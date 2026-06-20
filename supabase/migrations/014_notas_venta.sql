-- 014: Tabla para Notas de Venta numeradas

CREATE TABLE IF NOT EXISTS notas_venta (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  numero     INTEGER NOT NULL,
  checkin_id UUID REFERENCES checkins(id),
  guest_name TEXT NOT NULL,
  guest_doc  TEXT,
  room_number TEXT NOT NULL,
  total      NUMERIC(10,2) NOT NULL,
  payment_method TEXT,
  tipo       TEXT NOT NULL DEFAULT 'checkin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hotel_id, numero)
);

ALTER TABLE notas_venta ENABLE ROW LEVEL SECURITY;

CREATE POLICY notas_venta_select ON notas_venta
  FOR SELECT USING (hotel_id = get_my_hotel_id());

CREATE POLICY notas_venta_insert ON notas_venta
  FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
