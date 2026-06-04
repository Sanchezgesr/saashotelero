-- 002: CSRF token table for API route protection
-- Tokens expire after 1 hour

CREATE TABLE IF NOT EXISTS csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_csrf_tokens_token
  ON csrf_tokens(token);

CREATE INDEX IF NOT EXISTS idx_csrf_tokens_expires
  ON csrf_tokens(expires_at);
