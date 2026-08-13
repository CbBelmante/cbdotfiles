-- 🗄️ Schema SQL Practice
-- Tabelas demo para treinar SQL (incluindo JOINs)

-- Tabela demo simples
DROP TABLE IF EXISTS demo;
CREATE TABLE demo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Usuários
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Empresas
DROP TABLE IF EXISTS companies;
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Relacionamento N:N (usuários <-> empresas)
DROP TABLE IF EXISTS company_users;
CREATE TABLE company_users (
  user_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, company_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
