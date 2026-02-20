import { $ } from "bun";
import type { IModule } from "./index";
import { commandExists, getDistro, pkgInstall } from "../helpers";
import { log } from "../log";

export const opera: IModule = {
  id: "opera",
  name: "Opera",
  emoji: "🌐",
  description: "Opera Browser",
  installsSoftware: true,

  async run() {
    log.title("opera", "Opera Browser");

    if (await commandExists("opera")) {
      log.ok("Opera ja instalado");
      return;
    }

    log.add("Instalando Opera...");
    const distro = await getDistro();

    switch (distro) {
      case "arch":
        await pkgInstall("opera");
        break;
      case "debian":
        log.add("Adicionando repositorio Opera...");
        await $`curl -fsSL https://deb.opera.com/archive.key | sudo gpg --dearmor -o /usr/share/keyrings/opera-browser.gpg`;
        await $`echo "deb [signed-by=/usr/share/keyrings/opera-browser.gpg] https://deb.opera.com/opera-stable/ stable non-free" | sudo tee /etc/apt/sources.list.d/opera.list > /dev/null`;
        await $`sudo apt update -qq`.quiet();
        await $`sudo apt install -y opera-stable`;
        break;
      case "fedora":
        await $`sudo rpm --import https://rpm.opera.com/rpmrepo.key`;
        await $`sudo tee /etc/yum.repos.d/opera.repo > /dev/null << 'REPO'
[opera]
name=Opera packages
baseurl=https://rpm.opera.com/rpm
gpgcheck=1
gpgkey=https://rpm.opera.com/rpmrepo.key
enabled=1
REPO`;
        await $`sudo dnf install -y opera-stable`;
        break;
      default:
        log.warn("Distro nao suportada. Instale Opera manualmente.");
        return;
    }

    log.ok("Opera instalado");
  },
};
