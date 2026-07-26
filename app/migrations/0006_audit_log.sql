-- Audit log for tracking usage limit changes and admin actions.
-- Additive migration — safe to apply on existing databases.
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_scope TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS audit_log_actor_idx
  ON audit_log (actor_scope, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_log_action_idx
  ON audit_log (action, created_at DESC);