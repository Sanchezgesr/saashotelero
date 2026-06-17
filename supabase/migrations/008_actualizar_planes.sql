-- 008: Actualizar planes a la nueva estructura Básico/Pro
-- Eliminar planes anteriores si existen
DELETE FROM plans WHERE name IN ('prueba', 'mensual', 'trimestral', 'semestral', 'anual');

-- Insertar nuevos planes
INSERT INTO plans (name, label, duration_days, price, description, sort_order) VALUES
  ('basico', 'Básico', 30, 45, 'Sin facturación electrónica', 1),
  ('pro', 'Pro', 30, 65, 'Con facturación electrónica SUNAT', 2)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  duration_days = EXCLUDED.duration_days,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- Actualizar hoteles existentes: los que tenían plan con precio > 0 -> pro, los que tenían precio 0 -> basico
UPDATE hotels SET plan = 'pro' WHERE plan IN ('mensual', 'trimestral', 'semestral', 'anual');
UPDATE hotels SET plan = 'basico' WHERE plan IN ('prueba', '');
UPDATE hotels SET plan = 'basico' WHERE plan IS NULL;
