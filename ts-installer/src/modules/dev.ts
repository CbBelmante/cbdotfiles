import { $ } from "bun";
import { existsSync, lstatSync, readdirSync } from "fs";
import type { IModule, IRunContext } from "./index";
import {
  DOTFILES_DIR,
  HOME,
  checkboxWithAll,
  commandExists,
  getDistro,
  pkgInstall,
  symlink,
  versionGte,
} from "../helpers";
import { log } from "../log";

// ---------------------------------------------------------------------------
// Dev tool definitions
// ---------------------------------------------------------------------------

interface IDevTool {
  id: string;
  name: string;
  emoji: string;
  isInstalled: () => Promise<boolean>;
  install: (distro: string) => Promise<void>;
  configure?: () => Promise<void>;
}

const NVIM_MIN_VERSION = "0.11.2";

const DEV_TOOLS: IDevTool[] = [
  {
    id: "nvim",
    name: "Neovim",
    emoji: "✏️",
    async isInstalled() {
      return commandExists("nvim");
    },
    async install(distro) {
      // Verifica versao se ja existe
      if (await commandExists("nvim")) {
        const versionOutput = (await $`nvim --version`.text()).split("\n")[0];
        const current = versionOutput.match(/\d+\.\d+\.\d+/)?.[0] || "0.0.0";
        if (versionGte(current, NVIM_MIN_VERSION)) {
          log.ok(`Neovim ja instalado: v${current} (>= ${NVIM_MIN_VERSION})`);
          return;
        }
        log.warn(`Neovim v${current} encontrado, mas LazyVim requer >= ${NVIM_MIN_VERSION}`);
      }

      log.add(`Instalando Neovim >= ${NVIM_MIN_VERSION}...`);
      if (distro === "arch") {
        await pkgInstall("neovim");
      } else {
        await $`mkdir -p ${HOME}/.local/bin ${HOME}/.local/nvim`;
        log.add("Baixando Neovim do GitHub (latest stable)...");
        await $`curl -sL https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz | tar xz --strip-components=1 -C ${HOME}/.local/nvim/`;
        await $`ln -sf ${HOME}/.local/nvim/bin/nvim ${HOME}/.local/bin/nvim`;
        await $`chmod +x ${HOME}/.local/bin/nvim`;
      }

      const nvimBin = `${HOME}/.local/bin/nvim`;
      if ((await commandExists("nvim")) || existsSync(nvimBin)) {
        try {
          const ver = (await $`${nvimBin} --version`.text())
            .split("\n")[0]
            .match(/\d+\.\d+\.\d+/)?.[0];
          log.ok(`Neovim v${ver} instalado`);
        } catch {
          const ver = (await $`nvim --version`.text())
            .split("\n")[0]
            .match(/\d+\.\d+\.\d+/)?.[0];
          log.ok(`Neovim v${ver} instalado`);
        }
      } else {
        log.warn("Falha ao instalar Neovim");
      }
    },
    async configure() {
      await $`mkdir -p ${HOME}/.config`;
      const nvimConfig = `${HOME}/.config/nvim`;

      if (existsSync(nvimConfig) && !lstatSync(nvimConfig).isSymbolicLink()) {
        const backup = `${nvimConfig}.bak.${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
        log.warn(`Backup: ~/.config/nvim -> ${backup}`);
        await $`mv ${nvimConfig} ${backup}`;
      }

      await $`ln -sfn ${DOTFILES_DIR}/nvim ${nvimConfig}`;
      log.ok("~/.config/nvim -> cbdotfiles");
    },
  },
  {
    id: "zellij",
    name: "Zellij",
    emoji: "🖥️",
    async isInstalled() {
      return commandExists("zellij");
    },
    async install(distro) {
      if (await commandExists("zellij")) {
        const version = (await $`zellij --version`.text()).trim();
        log.ok(`Zellij ja instalado: ${version}`);
        return;
      }

      log.add("Instalando Zellij...");
      if (distro === "arch") {
        await pkgInstall("zellij");
      } else {
        await $`mkdir -p ${HOME}/.local/bin`;
        await $`curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xz -C ${HOME}/.local/bin/`;
        await $`chmod +x ${HOME}/.local/bin/zellij`;
      }
      log.ok("Zellij instalado");
    },
    async configure() {
      await $`mkdir -p ${HOME}/.config/zellij/layouts`;
      await symlink(
        `${DOTFILES_DIR}/zellij/config.kdl`,
        `${HOME}/.config/zellij/config.kdl`
      );
      log.ok("~/.config/zellij/config.kdl -> cbdotfiles");

      const zellijDir = `${DOTFILES_DIR}/zellij`;
      const layouts = readdirSync(zellijDir).filter(
        (f) => f.endsWith(".kdl") && f !== "config.kdl"
      );

      for (const layout of layouts) {
        await symlink(
          `${zellijDir}/${layout}`,
          `${HOME}/.config/zellij/layouts/${layout}`
        );
        log.ok(`~/.config/zellij/layouts/${layout} -> cbdotfiles`);
      }
    },
  },
  {
    id: "vscode",
    name: "VS Code",
    emoji: "💻",
    async isInstalled() {
      return commandExists("code");
    },
    async install(distro) {
      if (await commandExists("code")) {
        const version = (await $`code --version`.text()).split("\n")[0].trim();
        log.ok(`VS Code ja instalado: ${version}`);
        return;
      }

      log.add("Instalando VS Code...");
      switch (distro) {
        case "arch":
          await pkgInstall("code");
          break;
        case "debian":
          await $`curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft.gpg`;
          await $`echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y code`;
          break;
        case "fedora":
          await $`sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc`;
          await $`echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null`;
          await $`sudo dnf install -y code`;
          break;
      }
      if (await commandExists("code")) log.ok("VS Code instalado");
    },
  },
  {
    id: "gitkraken",
    name: "GitKraken",
    emoji: "🐙",
    async isInstalled() {
      if (await commandExists("gitkraken")) return true;
      try {
        const flatpakList = await $`flatpak list 2>/dev/null`.text();
        return flatpakList.includes("gitkraken");
      } catch {
        return false;
      }
    },
    async install(distro) {
      log.add("Instalando GitKraken...");
      switch (distro) {
        case "arch":
          await pkgInstall("gitkraken");
          break;
        case "debian": {
          log.add("Baixando GitKraken .deb...");
          const deb = "/tmp/gitkraken.deb";
          await $`curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.deb -o ${deb}`;
          await $`sudo dpkg -i ${deb}`.nothrow();
          await $`sudo apt install -f -y`.nothrow();
          await $`rm -f ${deb}`;
          break;
        }
        case "fedora": {
          log.add("Baixando GitKraken .rpm...");
          const rpm = "/tmp/gitkraken.rpm";
          await $`curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.rpm -o ${rpm}`;
          await $`sudo dnf install -y ${rpm}`;
          await $`rm -f ${rpm}`;
          break;
        }
      }
      log.ok("GitKraken instalado");
    },
  },
  {
    id: "lazygit",
    name: "LazyGit",
    emoji: "🦥",
    async isInstalled() {
      return commandExists("lazygit");
    },
    async install(distro) {
      if (await commandExists("lazygit")) {
        const version = (await $`lazygit --version`.text()).split("\n")[0].trim();
        log.ok(`LazyGit ja instalado: ${version}`);
        return;
      }

      log.add("Instalando LazyGit...");
      if (distro === "arch") {
        await pkgInstall("lazygit");
      } else {
        try {
          const release = await fetch(
            "https://api.github.com/repos/jesseduffield/lazygit/releases/latest"
          ).then((r) => r.json());

          const version = (release as { tag_name: string }).tag_name.replace("v", "");
          await $`curl -Lo /tmp/lazygit.tar.gz https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${version}_Linux_x86_64.tar.gz`;
          await $`tar xf /tmp/lazygit.tar.gz -C /tmp lazygit`;
          await $`sudo install /tmp/lazygit /usr/local/bin`;
          await $`rm -f /tmp/lazygit /tmp/lazygit.tar.gz`;
        } catch {
          log.warn("Falha ao instalar LazyGit");
          return;
        }
      }
      log.ok("LazyGit instalado");
    },
    async configure() {
      await symlink(
        `${DOTFILES_DIR}/lazygit/config.yml`,
        `${HOME}/.config/lazygit/config.yml`
      );
      log.ok("~/.config/lazygit/config.yml -> cbdotfiles");
    },
  },
  {
    id: "lazydocker",
    name: "LazyDocker",
    emoji: "🐳",
    async isInstalled() {
      return commandExists("lazydocker");
    },
    async install(distro) {
      if (await commandExists("lazydocker")) {
        const version = (await $`lazydocker --version`.text()).split("\n")[0].trim();
        log.ok(`LazyDocker ja instalado: ${version}`);
        return;
      }

      log.add("Instalando LazyDocker...");
      if (distro === "arch") {
        await pkgInstall("lazydocker");
      } else {
        try {
          const release = await fetch(
            "https://api.github.com/repos/jesseduffield/lazydocker/releases/latest"
          ).then((r) => r.json());

          const version = (release as { tag_name: string }).tag_name.replace("v", "");
          await $`curl -Lo /tmp/lazydocker.tar.gz https://github.com/jesseduffield/lazydocker/releases/latest/download/lazydocker_${version}_Linux_x86_64.tar.gz`;
          await $`tar xf /tmp/lazydocker.tar.gz -C /tmp lazydocker`;
          await $`sudo install /tmp/lazydocker /usr/local/bin`;
          await $`rm -f /tmp/lazydocker /tmp/lazydocker.tar.gz`;
        } catch {
          log.warn("Falha ao instalar LazyDocker");
          return;
        }
      }
      log.ok("LazyDocker instalado");
    },
  },
];

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const dev: IModule = {
  id: "dev",
  name: "Dev Tools",
  emoji: "🛠️",
  description: "Neovim + Zellij + VS Code + GitKraken + LazyGit + LazyDocker",
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("dev", "Dev Tools");

    // Mostra status atual
    const installed: IDevTool[] = [];
    const available: IDevTool[] = [];

    for (const tool of DEV_TOOLS) {
      if (await tool.isInstalled()) {
        log.ok(`${tool.emoji} ${tool.name} ja instalado`);
        installed.push(tool);
      } else {
        available.push(tool);
      }
    }

    // Seleciona quais instalar (dos que ainda nao estao)
    let toInstall: IDevTool[] = [];

    if (available.length > 0) {
      if (ctx.isAll) {
        toInstall = available;
      } else {
        toInstall = await checkboxWithAll("Quais dev tools deseja instalar?", available);
      }
    } else {
      log.dim("Todas as dev tools ja estao instaladas");
    }

    // Instala os selecionados
    if (toInstall.length > 0) {
      const distro = await getDistro();

      for (const tool of toInstall) {
        try {
          await tool.install(distro);
          if (await tool.isInstalled()) {
            installed.push(tool);
          } else {
            log.warn(`${tool.name}: instalacao pode ter falhado`);
          }
        } catch {
          log.warn(`Falha ao instalar ${tool.name}`);
        }
      }
    }

    // Configura symlinks para todas as tools instaladas
    for (const tool of installed) {
      if (tool.configure) {
        try {
          await tool.configure();
        } catch {
          log.warn(`Falha ao configurar ${tool.name}`);
        }
      }
    }

    log.ok("Dev tools configurados");
  },
};
