CREATE TABLE IF NOT EXISTS hotel_fiscal_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  lucode_token TEXT NOT NULL DEFAULT '',
  serie_boleta TEXT NOT NULL DEFAULT 'B001',
  serie_factura TEXT NOT NULL DEFAULT 'F001',
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  checkin_id UUID REFERENCES checkins(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('boleta', 'factura')),
  serie TEXT NOT NULL,
  numero INTEGER NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  cliente_tipo_documento TEXT,
  cliente_numero_documento TEXT,
  cliente_denominacion TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  hash TEXT,
  xml_url TEXT,
  cdr_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(serie, numero)
);
