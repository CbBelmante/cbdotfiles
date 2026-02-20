import { $ } from "bun";
import type { IModule } from "./index";
import { detectGPU, getDistro, isApple, pkgInstall, commandExists } from "../helpers";
import { log } from "../log";

const GPU_PACKAGES: Record<string, Record<string, string[]>> = {
  amd: {
    arch: ["mesa", "vulkan-radeon", "libva-mesa-driver", "mesa-vdpau"],
    debian: ["vainfo", "mesa-va-drivers", "mesa-vulkan-drivers", "mesa-vdpau-drivers", "vulkan-tools"],
    fedora: ["mesa-va-drivers", "mesa-vdpau-drivers", "mesa-vulkan-drivers", "vulkan-tools", "libva-utils"],
  },
  intel: {
    arch: ["mesa", "vulkan-intel", "intel-media-driver"],
    debian: ["vainfo", "intel-media-va-driver", "mesa-vulkan-drivers", "vulkan-tools"],
    fedora: ["mesa-vulkan-drivers", "intel-media-driver", "libva-utils", "vulkan-tools"],
  },
};

export const drivers: IModule = {
  id: "drivers",
  name: "Drivers",
  emoji: "🎮",
  description: "Drivers GPU (AMD/Intel/NVIDIA) + Bluetooth Mac",
  installsSoftware: true,

  async run() {
    log.title("drivers", "Drivers & Aceleracao de Video");

    const gpu = await detectGPU();
    const distro = await getDistro();

    if (gpu === "unknown") {
      log.warn("GPU nao identificada. Instale drivers de video manualmente.");
      return;
    }

    if (gpu === "nvidia") {
      log.warn("GPU NVIDIA detectada. Drivers proprietarios variam por modelo.");
      log.warn("Instale manualmente: https://wiki.debian.org/NvidiaGraphicsDrivers");
      return;
    }

    log.add(`GPU detectada: ${gpu}`);

    const packages = GPU_PACKAGES[gpu]?.[distro];
    if (!packages?.length) {
      log.warn(`Distro '${distro}' nao suportada para drivers automaticos.`);
      return;
    }

    log.add(`Instalando: ${packages.join(" ")}`);
    await pkgInstall(...packages);
    log.ok(`Drivers ${gpu} instalados`);

    // VA-API check
    if (await commandExists("vainfo")) {
      try {
        const output = await $`vainfo 2>&1`.text();
        const profiles = (output.match(/VAProfile/g) || []).length;
        log.ok(`VA-API funcionando (${profiles} perfis de decodificacao)`);
      } catch {}
    }

    // Bluetooth Apple/Broadcom
    if (isApple()) {
      log.add("Hardware Apple detectado — verificando Bluetooth...");
      try {
        const lsusb = await $`lsusb`.text();
        const btMatch = lsusb.match(/broadcom|apple.*bluetooth/i);
        if (btMatch) {
          log.warn("Bluetooth Apple detectado. Firmware pode ser necessario.");
          log.warn("Veja: https://github.com/winterheart/broadcom-bt-firmware");
        }
      } catch {}
    }
  },
};
