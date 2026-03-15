import { $ } from "bun";
import type { IModule, IRunContext } from "./index";
import { checkboxWithAll, commandExists, getDistro, pkgInstall } from "../helpers";
import { log, tracker } from "../log";

// ---------------------------------------------------------------------------
// Virtualization tool definitions
// ---------------------------------------------------------------------------

interface IVirtTool {
  id: string;
  name: string;
  emoji: string;
  isInstalled: () => Promise<boolean>;
  install: (distro: string) => Promise<void>;
}

const VIRT_TOOLS: IVirtTool[] = [
  {
    id: "virtualbox",
    name: "VirtualBox",
    emoji: "🖥️",
    async isInstalled() {
      return commandExists("virtualbox");
    },
    async install(distro) {
      switch (distro) {
        case "arch":
          await pkgInstall("virtualbox", "virtualbox-host-modules-arch");
          break;
        case "debian":
          await $`sudo apt install -y virtualbox`;
          break;
        case "fedora":
          await $`sudo dnf install -y VirtualBox`;
          break;
      }

      // Adiciona usuario ao grupo vboxusers
      try {
        await $`sudo usermod -aG vboxusers ${process.env.USER}`;
        log.ok("Usuario adicionado ao grupo vboxusers");
        log.warn("Reinicie o PC para aplicar o grupo");
      } catch {
        log.warn("Nao foi possivel adicionar ao grupo vboxusers");
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const virtualization: IModule = {
  id: "virtualization",
  name: "Virtualization",
  emoji: "🖥️",
  description: "VirtualBox",
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("virtualization", "Virtualization Tools");

    // Mostra status atual
    const installed: IVirtTool[] = [];
    const available: IVirtTool[] = [];

    for (const tool of VIRT_TOOLS) {
      if (await tool.isInstalled()) {
        log.ok(`${tool.emoji} ${tool.name} ja instalado`);
        installed.push(tool);
        tracker.skipped(tool.name);
      } else {
        available.push(tool);
      }
    }

    // Seleciona quais instalar
    const installedIds = new Set(installed.map((t) => t.id));
    let toInstall: IVirtTool[] = [];

    if (ctx.isAll) {
      toInstall = available;
    } else {
      const selected = await checkboxWithAll("Quais virtualization tools deseja instalar?", VIRT_TOOLS, installedIds);
      toInstall = selected.filter((t) => !installedIds.has(t.id));
    }

    // Instala os selecionados
    if (toInstall.length > 0) {
      const distro = await getDistro();

      for (const tool of toInstall) {
        log.add(`Instalando ${tool.name}...`);
        try {
          await tool.install(distro);
          if (await tool.isInstalled()) {
            log.ok(`${tool.name} instalado`);
            tracker.installed(tool.name);
          } else {
            log.warn(`${tool.name}: instalacao pode ter falhado`);
            tracker.warning(tool.name);
          }
        } catch {
          log.warn(`Falha ao instalar ${tool.name}`);
          tracker.warning(tool.name);
        }
      }
    }

    log.ok("Virtualization tools configurados");
  },
};
