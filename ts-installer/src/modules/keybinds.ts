import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, getDesktop, symlink } from "../helpers";
import { log } from "../log";

export const keybinds: IModule = {
  id: "keybinds",
  name: "Keybinds",
  emoji: "⌨️",
  description: "Gera e aplica keybinds (Hyprland/COSMIC)",
  installsSoftware: false,

  async run() {
    log.title("keybinds", "Keybinds");

    // Gerar configs a partir da fonte unica
    await $`bash ${DOTFILES_DIR}/keybinds/generate.sh`;

    const generated = `${DOTFILES_DIR}/keybinds/generated`;
    const desktop = await getDesktop();

    // Aplicar Hyprland
    const hyprDir = `${HOME}/.config/hypr`;
    if (desktop === "omarchy" || existsSync(hyprDir)) {
      const hyprBindings = `${generated}/hyprland-bindings.conf`;
      if (existsSync(hyprBindings)) {
        await symlink(hyprBindings, `${hyprDir}/bindings.conf`);
        log.ok("~/.config/hypr/bindings.conf -> cbdotfiles (generated)");
      }
    }

    // Aplicar COSMIC
    const cosmicDir = `${HOME}/.config/cosmic`;
    if (desktop === "cosmic" || existsSync(cosmicDir)) {
      const cosmicCustom = `${generated}/cosmic-custom.ron`;
      if (existsSync(cosmicCustom)) {
        const shortcutsDir = `${cosmicDir}/com.system76.CosmicSettings.Shortcuts/v1`;
        await $`mkdir -p ${shortcutsDir}`;
        await $`cp ${cosmicCustom} ${shortcutsDir}/custom`;
        log.ok("~/.config/cosmic/.../Shortcuts/v1/custom -> cbdotfiles (generated)");
      }

      // Terminal padrao -> kitty
      const actionsDir = `${cosmicDir}/com.system76.CosmicSettings.Shortcuts/v1`;
      await $`mkdir -p ${actionsDir}`;
      await Bun.write(`${actionsDir}/system_actions`, '{ Terminal: "kitty" }');
      log.ok("COSMIC terminal padrao -> kitty");
    }

    if (desktop === "unknown") {
      log.warn("Ambiente desktop nao detectado (Hyprland/COSMIC)");
      log.warn("Configs gerados em: keybinds/generated/");
    }
  },
};
