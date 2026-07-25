-- Analytics events table for page views and feature usage tracking.
-- Additive migration — safe to apply on existing databases.
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_path TEXT,
  session_id TEXT,
  user_scope TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx
  ON analytics_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_name_idx
  ON analytics_events (event_name, created_at DESC);