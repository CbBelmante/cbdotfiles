#!/usr/bin/env bun

import { $ } from "bun";
import { checkbox, select } from "@inquirer/prompts";
import { ALL_MODULES, getModuleById, type IModule, type IRunContext } from "./modules/index";
import { changeDefaultBrowser } from "./modules/browsers";
import { changeDefaultTerminal } from "./modules/shell-tools";
import {
  DOTFILES_DIR,
  askInput,
  commandExists,
  isMacos,
  isWSL,
  winHome,
  loadLocalOverrides,
  loadSavedModules,
  saveSelectedModules,
} from "./helpers";
import { log, showHeader, showSummary, tracker, type IModuleStatus } from "./log";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isHelp = args.includes("--help") || args.includes("-h");
const isAll = args.includes("--all");
const isMinimal = args.includes("--minimal");
const isCustom = args.includes("--custom");
const isUpdate = args.includes("--update");
const isChBrowser = args.includes("--chbrowser");
const isChTerminal = args.includes("--chterminal");
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
  console.log("    --minimal   Instala uso diario (sem infra dev pesada)");
  console.log("    --custom    Vai direto pra selecao de modulos");
  console.log("    --update    Reinstala os modulos da ultima selecao");
  console.log("    --chbrowser  Altera o browser padrao (sem instalar)");
  console.log("    --chterminal Altera o terminal padrao (sem instalar)");
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
  console.log("    ./install.sh shell-tools dev   # instala so esses");
  console.log();
  process.exit(0);
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

async function interactiveMenu(): Promise<{ modules: IModule[]; isAll: boolean; isMinimal?: boolean }> {
  const mode = await select({
    message: "Como deseja instalar?",
    choices: [
      {
        name: "Minimal (shell + terminal + apps — sem infra dev)",
        value: "minimal" as const,
        description: "Uso diario completo sem Docker, NVM, Firebase, etc.",
      },
      {
        name: "Padrao (todos os modulos)",
        value: "default" as const,
        description: "Instala todos os modulos sem perguntar",
      },
      {
        name: "Custom (selecionar modulos)",
        value: "custom" as const,
        description: "Escolha quais modulos instalar",
      },
    ],
  });

  if (mode === "minimal") {
    return { modules: ALL_MODULES, isAll: true, isMinimal: true };
  }
  if (mode === "default") {
    return { modules: ALL_MODULES, isAll: true };
  }
  return { modules: await pickModules(), isAll: false };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// sudo: pede senha uma unica vez no inicio e renova o cache periodicamente
// ---------------------------------------------------------------------------

let sudoKeepAlive: Timer | null = null;

async function acquireSudo() {
  log.add("Solicitando permissao de administrador...");
  const result = await $`sudo -v`.nothrow();
  if (result.exitCode !== 0) {
    log.warn("Falha ao obter sudo — modulos que precisam de sudo podem falhar");
    return;
  }
  log.ok("sudo ativo");

  // Renova o cache a cada 55s (sudo expira em 5-15min dependendo da distro)
  sudoKeepAlive = setInterval(async () => {
    await $`sudo -n true`.nothrow().quiet();
  }, 55_000);
}

function releaseSudo() {
  if (sudoKeepAlive) {
    clearInterval(sudoKeepAlive);
    sudoKeepAlive = null;
  }
}

async function setupGitIdentity() {
  let currentName = "";
  let currentEmail = "";
  try {
    currentName = (await $`git config --global user.name`.text()).trim();
    currentEmail = (await $`git config --global user.email`.text()).trim();
  } catch {}

  if (currentName && currentEmail) {
    log.ok(`Git: ${currentName} <${currentEmail}>`);
    return;
  }

  const name = await askInput("Seu nome para commits Git:", currentName || undefined);
  const email = await askInput("Seu email para commits Git:", currentEmail || undefined);

  await $`git config --global user.name ${name}`;
  await $`git config --global user.email ${email}`;
  log.ok(`Git configurado: ${name} <${email}>`);
}

async function main() {
  showHeader(DOTFILES_DIR);

  // Carrega overrides locais
  const overrides = await loadLocalOverrides();

  // --chbrowser: apenas altera o browser padrao
  if (isChBrowser) {
    await changeDefaultBrowser();
    return;
  }

  // --chterminal: apenas altera o terminal padrao
  if (isChTerminal) {
    await changeDefaultTerminal();
    return;
  }

  // Pede sudo logo no inicio pra nao interromper no meio (nao precisa no macOS)
  if (!isMacos()) {
    await acquireSudo();
  }

  // Configura Git nome/email (pula no minimal — usa existente sem perguntar)
  let minimal = isMinimal;
  if (!minimal) {
    await setupGitIdentity();
  } else {
    try {
      const name = (await $`git config --global user.name`.text()).trim();
      const email = (await $`git config --global user.email`.text()).trim();
      if (name && email) log.ok(`Git: ${name} <${email}> (existente)`);
      else log.dim("Git: nome/email nao configurado (use cbdotInstall pra configurar depois)");
    } catch {
      log.dim("Git: nome/email nao configurado (use cbdotInstall pra configurar depois)");
    }
  }

  // Determina quais modulos instalar
  let selectedModules: IModule[];
  let runAll = isAll || isMinimal;

  if (isUpdate) {
    // --update: reinstala os modulos da ultima selecao (sem prompts internos)
    const saved = loadSavedModules();
    if (saved) {
      selectedModules = saved
        .map((id) => getModuleById(id))
        .filter(Boolean) as IModule[];
      runAll = true;
      console.log(`  Atualizando ${selectedModules.length} modulo(s) salvos...\n`);
    } else {
      // Sem selecao salva — mostra menu interativo
      log.warn("Nenhuma selecao salva. Escolha os modulos:\n");
      const result = await interactiveMenu();
      selectedModules = result.modules;
      runAll = result.isAll;
    }
  } else if (isMinimal) {
    selectedModules = ALL_MODULES;
    minimal = true;
    console.log("  Instalando modo minimal...\n");
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
    const result = await interactiveMenu();
    selectedModules = result.modules;
    runAll = result.isAll;
    if (result.isMinimal) minimal = true;
  }

  // ---------------------------------------------------------------------------
  // Executa modulos
  // ---------------------------------------------------------------------------

  const results: Array<{ name: string; status: IModuleStatus }> = [];
  const ctx: IRunContext = { overrides, isAll: runAll, isMinimal: minimal };

  const currentPlatform = isMacos() ? "macos" : "linux";
  const minimalSkipModules = new Set(["gaming", "virtualization"]);

  for (const mod of selectedModules) {
    if (mod.platforms && !mod.platforms.includes(currentPlatform)) {
      log.warn(`[${mod.id}] Pulado — nao suportado no ${currentPlatform}`);
      results.push({ name: mod.id, status: "skipped" });
      continue;
    }

    if (minimal && minimalSkipModules.has(mod.id)) {
      log.warn(`[${mod.id}] Pulado — modo minimal`);
      results.push({ name: mod.id, status: "skipped" });
      continue;
    }

    tracker.start(mod.id);
    try {
      await mod.run(ctx);
      tracker.setStatus(mod.id, "ok");
      results.push({ name: mod.id, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  x [${mod.id}] ${msg}`);
      tracker.setStatus(mod.id, "erro");
      results.push({ name: mod.id, status: "erro" });
    }
  }

  // Salva selecao pra --update futuro
  const moduleIds = selectedModules.map((m) => m.id);
  await saveSelectedModules(moduleIds);

  // ---------------------------------------------------------------------------
  // Force reload (regenera keybinds + recarrega AeroSpace)
  // ---------------------------------------------------------------------------

  await $`bash ${DOTFILES_DIR}/keybinds/generate.sh`.nothrow().quiet();
  if (isMacos() && (await commandExists("aerospace"))) {
    await $`aerospace reload-config`.nothrow().quiet();
  }

  if (isWSL()) {
    const wh = winHome();
    const glazeDest = `${wh}/.glzr/glazewm`;
    await $`mkdir -p ${glazeDest}`.nothrow();
    await $`cp ${DOTFILES_DIR}/glazewm/config.yaml ${glazeDest}/config.yaml`.nothrow();
    log.ok(`GlazeWM config copiado pro Windows (${glazeDest})`);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  showSummary(results);
  releaseSudo();
}

main().catch((err) => {
  releaseSudo();
  if (err?.name === "ExitPromptError") {
    console.log("\n  Cancelado.\n");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
