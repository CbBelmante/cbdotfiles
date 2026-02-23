import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, commandExists, getDesktop, getDistro, pkgInstall, symlink } from "../helpers";
import { log } from "../log";

// ---------------------------------------------------------------------------
// Zsh + Oh My Zsh + plugins
// ---------------------------------------------------------------------------

async function setupZsh() {
  log.title("zsh", "Zsh");

  // Instalar zsh
  if (!(await commandExists("zsh"))) {
    log.add("Instalando zsh...");
    await pkgInstall("zsh");
    log.ok("Zsh instalado");
  } else {
    const version = (await $`zsh --version`.text()).trim();
    log.ok(`Zsh ja instalado: ${version}`);
  }

  // Oh My Zsh
  const omzFile = `${HOME}/.oh-my-zsh/oh-my-zsh.sh`;
  if (!existsSync(omzFile)) {
    log.add("Instalando Oh My Zsh...");
    if (existsSync(`${HOME}/.oh-my-zsh`)) {
      log.add("Diretorio ~/.oh-my-zsh incompleto, reinstalando...");
      await $`rm -rf ${HOME}/.oh-my-zsh`;
    }
    await $`sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended --keep-zshrc`;
    log.ok("Oh My Zsh instalado");
  } else {
    log.ok("Oh My Zsh ja instalado");
  }

  // Powerlevel10k
  const zshCustom = process.env.ZSH_CUSTOM || `${HOME}/.oh-my-zsh/custom`;
  const p10kDir = `${zshCustom}/themes/powerlevel10k`;

  if (!existsSync(p10kDir)) {
    log.add("Instalando Powerlevel10k...");
    await $`git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${p10kDir}`;
  } else {
    log.ok("Powerlevel10k ja instalado");
  }

  // Plugins
  const plugins = [
    { name: "zsh-autosuggestions", repo: "https://github.com/zsh-users/zsh-autosuggestions" },
    { name: "zsh-syntax-highlighting", repo: "https://github.com/zsh-users/zsh-syntax-highlighting" },
  ];

  for (const plugin of plugins) {
    const pluginDir = `${zshCustom}/plugins/${plugin.name}`;
    if (!existsSync(pluginDir)) {
      log.add(`Instalando ${plugin.name}...`);
      await $`git clone ${plugin.repo} ${pluginDir}`;
    } else {
      log.ok(`${plugin.name} ja instalado`);
    }
  }

  // Shell padrao
  const currentShell = process.env.SHELL || "";
  const zshPath = (await $`which zsh`.text()).trim();
  if (currentShell !== zshPath) {
    log.add("Definindo Zsh como shell padrao...");
    await $`sudo chsh -s ${zshPath} ${process.env.USER}`;
    log.ok("Zsh definido como shell padrao (efetivo no proximo login)");
  } else {
    log.ok("Zsh ja e o shell padrao");
  }

  // Symlinks
  await symlink(`${DOTFILES_DIR}/zsh/.zshrc`, `${HOME}/.zshrc`);
  log.ok("~/.zshrc -> cbdotfiles");

  await $`mkdir -p ${HOME}/.config/cb`;
  await symlink(`${DOTFILES_DIR}/zsh/aliases.zsh`, `${HOME}/.config/cb/aliases.zsh`);
  log.ok("~/.config/cb/aliases.zsh -> cbdotfiles");

  // Local override
  const localAliases = `${DOTFILES_DIR}/local/zsh/aliases.zsh`;
  if (existsSync(localAliases)) {
    await symlink(localAliases, `${HOME}/.config/cb/local.zsh`);
    log.ok("~/.config/cb/local.zsh -> local override");
  }
}

// ---------------------------------------------------------------------------
// NVM
// ---------------------------------------------------------------------------

async function setupNvm() {
  log.title("nvm", "NVM");

  const nvmDir = `${HOME}/.nvm`;
  const nvmAlt = `${HOME}/.config/nvm`;

  if (!existsSync(nvmDir) && !existsSync(nvmAlt)) {
    log.add("Instalando NVM...");
    await $`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`;
  } else {
    log.ok("NVM ja instalado");
  }

  log.ok("NVM instalado. Para instalar Node LTS:");
  log.dim("  source ~/.nvm/nvm.sh && nvm install --lts --default");
}

// ---------------------------------------------------------------------------
// Git config
// ---------------------------------------------------------------------------

async function setupGit() {
  log.title("git", "Git");

  await symlink(`${DOTFILES_DIR}/git/.gitconfig`, `${HOME}/.gitconfig`);
  log.ok("~/.gitconfig -> cbdotfiles");
}

// ---------------------------------------------------------------------------
// CLI tools (zoxide, fzf, ripgrep, bat, eza)
// ---------------------------------------------------------------------------

interface ITool {
  name: string;
  cmd: string;
  packages: string[];
  fallback?: () => Promise<void>;
}

async function setupCliTools() {
  log.title("shell-tools", "CLI Tools (zoxide, fzf, ripgrep, bat, eza)");

  const distro = await getDistro();

  const tools: ITool[] = [
    {
      name: "Zoxide",
      cmd: "zoxide",
      packages: ["zoxide"],
      fallback: async () => {
        await $`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh | sh`;
      },
    },
    {
      name: "fzf",
      cmd: "fzf",
      packages: ["fzf"],
    },
    {
      name: "ripgrep",
      cmd: "rg",
      packages: ["ripgrep"],
    },
    {
      name: "bat",
      cmd: "bat",
      packages: ["bat"],
    },
    {
      name: "eza",
      cmd: "eza",
      packages: ["eza"],
    },
  ];

  for (const tool of tools) {
    const altCmd = tool.cmd === "bat" ? "batcat" : null;
    const exists =
      (await commandExists(tool.cmd)) ||
      (altCmd && (await commandExists(altCmd)));

    if (!exists) {
      log.add(`Instalando ${tool.name}...`);
      if (distro !== "arch" && tool.fallback) {
        await tool.fallback();
      } else {
        await pkgInstall(...tool.packages);
      }
      log.ok(`${tool.name} instalado`);
    } else {
      log.ok(`${tool.name} ja instalado`);
    }
  }

  // Debian/Ubuntu: bat se chama batcat — criar symlink
  if (
    (await commandExists("batcat")) &&
    !(await commandExists("bat"))
  ) {
    await $`mkdir -p ${HOME}/.local/bin`;
    const batcatPath = (await $`which batcat`.text()).trim();
    await symlink(batcatPath, `${HOME}/.local/bin/bat`);
    log.ok("Symlink bat -> batcat");
  }
}

// ---------------------------------------------------------------------------
// Kitty terminal
// ---------------------------------------------------------------------------

async function setupKitty() {
  log.title("kitty", "Kitty");

  // Instalar kitty se nao instalado
  if (!(await commandExists("kitty"))) {
    log.add("Instalando Kitty...");
    if (await pkgInstall("kitty")) {
      log.ok("Kitty instalado");
    }
  } else {
    const version = (
      await $`kitty --version`.text().catch(() => "kitty")
    ).trim();
    log.ok(`Kitty ja instalado: ${version}`);
  }

  // Symlink config base
  await symlink(
    `${DOTFILES_DIR}/kitty/kitty.conf`,
    `${HOME}/.config/kitty/kitty.conf`
  );
  log.ok("~/.config/kitty/kitty.conf -> cbdotfiles");

  // Detecta ambiente e aplica override correto
  const desktop = await getDesktop();
  const envConf = `${HOME}/.config/kitty/env.conf`;

  switch (desktop) {
    case "omarchy":
    case "hyprland":
    case "sway":
      await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
      log.ok(`env: ${desktop} (opacity 0.65)`);
      break;

    case "cosmic": {
      // Tenta gerar tema COSMIC
      const themeDir = `${HOME}/.config/cosmic/com.system76.CosmicTheme.Dark/v1`;
      if (existsSync(themeDir)) {
        log.add("Detectando tema COSMIC...");
        await $`bash ${DOTFILES_DIR}/kitty/generate-cosmic-theme.sh`;
        log.ok("cosmic.conf gerado a partir do tema COSMIC ativo");
      }
      await symlink(`${DOTFILES_DIR}/kitty/cosmic.conf`, envConf);
      log.ok("env: cosmic");
      break;
    }

    default:
      // GNOME, KDE, Cinnamon, XFCE, etc. — usa config padrao
      await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
      log.ok(`env: ${desktop} (usando config padrao)`);
      break;
  }

  // Local override
  const localKitty = `${DOTFILES_DIR}/local/kitty/kitty.conf`;
  if (existsSync(localKitty)) {
    await symlink(localKitty, `${HOME}/.config/kitty/local.conf`);
    log.ok("~/.config/kitty/local.conf -> local override");
  }
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const shellTools: IModule = {
  id: "shell-tools",
  name: "Shell Tools",
  emoji: "🐚",
  description: "Zsh + Oh My Zsh + NVM + Git + Kitty + Zoxide + fzf + ripgrep + bat + eza",
  installsSoftware: true,

  async run() {
    await setupZsh();
    await setupNvm();
    await setupGit();
    await setupKitty();
    await setupCliTools();
  },
};
