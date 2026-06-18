-- Migración 009: Planes con duración mensual/trimestral/semestral/anual
-- Elimina planes anteriores (basico, pro) y crea 8 combinaciones

DELETE FROM plans;

INSERT INTO plans (name, label, duration_days, price, description, sort_order) VALUES
  ('basico_mensual',    'Básico Mensual',     30,  45,  'Sin facturación electrónica. Pago mensual.',        1),
  ('basico_trimestral', 'Básico Trimestral',  90,  120, 'Sin facturación electrónica. Ahorra ~11%.',          2),
  ('basico_semestral',  'Básico Semestral',   180, 225, 'Sin facturación electrónica. Ahorra ~17%.',          3),
  ('basico_anual',      'Básico Anual',       365, 430, 'Sin facturación electrónica. Ahorra ~20%.',          4),
  ('pro_mensual',       'Pro Mensual',        30,  65,  'Con facturación electrónica SUNAT. Pago mensual.',   5),
  ('pro_trimestral',    'Pro Trimestral',     90,  175, 'Con facturación electrónica SUNAT. Ahorra ~10%.',    6),
  ('pro_semestral',     'Pro Semestral',      180, 330, 'Con facturación electrónica SUNAT. Ahorra ~15%.',    7),
  ('pro_anual',         'Pro Anual',          365, 620, 'Con facturación electrónica SUNAT. Ahorra ~20%.',    8)
ON CONFLICT (name) DO UPDATE SET
  label        = EXCLUDED.label,
  duration_days = EXCLUDED.duration_days,
  price        = EXCLUDED.price,
  description  = EXCLUDED.description,
  sort_order   = EXCLUDED.sort_order;

-- Primero eliminar el CHECK constraint anterior (para poder actualizar los planes)
ALTER TABLE hotels DROP CONSTRAINT IF EXISTS hotels_plan_check;

-- Actualizar hoteles existentes: migrar basico → basico_mensual, pro → pro_mensual
UPDATE hotels SET plan = 'basico_mensual' WHERE plan IN ('basico', 'mensual');
UPDATE hotels SET plan = 'pro_mensual' WHERE plan = 'pro';

-- Agregar nuevo CHECK constraint
ALTER TABLE hotels ADD CONSTRAINT hotels_plan_check CHECK (
  plan IN (
    'basico_mensual', 'basico_trimestral', 'basico_semestral', 'basico_anual',
    'pro_mensual', 'pro_trimestral', 'pro_semestral', 'pro_anual'
  )
) NOT VALID;
