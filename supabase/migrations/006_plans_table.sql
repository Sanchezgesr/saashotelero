-- 006: Plans configuration table
-- Almacena la configuración de planes (precios, duración) en BD
-- en vez de hardcodear en TypeScript

CREATE TABLE IF NOT EXISTS plans (
  name TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO plans (name, label, duration_days, price, description, sort_order) VALUES
  ('prueba', 'Prueba', 30, 0, '30 días de prueba gratuita', 1),
  ('mensual', 'Mensual', 30, 50, 'Facturación mensual', 2),
  ('trimestral', 'Trimestral', 90, 140, 'Facturación trimestral', 3),
  ('semestral', 'Semestral', 180, 270, 'Facturación semestral', 4),
  ('anual', 'Anual', 365, 480, 'Facturación anual', 5)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  duration_days = EXCLUDED.duration_days,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;
