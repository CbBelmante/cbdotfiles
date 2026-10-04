import { $ } from "bun";
import { existsSync, mkdirSync, readdirSync, copyFileSync, rmSync } from "fs";
import { join, basename, extname } from "path";
import { tmpdir } from "os";
import type { IModule, IRunContext } from "./index";
import { HOME, commandExists, isMacos, isWindows, isWSL, pkgInstall, winHome } from "../helpers";
import { log, tracker } from "../log";
import { DESIGN_FONTS as CFG } from "../defaults";

const FONT_EXT = [".ttf", ".otf", ".ttc"];

// ---------------------------------------------------------------------------
// Onde cada sistema guarda fontes do usuario (sem precisar de admin/root)
// ---------------------------------------------------------------------------
interface ITarget {
  dir: string;
  label: string;
  windows: boolean; // precisa registrar no registro do Windows
}

function targets(): ITarget[] {
  if (isWindows()) {
    const local = process.env.LOCALAPPDATA ?? join(HOME, "AppData", "Local");
    return [{ dir: join(local, "Microsoft", "Windows", "Fonts"), label: "Windows", windows: true }];
  }

  if (isMacos()) {
    return [{ dir: join(HOME, "Library", "Fonts"), label: "macOS", windows: false }];
  }

  // Linux — e no WSL instala tambem no lado Windows, porque e la que rodam
  // Corel e Photoshop. Sem isso as fontes aparecem so pros apps do WSL.
  const list: ITarget[] = [
    { dir: join(HOME, ".local", "share", "fonts"), label: "Linux", windows: false },
  ];

  if (isWSL()) {
    const win = winHome();
    if (existsSync(win)) {
      list.push({
        dir: join(win, "AppData", "Local", "Microsoft", "Windows", "Fonts"),
        label: "Windows (via WSL)",
        windows: true,
      });
    }
  }

  return list;
}

// ---------------------------------------------------------------------------
// Descompactar: cada sistema tem sua ferramenta, tenta na ordem que funciona
// ---------------------------------------------------------------------------
async function extract(zip: string, dest: string): Promise<boolean> {
  mkdirSync(dest, { recursive: true });

  // Instalacao enxuta de Linux pode nao ter unzip, e o tar do GNU nao le zip
  // (o do macOS e do Windows le). Sem isso, PC novo falha aqui.
  if (!isWindows() && !isMacos() && !(await commandExists("unzip"))) {
    log.add("Instalando unzip...");
    await pkgInstall("unzip");
  }

  // unzip: padrao em Linux e macOS
  if (await $`unzip -o ${zip} -d ${dest}`.quiet().nothrow().then((r) => r.exitCode === 0)) {
    return true;
  }

  // tar do Windows 10+ e do macOS (bsdtar) le zip; o tar do Linux nao
  if (await $`tar -xf ${zip} -C ${dest}`.quiet().nothrow().then((r) => r.exitCode === 0)) {
    return true;
  }

  // ultimo recurso no Windows sem tar
  const ps = `Expand-Archive -LiteralPath '${zip}' -DestinationPath '${dest}' -Force`;
  return await $`powershell -NoProfile -Command ${ps}`.quiet().nothrow().then((r) => r.exitCode === 0);
}

// ---------------------------------------------------------------------------
// No Windows copiar nao basta: a fonte precisa existir no registro do usuario
// ---------------------------------------------------------------------------
async function registerWindows(dir: string, files: string[]) {
  const key = "HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts";

  for (const file of files) {
    const name = basename(file, extname(file));
    const kind = extname(file).toLowerCase() === ".otf" ? "OpenType" : "TrueType";
    const cmd =
      `New-ItemProperty -Path '${key}' -Name '${name} (${kind})' ` +
      `-Value '${join(dir, file)}' -PropertyType String -Force | Out-Null`;

    // No WSL o PowerShell e chamado pelo .exe
    const pwsh = isWSL() ? "powershell.exe" : "powershell";
    await $`${pwsh} -NoProfile -Command ${cmd}`.quiet().nothrow();
  }
}

// Linux cacheia fontes; macOS e Windows descobrem sozinhos
async function refreshCache() {
  if (isMacos() || isWindows()) return;
  await $`fc-cache -f`.quiet().nothrow();
  log.ok("Cache de fontes atualizado");
}

// ---------------------------------------------------------------------------
// Copia recursiva de .ttf/.otf de uma arvore de pastas pro diretorio de fontes
// ---------------------------------------------------------------------------
function install(from: string, target: ITarget): string[] {
  mkdirSync(target.dir, { recursive: true });
  const done: string[] = [];

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full);
        continue;
      }

      if (!FONT_EXT.includes(extname(entry.name).toLowerCase())) continue;

      try {
        copyFileSync(full, join(target.dir, entry.name));
        done.push(entry.name);
      } catch {
        log.warn(`Nao copiou ${entry.name}`);
      }
    }
  };

  walk(from);
  return done;
}

export const designFonts: IModule = {
  id: "design-fonts",
  name: "Design Fonts",
  emoji: "🎨",
  description: `Fontes de arte — ${CFG.ofl.join(", ")}`,
  installsSoftware: true,

  async run(ctx: IRunContext) {
    log.title("design-fonts", "Fontes de Design");

    const dests = targets();
    log.info(`Destino: ${dests.map((t) => t.label).join(" + ")}`);

    // -----------------------------------------------------------------------
    // 1. Familias OFL — baixa o asset da release deste repo
    // -----------------------------------------------------------------------
    // CB_FONTS_URL em local/local.sh substitui a origem (auto-hospedar, testar)
    const url =
      ctx.overrides.CB_FONTS_URL ??
      `https://github.com/${CFG.repo}/releases/download/${CFG.releaseTag}/${CFG.asset}`;
    const tmpZip = join(tmpdir(), CFG.asset);
    const tmpDir = join(tmpdir(), "cb-fonts-extract");

    log.add(`Baixando ${CFG.ofl.length} famílias OFL...`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await Bun.write(tmpZip, res);

      rmSync(tmpDir, { recursive: true, force: true });
      if (!(await extract(tmpZip, tmpDir))) throw new Error("falha ao descompactar");

      for (const target of dests) {
        const files = install(tmpDir, target);
        if (target.windows) await registerWindows(target.dir, files);
        log.ok(`${files.length} arquivos em ${target.label}`);
      }

      tracker.installed(`${CFG.ofl.length} famílias OFL`);
    } catch (err) {
      log.warn(`Fontes OFL falharam: ${err instanceof Error ? err.message : err}`);
      log.info(`  baixe à mão: ${url}`);
      tracker.warning("fontes OFL");
    } finally {
      rmSync(tmpZip, { force: true });
      rmSync(tmpDir, { recursive: true, force: true });
    }

    // -----------------------------------------------------------------------
    // 2. Familias de licenca restrita — pasta local, nunca o repo
    // -----------------------------------------------------------------------
    const raw = ctx.overrides.CB_FONTS_PRIVATE ?? CFG.privatePathDefault;
    const priv = raw.replace(/^\$HOME|^~/, HOME);

    if (!existsSync(priv)) {
      log.warn(`${CFG.restricted.length} fontes de licença restrita: pasta não encontrada`);
      log.info(`  esperada em ${priv} — ajuste CB_FONTS_PRIVATE em local/local.sh`);
      for (const f of CFG.restricted) log.info(`  · ${f.family} — ${f.origin}`);
      tracker.skipped("fontes restritas");
      await refreshCache();
      return;
    }

    for (const target of dests) {
      const files = install(priv, target);
      if (target.windows) await registerWindows(target.dir, files);
      log.ok(`${files.length} fontes privadas em ${target.label}`);
    }

    tracker.installed("fontes restritas");

    await refreshCache();
  },
};
