import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, commandExists, pkgInstall, symlink } from "../helpers";
import { log } from "../log";

export const zsh: IModule = {
  id: "zsh",
  name: "Zsh",
  emoji: "🐚",
  description: "Oh My Zsh + Powerlevel10k + plugins + symlink .zshrc",
  installsSoftware: true,

  async run() {
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
  },
};
