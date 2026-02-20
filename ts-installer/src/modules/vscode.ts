import { $ } from "bun";
import type { IModule } from "./index";
import { commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

export const vscode: IModule = {
  id: "vscode",
  name: "VS Code",
  emoji: "💻",
  description: "Visual Studio Code",
  installsSoftware: true,

  async run() {
    log.title("vscode", "Visual Studio Code");

    if (await commandExists("code")) {
      const version = (await $`code --version`.text()).split("\n")[0].trim();
      log.ok(`VS Code ja instalado: ${version}`);
      return;
    }

    log.add("Instalando VS Code...");
    const distro = await getDistro();

    switch (distro) {
      case "arch":
        await pkgInstall("code");
        break;
      case "debian":
        log.add("Adicionando repositorio Microsoft...");
        await $`curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft.gpg`;
        await $`echo "deb [signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null`;
        await $`sudo apt update -qq`.quiet();
        await $`sudo apt install -y code`;
        break;
      case "fedora":
        await $`sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc`;
        await $`echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" | sudo tee /etc/yum.repos.d/vscode.repo > /dev/null`;
        await $`sudo dnf install -y code`;
        break;
      default:
        log.warn("Distro nao suportada. Instale VS Code manualmente.");
        return;
    }

    log.ok("VS Code instalado");
  },
};
