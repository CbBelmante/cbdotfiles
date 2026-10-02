import { $ } from "bun";
import { existsSync, lstatSync } from "fs";
import type { IModule } from "./index";
import { DOTFILES_DIR, HOME, getDesktop, symlink } from "../helpers";
import { log, tracker } from "../log";

export const keybinds: IModule = {
  id: "keybinds",
  name: "Keybinds",
  emoji: "⌨️",
  description: "Gera e aplica keybinds (Hyprland/COSMIC)",
  installsSoftware: false,
  platforms: ["linux"],

  async run() {
    log.title("keybinds", "Keybinds");

    // Gerar configs a partir da fonte unica
    await $`bash ${DOTFILES_DIR}/keybinds/generate.sh`;

    const generated = `${DOTFILES_DIR}/keybinds/generated`;
    const desktop = await getDesktop();

    // Aplicar Hyprland
    const hyprDir = `${HOME}/.config/hypr`;
    if (desktop === "omarchy" || desktop === "hyprland" || existsSync(hyprDir)) {
      // O Omarchy 4 (2026-08-14) carrega hyprland.lua e IGNORA os .conf EM
      // SILENCIO — "left on disk, unloaded and unbacked up, with no error".
      // A presenca do hyprland.lua e o sinal de qual formato a maquina de fato
      // le, mais confiavel que versao declarada. Omarchy 3.x e Hyprland puro
      // seguem no .conf, intactos.
      const isLua = existsSync(`${hyprDir}/hyprland.lua`);
      const file = isLua ? "bindings.lua" : "bindings.conf";
      const source = `${generated}/hyprland-${isLua ? "bindings.lua" : "bindings.conf"}`;
      const target = `${hyprDir}/${file}`;

      if (existsSync(source)) {
        // `symlink` usa `ln -sf`, que sobrescreve sem backup. No Omarchy 4 o
        // bindings.lua ja vem populado com os overrides do usuario, entao um
        // arquivo real (nao symlink nosso) e preservado antes de linkar.
        if (existsSync(target) && !lstatSync(target).isSymbolicLink()) {
          const stamp = new Date().toISOString().slice(0, 10);
          const backup = `${target}.cbdotfiles-${stamp}.bak`;
          if (!existsSync(backup)) {
            await $`cp ${target} ${backup}`;
            log.ok(`backup: ${file} -> ${file}.cbdotfiles-${stamp}.bak`);
          }
        }

        await symlink(source, target);
        log.ok(`~/.config/hypr/${file} -> cbdotfiles (gerado)`);
        if (isLua) log.ok("Omarchy 4+ detectado (hyprland.lua) — formato Lua");
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

    tracker.configured("keybinds");

    if (!["omarchy", "hyprland", "sway", "cosmic"].includes(desktop)) {
      log.warn(`Desktop '${desktop}' nao suporta keybinds automaticos`);
      log.warn("Configs gerados em: keybinds/generated/");
      tracker.warning(`${desktop} sem suporte`);
    }
  },
};
