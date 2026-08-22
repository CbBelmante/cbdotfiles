import { $ } from "bun";
import { readdirSync } from "fs";
import type { IModule } from "./index";
import { HOME, getDistro, isMacos, pkgInstall } from "../helpers";
import { log, tracker } from "../log";
import { FONTS as FONT_DEFAULTS } from "../defaults";

interface IFont {
  name: string;
  archPkg: string;
  fcName: string;
}

const FONTS: IFont[] = FONT_DEFAULTS.map((f) => ({
  name: f.name,
  archPkg: `ttf-${f.name.toLowerCase()}-nerd`,
  fcName: f.name === "CascadiaMono" ? "CaskaydiaMono" : f.name,
}));

export const fonts: IModule = {
  id: "fonts",
  name: "Fonts",
  emoji: "🔤",
  description: "Fontes Nerd Font (CaskaydiaMono, JetBrainsMono)",
  installsSoftware: true,

  async run() {
    log.title("fonts", "Nerd Fonts");

    const distro = await getDistro();

    const fontDir = isMacos()
      ? `${HOME}/Library/Fonts`
      : `${HOME}/.local/share/fonts`;

    for (const font of FONTS) {
      // Checa se ja esta instalada
      let installed = false;
      if (isMacos()) {
        try {
          const files = readdirSync(fontDir);
          installed = files.some((f) => f.toLowerCase().includes(font.fcName.toLowerCase()));
        } catch {}
      } else {
        try {
          const fcList = await $`fc-list`.text();
          installed = fcList.toLowerCase().includes(font.fcName.toLowerCase());
        } catch {}
      }

      if (installed) {
        log.ok(`${font.fcName} Nerd Font ja instalada`);
        tracker.skipped(font.fcName);
        continue;
      }

      log.add(`Instalando ${font.name} Nerd Font...`);

      if (distro === "arch") {
        if (await pkgInstall(font.archPkg)) {
          log.ok(`${font.name} Nerd Font instalada`);
          tracker.installed(font.fcName);
        }
      } else {
        const url = `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${font.name}.tar.xz`;
        const tmp = `/tmp/${font.name}-nerd.tar.xz`;

        try {
          await $`mkdir -p ${fontDir}`;
          await $`curl -sLo ${tmp} ${url}`;
          await $`tar xf ${tmp} -C ${fontDir}`;
          await $`rm -f ${tmp}`;
          log.ok(`${font.name} Nerd Font instalada`);
          tracker.installed(font.fcName);
        } catch {
          log.warn(`Falha ao instalar ${font.name} Nerd Font`);
          tracker.warning(font.fcName);
        }
      }
    }

    // Atualiza cache de fontes (Linux only)
    if (distro !== "arch" && !isMacos()) {
      await $`fc-cache -f`.quiet().nothrow();
    }
  },
};
