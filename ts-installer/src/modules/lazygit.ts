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

export const lazygit: IModule = {
  id: "lazygit",
  name: "LazyGit",
  emoji: "🦥",
  description: "Config LazyGit (Git TUI)",
  installsSoftware: true,

  async run() {
    log.title("lazygit", "LazyGit");

    if (!(await commandExists("lazygit"))) {
      log.add("Instalando LazyGit...");
      const distro = await getDistro();

      if (distro === "arch") {
        await pkgInstall("lazygit");
        log.ok("LazyGit instalado");
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
          log.ok("LazyGit instalado");
        } catch {
          log.warn("Falha ao instalar LazyGit");
        }
      }
    } else {
      const version = (await $`lazygit --version`.text()).split("\n")[0].trim();
      log.ok(`LazyGit ja instalado: ${version}`);
    }

    await symlink(
      `${DOTFILES_DIR}/lazygit/config.yml`,
      `${HOME}/.config/lazygit/config.yml`
    );
    log.ok("~/.config/lazygit/config.yml -> cbdotfiles");
  },
};
