import { $ } from "bun";
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

export const fastfetch: IModule = {
  id: "fastfetch",
  name: "Fastfetch",
  emoji: "🖥️",
  description: "Config Fastfetch (system info)",
  installsSoftware: true,

  async run() {
    log.title("fastfetch", "Fastfetch");

    if (!(await commandExists("fastfetch"))) {
      log.add("Instalando Fastfetch...");
      const distro = await getDistro();
      if (distro === "debian") {
        await $`sudo add-apt-repository -y ppa:zhangsongcui3371/fastfetch`.nothrow();
        await $`sudo apt update -qq`.quiet().nothrow();
      }
      await pkgInstall("fastfetch");
      log.ok("Fastfetch instalado");
    } else {
      const version = (await $`fastfetch --version`.text()).split("\n")[0].trim();
      log.ok(`Fastfetch ja instalado: ${version}`);
    }

    await symlink(
      `${DOTFILES_DIR}/fastfetch/config.jsonc`,
      `${HOME}/.config/fastfetch/config.jsonc`
    );
    log.ok("~/.config/fastfetch/config.jsonc -> cbdotfiles");
  },
};
