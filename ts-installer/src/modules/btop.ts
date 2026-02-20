import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, commandExists, pkgInstall, symlink } from "../helpers";
import { log } from "../log";
import { $ } from "bun";

export const btop: IModule = {
  id: "btop",
  name: "Btop",
  emoji: "📊",
  description: "Config Btop (monitor de sistema)",
  installsSoftware: true,

  async run() {
    log.title("btop", "Btop");

    if (!(await commandExists("btop"))) {
      log.add("Instalando Btop...");
      await pkgInstall("btop");
      log.ok("Btop instalado");
    } else {
      const version = (await $`btop --version`.text().catch(() => "btop")).trim();
      log.ok(`Btop ja instalado: ${version}`);
    }

    await symlink(
      `${DOTFILES_DIR}/btop/btop.conf`,
      `${HOME}/.config/btop/btop.conf`
    );
    log.ok("~/.config/btop/btop.conf -> cbdotfiles");
  },
};
