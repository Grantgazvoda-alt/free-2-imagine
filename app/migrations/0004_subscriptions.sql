-- Subscriptions and billing tables for Stripe integration.
-- Additive migration — safe to apply on existing databases.
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_scope TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  current_period_start TEXT,
  current_period_end TEXT,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  credits_total INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS subscriptions_user_scope_idx
  ON subscriptions (user_scope);

CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_idx
  ON subscriptions (stripe_customer_id);

CREATE TABLE IF NOT EXISTS usage_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_scope TEXT NOT NULL,
  generation_id TEXT,
  credits_consumed INTEGER NOT NULL DEFAULT 1,
  model TEXT NOT NULL DEFAULT 'gpt_image_2',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS usage_ledger_user_scope_idx
  ON usage_ledger (user_scope, created_at DESC);