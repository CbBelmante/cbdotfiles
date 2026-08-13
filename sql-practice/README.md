# 🗄️ SQL Practice

Ferramenta interativa para treinar SQL com SQLite. **Workflow automatizado:** cria banco → copia connection string pro clipboard → abre Neovim com dadbod UI → 3 teclas e tá conectado!

## 🚀 Como usar

```bash
sqlp              # menu interativo
sqlpHelp          # guia passo a passo
```

> 💡 **Primeira vez?** Rode `sqlpHelp` - mostra o workflow completo com auto-copia da connection string!

## ⚡ Workflow rápido

```
1. sqlp → Criar banco → Automático → Completo
   ↓
   📋 Connection string copiada automaticamente!
   🚀 Neovim abre com dadbod UI já ativo

2. Shift+A (add connection)
3. Ctrl+Shift+V (cola)
4. Enter
   ↓
   ✅ Conectado! 3 teclas apenas!
```

## 📋 Menu

```
🗄️  SQL Practice

1. 🆕 Criar novo banco
2. 📂 Abrir banco existente
3. 📋 Listar bancos salvos
4. 🗑️  Limpar bancos
5. ⚙️  Configurações
6. ❌ Sair
```

> 💡 **Todas as ações voltam ao menu principal!** Use "◀️ Voltar" ou complete a ação para retornar.

## 🎨 Presets disponíveis

Ao criar um novo banco, você escolhe entre 3 presets:

| Preset | Schema | Dados | Quando usar |
|--------|--------|-------|-------------|
| **🏢 Completo** | ✅ 4 tabelas | ✅ 24 registros | Treinar SELECT, JOIN, WHERE, GROUP BY, agregações |
| **📐 Estrutura apenas** | ✅ 4 tabelas | ❌ 0 registros | Treinar INSERT, UPDATE, DELETE (você popula) |
| **⚪ Vazio em branco** | ❌ 0 tabelas | ❌ 0 registros | Treinar CREATE TABLE, definir schema do zero |

**Exemplo:**
```
? Escolha o preset:
❯ 🏢 Completo (schema + dados)
  📐 Estrutura apenas (schema sem dados)
  ⚪ Vazio em branco (sem schema)
```

### 1️⃣ Criar novo banco

- **Nome:**
  - ⚡ **Automático** — formato brasileiro: `practice-13-08-2026-11h51` (DD-MM-YYYY-HHhMM)
  - ✏️ **Manual** — você escolhe (ex: `curso-sql`, `treino-joins`)
- Escolhe o preset:
  - **🏢 Completo** — 4 tabelas + 24 registros (pronto pra treinar SQL)
  - **📐 Estrutura apenas** — 4 tabelas vazias (pronto pra treinar INSERT)
  - **⚪ Vazio em branco** — banco vazio (pronto pra treinar CREATE TABLE)
- Cria banco em `~/Workspaces/sql-practice/<nome>.db` (ou path customizado)
- Pergunta se quer abrir no Neovim

### 2️⃣ Abrir banco existente

- Lista todos os `.db` no diretório de prática
- Seleciona e abre no Neovim com dadbod UI ativo

### 3️⃣ Listar bancos salvos

- Mostra todos os bancos criados com índice numérico

### 4️⃣ Limpar bancos

- Lista todos os bancos com **data de criação**
- Multi-select (espaço = marcar)
- Deleta múltiplos de uma vez
- **Confirma antes de deletar**

**Exemplo:**
```
☑ practice-13-08-2026-11h51 (criado: 13/08/2026 11:51:30)
☑ practice-12-08-2026-15h20 (criado: 12/08/2026 15:20:15)
☐ meu-projeto-importante (criado: 10/08/2026 10:00:00)
```

### 5️⃣ Configurações

**Opções:**
- **📂 Alterar path padrão** — escolhe onde salvar os bancos
- **🔄 Resetar para padrão** — volta para `~/Workspaces/sql-practice`
- **◀️ Voltar** — retorna ao menu principal

**Exemplo de uso:**
```
⚙️ Configurações
📁 Path atual: /home/user/Workspaces/sql-practice

> 📂 Alterar path padrão

Novo path: ~/Documentos/sql-estudos
✅ Configuração salva!
```

## 📊 Schema (preset Completo ou Estrutura apenas)

Todo banco criado com preset **Completo** ou **Estrutura apenas** vem com 4 tabelas:

### **1. demo** (tabela simples)
```sql
CREATE TABLE demo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Dados (preset Completo):** 5 registros (Alpha, Bravo, Charlie, Delta, Echo)

### **2. users** (usuários)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Dados (preset Completo):** 6 usuários (Ana Silva, Bruno Costa, Carla Santos, Diego Alves, Elena Rocha, Felipe Lima)

### **3. companies** (empresas)
```sql
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Dados (preset Completo):** 4 empresas (TechCorp, FinanceHub, EduTech, HealthPlus)

### **4. company_users** (relacionamento N:N)
```sql
CREATE TABLE company_users (
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, company_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (user_id) REFERENCES companies(id)
);
```

**Dados (preset Completo):** 9 relacionamentos (usuários trabalhando em empresas com cargos)

---

## 🎯 Exemplos de queries (preset Completo)

### Queries simples
```sql
-- Tabela demo
SELECT * FROM demo WHERE value > 150;
SELECT name, value FROM demo ORDER BY value DESC;
SELECT AVG(value) FROM demo;

-- Usuários
SELECT * FROM users WHERE email LIKE '%example.com';
SELECT COUNT(*) FROM users;
```

### JOINs
```sql
-- Usuários com suas empresas
SELECT 
  u.name as usuario,
  c.name as empresa,
  cu.role as cargo
FROM users u
INNER JOIN company_users cu ON u.id = cu.user_id
INNER JOIN companies c ON cu.company_id = c.id
ORDER BY u.name;

-- LEFT JOIN (mostra usuários sem empresa)
SELECT 
  u.name,
  COUNT(cu.company_id) as total_empresas
FROM users u
LEFT JOIN company_users cu ON u.id = cu.user_id
GROUP BY u.id;

-- Empresas com contagem de funcionários
SELECT 
  c.name as empresa,
  c.industry as setor,
  COUNT(cu.user_id) as funcionarios
FROM companies c
LEFT JOIN company_users cu ON c.id = cu.company_id
GROUP BY c.id
ORDER BY funcionarios DESC;
```

### Agregações
```sql
-- Usuários que trabalham em mais de 1 empresa
SELECT 
  u.name,
  COUNT(cu.company_id) as empresas
FROM users u
INNER JOIN company_users cu ON u.id = cu.user_id
GROUP BY u.id
HAVING COUNT(cu.company_id) > 1;

-- Setor com mais empresas
SELECT industry, COUNT(*) as total
FROM companies
GROUP BY industry
ORDER BY total DESC;
```

## ⚙️ Configuração

O SQL Practice salva suas preferências em:

```
~/.sqlpractice.json
```

**Exemplo:**
```json
{
  "defaultPath": "/home/user/Documentos/meus-bancos-sql"
}
```

## 🔧 Estrutura do código

```
sql-practice/
├── index.ts          # Orquestrador + menu interativo
├── seeds/
│   └── demo.ts       # Seed da tabela demo
├── schema.sql        # DDL (CREATE TABLE)
├── package.json      # Dependências (inquirer)
└── README.md         # Este arquivo
```

## 🎯 Neovim + dadbod

Quando você abre um banco, o Neovim inicia com o **vim-dadbod-ui** ativo (`<leader>db`).

**Atalhos úteis:**
- `<leader>db` — toggle dadbod UI
- No dadbod: `o` — expandir/colapsar
- No dadbod: `S` — executar query selecionada
- No dadbod: `<Enter>` — executar query sob o cursor

## 📚 Adicionar mais tabelas

Para expandir o banco com mais exemplos:

1. Crie novo seed: `seeds/users.ts`
2. Adicione a função `buildUsersSQL()`
3. Importe e execute no `index.ts`

**Exemplo:**
```typescript
// seeds/users.ts
export function buildUsersSQL(): string[] {
  return [
    `CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE
    )`,
    `INSERT INTO users VALUES (1, 'Ana', 'ana@example.com')`,
    `INSERT INTO users VALUES (2, 'Bruno', 'bruno@example.com')`,
  ];
}
```

## 🐛 Troubleshooting

**Não sabe como conectar no Neovim?**
- Rode `sqlpHelp` no terminal para ver o passo a passo completo
- Explica como adicionar conexão no dadbod, executar queries, etc.

**Erro: "banco já existe"**
- Use "📂 Abrir banco existente" para acessá-lo
- Ou delete o arquivo `.db` manualmente

**Neovim não abre o dadbod**
- Verifique se `vim-dadbod-ui` está instalado: `:checkhealth`
- Plugin está em: `~/.config/nvim/lua/plugins/dadbod.lua`
- Rode `sqlpHelp` para ver atalhos e como usar

**Path não salva**
- Verifique permissões em `~/.sqlpractice.json`
- Use path absoluto ou `~` (não caminhos relativos)

## 🆘 Ajuda

- `sqlpHelp` — Passo a passo completo (como conectar no Neovim)
- `cbHelp` — Ajuda geral do cbdotfiles
- `nvimTips` — Dicas de navegação no Neovim

## 📝 TODO / Ideias futuras

- [ ] Templates de bancos (e-commerce, blog, sistema de usuários)
- [ ] Import de CSV para popular tabelas
- [ ] Gerador de dados fake (faker.js)
- [ ] Exercícios guiados (quiz SQL)
- [ ] Export de queries executadas (history)
