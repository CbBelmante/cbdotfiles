import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import type { IModule } from "./index";
import { detectGPU, getDistro, isApple, pkgInstall, commandExists } from "../helpers";
import { log, tracker } from "../log";

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

// GPUs AMD GCN 1.0 (Southern Islands / SI) e GCN 1.1 (Sea Islands / CIK)
// O kernel usa o driver "radeon" por padrao, mas "amdgpu" e melhor (Vulkan, VA-API moderno)
const AMD_CIK_CHIPS = [
  "bonaire", "hawaii", "kaveri", "kabini", "mullins",
  "curacao", "trinidad", "hainan", "oland",
];
const AMD_SI_CHIPS = [
  "tahiti", "pitcairn", "verde", "cape verde",
];

async function detectAmdDriverIssue(): Promise<"cik" | "si" | null> {
  try {
    const lspciVga = await $`bash -c "lspci -k | grep -A3 'VGA'"`.text();

    // Verifica se esta usando driver radeon ao inves de amdgpu
    if (!lspciVga.includes("radeon")) return null;

    const lspciLower = lspciVga.toLowerCase();

    // Detecta GCN 1.1 (CIK / Sea Islands)
    for (const chip of AMD_CIK_CHIPS) {
      if (lspciLower.includes(chip)) return "cik";
    }

    // Detecta GCN 1.0 (SI / Southern Islands)
    for (const chip of AMD_SI_CHIPS) {
      if (lspciLower.includes(chip)) return "si";
    }

    // Detecta pela familia generica
    if (/r[79]\s*(2[67]0|3[67]0)/i.test(lspciVga)) return "cik";
    if (/hd\s*7[89]\d\d/i.test(lspciVga)) return "si";
  } catch {}

  return null;
}

async function fixAmdDriver(gen: "cik" | "si", distro: string) {
  const params = gen === "cik"
    ? "amdgpu.cik_support=1 radeon.cik_support=0"
    : "amdgpu.si_support=1 radeon.si_support=0";

  const genName = gen === "cik" ? "GCN 1.1 (Sea Islands)" : "GCN 1.0 (Southern Islands)";

  log.warn(`GPU AMD ${genName} usando driver "radeon" (sem Vulkan, VA-API antigo)`);
  log.warn(`Trocar para "amdgpu" habilita Vulkan, VA-API moderno e fix artefatos`);

  const doFix = await confirm({
    message: `Adicionar parametros do kernel para usar amdgpu? (requer reboot)`,
    default: true,
  });

  if (!doFix) {
    log.dim("Pulando troca de driver — pode configurar manualmente depois");
    return;
  }

  try {
    if (distro === "debian") {
      // Pop!_OS usa kernelstub (systemd-boot)
      if (await commandExists("kernelstub")) {
        await $`sudo kernelstub -a ${params}`;
        log.ok(`kernelstub: adicionado "${params}"`);
      } else {
        // Ubuntu/Debian padrao usa GRUB
        const grubFile = "/etc/default/grub";
        const grubContent = await $`cat ${grubFile}`.text();
        if (!grubContent.includes(params)) {
          const current = grubContent.match(/GRUB_CMDLINE_LINUX_DEFAULT="([^"]*)"/)?.[1] || "";
          const updated = `${current} ${params}`.trim();
          await $`sudo bash -c 'sed -i "s/GRUB_CMDLINE_LINUX_DEFAULT=\"[^\"]*\"/GRUB_CMDLINE_LINUX_DEFAULT=\"${updated}\"/" ${grubFile}'`;
          await $`sudo update-grub`;
          log.ok(`GRUB: adicionado "${params}"`);
        } else {
          log.ok("Parametros ja configurados no GRUB");
        }
      }
    } else if (distro === "arch") {
      log.warn(`Adicione manualmente ao kernel cmdline: ${params}`);
      log.warn("Arch: edite /etc/default/grub ou /boot/loader/entries/*.conf");
    } else if (distro === "fedora") {
      await $`sudo grubby --update-kernel=ALL --args="${params}"`;
      log.ok(`grubby: adicionado "${params}"`);
    }

    log.ok("Driver amdgpu sera ativado apos reboot");
    log.warn("REBOOT NECESSARIO para aplicar a troca de driver");
    tracker.installed("amdgpu kernel params");
  } catch {
    log.warn(`Falha ao configurar. Adicione manualmente: ${params}`);
    tracker.warning("amdgpu kernel params");
  }
}

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
      tracker.warning("GPU desconhecida");
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
    tracker.installed(`drivers ${gpu}`);

    // AMD: detecta se GPU antiga esta usando driver radeon ao inves de amdgpu
    if (gpu === "amd") {
      const amdGen = await detectAmdDriverIssue();
      if (amdGen) {
        await fixAmdDriver(amdGen, distro);
      }
    }

    // VA-API check
    if (await commandExists("vainfo")) {
      try {
        const output = await $`vainfo 2>&1`.text();
        const profiles = (output.match(/VAProfile/g) || []).length;
        log.ok(`VA-API funcionando (${profiles} perfis de decodificacao)`);
      } catch {}
    }

    // Vulkan check
    try {
      const vulkan = await $`bash -c "vulkaninfo --summary 2>/dev/null | grep driverName"`.nothrow().text();
      if (vulkan.includes("llvmpipe")) {
        log.warn("Vulkan usando llvmpipe (software) — GPU sem aceleracao de hardware");
      } else if (vulkan.includes("radv") || vulkan.includes("anv")) {
        log.ok("Vulkan com aceleracao de hardware ativo");
      }
    } catch {}

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
