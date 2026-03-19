import { $ } from "bun";
import { existsSync } from "fs";
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
// Nota: Curacao/Trinidad sao SI segundo o kernel (nao CIK como a AMD classifica)
const AMD_CIK_CHIPS = [
  "bonaire", "hawaii", "kaveri", "kabini", "mullins",
  "hainan", "oland",
];
const AMD_SI_CHIPS = [
  "tahiti", "pitcairn", "verde", "cape verde",
  "curacao", "trinidad",
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
    if (/r[79]\s*(2[67]0|370)/i.test(lspciVga)) return "si";
    if (/hd\s*7[89]\d\d/i.test(lspciVga)) return "si";
    if (/r[79]\s*(260|360)/i.test(lspciVga)) return "cik";
  } catch {}

  return null;
}

async function fixAmdDriver(gen: "cik" | "si", distro: string) {
  const params = gen === "cik"
    ? "amdgpu.cik_support=1 radeon.cik_support=0"
    : "amdgpu.si_support=1 radeon.si_support=0";

  const genName = gen === "cik" ? "GCN 1.1 (Sea Islands)" : "GCN 1.0 (Southern Islands)";
  const blacklistFile = "/etc/modprobe.d/blacklist-radeon.conf";

  // Verifica se os params ja estao no kernel
  let paramsInKernel = false;
  try {
    const cmdline = await $`cat /proc/cmdline`.text();
    paramsInKernel = cmdline.includes("amdgpu.cik_support=1") || cmdline.includes("amdgpu.si_support=1");
  } catch {}

  // Verifica se blacklist ja existe
  const blacklistExists = existsSync(blacklistFile);

  if (paramsInKernel && blacklistExists) {
    // Tudo configurado mas driver ainda e radeon — precisa de reboot
    log.warn(`GPU AMD ${genName} — amdgpu configurado, precisa de REBOOT`);
    log.warn("Rode: sudo reboot");
    return;
  }

  if (paramsInKernel && !blacklistExists) {
    // Params no kernel mas radeon nao esta bloqueado — radeon carrega primeiro
    log.warn(`GPU AMD ${genName} — params do kernel ok, mas "radeon" carrega antes do "amdgpu"`);
    log.add("Bloqueando modulo radeon e atualizando initramfs...");

    try {
      await $`sudo bash -c 'echo "blacklist radeon" > ${blacklistFile}'`;
      await $`sudo update-initramfs -u`.nothrow();
      log.ok("radeon bloqueado via blacklist + initramfs atualizado");
      log.warn("REBOOT NECESSARIO para ativar o driver amdgpu");
      tracker.installed("blacklist radeon");
    } catch {
      log.warn(`Falha ao blacklistar. Rode manualmente:`);
      log.warn(`  echo "blacklist radeon" | sudo tee ${blacklistFile}`);
      log.warn("  sudo update-initramfs -u && sudo reboot");
      tracker.warning("blacklist radeon");
    }
    return;
  }

  // Params nao estao no kernel — primeira vez
  log.warn(`GPU AMD ${genName} usando driver "radeon" (sem Vulkan, VA-API antigo)`);
  log.warn(`Trocar para "amdgpu" habilita Vulkan, VA-API moderno e fix artefatos`);

  const doFix = await confirm({
    message: `Configurar kernel para usar amdgpu? (requer reboot)`,
    default: true,
  });

  if (!doFix) {
    log.dim("Pulando troca de driver — pode configurar manualmente depois");
    return;
  }

  try {
    // 1. Adiciona params do kernel
    if (distro === "debian") {
      if (await commandExists("kernelstub")) {
        await $`sudo kernelstub -a ${params}`;
        log.ok(`kernelstub: adicionado "${params}"`);
      } else {
        const grubFile = "/etc/default/grub";
        const grubContent = await $`cat ${grubFile}`.text();
        if (!grubContent.includes(params)) {
          const current = grubContent.match(/GRUB_CMDLINE_LINUX_DEFAULT="([^"]*)"/)?.[1] || "";
          const updated = `${current} ${params}`.trim();
          await $`sudo bash -c 'sed -i "s/GRUB_CMDLINE_LINUX_DEFAULT=\"[^\"]*\"/GRUB_CMDLINE_LINUX_DEFAULT=\"${updated}\"/" ${grubFile}'`;
          await $`sudo update-grub`;
          log.ok(`GRUB: adicionado "${params}"`);
        }
      }
    } else if (distro === "arch") {
      log.warn(`Adicione manualmente ao kernel cmdline: ${params}`);
      log.warn("Arch: edite /etc/default/grub ou /boot/loader/entries/*.conf");
    } else if (distro === "fedora") {
      await $`sudo grubby --update-kernel=ALL --args="${params}"`;
      log.ok(`grubby: adicionado "${params}"`);
    }

    // 2. Blacklist radeon pra garantir que amdgpu carrega primeiro
    if (!blacklistExists) {
      await $`sudo bash -c 'echo "blacklist radeon" > ${blacklistFile}'`;
      log.ok("radeon bloqueado via blacklist");
    }

    // 3. Atualiza initramfs
    await $`sudo update-initramfs -u`.nothrow();
    log.ok("initramfs atualizado");

    log.ok("Driver amdgpu sera ativado apos reboot");
    log.warn("REBOOT NECESSARIO para aplicar a troca de driver");
    tracker.installed("amdgpu + blacklist radeon");
  } catch {
    log.warn(`Falha ao configurar. Rode manualmente:`);
    log.warn(`  sudo kernelstub -a "${params}"`);
    log.warn(`  echo "blacklist radeon" | sudo tee ${blacklistFile}`);
    log.warn("  sudo update-initramfs -u && sudo reboot");
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
