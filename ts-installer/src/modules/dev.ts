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
        await $`curl -sL https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz -o /tmp/nvim.tar.gz`;
        await $`tar xz --strip-components=1 -C ${HOME}/.local/nvim/ -f /tmp/nvim.tar.gz`;
        await $`rm -f /tmp/nvim.tar.gz`;
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

      // markdownlint-cli2 config (desabilita MD013/MD058)
      await symlink(
        `${DOTFILES_DIR}/nvim/.markdownlint-cli2.yaml`,
        `${HOME}/.markdownlint-cli2.yaml`
      );
      log.ok("~/.markdownlint-cli2.yaml -> cbdotfiles");

      // ImageMagick 7 (dependencia do image.nvim — v6 nao suporta SVG inline)
      if (await commandExists("magick")) {
        log.ok("ImageMagick 7 (magick) ja instalado");
      } else {
        const distro = await getDistro();
        if (distro === "arch") {
          log.add("Instalando ImageMagick...");
          await pkgInstall("imagemagick");
        } else {
          // Debian/Ubuntu/Pop: apt instala v6, precisa baixar v7 binario
          log.add("Instalando ImageMagick 7 (AppImage)...");
          await $`mkdir -p ${HOME}/.local/bin`;
          await $`curl -sL https://imagemagick.org/archive/binaries/magick -o ${HOME}/.local/bin/magick`.nothrow();
          await $`chmod +x ${HOME}/.local/bin/magick`.nothrow();
        }
        if (await commandExists("magick")) {
          log.ok("ImageMagick 7 instalado");
        } else {
          log.warn("Falha ao instalar ImageMagick 7 — instale manualmente");
        }
      }

      // luarocks para image.nvim (magick rock)
      if (!(await commandExists("luarocks"))) {
        log.add("Instalando luarocks (dependencia do image.nvim)...");
        await pkgInstall("luarocks");
        if (await commandExists("luarocks")) {
          log.ok("luarocks instalado");
        } else {
          log.warn("Falha ao instalar luarocks — instale manualmente");
        }
      } else {
        log.ok("luarocks ja instalado");
      }

      // luarocks magick (binding Lua para ImageMagick)
      if (await commandExists("luarocks")) {
        try {
          const rocks = await $`luarocks --local list magick 2>/dev/null`.text();
          if (!rocks.includes("magick")) {
            log.add("Instalando luarocks magick...");
            await $`luarocks --local --lua-version=5.1 install magick`.nothrow();
          }
          log.ok("luarocks magick instalado");
        } catch {
          log.warn("Falha ao instalar luarocks magick — instale manualmente: luarocks --local --lua-version=5.1 install magick");
        }
      }

      // Mermaid CLI (mmdc) para diagram.nvim renderizar Mermaid no terminal
      if (!(await commandExists("mmdc"))) {
        if (await commandExists("npm")) {
          log.add("Instalando mermaid-cli (mmdc)...");
          await $`npm install -g @mermaid-js/mermaid-cli`.nothrow();
          if (await commandExists("mmdc")) {
            log.ok("mmdc instalado (mermaid-cli)");
          } else {
            log.warn("Falha ao instalar mmdc — instale manualmente: npm i -g @mermaid-js/mermaid-cli");
          }
        } else {
          log.warn("npm nao encontrado — mmdc nao instalado (instale Node primeiro via shell-tools)");
        }
      } else {
        log.ok("mmdc ja instalado (mermaid-cli)");
      }

      // claudecode.nvim cuida da integracao Claude Code <-> Neovim via WebSocket
    },
  },
  {
    id: "tmux",
    name: "tmux",
    emoji: "🪟",
    async isInstalled() {
      return commandExists("tmux");
    },
    async install(distro) {
      if (await commandExists("tmux")) {
        const version = (await $`tmux -V`.text()).trim();
        log.ok(`tmux ja instalado: ${version}`);
        return;
      }

      log.add("Instalando tmux...");
      await pkgInstall("tmux");
      if (await commandExists("tmux")) {
        const version = (await $`tmux -V`.text()).trim();
        log.ok(`tmux instalado: ${version}`);
      } else {
        log.warn("Falha ao instalar tmux");
      }
    },
    async configure() {
      // Symlink config
      await symlink(
        `${DOTFILES_DIR}/tmux/tmux.conf`,
        `${HOME}/.tmux.conf`
      );
      log.ok("~/.tmux.conf -> cbdotfiles");

      // Instalar TPM (Tmux Plugin Manager)
      const tpmDir = `${HOME}/.tmux/plugins/tpm`;
      if (!existsSync(tpmDir)) {
        log.add("Instalando TPM (Tmux Plugin Manager)...");
        await $`git clone https://github.com/tmux-plugins/tpm ${tpmDir}`.nothrow();
        if (existsSync(tpmDir)) {
          log.ok("TPM instalado");
        } else {
          log.warn("Falha ao instalar TPM — instale manualmente");
        }
      } else {
        log.ok("TPM ja instalado");
      }

      // Instalar plugins via TPM
      const tpmInstall = `${tpmDir}/bin/install_plugins`;
      if (existsSync(tpmInstall)) {
        log.add("Instalando plugins do tmux...");
        await $`${tpmInstall}`.nothrow();
        log.ok("Plugins do tmux instalados");
      }
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
        await $`curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz -o /tmp/zellij.tar.gz`;
        await $`tar xz -C ${HOME}/.local/bin/ -f /tmp/zellij.tar.gz`;
        await $`rm -f /tmp/zellij.tar.gz`;
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
          await $`curl -fsSL https://packages.microsoft.com/keys/microsoft.asc -o /tmp/microsoft-key.asc`;
          await $`sudo gpg --yes --dearmor -o /usr/share/keyrings/microsoft.gpg /tmp/microsoft-key.asc`;
          await $`rm -f /tmp/microsoft-key.asc`;
          await $`sudo bash -c 'echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y code`;
          break;
        case "fedora":
          await $`sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc`;
          await $`sudo bash -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'`;
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
    id: "gh",
    name: "GitHub CLI",
    emoji: "🐙",
    async isInstalled() {
      return commandExists("gh");
    },
    async install(distro) {
      if (await commandExists("gh")) {
        const version = (await $`gh --version`.text()).split("\n")[0].trim();
        log.ok(`GitHub CLI ja instalado: ${version}`);
        return;
      }

      log.add("Instalando GitHub CLI...");
      switch (distro) {
        case "arch":
          await pkgInstall("github-cli");
          break;
        case "debian": {
          await $`curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /tmp/gh-keyring.gpg`;
          await $`sudo install -o root -g root -m 644 /tmp/gh-keyring.gpg /etc/apt/keyrings/githubcli-archive-keyring.gpg`;
          await $`rm -f /tmp/gh-keyring.gpg`;
          const arch = (await $`dpkg --print-architecture`.text()).trim();
          await $`sudo bash -c 'echo "deb [arch=${arch} signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y gh`;
          break;
        }
        case "fedora":
          await $`sudo dnf install -y gh`;
          break;
      }
      if (await commandExists("gh")) log.ok("GitHub CLI instalado");
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
  {
    id: "tauri",
    name: "Tauri Dev",
    emoji: "🦀",
    async isInstalled() {
      return commandExists("cargo");
    },
    async install(distro) {
      // 1. Rust via rustup
      if (!(await commandExists("cargo"))) {
        log.add("Instalando Rust via rustup...");
        await $`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`;
        // Atualiza PATH pra sessao atual
        process.env.PATH = `${HOME}/.cargo/bin:${process.env.PATH}`;
        if (await commandExists("cargo")) {
          const version = (await $`rustc --version`.text()).trim();
          log.ok(`Rust instalado: ${version}`);
        } else {
          log.warn("Falha ao instalar Rust — instale manualmente: https://rustup.rs");
          return;
        }
      } else {
        const version = (await $`rustc --version`.text()).trim();
        log.ok(`Rust ja instalado: ${version}`);
      }

      // 2. Libs de sistema pra Tauri (WebView nativo)
      log.add("Instalando dependencias de sistema do Tauri...");
      switch (distro) {
        case "arch":
          await pkgInstall(
            "webkit2gtk-4.1", "base-devel", "curl", "wget", "file",
            "openssl", "appmenu-gtk-module", "gtk3",
            "libappindicator-gtk3", "librsvg", "patchelf"
          );
          break;
        case "debian":
          await pkgInstall(
            "libwebkit2gtk-4.1-dev", "build-essential", "curl", "wget",
            "file", "libxdo-dev", "libssl-dev", "libgtk-3-dev",
            "libayatana-appindicator3-dev", "librsvg2-dev", "patchelf"
          );
          break;
        case "fedora":
          await pkgInstall(
            "webkit2gtk4.1-devel", "openssl-devel", "curl", "wget",
            "file", "libappindicator-gtk3-devel", "librsvg2-devel",
            "gtk3-devel", "patchelf"
          );
          break;
      }
      log.ok("Dependencias de sistema do Tauri instaladas");

      // 3. Tauri CLI
      if (await commandExists("cargo-tauri")) {
        log.ok("cargo-tauri ja instalado");
      } else {
        log.add("Instalando Tauri CLI via cargo (pode demorar)...");
        await $`cargo install tauri-cli --locked`.nothrow();
        if (await commandExists("cargo-tauri")) {
          log.ok("Tauri CLI instalado");
        } else {
          log.warn("Falha ao instalar Tauri CLI — instale manualmente: cargo install tauri-cli");
        }
      }
    },
  },
  {
    id: "docker",
    name: "Docker",
    emoji: "🐋",
    async isInstalled() {
      return commandExists("docker");
    },
    async install(distro) {
      if (await commandExists("docker")) {
        const version = (await $`docker --version`.text()).trim();
        log.ok(`Docker ja instalado: ${version}`);
        return;
      }

      log.add("Instalando Docker...");
      switch (distro) {
        case "arch":
          await pkgInstall("docker", "docker-compose");
          break;
        case "debian": {
          // Dependencias
          await $`sudo apt install -y ca-certificates curl`;
          await $`sudo install -m 0755 -d /etc/apt/keyrings`;

          // GPG key
          await $`curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /tmp/docker-key.asc`;
          await $`sudo gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg /tmp/docker-key.asc`;
          await $`rm -f /tmp/docker-key.asc`;
          await $`sudo chmod a+r /etc/apt/keyrings/docker.gpg`;

          // Repo (detecta codename: ubuntu ou debian)
          const codename = (await $`bash -c '. /etc/os-release && echo $VERSION_CODENAME'`.text()).trim();
          const id = (await $`bash -c '. /etc/os-release && echo $ID'`.text()).trim();
          // Pop!_OS usa Ubuntu como base
          const baseId = id === "pop" ? "ubuntu" : id;
          const baseCodename = codename || (await $`bash -c '. /etc/os-release && echo $UBUNTU_CODENAME'`.text()).trim();

          await $`sudo bash -c 'echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${baseId} ${baseCodename} stable" > /etc/apt/sources.list.d/docker.list'`;
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`;
          break;
        }
        case "fedora":
          await $`sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo`;
          await $`sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`;
          break;
      }

      // Adiciona usuario ao grupo docker (sem precisar sudo)
      try {
        await $`sudo groupadd docker`.nothrow();
        await $`sudo usermod -aG docker ${process.env.USER}`;
        log.ok("Usuario adicionado ao grupo docker (efetivo no proximo login)");
      } catch {}

      // Habilita e inicia o servico
      try {
        await $`sudo systemctl enable docker`;
        await $`sudo systemctl start docker`;
        log.ok("Docker servico habilitado e iniciado");
      } catch {
        log.warn("Falha ao iniciar servico Docker — inicie manualmente: sudo systemctl start docker");
      }

      if (await commandExists("docker")) {
        const version = (await $`docker --version`.text()).trim();
        log.ok(`Docker instalado: ${version}`);
      }
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
  description: "Neovim + Zellij + VS Code + GitKraken + GitHub CLI + LazyGit + Tauri Dev + LazyDocker + Docker",
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

    // Seleciona quais instalar
    const installedIds = new Set(installed.map((t) => t.id));
    let selected: IDevTool[] = [];

    if (ctx.isAll) {
      selected = DEV_TOOLS;
    } else {
      selected = await checkboxWithAll("Quais dev tools deseja instalar?", DEV_TOOLS, installedIds);
    }

    const toInstall = selected.filter((t) => !installedIds.has(t.id));

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

    // Configura symlinks para todas as tools selecionadas (instaladas ou nao)
    for (const tool of selected) {
      if (tool.configure && (await tool.isInstalled())) {
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
