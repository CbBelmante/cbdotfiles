import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, commandExists, getDesktop, getDistro, pkgInstall, symlink, versionGte } from "../helpers";
import { log, tracker } from "../log";
import { NVM, TERMINAL } from "../defaults";

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
    tracker.installed("Zsh");
  } else {
    const version = (await $`zsh --version`.text()).trim();
    log.ok(`Zsh ja instalado: ${version}`);
    tracker.skipped("Zsh");
  }

  // Oh My Zsh
  const omzFile = `${HOME}/.oh-my-zsh/oh-my-zsh.sh`;
  if (!existsSync(omzFile)) {
    log.add("Instalando Oh My Zsh...");
    if (existsSync(`${HOME}/.oh-my-zsh`)) {
      log.add("Diretorio ~/.oh-my-zsh incompleto, reinstalando...");
      await $`rm -rf ${HOME}/.oh-my-zsh`;
    }
    await $`curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -o /tmp/omz-install.sh`;
    await $`sh /tmp/omz-install.sh --unattended --keep-zshrc`;
    await $`rm -f /tmp/omz-install.sh`;
    log.ok("Oh My Zsh instalado");
    tracker.installed("Oh My Zsh");
  } else {
    log.ok("Oh My Zsh ja instalado");
    tracker.skipped("Oh My Zsh");
  }

  // Powerlevel10k
  const zshCustom = process.env.ZSH_CUSTOM || `${HOME}/.oh-my-zsh/custom`;
  const p10kDir = `${zshCustom}/themes/powerlevel10k`;

  if (!existsSync(p10kDir)) {
    log.add("Instalando Powerlevel10k...");
    await $`git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${p10kDir}`;
    tracker.installed("Powerlevel10k");
  } else {
    log.ok("Powerlevel10k ja instalado");
    tracker.skipped("Powerlevel10k");
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
      tracker.installed(plugin.name);
    } else {
      log.ok(`${plugin.name} ja instalado`);
      tracker.skipped(plugin.name);
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

  tracker.configured("zsh configs");
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
    await $`curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM.version}/install.sh -o /tmp/nvm-install.sh`;
    await $`bash /tmp/nvm-install.sh`;
    await $`rm -f /tmp/nvm-install.sh`;
    tracker.installed("NVM");
  } else {
    log.ok("NVM ja instalado");
    tracker.skipped("NVM");
  }

  // Instala Node LTS via NVM
  const nvmSh = existsSync(nvmDir) ? `${nvmDir}/nvm.sh` : `${nvmAlt}/nvm.sh`;

  if (existsSync(nvmSh)) {
    try {
      const script = [
        "#!/bin/bash",
        `source "${nvmSh}"`,
        "nvm install --lts --default",
        "node --version",
      ].join("\n");

      await Bun.write("/tmp/nvm-setup.sh", script);
      const result = await $`bash /tmp/nvm-setup.sh`.nothrow().text();
      await $`rm -f /tmp/nvm-setup.sh`.nothrow();

      const version = result.trim().split("\n").pop()?.trim();
      if (version?.startsWith("v")) {
        log.ok(`Node ${version} (LTS) + npm`);
        tracker.skipped("Node");
      } else {
        log.warn("Rode: source ~/.nvm/nvm.sh && nvm install --lts");
        tracker.warning("Node LTS");
      }
    } catch {
      log.warn("Rode: source ~/.nvm/nvm.sh && nvm install --lts");
      tracker.warning("Node LTS");
    }
  }
}

// ---------------------------------------------------------------------------
// Git config
// ---------------------------------------------------------------------------

async function setupGit() {
  log.title("git", "Git");

  // Remove symlink se existir (evita loop circular de include)
  const globalGitconfig = `${HOME}/.gitconfig`;
  try {
    const stats = require("fs").lstatSync(globalGitconfig);
    if (stats.isSymbolicLink()) {
      await $`rm ${globalGitconfig}`.nothrow();
      log.dim("Removido symlink ~/.gitconfig (usando include.path)");
    }
  } catch {}

  // Nome/email ja configurados no install.ts (antes dos modulos)
  // Aqui so faz o include.path das configs compartilhaveis
  const gitconfigExtra = `${DOTFILES_DIR}/git/.gitconfig`;
  if (existsSync(gitconfigExtra)) {
    // Verifica se ja esta incluido
    try {
      const current = (await $`git config --global include.path`.nothrow().text()).trim();
      if (current === gitconfigExtra) {
        log.ok("git include.path -> cbdotfiles/.gitconfig (ja configurado)");
      } else {
        await $`git config --global include.path ${gitconfigExtra}`;
        log.ok("git include.path -> cbdotfiles/.gitconfig");
      }
    } catch {
      await $`git config --global include.path ${gitconfigExtra}`;
      log.ok("git include.path -> cbdotfiles/.gitconfig");
    }
  }

  tracker.configured("git");
}

// ---------------------------------------------------------------------------
// SSH key (GitHub/GitLab)
// ---------------------------------------------------------------------------

async function setupSSH() {
  log.title("ssh", "SSH Key");

  const sshDir = `${HOME}/.ssh`;
  const keyFile = `${sshDir}/id_ed25519`;
  const pubFile = `${keyFile}.pub`;

  if (existsSync(pubFile)) {
    const pubKey = (await Bun.file(pubFile).text()).trim();
    log.ok("Chave SSH ja existe");
    log.dim(`  ${pubKey.substring(0, 80)}...`);
    tracker.skipped("SSH key");
    return;
  }

  // Pega email do git config pra usar na chave
  let email = "";
  try {
    email = (await $`git config --global user.email`.text()).trim();
  } catch {}

  if (!email) {
    log.warn("Configure o email do Git primeiro (aparece antes no install)");
    tracker.warning("SSH key");
    return;
  }

  log.add(`Gerando chave SSH (ed25519) para ${email}...`);

  try {
    await $`mkdir -p ${sshDir}`;
    await $`chmod 700 ${sshDir}`;
    await $`ssh-keygen -t ed25519 -C ${email} -f ${keyFile} -N ""`;
    log.ok("Chave SSH gerada");

    // Inicia ssh-agent e adiciona a chave
    await $`bash -c 'eval "$(ssh-agent -s)" && ssh-add ${keyFile}'`.nothrow();
    log.ok("Chave adicionada ao ssh-agent");

    // Mostra a chave publica
    const pubKey = (await Bun.file(pubFile).text()).trim();
    console.log();
    console.log("  ┌─────────────────────────────────────────────────────┐");
    console.log("  │  Copie a chave abaixo e adicione no GitHub/GitLab:  │");
    console.log("  │  GitHub: https://github.com/settings/ssh/new       │");
    console.log("  └─────────────────────────────────────────────────────┘");
    console.log();
    console.log(`  ${pubKey}`);
    console.log();

    tracker.installed("SSH key");
  } catch {
    log.warn("Falha ao gerar chave SSH — rode manualmente:");
    log.warn(`  ssh-keygen -t ed25519 -C "${email}"`);
    tracker.warning("SSH key");
  }
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
        await $`curl -sSfL https://raw.githubusercontent.com/ajeetdsouza/zoxide/main/install.sh -o /tmp/zoxide-install.sh`;
        await $`sh /tmp/zoxide-install.sh`;
        await $`rm -f /tmp/zoxide-install.sh`;
      },
    },
    {
      name: "fzf",
      cmd: "fzf",
      packages: ["fzf"],
      fallback: async () => {
        await $`curl -fsSL https://github.com/junegunn/fzf/releases/latest/download/fzf-$(curl -s https://api.github.com/repos/junegunn/fzf/releases/latest | grep tag_name | cut -d'"' -f4)-linux_amd64.tar.gz -o /tmp/fzf.tar.gz`.nothrow();
        // fallback simples: git clone
        if (!existsSync("/tmp/fzf.tar.gz")) {
          await $`git clone --depth 1 https://github.com/junegunn/fzf.git ${HOME}/.fzf`;
          await $`${HOME}/.fzf/install --all --no-bash --no-fish`;
        } else {
          await $`tar xf /tmp/fzf.tar.gz -C ${HOME}/.local/bin/`;
          await $`rm -f /tmp/fzf.tar.gz`;
        }
      },
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
      fallback: async () => {
        // eza nao esta nos repos padrao do Ubuntu/Debian antigo
        // Adiciona o repo oficial do eza
        await $`sudo mkdir -p /etc/apt/keyrings`;
        await $`curl -fsSL https://raw.githubusercontent.com/eza-community/eza/main/deb.asc -o /tmp/eza-key.asc`;
        await $`sudo gpg --yes --dearmor -o /etc/apt/keyrings/gierens.gpg /tmp/eza-key.asc`;
        await $`rm -f /tmp/eza-key.asc`;
        await $`sudo chmod 644 /etc/apt/keyrings/gierens.gpg`;
        await $`sudo bash -c 'echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" > /etc/apt/sources.list.d/gierens.list'`;
        await $`sudo chmod 644 /etc/apt/sources.list.d/gierens.list`;
        await $`sudo apt update -qq`.quiet();
        await $`sudo apt install -y eza`;
      },
    },
  ];

  for (const tool of tools) {
    const altCmd = tool.cmd === "bat" ? "batcat" : null;
    const exists =
      (await commandExists(tool.cmd)) ||
      (altCmd && (await commandExists(altCmd)));

    if (!exists) {
      log.add(`Instalando ${tool.name}...`);
      const installed = await pkgInstall(...tool.packages);
      // Se pkgInstall falhou e tem fallback, tenta o fallback
      if (!installed && tool.fallback) {
        try {
          await tool.fallback();
        } catch {
          log.warn(`Falha ao instalar ${tool.name}`);
          tracker.warning(tool.name);
          continue;
        }
      }
      log.ok(`${tool.name} instalado`);
      tracker.installed(tool.name);
    } else {
      log.ok(`${tool.name} ja instalado`);
      tracker.skipped(tool.name);
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

  const KITTY_MIN_VERSION = TERMINAL.minVersion;
  const kittyApp = `${HOME}/.local/kitty.app/bin/kitty`;

  // Checa se ja tem kitty >= 0.40 (instalado via site oficial)
  let needsInstall = true;
  if (existsSync(kittyApp)) {
    const ver = (await $`${kittyApp} --version`.text().catch(() => "")).match(/\d+\.\d+\.\d+/)?.[0];
    if (ver && versionGte(ver, KITTY_MIN_VERSION)) {
      log.ok(`Kitty ja instalado: v${ver} (>= ${KITTY_MIN_VERSION})`);
      needsInstall = false;
      tracker.skipped("Kitty");
    } else {
      log.warn(`Kitty v${ver || "?"} encontrado, precisa >= ${KITTY_MIN_VERSION}`);
    }
  } else if (await commandExists("kitty")) {
    const ver = (await $`kitty --version`.text().catch(() => "")).match(/\d+\.\d+\.\d+/)?.[0];
    if (ver && versionGte(ver, KITTY_MIN_VERSION)) {
      log.ok(`Kitty ja instalado: v${ver} (>= ${KITTY_MIN_VERSION})`);
      needsInstall = false;
      tracker.skipped("Kitty");
    } else {
      log.warn(`Kitty v${ver || "?"} do sistema, precisa >= ${KITTY_MIN_VERSION}`);
    }
  }

  if (needsInstall) {
    log.add("Instalando Kitty do site oficial (latest)...");
    await $`curl -sSL https://sw.kovidgoyal.net/kitty/installer.sh -o /tmp/kitty-installer.sh`.nothrow();
    await $`sh /tmp/kitty-installer.sh launch=n`.nothrow();
    await $`rm -f /tmp/kitty-installer.sh`.nothrow();
    if (existsSync(kittyApp)) {
      const ver = (await $`${kittyApp} --version`.text().catch(() => "")).match(/\d+\.\d+\.\d+/)?.[0];
      log.ok(`Kitty v${ver} instalado`);
      tracker.installed("Kitty");
    } else {
      log.warn("Falha ao instalar Kitty — instale manualmente: https://sw.kovidgoyal.net/kitty/");
      tracker.warning("Kitty");
    }
  }

  // Symlinks pra ~/.local/bin (garante que 'kitty' aponta pro novo)
  await $`mkdir -p ${HOME}/.local/bin`.nothrow();
  if (existsSync(kittyApp)) {
    await $`ln -sf ${kittyApp} ${HOME}/.local/bin/kitty`.nothrow();
    await $`ln -sf ${HOME}/.local/kitty.app/bin/kitten ${HOME}/.local/bin/kitten`.nothrow();
    log.ok("~/.local/bin/kitty -> kitty.app (latest)");
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
      // Tenta gerar tema COSMIC (nao falha se tema nao existe)
      const themeDir = `${HOME}/.config/cosmic/com.system76.CosmicTheme.Dark/v1`;
      if (existsSync(themeDir)) {
        log.add("Detectando tema COSMIC...");
        const result = await $`bash ${DOTFILES_DIR}/kitty/generate-cosmic-theme.sh`.nothrow();
        if (result.exitCode === 0) {
          log.ok("cosmic.conf gerado a partir do tema COSMIC ativo");
        } else {
          log.warn("Falha ao gerar tema COSMIC — usando cosmic.conf padrao");
        }
      } else {
        log.dim("Tema COSMIC Dark nao encontrado — usando cosmic.conf padrao");
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

  tracker.configured("kitty configs");
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
    await setupSSH();
    await setupKitty();
    await setupCliTools();
  },
};
