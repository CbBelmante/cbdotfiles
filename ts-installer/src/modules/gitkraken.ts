import { $ } from "bun";
import type { IModule } from "./index";
import { commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

export const gitkraken: IModule = {
  id: "gitkraken",
  name: "GitKraken",
  emoji: "🐙",
  description: "GitKraken (Git GUI)",
  installsSoftware: true,

  async run() {
    log.title("gitkraken", "GitKraken");

    if (await commandExists("gitkraken")) {
      log.ok("GitKraken ja instalado");
      return;
    }

    // Checa flatpak tambem
    try {
      const flatpakList = await $`flatpak list 2>/dev/null`.text();
      if (flatpakList.includes("gitkraken")) {
        log.ok("GitKraken ja instalado (flatpak)");
        return;
      }
    } catch {}

    log.add("Instalando GitKraken...");
    const distro = await getDistro();

    switch (distro) {
      case "arch":
        await pkgInstall("gitkraken");
        break;
      case "debian": {
        log.add("Baixando GitKraken .deb...");
        const deb = "/tmp/gitkraken.deb";
        await $`curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.deb -o ${deb}`;
        await $`sudo dpkg -i ${deb}`.nothrow();
        await $`sudo apt install -f -y`.nothrow();
        await $`rm -f ${deb}`;
        break;
      }
      case "fedora": {
        log.add("Baixando GitKraken .rpm...");
        const rpm = "/tmp/gitkraken.rpm";
        await $`curl -sL https://release.gitkraken.com/linux/gitkraken-amd64.rpm -o ${rpm}`;
        await $`sudo dnf install -y ${rpm}`;
        await $`rm -f ${rpm}`;
        break;
      }
      default:
        log.warn("Distro nao suportada. Instale GitKraken manualmente.");
        return;
    }

    log.ok("GitKraken instalado");
  },
};
