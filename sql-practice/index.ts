#!/usr/bin/env bun

/**
 * 🗄️ SQL Practice
 * Cria/abre bancos SQLite para treinar SQL + abre no Neovim com dadbod
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, join } from 'path';
import { select, input, confirm } from '@inquirer/prompts';
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
 */
function openInNeovim(dbPath: string): void {
  console.log(`🚀 Abrindo Neovim...\n`);

  // Abre Neovim e já ativa o dadbod UI
  execSync(`nvim -c "DBUI"`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NVIM_DB_PATH: dbPath // passa o path pro neovim se precisar
    }
  });
}

// ============== MENU ==============

async function showMenu(): Promise<void> {
  ensurePracticeDir();

  console.log('\n🗄️  SQL Practice\n');

  const action = await select({
    message: 'O que você quer fazer?',
    choices: [
      { name: '🆕 Criar novo banco', value: 'create' },
      { name: '📂 Abrir banco existente', value: 'open' },
      { name: '📋 Listar bancos salvos', value: 'list' },
      { name: '⚙️  Configurações', value: 'config' },
      { name: '❌ Sair', value: 'exit' },
    ],
  });

  if (action === 'exit') {
    console.log('\n👋 Até mais!\n');
    process.exit(0);
  }

  if (action === 'create') {
    const name = await input({
      message: 'Nome do banco (sem .db):',
      default: 'practice',
      validate: (value) => {
        if (!value.trim()) return 'Nome não pode ser vazio';
        if (value.includes('.')) return 'Não inclua a extensão .db';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Use apenas letras, números, - e _';
        return true;
      },
    });

    const dbPath = await createDatabase(name.trim());

    const shouldOpen = await confirm({
      message: 'Abrir no Neovim agora?',
      default: true,
    });

    if (shouldOpen) {
      openInNeovim(dbPath);
    }

    return;
  }

  if (action === 'open') {
    const databases = listDatabases();

    if (databases.length === 0) {
      console.log('\n⚠️  Nenhum banco encontrado em ~/sql-practice\n');
      console.log('💡 Crie um novo primeiro!\n');
      return;
    }

    const selected = await select({
      message: 'Selecione o banco:',
      choices: databases.map(db => ({
        name: db,
        value: db,
      })),
    });

    const practiceDir = getPracticeDir();
    const dbPath = join(practiceDir, selected);
    openInNeovim(dbPath);

    return;
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

    return;
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
      return;
    }

    if (configAction === 'reset') {
      const config = loadConfig();
      delete config.defaultPath;
      saveConfig(config);
      console.log(`✅ Path resetado para: ${DEFAULT_PRACTICE_DIR}\n`);
      return;
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

      return;
    }
  }
}

// ============== MAIN ==============

showMenu().catch(error => {
  console.error('\n❌ Erro:', error.message);
  process.exit(1);
});
