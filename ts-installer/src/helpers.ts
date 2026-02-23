import { $ } from "bun";
import { checkbox } from "@inquirer/prompts";
import { log } from "./log";
import { existsSync } from "fs";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

export const DOTFILES_DIR = resolve(import.meta.dir, "../..");
export const HOME = process.env.HOME!;

// ---------------------------------------------------------------------------
// Detecta distro pelo gerenciador de pacotes
// ---------------------------------------------------------------------------

export type Distro = "arch" | "debian" | "fedora" | "unknown";

export async function getDistro(): Promise<Distro> {
  if (await commandExists("pacman")) return "arch";
  if (await commandExists("apt")) return "debian";
  if (await commandExists("dnf")) return "fedora";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Detecta desktop environment
// ---------------------------------------------------------------------------

export type Desktop =
  | "omarchy"
  | "cosmic"
  | "hyprland"
  | "sway"
  | "gnome"
  | "kde"
  | "cinnamon"
  | "xfce"
  | "unknown";

export async function getDesktop(): Promise<Desktop> {
  // Omarchy: tem diretorio proprio
  if (existsSync(`${HOME}/.config/omarchy`)) {
    return "omarchy";
  }

  // XDG_CURRENT_DESKTOP e a forma padrao de detectar DE
  const xdg = (process.env.XDG_CURRENT_DESKTOP || "").toUpperCase();

  if (xdg === "COSMIC" || (await commandExists("cosmic-comp"))) return "cosmic";
  if (xdg.includes("GNOME")) return "gnome";
  if (xdg.includes("KDE") || xdg.includes("PLASMA")) return "kde";
  if (xdg.includes("CINNAMON") || xdg.includes("X-CINNAMON")) return "cinnamon";
  if (xdg.includes("XFCE")) return "xfce";
  if (xdg.includes("HYPRLAND") || (await commandExists("hyprctl"))) return "hyprland";
  if (xdg.includes("SWAY") || (await commandExists("swaymsg"))) return "sway";

  return "unknown";
}

// DEs completos que ja trazem launcher, clipboard, screenshots, notificacoes, lock
export function hasIntegratedDesktop(desktop: Desktop): boolean {
  return ["omarchy", "cosmic", "gnome", "kde", "cinnamon", "xfce"].includes(desktop);
}

// ---------------------------------------------------------------------------
// Detecta hardware
// ---------------------------------------------------------------------------

export function isLaptop(): boolean {
  try {
    const entries = require("fs").readdirSync("/sys/class/power_supply/");
    return entries.some((e: string) => e.startsWith("BAT"));
  } catch {
    return false;
  }
}

export function isApple(): boolean {
  try {
    const vendor = require("fs")
      .readFileSync("/sys/class/dmi/id/sys_vendor", "utf-8")
      .trim();
    return vendor === "Apple Inc.";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Detecta GPU
// ---------------------------------------------------------------------------

export type GPU = "amd" | "intel" | "nvidia" | "unknown";

export async function detectGPU(): Promise<GPU> {
  try {
    const lspci = await $`lspci`.text();
    if (/amd.*(radeon|rx|vega)|amd\/ati/i.test(lspci)) return "amd";
    if (/intel.*(graphics|hd|uhd|iris)/i.test(lspci)) return "intel";
    if (/nvidia/i.test(lspci)) return "nvidia";
  } catch {}
  return "unknown";
}

// ---------------------------------------------------------------------------
// Verifica se um comando existe
// ---------------------------------------------------------------------------

export async function commandExists(cmd: string): Promise<boolean> {
  try {
    await $`command -v ${cmd}`.quiet();
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Instala pacotes via gerenciador da distro
// ---------------------------------------------------------------------------

export async function pkgInstall(...packages: string[]): Promise<boolean> {
  const distro = await getDistro();
  const pkgs = packages.join(" ");

  try {
    switch (distro) {
      case "arch":
        await $`sudo pacman -Syu --noconfirm ${packages}`;
        break;
      case "debian":
        try {
          await $`sudo apt install -y ${packages}`;
        } catch {
          log.warn("Falha na instalacao, atualizando repos...");
          await $`sudo apt update -qq`.quiet();
          await $`sudo apt install -y ${packages}`;
        }
        break;
      case "fedora":
        await $`sudo dnf install -y ${packages}`;
        break;
      default:
        log.warn(`Gerenciador nao encontrado. Instale manualmente: ${pkgs}`);
        return false;
    }
    return true;
  } catch {
    log.warn(`Falha ao instalar: ${pkgs}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Symlink helper
// ---------------------------------------------------------------------------

export async function symlink(source: string, target: string) {
  await $`mkdir -p ${resolve(target, "..")}`;
  await $`ln -sf ${source} ${target}`;
}

// ---------------------------------------------------------------------------
// Compara versoes semver: retorna true se current >= required
// ---------------------------------------------------------------------------

export function versionGte(current: string, required: string): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const [cMaj, cMin, cPat] = parse(current);
  const [rMaj, rMin, rPat] = parse(required);

  if (cMaj !== rMaj) return cMaj > rMaj;
  if (cMin !== rMin) return cMin > rMin;
  return cPat >= rPat;
}

// ---------------------------------------------------------------------------
// Persistencia de modulos selecionados (local/.modules)
// ---------------------------------------------------------------------------

const MODULES_FILE = resolve(DOTFILES_DIR, "local/.modules");

export async function saveSelectedModules(moduleIds: string[]) {
  await $`mkdir -p ${resolve(MODULES_FILE, "..")}`;
  await Bun.write(MODULES_FILE, moduleIds.join("\n") + "\n");
}

// Migra IDs de modulos antigos para os novos (agrupados)
const LEGACY_MODULE_MAP: Record<string, string> = {
  vivaldi: "browsers",
  opera: "browsers",
  nvim: "dev",
  zellij: "dev",
  vscode: "dev",
  gitkraken: "dev",
  lazygit: "dev",
  zsh: "shell-tools",
  nvm: "shell-tools",
  git: "shell-tools",
  kitty: "shell-tools",
};

export function loadSavedModules(): string[] | null {
  if (!existsSync(MODULES_FILE)) return null;

  try {
    const content = require("fs").readFileSync(MODULES_FILE, "utf-8") as string;
    const ids = content
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .map((id: string) => LEGACY_MODULE_MAP[id] || id);

    // Remove duplicatas (ex: vivaldi + opera -> browsers + browsers)
    return [...new Set(ids)];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Carrega overrides locais (local/local.sh → exporta key=value)
// ---------------------------------------------------------------------------

export async function loadLocalOverrides(): Promise<Record<string, string>> {
  const localConf = resolve(DOTFILES_DIR, "local/local.sh");
  const overrides: Record<string, string> = {};

  if (!existsSync(localConf)) return overrides;

  const content = await Bun.file(localConf).text();
  for (const line of content.split("\n")) {
    const match = line.match(/^(\w+)=["']?(.+?)["']?\s*$/);
    if (match) overrides[match[1]] = match[2];
  }

  log.dim("local/local.sh carregado");
  return overrides;
}

// ---------------------------------------------------------------------------
// Checkbox com opcao "Todos" no topo
// ---------------------------------------------------------------------------

interface ICheckboxItem {
  id: string;
  name: string;
  emoji: string;
}

export async function checkboxWithAll<T extends ICheckboxItem>(
  message: string,
  items: T[],
  installedIds: Set<string> = new Set()
): Promise<T[]> {
  const ALL_VALUE = "__all__";

  const selected = await checkbox({
    message,
    choices: [
      { name: "✅ Todos", value: ALL_VALUE },
      ...items.map((item) => {
        const done = installedIds.has(item.id);
        return {
          name: done
            ? `${item.emoji} ${item.name} (ja instalado)`
            : `${item.emoji} ${item.name}`,
          value: item.id,
          checked: false,
        };
      }),
    ],
    required: true,
  });

  if (selected.includes(ALL_VALUE)) {
    return items;
  }

  return selected
    .map((id) => items.find((item) => item.id === id)!)
    .filter(Boolean);
}
