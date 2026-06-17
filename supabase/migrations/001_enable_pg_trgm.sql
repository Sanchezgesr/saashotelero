-- 001: Enable pg_trgm extension and create trigram indexes for guest search
-- Requires: superuser privileges in Supabase

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_guests_full_name_trgm
  ON guests USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_guests_dni_trgm
  ON guests USING gin (dni gin_trgm_ops);
