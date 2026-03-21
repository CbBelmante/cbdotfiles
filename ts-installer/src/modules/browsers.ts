import { $ } from "bun";
import { existsSync } from "fs";
import { select } from "@inquirer/prompts";
import type { IModule, IRunContext } from "./index";
import { checkboxWithAll, commandExists, getDistro, HOME, pkgInstall } from "../helpers";
import { log, tracker } from "../log";
import { BROWSER, BROWSERS_ENABLED } from "../defaults";

// ---------------------------------------------------------------------------
// Browser definitions
// ---------------------------------------------------------------------------

interface IBrowser {
  id: string;
  name: string;
  emoji: string;
  command: string;
  desktopFile: string;
  install: (distro: string) => Promise<void>;
}

const BROWSERS: IBrowser[] = [
  {
    id: "vivaldi",
    name: "Vivaldi",
    emoji: "🌐",
    command: "vivaldi",
    desktopFile: "vivaldi",
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("vivaldi");
          break;
        case "debian":
          await $`curl -fsSL https://repo.vivaldi.com/archive/linux_signing_key.pub -o /tmp/vivaldi-key.pub`;
          await $`sudo gpg --yes --dearmor -o /usr/share/keyrings/vivaldi-browser.gpg /tmp/vivaldi-key.pub`;
          await $`rm -f /tmp/vivaldi-key.pub`;
          await $`sudo bash -c 'echo "deb [signed-by=/usr/share/keyrings/vivaldi-browser.gpg] https://repo.vivaldi.com/archive/deb/ stable main" > /etc/apt/sources.list.d/vivaldi.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y vivaldi-stable`;
          break;
        case "fedora":
          await $`sudo dnf config-manager --add-repo https://repo.vivaldi.com/archive/vivaldi-fedora.repo`;
          await $`sudo dnf install -y vivaldi-stable`;
          break;
      }
    },
  },
  {
    id: "opera",
    name: "Opera",
    emoji: "🌐",
    command: "opera",
    desktopFile: "opera",
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("opera");
          break;
        case "debian":
          await $`curl -fsSL https://deb.opera.com/archive.key -o /tmp/opera-key.pub`;
          await $`sudo gpg --yes --dearmor -o /usr/share/keyrings/opera-browser.gpg /tmp/opera-key.pub`;
          await $`rm -f /tmp/opera-key.pub`;
          await $`sudo bash -c 'echo "deb [signed-by=/usr/share/keyrings/opera-browser.gpg] https://deb.opera.com/opera-stable/ stable non-free" > /etc/apt/sources.list.d/opera.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y opera-stable`;
          break;
        case "fedora":
          await $`sudo rpm --import https://rpm.opera.com/rpmrepo.key`;
          await $`sudo bash -c 'echo -e "[opera]\nname=Opera packages\nbaseurl=https://rpm.opera.com/rpm\ngpgcheck=1\ngpgkey=https://rpm.opera.com/rpmrepo.key\nenabled=1" > /etc/yum.repos.d/opera.repo'`;
          await $`sudo dnf install -y opera-stable`;
          break;
      }
    },
  },
  {
    id: "firefox",
    name: "Firefox",
    emoji: "🦊",
    command: "firefox",
    desktopFile: "firefox",
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("firefox");
          break;
        case "debian":
          await $`sudo apt install -y firefox`;
          break;
        case "fedora":
          await $`sudo dnf install -y firefox`;
          break;
      }
    },
  },
  {
    id: "chrome",
    name: "Google Chrome",
    emoji: "🌐",
    command: "google-chrome-stable",
    desktopFile: "google-chrome",
    async install(distro) {
      switch (distro) {
        case "arch":
          if (await commandExists("yay")) {
            await $`yay -S --noconfirm google-chrome`;
          } else if (await commandExists("paru")) {
            await $`paru -S --noconfirm google-chrome`;
          } else {
            log.warn("Instale google-chrome via AUR (yay -S google-chrome)");
          }
          break;
        case "debian": {
          const dl = await $`bash -c 'curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/google-chrome.deb'`.nothrow();
          if (dl.exitCode !== 0) throw new Error("Falha ao baixar .deb do Chrome");
          const inst = await $`sudo apt install -y /tmp/google-chrome.deb`.nothrow();
          await $`rm -f /tmp/google-chrome.deb`.nothrow();
          if (inst.exitCode !== 0) throw new Error(`apt install falhou (exit ${inst.exitCode})`);
          break;
        }
        case "fedora":
          await $`sudo dnf install -y https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm`;
          break;
      }
    },
  },
  {
    id: "chromium",
    name: "Chromium",
    emoji: "🌐",
    command: "chromium",
    desktopFile: "chromium",
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("chromium");
          break;
        case "debian":
          try {
            await $`sudo apt install -y chromium`;
          } catch {
            await $`sudo apt install -y chromium-browser`;
          }
          break;
        case "fedora":
          await $`sudo dnf install -y chromium`;
          break;
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function isInstalled(browser: IBrowser): Promise<boolean> {
  if (await commandExists(browser.command)) return true;
  // Chromium pode ser chromium-browser em algumas distros
  if (browser.id === "chromium") return commandExists("chromium-browser");
  return false;
}

async function setDefaultBrowser(browser: IBrowser) {
  if (!(await commandExists("xdg-settings"))) {
    log.warn("xdg-settings nao disponivel, defina o browser padrao manualmente");
    return;
  }

  try {
    const found = (
      await $`find /usr/share/applications -name "${browser.desktopFile}*" -print -quit 2>/dev/null`.text()
    ).trim();

    if (found) {
      const desktopName = found.split("/").pop()!;
      await $`xdg-settings set default-web-browser ${desktopName}`;
      log.ok(`${browser.name} definido como browser padrao (${desktopName})`);
    } else {
      log.warn(`Desktop file de ${browser.name} nao encontrado`);
    }
  } catch {
    log.warn(`Falha ao definir ${browser.name} como browser padrao`);
  }
}

// ---------------------------------------------------------------------------
// Standalone: alterar browser padrao (--chbrowser)
// ---------------------------------------------------------------------------

export async function changeDefaultBrowser() {
  log.title("browsers", "Alterar browser padrao");

  const installed: IBrowser[] = [];
  for (const b of BROWSERS) {
    if (await isInstalled(b)) {
      installed.push(b);
    }
  }

  if (installed.length === 0) {
    log.warn("Nenhum browser instalado");
    return;
  }

  // Mostra o browser padrao atual
  try {
    const current = (await $`xdg-settings get default-web-browser 2>/dev/null`.text()).trim();
    if (current) log.dim(`Atual: ${current}`);
  } catch {}

  const choices = installed.map((b) => ({
    name: `${b.emoji} ${b.name}`,
    value: b.id,
  }));
  choices.push({ name: "Cancelar (manter o atual)", value: "none" });

  const chosen = await select({
    message: "Qual browser definir como padrao?",
    choices,
  });

  if (chosen !== "none") {
    const browser = BROWSERS.find((b) => b.id === chosen)!;
    await setDefaultBrowser(browser);
  }
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Flags VA-API globais nos .desktop (protege em qualquer contexto)
// ---------------------------------------------------------------------------

const WAYLAND_FLAGS = "--enable-features=VaapiVideoDecodeLinuxGL --disable-features=UseChromeOSDirectVideoDecoder";

// Browsers Chromium-based e seus .desktop files no sistema
const CHROMIUM_DESKTOP_FILES: Record<string, string[]> = {
  vivaldi: ["vivaldi-stable.desktop"],
  chrome: ["google-chrome.desktop", "google-chrome-stable.desktop"],
  chromium: ["chromium.desktop", "chromium-browser.desktop"],
  opera: ["opera.desktop", "opera-stable.desktop"],
};

async function applyWaylandFlags(installed: IBrowser[]) {
  // So aplica se estiver em Wayland
  if (process.env.XDG_SESSION_TYPE !== "wayland") return;

  // Carrega flags extras do local override
  let extraFlags = "";
  try {
    const localConf = `${HOME}/Workspaces/cbdotfiles/local/local.sh`;
    if (existsSync(localConf)) {
      const content = await Bun.file(localConf).text();
      const match = content.match(/^CB_BROWSER_FLAGS=["']?(.+?)["']?\s*$/m);
      if (match) extraFlags = match[1];
    }
  } catch {}

  const allFlags = `${WAYLAND_FLAGS} ${extraFlags}`.trim();
  const flagLines = allFlags.split(" ").join("\n");

  // 1. Arquivos de flags globais (cobrem TODOS os apps Chromium/Electron)
  const flagFiles: Record<string, string> = {
    "electron-flags.conf": flagLines,           // Electron apps (VS Code, GitKraken, Discord, Obsidian)
    "code-flags.conf": flagLines,               // VS Code especifico
    "chromium-flags.conf": flagLines,            // Chromium
    "chrome-flags.conf": flagLines,              // Google Chrome
    "vivaldi-stable.conf": flagLines,            // Vivaldi
  };

  let count = 0;
  for (const [file, content] of Object.entries(flagFiles)) {
    const path = `${HOME}/.config/${file}`;
    try {
      if (existsSync(path)) {
        const existing = await Bun.file(path).text();
        if (existing.includes("VaapiVideoDecodeLinuxGL")) continue;
      }
      await Bun.write(path, content + "\n");
      count++;
    } catch {}
  }

  if (count > 0) {
    log.ok(`Flags Wayland aplicadas em ${count} config(s) (browsers + Electron apps)`);
    tracker.configured("wayland flags");
  } else {
    log.ok("Flags Wayland ja configuradas (browsers + Electron apps)");
  }

  // 2. Override .desktop dos browsers (pra launcher/links)
  const localApps = `${HOME}/.local/share/applications`;
  await $`mkdir -p ${localApps}`.nothrow();

  let desktopCount = 0;
  for (const browser of installed) {
    if (browser.id === "firefox") continue;

    const desktopFiles = CHROMIUM_DESKTOP_FILES[browser.id];
    if (!desktopFiles) continue;

    for (const desktopFile of desktopFiles) {
      const systemFile = `/usr/share/applications/${desktopFile}`;
      if (!existsSync(systemFile)) continue;

      try {
        const content = await Bun.file(systemFile).text();
        const localFile = `${localApps}/${desktopFile}`;

        if (existsSync(localFile)) {
          const existing = await Bun.file(localFile).text();
          if (existing.includes(WAYLAND_FLAGS)) continue;
        }

        const patched = content.replace(
          /^(Exec=\S+)(.*?)$/gm,
          (match, exec, args) => {
            if (args.includes("VaapiVideoDecodeLinuxGL")) return match;
            return `${exec} ${allFlags}${args}`;
          }
        );

        await Bun.write(localFile, patched);
        desktopCount++;
      } catch {}
    }
  }

  if (desktopCount > 0) {
    await $`update-desktop-database ${localApps}`.nothrow();
    log.ok(`Override .desktop em ${desktopCount} browser(s)`);
  }
}

export const browsers: IModule = {
  id: "browsers",
  name: "Browsers",
  emoji: "🌐",
  description: "Navegadores (Vivaldi, Opera, Firefox, Chrome, Chromium)",
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("browsers", "Navegadores");

    // Mostra status atual
    const installed: IBrowser[] = [];
    const available: IBrowser[] = [];

    const enabledIds = BROWSERS_ENABLED.map((b) => b.id);
    const defaultIds = BROWSERS_ENABLED.filter((b) => b.defaultInstall).map((b) => b.id);
    const enabledBrowsers = BROWSERS.filter((b) => enabledIds.includes(b.id));

    for (const b of enabledBrowsers) {
      if (await isInstalled(b)) {
        log.ok(`${b.emoji} ${b.name} ja instalado`);
        installed.push(b);
        tracker.skipped(b.name);
      } else {
        available.push(b);
      }
    }

    // Seleciona quais instalar
    const installedIds = new Set(installed.map((b) => b.id));
    let toInstall: IBrowser[] = [];

    if (ctx.isAll) {
      toInstall = available.filter((b) => defaultIds.includes(b.id));
    } else {
      const selected = await checkboxWithAll("Quais browsers deseja instalar?", enabledBrowsers, installedIds);
      toInstall = selected.filter((b) => !installedIds.has(b.id));
    }

    // Instala os selecionados
    if (toInstall.length > 0) {
      const distro = await getDistro();

      for (const browser of toInstall) {
        log.add(`Instalando ${browser.name}...`);
        try {
          await browser.install(distro);
          if (await isInstalled(browser)) {
            log.ok(`${browser.name} instalado`);
            installed.push(browser);
            tracker.installed(browser.name);
          } else {
            log.warn(`${browser.name}: instalacao pode ter falhado`);
            tracker.warning(browser.name);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          log.error(`Falha ao instalar ${browser.name}: ${msg}`);
          tracker.warning(browser.name);
        }
      }
    }

    // Browser padrao
    if (installed.length > 0) {
      if (ctx.isAll) {
        // --all/--update: so define se nenhum browser padrao esta configurado
        let currentDefault = "";
        try {
          currentDefault = (await $`xdg-settings get default-web-browser`.nothrow().text()).trim();
        } catch {}

        if (currentDefault) {
          log.ok(`Browser padrao: ${currentDefault} (mantido)`);
        } else {
          const defaultBrowser = BROWSERS.find((b) => b.id === BROWSER.default)!;
          if (await isInstalled(defaultBrowser)) {
            await setDefaultBrowser(defaultBrowser);
          }
        }
      } else {
        const choices = installed.map((b) => ({
          name: `${b.emoji} ${b.name}`,
          value: b.id,
        }));
        choices.push({ name: "Nenhum (manter o atual)", value: "none" });

        const chosen = await select({
          message: "Qual browser definir como padrao?",
          choices,
        });

        if (chosen !== "none") {
          const browser = BROWSERS.find((b) => b.id === chosen)!;
          await setDefaultBrowser(browser);
        }
      }
    }

    // Aplica flags VA-API globalmente nos .desktop de browsers Chromium instalados
    await applyWaylandFlags(installed);
  },
};
