import { $ } from "bun";
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

export type Desktop = "omarchy" | "cosmic" | "unknown";

export async function getDesktop(): Promise<Desktop> {
  if (
    existsSync(`${HOME}/.config/omarchy`) ||
    (await commandExists("hyprctl"))
  ) {
    return "omarchy";
  }
  if (
    process.env.XDG_CURRENT_DESKTOP === "COSMIC" ||
    (await commandExists("cosmic-comp"))
  ) {
    return "cosmic";
  }
  return "unknown";
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

export function loadSavedModules(): string[] | null {
  if (!existsSync(MODULES_FILE)) return null;

  try {
    const content = require("fs").readFileSync(MODULES_FILE, "utf-8") as string;
    return content
      .split("\n")
      .filter((line: string) => line.trim().length > 0);
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
