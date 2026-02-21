import { $ } from "bun";
import { select } from "@inquirer/prompts";
import type { IModule, IRunContext } from "./index";
import { checkboxWithAll, commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

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
          await $`curl -fsSL https://repo.vivaldi.com/archive/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/vivaldi-browser.gpg`;
          await $`echo "deb [signed-by=/usr/share/keyrings/vivaldi-browser.gpg] https://repo.vivaldi.com/archive/deb/ stable main" | sudo tee /etc/apt/sources.list.d/vivaldi.list > /dev/null`;
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
          await $`curl -fsSL https://deb.opera.com/archive.key | sudo gpg --dearmor -o /usr/share/keyrings/opera-browser.gpg`;
          await $`echo "deb [signed-by=/usr/share/keyrings/opera-browser.gpg] https://deb.opera.com/opera-stable/ stable non-free" | sudo tee /etc/apt/sources.list.d/opera.list > /dev/null`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y opera-stable`;
          break;
        case "fedora":
          await $`sudo rpm --import https://rpm.opera.com/rpmrepo.key`;
          await $`sudo tee /etc/yum.repos.d/opera.repo > /dev/null << 'REPO'
[opera]
name=Opera packages
baseurl=https://rpm.opera.com/rpm
gpgcheck=1
gpgkey=https://rpm.opera.com/rpmrepo.key
enabled=1
REPO`;
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
        case "debian":
          await $`curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg`;
          await $`echo "deb [signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list > /dev/null`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y google-chrome-stable`;
          break;
        case "fedora":
          await $`sudo dnf config-manager --add-repo https://dl.google.com/linux/chrome/rpm/stable/x86_64`;
          await $`sudo rpm --import https://dl.google.com/linux/linux_signing_key.pub`;
          await $`sudo dnf install -y google-chrome-stable`;
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

    for (const b of BROWSERS) {
      if (await isInstalled(b)) {
        log.ok(`${b.emoji} ${b.name} ja instalado`);
        installed.push(b);
      } else {
        available.push(b);
      }
    }

    // Seleciona quais instalar (dos que ainda nao estao)
    let toInstall: IBrowser[] = [];

    if (available.length > 0) {
      if (ctx.isAll) {
        // --all: instala todos os browsers disponíveis
        toInstall = available;
      } else {
        toInstall = await checkboxWithAll("Quais browsers deseja instalar?", available);
      }
    } else {
      log.dim("Todos os browsers ja estao instalados");
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
          } else {
            log.warn(`${browser.name}: instalacao pode ter falhado`);
          }
        } catch {
          log.warn(`Falha ao instalar ${browser.name}`);
        }
      }
    }

    // Browser padrao
    if (installed.length > 0) {
      if (ctx.isAll) {
        // --all: Vivaldi como padrao automaticamente
        const vivaldi = BROWSERS.find((b) => b.id === "vivaldi")!;
        if (await isInstalled(vivaldi)) {
          await setDefaultBrowser(vivaldi);
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
  },
};
