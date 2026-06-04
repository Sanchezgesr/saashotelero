-- 003: Add archived_at column to audit_log for future partitioning/archival strategy

ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
