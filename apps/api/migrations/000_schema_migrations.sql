CREATE TABLE IF NOT EXISTS schema_migrations (
  file_name TEXT PRIMARY KEY,
  checksum TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);