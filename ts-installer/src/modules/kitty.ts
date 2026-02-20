import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import {
  DOTFILES_DIR,
  HOME,
  commandExists,
  getDesktop,
  pkgInstall,
  symlink,
} from "../helpers";
import { log } from "../log";

export const kitty: IModule = {
  id: "kitty",
  name: "Kitty",
  emoji: "🐱",
  description: "Config Kitty + override por ambiente (Omarchy/COSMIC)",
  installsSoftware: true,

  async run() {
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
        await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
        log.ok("env: omarchy (opacity 0.65)");
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
        await symlink(`${DOTFILES_DIR}/kitty/omarchy.conf`, envConf);
        log.warn("Desktop nao detectado, usando config omarchy como padrao");
        break;
    }

    // Local override
    const localKitty = `${DOTFILES_DIR}/local/kitty/kitty.conf`;
    if (existsSync(localKitty)) {
      await symlink(localKitty, `${HOME}/.config/kitty/local.conf`);
      log.ok("~/.config/kitty/local.conf -> local override");
    }
  },
};
