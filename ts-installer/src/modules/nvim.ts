import { $ } from "bun";
import { existsSync, lstatSync } from "fs";
import type { IModule } from "./index";
import {
  DOTFILES_DIR,
  HOME,
  commandExists,
  getDistro,
  pkgInstall,
  versionGte,
} from "../helpers";
import { log } from "../log";

const MIN_VERSION = "0.11.2";

export const nvim: IModule = {
  id: "nvim",
  name: "Neovim",
  emoji: "✏️",
  description: `Config completa Neovim (LazyVim) >= ${MIN_VERSION}`,
  installsSoftware: true,

  async run() {
    log.title("nvim", "Neovim");

    let needsInstall = false;

    if (!(await commandExists("nvim"))) {
      needsInstall = true;
    } else {
      const versionOutput = (await $`nvim --version`.text()).split("\n")[0];
      const current = versionOutput.match(/\d+\.\d+\.\d+/)?.[0] || "0.0.0";

      if (versionGte(current, MIN_VERSION)) {
        log.ok(`Neovim ja instalado: v${current} (>= ${MIN_VERSION})`);
      } else {
        log.warn(
          `Neovim v${current} encontrado, mas LazyVim requer >= ${MIN_VERSION}`
        );
        needsInstall = true;
      }
    }

    if (needsInstall) {
      log.add(`Instalando Neovim >= ${MIN_VERSION}...`);
      const distro = await getDistro();

      if (distro === "arch") {
        await pkgInstall("neovim");
      } else {
        await $`mkdir -p ${HOME}/.local/bin ${HOME}/.local/nvim`;
        log.add("Baixando Neovim do GitHub (latest stable)...");
        await $`curl -sL https://github.com/neovim/neovim/releases/latest/download/nvim-linux-x86_64.tar.gz | tar xz --strip-components=1 -C ${HOME}/.local/nvim/`;
        await $`ln -sf ${HOME}/.local/nvim/bin/nvim ${HOME}/.local/bin/nvim`;
        await $`chmod +x ${HOME}/.local/bin/nvim`;
      }

      // Verifica se instalou
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
    }

    // Symlink config
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
};
