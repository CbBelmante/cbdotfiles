const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const RED = "\x1b[0;31m";
const CYAN = "\x1b[0;36m";
const BLUE = "\x1b[0;34m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const NC = "\x1b[0m";

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
  let okCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const r of results) {
    if (r.status === "ok") okCount++;
    else if (r.status === "skipped") skippedCount++;
    else errorCount++;
  }

  console.log();
  console.log(`  ${BOLD}┌───────────────┬─────────────┐${NC}`);
  console.log(`  ${BOLD}│ Modulo        │ Status      │${NC}`);
  console.log(`  ${BOLD}├───────────────┼─────────────┤${NC}`);

  for (const r of results) {
    const statusStr =
      r.status === "ok"
        ? `${GREEN} ok${NC}`
        : r.status === "skipped"
          ? `${DIM} skipped${NC}`
          : `${RED} erro${NC}`;
    console.log(
      `  ${BOLD}│${NC} ${r.name.padEnd(13)} ${BOLD}│${NC} ${statusStr}  ${BOLD}│${NC}`
    );
  }

  console.log(`  ${BOLD}└───────────────┴─────────────┘${NC}`);
  console.log();
  console.log(
    `    ${GREEN} ${okCount} ok${NC}   ${DIM} ${skippedCount} skipped${NC}   ${RED} ${errorCount} erro(s)${NC}`
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
