import { $ } from "bun";
import { existsSync } from "fs";
import type { IModule } from "./index";
import { HOME } from "../helpers";
import { log } from "../log";

export const nvm: IModule = {
  id: "nvm",
  name: "NVM",
  emoji: "📦",
  description: "Node Version Manager",
  installsSoftware: true,

  async run() {
    log.title("nvm", "NVM");

    const nvmDir = `${HOME}/.nvm`;
    const nvmAlt = `${HOME}/.config/nvm`;

    if (!existsSync(nvmDir) && !existsSync(nvmAlt)) {
      log.add("Instalando NVM...");
      await $`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash`;
    } else {
      log.ok("NVM ja instalado");
    }

    // NVM e uma funcao shell — nao funciona direto no Bun.
    // Instalamos via script e avisamos o usuario.
    log.ok("NVM instalado. Para instalar Node LTS:");
    log.dim("  source ~/.nvm/nvm.sh && nvm install --lts --default");
  },
};
