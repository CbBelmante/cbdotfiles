import { $ } from "bun";
import { readdirSync } from "fs";
import type { IModule } from "./index";
import {
  DOTFILES_DIR,
  HOME,
  commandExists,
  getDistro,
  pkgInstall,
  symlink,
} from "../helpers";
import { log } from "../log";

export const zellij: IModule = {
  id: "zellij",
  name: "Zellij",
  emoji: "🖥️",
  description: "Multiplexador de terminal + config + layouts",
  installsSoftware: true,

  async run() {
    log.title("zellij", "Zellij");

    if (!(await commandExists("zellij"))) {
      log.add("Instalando Zellij...");
      const distro = await getDistro();

      if (distro === "arch") {
        await pkgInstall("zellij");
      } else {
        await $`mkdir -p ${HOME}/.local/bin`;
        await $`curl -sL https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz | tar xz -C ${HOME}/.local/bin/`;
        await $`chmod +x ${HOME}/.local/bin/zellij`;
      }
      log.ok("Zellij instalado");
    } else {
      const version = (await $`zellij --version`.text()).trim();
      log.ok(`Zellij ja instalado: ${version}`);
    }

    // Config principal
    await $`mkdir -p ${HOME}/.config/zellij/layouts`;
    await symlink(
      `${DOTFILES_DIR}/zellij/config.kdl`,
      `${HOME}/.config/zellij/config.kdl`
    );
    log.ok("~/.config/zellij/config.kdl -> cbdotfiles");

    // Layouts (todos os .kdl exceto config.kdl)
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
};
