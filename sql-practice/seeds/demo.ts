/**
 * 🌱 Seed das tabelas demo
 * Dados iniciais para treinar SELECT, WHERE, JOINs, etc.
 */

export function buildDemoSQL(): string[] {
  const statements: string[] = [];

  // ============== Tabela demo (simples) ==============
  statements.push(
    `INSERT INTO demo (name, value) VALUES ('Alpha', 100)`,
    `INSERT INTO demo (name, value) VALUES ('Bravo', 200)`,
    `INSERT INTO demo (name, value) VALUES ('Charlie', 300)`,
    `INSERT INTO demo (name, value) VALUES ('Delta', 150)`,
    `INSERT INTO demo (name, value) VALUES ('Echo', 250)`
  );

  // ============== Users ==============
  statements.push(
    `INSERT INTO users (name, email) VALUES ('Ana Silva', 'ana@example.com')`,
    `INSERT INTO users (name, email) VALUES ('Bruno Costa', 'bruno@example.com')`,
    `INSERT INTO users (name, email) VALUES ('Carla Santos', 'carla@example.com')`,
    `INSERT INTO users (name, email) VALUES ('Diego Alves', 'diego@example.com')`,
    `INSERT INTO users (name, email) VALUES ('Elena Rocha', 'elena@example.com')`,
    `INSERT INTO users (name, email) VALUES ('Felipe Lima', 'felipe@example.com')`
  );

  // ============== Companies ==============
  statements.push(
    `INSERT INTO companies (name, industry) VALUES ('TechCorp', 'Tecnologia')`,
    `INSERT INTO companies (name, industry) VALUES ('FinanceHub', 'Financeiro')`,
    `INSERT INTO companies (name, industry) VALUES ('EduTech', 'Educacao')`,
    `INSERT INTO companies (name, industry) VALUES ('HealthPlus', 'Saude')`
  );

  // ============== Company_Users (relacionamentos) ==============
  // Ana trabalha em 2 empresas
  statements.push(
    `INSERT INTO company_users (user_id, company_id, role) VALUES (1, 1, 'Developer')`,
    `INSERT INTO company_users (user_id, company_id, role) VALUES (1, 3, 'Consultant')`
  );

  // Bruno trabalha em 1 empresa
  statements.push(
    `INSERT INTO company_users (user_id, company_id, role) VALUES (2, 2, 'Analyst')`
  );

  // Carla trabalha em 3 empresas
  statements.push(
    `INSERT INTO company_users (user_id, company_id, role) VALUES (3, 1, 'Manager')`,
    `INSERT INTO company_users (user_id, company_id, role) VALUES (3, 2, 'Advisor')`,
    `INSERT INTO company_users (user_id, company_id, role) VALUES (3, 4, 'Director')`
  );

  // Diego trabalha em 1 empresa
  statements.push(
    `INSERT INTO company_users (user_id, company_id, role) VALUES (4, 3, 'Teacher')`
  );

  // Elena trabalha em 2 empresas
  statements.push(
    `INSERT INTO company_users (user_id, company_id, role) VALUES (5, 1, 'Designer')`,
    `INSERT INTO company_users (user_id, company_id, role) VALUES (5, 4, 'UX Lead')`
  );

  // Felipe não trabalha em nenhuma empresa (útil para LEFT JOIN)

  return statements;
}
