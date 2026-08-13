#!/usr/bin/env bun

/**
 * 🗄️ SQL Practice
 * Cria/abre bancos SQLite para treinar SQL + abre no Neovim com dadbod
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, statSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, join, dirname } from 'path';
import { select, input, confirm, checkbox } from '@inquirer/prompts';
import { buildDemoSQL } from './seeds/demo';

// ============== CONSTANTS ==============

const HOME = process.env.HOME!;
const DEFAULT_PRACTICE_DIR = join(HOME, 'Workspaces', 'sql-practice');
const CONFIG_FILE = join(HOME, '.sqlpractice.json');
const SCHEMA_PATH = resolve(import.meta.dir, 'schema.sql');

// ============== CONFIG ==============

interface IConfig {
  defaultPath?: string;
}

function loadConfig(): IConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function saveConfig(config: IConfig): void {
  const content = JSON.stringify(config, null, 2);
  const { writeFileSync } = require('fs');
  writeFileSync(CONFIG_FILE, content, 'utf-8');
  console.log(`\n✅ Configuração salva em ${CONFIG_FILE}\n`);
}

function getPracticeDir(): string {
  const config = loadConfig();
  return config.defaultPath || DEFAULT_PRACTICE_DIR;
}

// ============== HELPERS ==============

/**
 * Gera nome automático com timestamp brasileiro
 * Formato: practice-DD-MM-YYYY-HHhMM
 */
function generateAutoName(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `practice-${day}-${month}-${year}-${hours}h${minutes}`;
}

/**
 * Garante que o diretório de prática existe
 */
function ensurePracticeDir(): void {
  const practiceDir = getPracticeDir();
  if (!existsSync(practiceDir)) {
    mkdirSync(practiceDir, { recursive: true });
    console.log(`✅ Diretório criado: ${practiceDir}`);
  }
}

/**
 * Lista todos os bancos .db no diretório de prática
 */
function listDatabases(): string[] {
  const practiceDir = getPracticeDir();
  if (!existsSync(practiceDir)) return [];

  const files = readdirSync(practiceDir);
  const databases = files.filter(f => f.endsWith('.db'));

  return databases;
}

/**
 * Cria um novo banco com schema + seed inicial (opcional)
 */
async function createDatabase(name: string): Promise<string> {
  const practiceDir = getPracticeDir();
  const dbPath = join(practiceDir, `${name}.db`);

  if (existsSync(dbPath)) {
    throw new Error(`⚠️  Banco "${name}.db" já existe!`);
  }

  // Pergunta o preset
  const preset = await select({
    message: 'Escolha o preset:',
    choices: [
      { name: '🏢 Completo (schema + dados)', value: 'full' },
      { name: '📐 Estrutura apenas (schema sem dados)', value: 'schema-only' },
      { name: '⚪ Vazio em branco (sem schema)', value: 'blank' },
    ],
  });

  console.log(`\n📦 Criando banco: ${name}.db`);

  // Cria banco
  const db = new Database(dbPath);

  // Aplica schema (exceto se for blank)
  if (preset !== 'blank') {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    console.log('  ✅ Schema aplicado (4 tabelas: demo, users, companies, company_users)');
  } else {
    console.log('  ℹ️  Banco vazio em branco (sem schema)');
  }

  // Roda seeds apenas se preset = full
  if (preset === 'full') {
    const statements = buildDemoSQL();
    for (let i = 0; i < statements.length; i++) {
      db.exec(statements[i]);
    }
    console.log(`  ✅ ${statements.length} registros inseridos`);
  } else if (preset === 'schema-only') {
    console.log('  ℹ️  Tabelas criadas sem dados (0 registros)');
  }

  db.close();
  console.log(`\n🎉 Banco criado: ${dbPath}\n`);

  return dbPath;
}

/**
 * Abre Neovim com o banco já conectado no dadbod
 * - Copia connection string pro clipboard
 * - Abre dadbod UI automaticamente
 * - Abre no diretório do banco para sidebar mostrar arquivos corretos
 */
function openInNeovim(dbPath: string): void {
  const dbDir = dirname(dbPath);
  const connectionString = `sqlite://${dbPath}`;

  // Tenta copiar pro clipboard (X11 ou Wayland)
  try {
    // Tenta wl-copy (Wayland) primeiro
    execSync(`echo -n "${connectionString}" | wl-copy`, { stdio: 'ignore' });
    console.log(`📋 Connection string copiada pro clipboard!`);
  } catch {
    try {
      // Fallback: xclip (X11)
      execSync(`echo -n "${connectionString}" | xclip -selection clipboard`, { stdio: 'ignore' });
      console.log(`📋 Connection string copiada pro clipboard!`);
    } catch {
      // Se nenhum funcionar, mostra a string
      console.log(`⚠️  Clipboard não disponível`);
      console.log(`📋 Connection string: ${connectionString}`);
    }
  }

  console.log(`\n💡 No Neovim:`);
  console.log(`   1. Pressiona: Shift+A  (Add connection)`);
  console.log(`   2. Cola: Ctrl+Shift+V  (connection string)`);
  console.log(`   3. Enter pra confirmar\n`);
  console.log(`🚀 Abrindo Neovim...\n`);

  // Abre Neovim no diretório do banco com dadbod UI já aberto
  execSync(`nvim -c "DBUI"`, {
    stdio: 'inherit',
    cwd: dbDir,
    env: {
      ...process.env,
      NVIM_DB_PATH: dbPath
    }
  });
}

/**
 * Limpa bancos antigos (deletar múltiplos)
 */
async function cleanDatabases(): Promise<void> {
  const databases = listDatabases();
  const practiceDir = getPracticeDir();

  if (databases.length === 0) {
    console.log('\n📭 Nenhum banco encontrado para limpar\n');
    return;
  }

  // Monta lista com info de data
  const choices = databases.map(db => {
    const dbPath = join(practiceDir, db);
    const stats = statSync(dbPath);
    const date = stats.mtime.toLocaleString('pt-BR');
    return {
      name: `${db} (criado: ${date})`,
      value: db,
    };
  });

  const selected = await checkbox({
    message: 'Selecione os bancos para deletar (espaço = marcar):',
    choices,
  });

  if (selected.length === 0) {
    console.log('\n✅ Nenhum banco selecionado\n');
    return;
  }

  // Confirma antes de deletar
  console.log(`\n⚠️  Você vai deletar ${selected.length} banco(s):`);
  for (let i = 0; i < selected.length; i++) {
    console.log(`  - ${selected[i]}`);
  }
  console.log('');

  const confirmed = await confirm({
    message: 'Tem certeza?',
    default: false,
  });

  if (!confirmed) {
    console.log('\n✅ Cancelado\n');
    return;
  }

  // Deleta os selecionados
  let deleted = 0;
  for (let i = 0; i < selected.length; i++) {
    const dbPath = join(practiceDir, selected[i]);
    try {
      unlinkSync(dbPath);
      console.log(`  ✅ Deletado: ${selected[i]}`);
      deleted++;
    } catch (error) {
      console.log(`  ❌ Erro ao deletar ${selected[i]}: ${error}`);
    }
  }

  console.log(`\n🎉 ${deleted} banco(s) deletado(s)\n`);
}

// ============== MENU ==============

async function showMenu(): Promise<void> {
  ensurePracticeDir();

  // Loop infinito - só sai com "Sair"
  while (true) {
    console.log('\n🗄️  SQL Practice\n');

    const action = await select({
      message: 'O que você quer fazer?',
      choices: [
        { name: '🆕 Criar novo banco', value: 'create' },
        { name: '📂 Abrir banco existente', value: 'open' },
        { name: '📋 Listar bancos salvos', value: 'list' },
        { name: '🗑️  Limpar bancos', value: 'clean' },
        { name: '⚙️  Configurações', value: 'config' },
        { name: '❌ Sair', value: 'exit' },
      ],
    });

    if (action === 'exit') {
      console.log('\n👋 Até mais!\n');
      process.exit(0);
    }

    if (action === 'create') {
      // Oferece nome automático ou manual
      const nameChoice = await select({
        message: 'Como quer nomear o banco?',
        choices: [
          { name: `⚡ Automático (${generateAutoName()})`, value: 'auto' },
          { name: '✏️  Manual (você digita)', value: 'manual' },
          { name: '◀️  Voltar', value: '__back__' },
        ],
      });

      if (nameChoice === '__back__') {
        continue; // Volta pro menu
      }

    let name: string;

    if (nameChoice === 'auto') {
      name = generateAutoName();
      console.log(`\n✅ Nome: ${name}\n`);
    } else {
      name = await input({
        message: 'Nome do banco (sem .db):',
        default: 'practice',
        validate: (value) => {
          if (!value.trim()) return 'Nome não pode ser vazio';
          if (value.includes('.')) return 'Não inclua a extensão .db';
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Use apenas letras, números, - e _';
          return true;
        },
      });
    }

    const dbPath = await createDatabase(name.trim());

    const shouldOpen = await confirm({
      message: 'Abrir no Neovim agora?',
      default: true,
    });

    if (shouldOpen) {
      openInNeovim(dbPath);
    }

    continue; // Volta pro menu
    }

    if (action === 'open') {
      const databases = listDatabases();

      if (databases.length === 0) {
        console.log('\n⚠️  Nenhum banco encontrado\n');
        console.log('💡 Crie um novo primeiro!\n');
        continue; // Volta pro menu
      }

      // Adiciona opção "Voltar"
      const choices = [
        ...databases.map(db => ({ name: db, value: db })),
        { name: '◀️  Voltar', value: '__back__' },
      ];

      const selected = await select({
        message: 'Selecione o banco:',
        choices,
      });

      if (selected === '__back__') {
        continue; // Volta pro menu
      }

      const practiceDir = getPracticeDir();
      const dbPath = join(practiceDir, selected);
      openInNeovim(dbPath);

      continue; // Volta pro menu
    }

    if (action === 'list') {
      const databases = listDatabases();
      const practiceDir = getPracticeDir();

      if (databases.length === 0) {
        console.log('\n📭 Nenhum banco encontrado\n');
      } else {
        console.log(`\n📋 Bancos em ${practiceDir}:\n`);
        for (let i = 0; i < databases.length; i++) {
          console.log(`  ${i + 1}. ${databases[i]}`);
        }
        console.log('');
      }

      continue; // Volta pro menu
    }

    if (action === 'clean') {
      await cleanDatabases();
      continue; // Volta pro menu
    }

    if (action === 'config') {
      const currentPath = getPracticeDir();
      console.log(`\n⚙️  Configurações\n`);
      console.log(`📁 Path atual: ${currentPath}\n`);

      const configAction = await select({
        message: 'O que deseja configurar?',
        choices: [
          { name: '📂 Alterar path padrão', value: 'change-path' },
          { name: '🔄 Resetar para padrão (Workspaces)', value: 'reset' },
          { name: '◀️  Voltar', value: 'back' },
        ],
      });

      if (configAction === 'back') {
        continue; // Volta pro menu
      }

      if (configAction === 'reset') {
        const config = loadConfig();
        delete config.defaultPath;
        saveConfig(config);
        console.log(`✅ Path resetado para: ${DEFAULT_PRACTICE_DIR}\n`);
        continue; // Volta pro menu
      }

      if (configAction === 'change-path') {
        const newPath = await input({
          message: 'Novo path (use ~ para home):',
          default: currentPath,
          validate: (value) => {
            if (!value.trim()) return 'Path não pode ser vazio';
            return true;
          },
        });

        const expandedPath = newPath.replace(/^~/, HOME);
        const config = loadConfig();
        config.defaultPath = expandedPath;
        saveConfig(config);

        // Cria o novo diretório se não existir
        if (!existsSync(expandedPath)) {
          const shouldCreate = await confirm({
            message: `Diretório não existe. Criar ${expandedPath}?`,
            default: true,
          });

          if (shouldCreate) {
            mkdirSync(expandedPath, { recursive: true });
            console.log(`✅ Diretório criado!\n`);
          }
        }

        continue; // Volta pro menu
      }
    }
  } // Fecha o while (true)
}

// ============== MAIN ==============

showMenu().catch(error => {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
});
