import { $ } from "bun";
import type { IModule } from "./index";
import { HOME, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

interface IFont {
  name: string;
  archPkg: string;
}

const FONTS: IFont[] = [
  { name: "CaskaydiaMono", archPkg: "ttf-cascadia-mono-nerd" },
  { name: "JetBrainsMono", archPkg: "ttf-jetbrains-mono-nerd" },
];

export const fonts: IModule = {
  id: "fonts",
  name: "Fonts",
  emoji: "🔤",
  description: "Fontes Nerd Font (CaskaydiaMono, JetBrainsMono)",
  installsSoftware: true,

  async run() {
    log.title("fonts", "Nerd Fonts");

    const distro = await getDistro();

    for (const font of FONTS) {
      // Checa se ja esta instalada
      try {
        const fcList = await $`fc-list`.text();
        if (fcList.toLowerCase().includes(font.name.toLowerCase())) {
          log.ok(`${font.name} Nerd Font ja instalada`);
          continue;
        }
      } catch {}

      log.add(`Instalando ${font.name} Nerd Font...`);

      if (distro === "arch") {
        if (await pkgInstall(font.archPkg)) {
          log.ok(`${font.name} Nerd Font instalada`);
        }
      } else {
        // Debian/Fedora: baixa do GitHub
        const fontDir = `${HOME}/.local/share/fonts`;
        const url = `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/${font.name}.tar.xz`;
        const tmp = `/tmp/${font.name}-nerd.tar.xz`;

        try {
          await $`mkdir -p ${fontDir}`;
          await $`curl -sLo ${tmp} ${url}`;
          await $`tar xf ${tmp} -C ${fontDir}`;
          await $`rm -f ${tmp}`;
          log.ok(`${font.name} Nerd Font instalada`);
        } catch {
          log.warn(`Falha ao instalar ${font.name} Nerd Font`);
        }
      }
    }

    // Atualiza cache de fontes
    if (distro !== "arch") {
      await $`fc-cache -f`.quiet().nothrow();
    }
  },
};
