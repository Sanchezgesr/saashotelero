-- 013: Soporte para anulación de comprobantes electrónicos

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS motivo_baja TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS fecha_baja TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nota_credito_serie TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nota_credito_numero INTEGER;
