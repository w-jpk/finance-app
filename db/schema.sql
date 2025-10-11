-- Finance App - PostgreSQL schema
-- Run in psql or migrations tool

-- Safe drops for iterative development (optional)
DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'transaction_type';
  IF FOUND THEN DROP TYPE transaction_type; END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'budget_period';
  IF FOUND THEN DROP TYPE budget_period; END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_type WHERE typname = 'goal_status';
  IF FOUND THEN DROP TYPE goal_status; END IF;
END $$;

-- Enums
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE budget_period     AS ENUM ('monthly', 'yearly');
CREATE TYPE goal_status       AS ENUM ('active', 'completed', 'paused');

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users (single-user for now, but future-proof)
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  currency    TEXT NOT NULL DEFAULT 'RUB',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Categories (income/expense)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        transaction_type NOT NULL,
  color       TEXT NOT NULL,
  icon        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_categories_user_name_type UNIQUE (user_id, name, type)
);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Transactions (income/expense)
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type         transaction_type NOT NULL,
  amount       NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  description  TEXT NOT NULL,
  occurred_on  DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, occurred_on);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category  ON transactions(category_id);
CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Budgets per category and period
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  period      budget_period NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_budget_dates CHECK (start_date <= end_date),
  CONSTRAINT uq_budget_window UNIQUE (user_id, category_id, start_date, end_date)
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_window ON budgets(user_id, start_date, end_date);
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Goals with optional category link
CREATE TABLE IF NOT EXISTS goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  target_amount  NUMERIC(14,2) NOT NULL CHECK (target_amount >= 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date    DATE NOT NULL,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  status         goal_status NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed a single demo user (id is stable for local use)
-- Requires pgcrypto for gen_random_uuid(); enable if needed: CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO users (id, name, email, currency)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Пользователь',
  'user@example.com',
  'RUB'
)
ON CONFLICT (email) DO NOTHING;

-- Helpful view: expenses summed by category within a period
CREATE OR REPLACE VIEW v_expenses_by_category AS
SELECT
  t.user_id,
  c.id   AS category_id,
  c.name AS category_name,
  SUM(t.amount) AS total_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.type = 'expense'
GROUP BY t.user_id, c.id, c.name;


