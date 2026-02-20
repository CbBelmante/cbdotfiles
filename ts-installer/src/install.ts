#!/usr/bin/env bun

import { $ } from "bun";
import { checkbox, confirm, select } from "@inquirer/prompts";
import { ALL_MODULES, BROWSER_MODULES, getModuleById, type IModule } from "./modules/index";
import {
  DOTFILES_DIR,
  commandExists,
  loadLocalOverrides,
  loadSavedModules,
  saveSelectedModules,
} from "./helpers";
import { log, showHeader, showSummary, type IModuleStatus } from "./log";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isHelp = args.includes("--help") || args.includes("-h");
const isAll = args.includes("--all");
const isCustom = args.includes("--custom");
const isUpdate = args.includes("--update");
const cliModules = args.filter((a) => !a.startsWith("-"));

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

if (isHelp) {
  showHeader(DOTFILES_DIR);
  console.log("  Uso: ./install.sh [opcoes] [modulos...]");
  console.log();
  console.log("  Opcoes:");
  console.log("    --all       Instala todos os modulos (sem perguntar)");
  console.log("    --custom    Vai direto pra selecao de modulos");
  console.log("    --update    Reinstala os modulos da ultima selecao");
  console.log("    --help      Mostra esta ajuda");
  console.log();
  console.log("  Modulos disponiveis:");
  for (const mod of ALL_MODULES) {
    const badge = mod.installsSoftware ? "instala" : "symlink";
    console.log(`    ${mod.emoji} ${mod.id.padEnd(14)} ${mod.description} [${badge}]`);
  }
  console.log();
  console.log("  Exemplos:");
  console.log("    ./install.sh                   # interativo (Padrao / Custom)");
  console.log("    ./install.sh --all             # instala tudo");
  console.log("    ./install.sh --custom          # seleciona modulos");
  console.log("    ./install.sh zsh nvim git      # instala so esses");
  console.log();
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Selecao de browser padrao
// ---------------------------------------------------------------------------

async function askDefaultBrowser(selectedModules: IModule[]) {
  // Verifica quais browsers foram selecionados pra instalar
  const browserIds = BROWSER_MODULES.map((b) => b.id);
  const hasBrowser = selectedModules.some((m) => browserIds.includes(m.id));

  if (!hasBrowser) return;

  // Monta choices com os browsers selecionados + "Nenhum"
  const choices = [];
  for (const mod of selectedModules) {
    if (browserIds.includes(mod.id)) {
      choices.push({
        name: `${mod.emoji} ${mod.name}`,
        value: mod.id,
      });
    }
  }
  choices.push({ name: "Nenhum (manter o atual)", value: "none" });

  const browser = await select({
    message: "Qual browser definir como padrao?",
    choices,
  });

  if (browser !== "none") {
    return browser;
  }
}

async function setDefaultBrowser(browserId: string) {
  if (!(await commandExists("xdg-settings"))) {
    log.warn("xdg-settings nao disponivel, defina o browser padrao manualmente");
    return;
  }

  // Mapeia id -> desktop file pattern
  const desktopFiles: Record<string, string> = {
    vivaldi: "vivaldi",
    opera: "opera",
  };

  const pattern = desktopFiles[browserId];
  if (!pattern) return;

  try {
    const found = (
      await $`find /usr/share/applications -name "${pattern}*" -print -quit 2>/dev/null`.text()
    ).trim();

    if (found) {
      const desktopName = found.split("/").pop()!;
      await $`xdg-settings set default-web-browser ${desktopName}`;
      log.ok(`${browserId} definido como browser padrao (${desktopName})`);
    } else {
      log.warn(`Desktop file de ${browserId} nao encontrado`);
    }
  } catch {
    log.warn(`Falha ao definir ${browserId} como browser padrao`);
  }
}

// ---------------------------------------------------------------------------
// Selecao de modulos via checkbox
// ---------------------------------------------------------------------------

async function pickModules(): Promise<IModule[]> {
  const selected = await checkbox({
    message: "Selecione os modulos para instalar:",
    choices: ALL_MODULES.map((mod) => ({
      name: `${mod.emoji} ${mod.id.padEnd(14)} ${mod.description}`,
      value: mod.id,
      checked: false,
    })),
    required: true,
  });

  return selected
    .map((id) => getModuleById(id))
    .filter(Boolean) as IModule[];
}

// ---------------------------------------------------------------------------
// Menu interativo: Padrao / Custom
// ---------------------------------------------------------------------------

async function interactiveMenu(): Promise<IModule[]> {
  const mode = await select({
    message: "Como deseja instalar?",
    choices: [
      {
        name: "Padrao (todos os modulos)",
        value: "default" as const,
        description: "Instala todos os modulos na ordem correta",
      },
      {
        name: "Custom (selecionar modulos)",
        value: "custom" as const,
        description: "Escolha quais modulos instalar",
      },
    ],
  });

  if (mode === "default") {
    return ALL_MODULES;
  }
  return pickModules();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  showHeader(DOTFILES_DIR);

  // Carrega overrides locais
  const overrides = await loadLocalOverrides();

  // Determina quais modulos instalar
  let selectedModules: IModule[];
  let defaultBrowser: string | undefined;

  if (isUpdate) {
    // --update: reinstala os modulos da ultima selecao
    const saved = loadSavedModules();
    if (saved) {
      selectedModules = saved
        .map((id) => getModuleById(id))
        .filter(Boolean) as IModule[];
      console.log(`  Atualizando ${selectedModules.length} modulo(s) salvos...\n`);
    } else {
      // Sem selecao salva — mostra menu interativo
      log.warn("Nenhuma selecao salva. Escolha os modulos:\n");
      selectedModules = await interactiveMenu();
    }
  } else if (isAll) {
    selectedModules = ALL_MODULES;
    console.log("  Instalando todos os modulos...\n");
  } else if (isCustom) {
    selectedModules = await pickModules();
  } else if (cliModules.length > 0) {
    selectedModules = cliModules
      .map((id) => {
        const mod = getModuleById(id);
        if (!mod) console.log(`  ! Modulo '${id}' nao encontrado`);
        return mod;
      })
      .filter(Boolean) as IModule[];

    console.log(`  Modulos: ${selectedModules.map((m) => m.id).join(", ")}\n`);
  } else {
    selectedModules = await interactiveMenu();
  }

  // Pergunta browser padrao (se algum browser foi selecionado)
  defaultBrowser = await askDefaultBrowser(selectedModules);

  // Confirma antes de executar
  console.log();
  console.log("  Modulos selecionados:");
  for (const mod of selectedModules) {
    const badge = mod.installsSoftware ? " (instala software)" : " (symlink)";
    console.log(`    ${mod.emoji} ${mod.id}${badge}`);
  }
  if (defaultBrowser) {
    console.log(`    🌐 Browser padrao: ${defaultBrowser}`);
  }
  console.log();

  if (!isAll) {
    const ok = await confirm({
      message: `Instalar ${selectedModules.length} modulo(s)?`,
      default: true,
    });

    if (!ok) {
      console.log("\n  Cancelado.\n");
      process.exit(0);
    }
  }

  // ---------------------------------------------------------------------------
  // Executa modulos
  // ---------------------------------------------------------------------------

  const results: Array<{ name: string; status: IModuleStatus }> = [];

  for (const mod of selectedModules) {
    try {
      await mod.run(overrides);
      results.push({ name: mod.id, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  x [${mod.id}] ${msg}`);
      results.push({ name: mod.id, status: "erro" });
    }
  }

  // Salva selecao pra --update futuro
  const moduleIds = selectedModules.map((m) => m.id);
  await saveSelectedModules(moduleIds);

  // Definir browser padrao apos instalar
  if (defaultBrowser) {
    await setDefaultBrowser(defaultBrowser);
  }

  // ---------------------------------------------------------------------------
  // PATH check
  // ---------------------------------------------------------------------------

  if (!process.env.PATH?.includes(".local/bin")) {
    console.log();
    console.log('  ! Adicione ~/.local/bin ao PATH no seu .zshrc:');
    console.log('      export PATH="$HOME/.local/bin:$PATH"');
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  showSummary(results);
}

main().catch((err) => {
  if (err?.name === "ExitPromptError") {
    console.log("\n  Cancelado.\n");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
