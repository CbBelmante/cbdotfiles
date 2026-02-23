import type { IModule } from "./index";
import { commandExists, getDesktop, getDistro, hasIntegratedDesktop, pkgInstall } from "../helpers";
import { log } from "../log";

// ---------------------------------------------------------------------------
// Ferramentas de desktop (Wayland/Hyprland)
// No COSMIC e Omarchy ja vem integrado — so instala em DEs "cru"
// ---------------------------------------------------------------------------

interface IDesktopTool {
  name: string;
  cmd: string;
  arch: string[];
  debian: string[];
  fedora: string[];
}

const TOOLS: IDesktopTool[] = [
  {
    name: "wofi (app launcher)",
    cmd: "wofi",
    arch: ["wofi"],
    debian: ["wofi"],
    fedora: ["wofi"],
  },
  {
    name: "wl-clipboard (copy/paste)",
    cmd: "wl-copy",
    arch: ["wl-clipboard"],
    debian: ["wl-clipboard"],
    fedora: ["wl-clipboard"],
  },
  {
    name: "cliphist (clipboard history)",
    cmd: "cliphist",
    arch: ["cliphist"],
    debian: ["cliphist"],
    fedora: ["cliphist"],
  },
  {
    name: "grim (screenshots)",
    cmd: "grim",
    arch: ["grim"],
    debian: ["grim"],
    fedora: ["grim"],
  },
  {
    name: "slurp (selecao de area)",
    cmd: "slurp",
    arch: ["slurp"],
    debian: ["slurp"],
    fedora: ["slurp"],
  },
  {
    name: "mako (notificacoes)",
    cmd: "mako",
    arch: ["mako"],
    debian: ["mako-notifier"],
    fedora: ["mako"],
  },
  {
    name: "hyprlock (lock screen)",
    cmd: "hyprlock",
    arch: ["hyprlock"],
    debian: [],
    fedora: [],
  },
  {
    name: "hypridle (auto-lock/suspend)",
    cmd: "hypridle",
    arch: ["hypridle"],
    debian: [],
    fedora: [],
  },
  {
    name: "hyprpicker (color picker)",
    cmd: "hyprpicker",
    arch: ["hyprpicker"],
    debian: [],
    fedora: [],
  },
];

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

export const desktopTools: IModule = {
  id: "desktop-tools",
  name: "Desktop Tools",
  emoji: "🖥️",
  description: "Ferramentas de desktop (wofi, clipboard, screenshots, notificacoes)",
  installsSoftware: true,

  async run() {
    log.title("desktop-tools", "Desktop Tools");

    const desktop = await getDesktop();

    if (hasIntegratedDesktop(desktop)) {
      log.ok(`${desktop} detectado — ferramentas de desktop ja integradas`);
      return;
    }

    // Tiling WM sem DE completo (hyprland, sway, etc.) — instala ferramentas
    log.add(`Desktop: ${desktop} — instalando ferramentas de desktop...`);

    const distro = await getDistro();

    for (const tool of TOOLS) {
      if (await commandExists(tool.cmd)) {
        log.ok(`${tool.name} ja instalado`);
        continue;
      }

      const packages =
        distro === "arch"
          ? tool.arch
          : distro === "debian"
            ? tool.debian
            : distro === "fedora"
              ? tool.fedora
              : [];

      if (packages.length === 0) {
        log.warn(`${tool.name} nao disponivel nos repos de ${distro}`);
        continue;
      }

      log.add(`Instalando ${tool.name}...`);
      if (await pkgInstall(...packages)) {
        log.ok(`${tool.name} instalado`);
      }
    }
  },
};
