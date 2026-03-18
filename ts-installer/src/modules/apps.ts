import { $ } from "bun";
import type { IModule, IRunContext } from "./index";
import { checkboxWithAll, commandExists, getDistro, pkgInstall } from "../helpers";
import { log, tracker } from "../log";
import { APPS_ENABLED } from "../defaults";

// ---------------------------------------------------------------------------
// App definitions
// ---------------------------------------------------------------------------

interface IApp {
  id: string;
  name: string;
  emoji: string;
  isInstalled: () => Promise<boolean>;
  install: (distro: string) => Promise<void>;
}

const APPS: IApp[] = [
  {
    id: "libreoffice",
    name: "LibreOffice",
    emoji: "📄",
    async isInstalled() {
      return commandExists("libreoffice");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("libreoffice-fresh");
          break;
        case "debian":
          await $`sudo apt install -y libreoffice`;
          break;
        case "fedora":
          await $`sudo dnf install -y libreoffice`;
          break;
      }
    },
  },
  {
    id: "sublime",
    name: "Sublime Text",
    emoji: "📝",
    async isInstalled() {
      return commandExists("subl");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          // AUR
          if (await commandExists("yay")) {
            await $`yay -S --noconfirm sublime-text-4`;
          } else if (await commandExists("paru")) {
            await $`paru -S --noconfirm sublime-text-4`;
          } else {
            log.warn("Instale sublime-text via AUR (yay -S sublime-text-4)");
          }
          break;
        case "debian":
          await $`curl -fsSL https://download.sublimetext.com/sublimehq-pub.gpg -o /tmp/sublimehq-pub.gpg`;
          await $`sudo gpg --yes --dearmor -o /usr/share/keyrings/sublimehq.gpg /tmp/sublimehq-pub.gpg`;
          await $`rm -f /tmp/sublimehq-pub.gpg`;
          await $`sudo bash -c 'echo "deb [signed-by=/usr/share/keyrings/sublimehq.gpg] https://download.sublimetext.com/ apt/stable/" > /etc/apt/sources.list.d/sublime-text.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y sublime-text`;
          break;
        case "fedora":
          await $`sudo rpm -v --import https://download.sublimetext.com/sublimehq-rpm-pub.gpg`;
          await $`sudo dnf config-manager --add-repo https://download.sublimetext.com/rpm/stable/x86_64/sublime-text.repo`;
          await $`sudo dnf install -y sublime-text`;
          break;
      }
    },
  },
  {
    id: "pavucontrol",
    name: "PavuControl",
    emoji: "🔊",
    async isInstalled() {
      return commandExists("pavucontrol");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("pavucontrol");
          break;
        case "debian":
          await $`sudo apt install -y pavucontrol`;
          break;
        case "fedora":
          await $`sudo dnf install -y pavucontrol`;
          break;
      }
    },
  },
  {
    id: "vlc",
    name: "VLC",
    emoji: "🎬",
    async isInstalled() {
      return commandExists("vlc");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("vlc");
          break;
        case "debian":
          await $`sudo apt install -y vlc`;
          break;
        case "fedora":
          // VLC precisa do RPM Fusion
          try {
            const fedoraVer = (await $`rpm -E %fedora`.text()).trim();
            await $`sudo dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-${fedoraVer}.noarch.rpm`.quiet();
          } catch {
            log.dim("RPM Fusion ja configurado");
          }
          await $`sudo dnf install -y vlc`;
          break;
      }
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    emoji: "🗒️",
    async isInstalled() {
      if (await commandExists("obsidian")) return true;
      try {
        const list = await $`flatpak list --app 2>/dev/null`.text();
        return list.includes("md.obsidian.Obsidian");
      } catch {
        return false;
      }
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          if (await commandExists("yay")) {
            await $`yay -S --noconfirm obsidian`;
          } else if (await commandExists("paru")) {
            await $`paru -S --noconfirm obsidian`;
          } else {
            log.warn("Instale obsidian via AUR (yay -S obsidian)");
          }
          break;
        case "debian":
        case "fedora":
          // Flatpak e a forma mais confiavel no debian/fedora
          if (!(await commandExists("flatpak"))) {
            if (distro === "debian") await $`sudo apt install -y flatpak`;
          }
          await $`flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`.quiet();
          await $`flatpak install --user -y flathub md.obsidian.Obsidian`;
          break;
      }
    },
  },
  {
    id: "kdenlive",
    name: "Kdenlive",
    emoji: "🎥",
    async isInstalled() {
      return commandExists("kdenlive");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("kdenlive");
          break;
        case "debian":
          await $`sudo apt install -y kdenlive`;
          break;
        case "fedora":
          await $`sudo dnf install -y kdenlive`;
          break;
      }
    },
  },
  {
    id: "peazip",
    name: "PeaZip",
    emoji: "🗜️",
    async isInstalled() {
      if (await commandExists("peazip")) return true;
      try {
        const list = await $`flatpak list --app 2>/dev/null`.text();
        return list.includes("io.github.peazip.PeaZip");
      } catch {
        return false;
      }
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          if (await commandExists("yay")) {
            await $`yay -S --noconfirm peazip-qt-bin`;
          } else if (await commandExists("paru")) {
            await $`paru -S --noconfirm peazip-qt-bin`;
          } else {
            log.warn("Instale peazip via AUR (yay -S peazip-qt-bin)");
          }
          break;
        case "debian":
        case "fedora":
          if (!(await commandExists("flatpak"))) {
            if (distro === "debian") await $`sudo apt install -y flatpak`;
          }
          await $`flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`.quiet();
          await $`flatpak install --user -y flathub io.github.peazip.PeaZip`;
          break;
      }
    },
  },
  {
    id: "qbittorrent",
    name: "qBittorrent",
    emoji: "📥",
    async isInstalled() {
      return commandExists("qbittorrent");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("qbittorrent");
          break;
        case "debian":
          await $`sudo apt install -y qbittorrent`;
          break;
        case "fedora":
          await $`sudo dnf install -y qbittorrent`;
          break;
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const apps: IModule = {
  id: "apps",
  name: "Apps",
  emoji: "📦",
  description: "LibreOffice + Sublime + VLC + Obsidian + Kdenlive + PeaZip + qBittorrent",
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("apps", "Apps do dia a dia");

    // Mostra status atual
    const installed: IApp[] = [];
    const available: IApp[] = [];

    const enabledIds = APPS_ENABLED.map((a) => a.id);
    const activeIds = APPS_ENABLED.filter((a) => a.active).map((a) => a.id);
    const enabledApps = APPS.filter((a) => enabledIds.includes(a.id));

    for (const app of enabledApps) {
      if (await app.isInstalled()) {
        log.ok(`${app.emoji} ${app.name} ja instalado`);
        installed.push(app);
        tracker.skipped(app.name);
      } else {
        available.push(app);
      }
    }

    // Seleciona quais instalar
    const installedIds = new Set(installed.map((a) => a.id));
    let toInstall: IApp[] = [];

    if (ctx.isAll) {
      toInstall = available.filter((a) => activeIds.includes(a.id));
    } else {
      const selected = await checkboxWithAll("Quais apps deseja instalar?", enabledApps, installedIds);
      toInstall = selected.filter((a) => !installedIds.has(a.id));
    }

    // Instala os selecionados
    if (toInstall.length > 0) {
      const distro = await getDistro();

      for (const app of toInstall) {
        log.add(`Instalando ${app.name}...`);
        try {
          await app.install(distro);
          if (await app.isInstalled()) {
            log.ok(`${app.name} instalado`);
            tracker.installed(app.name);
          } else {
            log.warn(`${app.name}: instalacao pode ter falhado`);
            tracker.warning(app.name);
          }
        } catch {
          log.warn(`Falha ao instalar ${app.name}`);
          tracker.warning(app.name);
        }
      }
    }

    log.ok("Apps configurados");
  },
};
