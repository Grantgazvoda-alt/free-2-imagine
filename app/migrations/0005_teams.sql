-- Team/multi-user account support.
-- Additive migration — safe to apply on existing databases.
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_owner_scope TEXT NOT NULL,
  member_scope TEXT NOT NULL,
  member_name TEXT,
  member_role TEXT NOT NULL DEFAULT 'member',
  invited_at TEXT NOT NULL DEFAULT (datetime('now')),
  joined_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(team_owner_scope, member_scope)
);

CREATE INDEX IF NOT EXISTS team_members_owner_idx
  ON team_members (team_owner_scope, status);

CREATE INDEX IF NOT EXISTS team_members_member_idx
  ON team_members (member_scope);

-- Add member_name to usage_ledger for display purposes
ALTER TABLE usage_ledger ADD COLUMN member_name TEXT;