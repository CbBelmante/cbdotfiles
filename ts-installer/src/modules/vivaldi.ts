import { $ } from "bun";
import type { IModule } from "./index";
import { commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

export const vivaldi: IModule = {
  id: "vivaldi",
  name: "Vivaldi",
  emoji: "🌐",
  description: "Vivaldi Browser",
  installsSoftware: true,

  async run() {
    log.title("vivaldi", "Vivaldi Browser");

    if (await commandExists("vivaldi")) {
      const version = (await $`vivaldi --version 2>&1`.text()).split("\n")[0].trim();
      log.ok(`Vivaldi ja instalado: ${version}`);
      return;
    }

    log.add("Instalando Vivaldi...");
    const distro = await getDistro();

    switch (distro) {
      case "arch":
        await pkgInstall("vivaldi");
        break;
      case "debian":
        log.add("Adicionando repositorio Vivaldi...");
        await $`curl -fsSL https://repo.vivaldi.com/archive/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/vivaldi-browser.gpg`;
        await $`echo "deb [signed-by=/usr/share/keyrings/vivaldi-browser.gpg] https://repo.vivaldi.com/archive/deb/ stable main" | sudo tee /etc/apt/sources.list.d/vivaldi.list > /dev/null`;
        await $`sudo apt update -qq`.quiet();
        await $`sudo apt install -y vivaldi-stable`;
        break;
      case "fedora":
        await $`sudo dnf config-manager --add-repo https://repo.vivaldi.com/archive/vivaldi-fedora.repo`;
        await $`sudo dnf install -y vivaldi-stable`;
        break;
      default:
        log.warn("Distro nao suportada. Instale Vivaldi manualmente.");
        return;
    }

    log.ok("Vivaldi instalado");
  },
};
