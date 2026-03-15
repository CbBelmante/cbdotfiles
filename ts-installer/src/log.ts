const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const RED = "\x1b[0;31m";
const CYAN = "\x1b[0;36m";
const BLUE = "\x1b[0;34m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const NC = "\x1b[0m";

// ---------------------------------------------------------------------------
// Tracker: coleta o que cada modulo fez pra mostrar na tabela final
// ---------------------------------------------------------------------------

export interface IModuleResult {
  name: string;
  status: IModuleStatus;
  installed: string[];
  configured: string[];
  skipped: string[];
  warnings: string[];
}

const moduleResults: Map<string, IModuleResult> = new Map();
let currentModule: string | null = null;

function getOrCreate(id: string): IModuleResult {
  if (!moduleResults.has(id)) {
    moduleResults.set(id, {
      name: id,
      status: "ok",
      installed: [],
      configured: [],
      skipped: [],
      warnings: [],
    });
  }
  return moduleResults.get(id)!;
}

export const tracker = {
  /** Define o modulo ativo (chamado pelo install.ts antes de cada mod.run) */
  start(id: string) {
    currentModule = id;
    getOrCreate(id);
  },

  /** Registra algo que foi instalado */
  installed(item: string) {
    if (currentModule) getOrCreate(currentModule).installed.push(item);
  },

  /** Registra algo que foi configurado (symlink, config gerado, etc.) */
  configured(item: string) {
    if (currentModule) getOrCreate(currentModule).configured.push(item);
  },

  /** Registra algo que ja existia / foi pulado */
  skipped(item: string) {
    if (currentModule) getOrCreate(currentModule).skipped.push(item);
  },

  /** Registra um aviso */
  warning(item: string) {
    if (currentModule) getOrCreate(currentModule).warnings.push(item);
  },

  /** Marca status do modulo */
  setStatus(id: string, status: IModuleStatus) {
    getOrCreate(id).status = status;
  },

  /** Retorna todos os resultados na ordem de execucao */
  getResults(): IModuleResult[] {
    return Array.from(moduleResults.values());
  },

  /** Limpa tudo */
  clear() {
    moduleResults.clear();
    currentModule = null;
  },
};

// ---------------------------------------------------------------------------
// Log (output em tempo real durante a instalacao)
// ---------------------------------------------------------------------------

export const log = {
  ok: (msg: string) => console.log(`  ${GREEN}+${NC} ${msg}`),
  add: (msg: string) => console.log(`  ${CYAN}+${NC} ${msg}`),
  warn: (msg: string) => console.log(`  ${YELLOW}!${NC} ${msg}`),
  error: (msg: string) => console.log(`  ${RED}x${NC} ${msg}`),
  title: (id: string, name: string) =>
    console.log(`${BOLD}[${id}]${NC} Configurando ${name}...`),
  dim: (msg: string) => console.log(`  ${DIM}${msg}${NC}`),
  info: (msg: string) => console.log(`  ${BLUE}${msg}${NC}`),
};

export const colors = { GREEN, YELLOW, RED, CYAN, BLUE, BOLD, DIM, NC };

export function showHeader(dotfilesDir: string) {
  console.log();
  console.log(`${CYAN}${BOLD}`);
  console.log(
    "   ██████╗██████╗ ██████╗  ██████╗ ████████╗███████╗██╗██╗     ███████╗███████╗"
  );
  console.log(
    "  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║██║     ██╔════╝██╔════╝"
  );
  console.log(
    "  ██║     ██████╔╝██║  ██║██║   ██║   ██║   █████╗  ██║██║     █████╗  ███████╗"
  );
  console.log(
    "  ██║     ██╔══██╗██║  ██║██║   ██║   ██║   ██╔══╝  ██║██║     ██╔══╝  ╚════██║"
  );
  console.log(
    "  ╚██████╗██████╔╝██████╔╝╚██████╔╝   ██║   ██║     ██║███████╗███████╗███████║"
  );
  console.log(
    "   ╚═════╝╚═════╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝"
  );
  console.log(`${NC}`);
  console.log(`  ${DIM}Diretorio: ${dotfilesDir}${NC}`);
  console.log();
}

export type IModuleStatus = "ok" | "skipped" | "erro";

export function showSummary(
  results: Array<{ name: string; status: IModuleStatus }>
) {
  const tracked = tracker.getResults();

  // Calcula largura dinamica da coluna "Detalhes"
  const detailLines: string[] = [];
  for (const r of results) {
    const t = tracked.find((t) => t.name === r.name);
    detailLines.push(buildDetail(t));
  }
  const maxDetail = Math.max(20, ...detailLines.map((d) => stripAnsi(d).length));
  const detailCol = Math.min(maxDetail, 52); // limita pra nao explodir

  const modCol = 16;
  const statusCol = 8;

  const line = (m: number, s: number, d: number) =>
    `${"─".repeat(m)}┬${"─".repeat(s)}┬${"─".repeat(d)}`;

  console.log();
  console.log(`  ${BOLD}┌${line(modCol, statusCol, detailCol + 2)}┐${NC}`);
  console.log(
    `  ${BOLD}│${NC} ${"Modulo".padEnd(modCol - 2)} ${BOLD}│${NC} ${"Status".padEnd(statusCol - 2)} ${BOLD}│${NC} ${"Detalhes".padEnd(detailCol)} ${BOLD}│${NC}`
  );
  console.log(`  ${BOLD}├${"─".repeat(modCol)}┼${"─".repeat(statusCol)}┼${"─".repeat(detailCol + 2)}┤${NC}`);

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const statusStr =
      r.status === "ok"
        ? `${GREEN}ok${NC}`
        : r.status === "skipped"
          ? `${DIM}skip${NC}`
          : `${RED}erro${NC}`;

    const detail = detailLines[i];
    const detailVisible = stripAnsi(detail);
    const detailPadded = detail + " ".repeat(Math.max(0, detailCol - detailVisible.length));

    console.log(
      `  ${BOLD}│${NC} ${r.name.padEnd(modCol - 2)} ${BOLD}│${NC} ${statusStr}${" ".repeat(Math.max(0, statusCol - 2 - stripAnsi(statusStr).length))} ${BOLD}│${NC} ${detailPadded} ${BOLD}│${NC}`
    );
  }

  console.log(`  ${BOLD}└${"─".repeat(modCol)}┴${"─".repeat(statusCol)}┴${"─".repeat(detailCol + 2)}┘${NC}`);

  // Contadores
  let okCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  for (const r of results) {
    if (r.status === "ok") okCount++;
    else if (r.status === "skipped") skippedCount++;
    else errorCount++;
  }

  console.log();
  console.log(
    `    ${GREEN}${okCount} ok${NC}   ${DIM}${skippedCount} skipped${NC}   ${RED}${errorCount} erro(s)${NC}`
  );

  console.log();
  if (errorCount === 0) {
    console.log(
      `  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`
    );
    console.log(`  ${GREEN}${BOLD}   cbdotfiles updated!${NC}`);
    console.log(
      `  ${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`
    );
  } else {
    console.log(
      `  ${RED}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`
    );
    console.log(`  ${RED}${BOLD}   cbdotfiles updated com erros${NC}`);
    console.log(
      `  ${RED}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}`
    );
  }

  console.log();
  console.log(`  ${DIM}Rode:${NC} ${BOLD}source ~/.zshrc${NC}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function buildDetail(t: IModuleResult | undefined): string {
  if (!t) return `${DIM}—${NC}`;

  const parts: string[] = [];

  if (t.installed.length > 0) {
    parts.push(`${GREEN}+${t.installed.length} instalado${t.installed.length > 1 ? "s" : ""}${NC} ${DIM}(${t.installed.join(", ")})${NC}`);
  }

  if (t.configured.length > 0) {
    parts.push(`${CYAN}${t.configured.length} config${NC}`);
  }

  if (t.skipped.length > 0) {
    parts.push(`${DIM}${t.skipped.length} ja ok${NC}`);
  }

  if (t.warnings.length > 0) {
    parts.push(`${YELLOW}${t.warnings.length} aviso${t.warnings.length > 1 ? "s" : ""}${NC}`);
  }

  if (parts.length === 0) {
    return `${DIM}apenas config${NC}`;
  }

  return parts.join("  ");
}
