import { $ } from "bun";
import type { IModule, IRunContext } from "./index";
import { checkboxWithAll, commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

// ---------------------------------------------------------------------------
// Gaming tool definitions
// ---------------------------------------------------------------------------

interface IGamingTool {
  id: string;
  name: string;
  emoji: string;
  isInstalled: () => Promise<boolean>;
  install: (distro: string) => Promise<void>;
}

const GAMING_TOOLS: IGamingTool[] = [
  {
    id: "steam",
    name: "Steam",
    emoji: "🎮",
    async isInstalled() {
      return commandExists("steam");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("steam");
          break;
        case "debian":
          await $`sudo dpkg --add-architecture i386`;
          await $`sudo apt update -qq`.quiet();
          try {
            await $`sudo apt install -y steam-installer`;
          } catch {
            log.warn("steam-installer nao disponivel, baixando .deb...");
            await $`curl -fsSL -o /tmp/steam.deb https://cdn.akamai.steamstatic.com/client/installer/steam.deb`;
            await $`sudo apt install -y /tmp/steam.deb`;
          }
          break;
        case "fedora":
          try {
            await $`sudo dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm`.quiet();
          } catch {
            log.dim("RPM Fusion ja configurado");
          }
          await $`sudo dnf install -y steam`;
          break;
      }
    },
  },
  {
    id: "lutris",
    name: "Lutris",
    emoji: "🐧",
    async isInstalled() {
      return commandExists("lutris");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("lutris");
          break;
        case "debian":
          await $`sudo apt install -y lutris`;
          break;
        case "fedora":
          await $`sudo dnf install -y lutris`;
          break;
      }
    },
  },
  {
    id: "protonup-qt",
    name: "ProtonUp-Qt",
    emoji: "🍷",
    async isInstalled() {
      try {
        const list = await $`flatpak list --app 2>/dev/null`.text();
        return list.includes("net.davidotek.pupgui2");
      } catch {
        return false;
      }
    },
    async install(distro) {
      if (!(await commandExists("flatpak"))) {
        log.add("Instalando Flatpak...");
        switch (distro) {
          case "arch":
            await pkgInstall("flatpak");
            break;
          case "debian":
            await $`sudo apt install -y flatpak`;
            break;
          case "fedora":
            break;
        }
      }
      await $`flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`.quiet();
      await $`flatpak install -y flathub net.davidotek.pupgui2`;
    },
  },
  {
    id: "mangohud",
    name: "MangoHud",
    emoji: "📊",
    async isInstalled() {
      return commandExists("mangohud");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("mangohud", "lib32-mangohud");
          break;
        case "debian":
          await $`sudo apt install -y mangohud`;
          break;
        case "fedora":
          await $`sudo dnf install -y mangohud`;
          break;
      }
    },
  },
  {
    id: "gamemode",
    name: "Gamemode",
    emoji: "⚡",
    async isInstalled() {
      return commandExists("gamemoderun");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("gamemode", "lib32-gamemode");
          break;
        case "debian":
          await $`sudo apt install -y gamemode`;
          break;
        case "fedora":
          await $`sudo dnf install -y gamemode`;
          break;
      }
    },
  },
  {
    id: "wine",
    name: "Wine + Winetricks",
    emoji: "🍷",
    async isInstalled() {
      return commandExists("wine");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("wine", "winetricks");
          break;
        case "debian":
          await $`sudo dpkg --add-architecture i386`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y wine winetricks`;
          break;
        case "fedora":
          await $`sudo dnf install -y wine winetricks`;
          break;
      }
    },
  },
  {
    id: "discord",
    name: "Discord",
    emoji: "💬",
    async isInstalled() {
      if (await commandExists("discord")) return true;
      if (await commandExists("Discord")) return true;
      try {
        const list = await $`flatpak list --app 2>/dev/null`.text();
        return list.includes("com.discordapp.Discord");
      } catch {
        return false;
      }
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("discord");
          break;
        case "debian":
          log.add("Baixando Discord .deb...");
          await $`curl -fsSL -o /tmp/discord.deb "https://discord.com/api/download?platform=linux&format=deb"`;
          await $`sudo apt install -y /tmp/discord.deb`;
          await $`rm -f /tmp/discord.deb`;
          break;
        case "fedora":
          // Flatpak é a forma mais estável no Fedora
          if (!(await commandExists("flatpak"))) {
            break;
          }
          await $`flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`.quiet();
          await $`flatpak install -y flathub com.discordapp.Discord`;
          break;
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const gaming: IModule = {
  id: "gaming",
  name: "Gaming",
  emoji: "🎮",
  description: "Steam + Lutris + ProtonUp-Qt + MangoHud + Gamemode + Wine + Discord",
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("gaming", "Gaming Tools");

    // Mostra status atual
    const installed: IGamingTool[] = [];
    const available: IGamingTool[] = [];

    for (const tool of GAMING_TOOLS) {
      if (await tool.isInstalled()) {
        log.ok(`${tool.emoji} ${tool.name} ja instalado`);
        installed.push(tool);
      } else {
        available.push(tool);
      }
    }

    // Seleciona quais instalar (dos que ainda nao estao)
    let toInstall: IGamingTool[] = [];

    if (available.length > 0) {
      if (ctx.isAll) {
        // --all: instala todas as gaming tools
        toInstall = available;
      } else {
        toInstall = await checkboxWithAll("Quais gaming tools deseja instalar?", available);
      }
    } else {
      log.dim("Todas as gaming tools ja estao instaladas");
    }

    // Instala os selecionados
    if (toInstall.length > 0) {
      const distro = await getDistro();

      for (const tool of toInstall) {
        log.add(`Instalando ${tool.name}...`);
        try {
          await tool.install(distro);
          if (await tool.isInstalled()) {
            log.ok(`${tool.name} instalado`);
          } else {
            log.warn(`${tool.name}: instalacao pode ter falhado`);
          }
        } catch {
          log.warn(`Falha ao instalar ${tool.name}`);
        }
      }
    }

    log.ok("Gaming tools configurados");
  },
};
