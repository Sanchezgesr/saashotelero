-- 1. Tablas del Sistema

-- HOTELS: Hoteles registrados
CREATE TABLE IF NOT EXISTS hotels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  ruc         TEXT,
  address     TEXT,
  city        TEXT,
  phone       TEXT,
  logo_url    TEXT,
  status      TEXT DEFAULT 'active',   -- active | suspended | deleted
  plan        TEXT DEFAULT 'mensual',  -- prueba | mensual | trimestral | semestral | anual
  plan_expires_at TIMESTAMPTZ,
  theme       TEXT DEFAULT 'default',   -- default | ocean | emerald | sunset | midnight | rose | amber | violet
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES: Usuarios del sistema
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id    UUID REFERENCES hotels(id),   -- NULL para Super Admin
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL,   -- super_admin | hotel_admin | receptionist
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ROOMS: Habitaciones
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  number      TEXT NOT NULL,           -- Número o nombre: "101", "Suite A"
  type        TEXT NOT NULL,           -- simple | doble | triple | matrimonial | familiar
  capacity    INT NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'available', -- available | occupied | cleaning | maintenance
  floor       INT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, number)
);

-- GUESTS: Huéspedes / Clientes
CREATE TABLE IF NOT EXISTS guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  dni         TEXT,
  phone       TEXT,
  email       TEXT,
  nationality TEXT DEFAULT 'Peruana',
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, dni)
);

-- RESERVATIONS: Reservas anticipadas
CREATE TABLE IF NOT EXISTS reservations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id     UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_id      UUID NOT NULL REFERENCES rooms(id),
  guest_id     UUID NOT NULL REFERENCES guests(id),
  check_in_date  DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights       INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  total_price  NUMERIC(10,2),
  status       TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled | completed
  notes        TEXT,
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKINS: Check-in / Check-out
CREATE TABLE IF NOT EXISTS checkins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_id         UUID NOT NULL REFERENCES rooms(id),
  guest_id        UUID NOT NULL REFERENCES guests(id),
  reservation_id  UUID REFERENCES reservations(id),
  check_in_at     TIMESTAMPTZ DEFAULT NOW(),
  check_out_at    TIMESTAMPTZ,
  nights          INT,
  price_per_night NUMERIC(10,2) NOT NULL,
  total_price     NUMERIC(10,2),
  payment_method  TEXT,   -- cash | card | yape | plin
  payment_status  TEXT DEFAULT 'pending',  -- pending | paid
  status          TEXT DEFAULT 'active',   -- active | checked_out
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CASH_MOVEMENTS: Movimientos de Caja
CREATE TABLE IF NOT EXISTS cash_movements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,          -- income | expense
  category    TEXT NOT NULL,          -- checkin | service | supply | salary | other
  amount      NUMERIC(10,2) NOT NULL,
  description TEXT,
  payment_method TEXT,               -- cash | card | yape | plin
  checkin_id  UUID REFERENCES checkins(id),
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- CASH_CLOSURES: Cierre de Caja Diario
CREATE TABLE IF NOT EXISTS cash_closures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  total_income    NUMERIC(10,2) DEFAULT 0,
  total_expense   NUMERIC(10,2) DEFAULT 0,
  balance         NUMERIC(10,2) GENERATED ALWAYS AS (total_income - total_expense) STORED,
  closed_by       UUID REFERENCES profiles(id),
  closed_at       TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT_LOG: Auditoría del Sistema (tabla única, usar esta — no audit_logs)

-- 4b. Migración: cash movements → closure_id tracking, closures → closed_by_role
-- CSRF_TOKENS: Tokens CSRF (migración 002)
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id   UUID REFERENCES hotels(id) ON DELETE SET NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  UUID,
  details    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS closure_id UUID REFERENCES cash_closures(id);
ALTER TABLE cash_closures ADD COLUMN IF NOT EXISTS closed_by_role TEXT DEFAULT 'hotel_admin';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_log_select_own' AND tablename = 'audit_log') THEN
    CREATE POLICY "audit_log_select_own" ON audit_log
      FOR SELECT USING (get_my_role() = 'super_admin' OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_log_insert' AND tablename = 'audit_log') THEN
    CREATE POLICY "audit_log_insert" ON audit_log
      FOR INSERT WITH CHECK (true);
  END IF;
END;
$$;

-- 2. Políticas RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE hotels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closures   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log       ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para obtener hotel_id del usuario
CREATE OR REPLACE FUNCTION get_my_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas por tabla

-- Helper: true si el usuario es super_admin
-- (se usa en policies para evitar NULL = NULL en hotel_id)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE sql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rooms_select' AND tablename = 'rooms') THEN
    CREATE POLICY "rooms_select" ON rooms FOR SELECT USING (is_super_admin() OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rooms_insert' AND tablename = 'rooms') THEN
    CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rooms_update' AND tablename = 'rooms') THEN
    CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rooms_delete' AND tablename = 'rooms') THEN
    CREATE POLICY "rooms_delete" ON rooms FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'guests_select' AND tablename = 'guests') THEN
    CREATE POLICY "guests_select" ON guests FOR SELECT USING (is_super_admin() OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'guests_insert' AND tablename = 'guests') THEN
    CREATE POLICY "guests_insert" ON guests FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'guests_update' AND tablename = 'guests') THEN
    CREATE POLICY "guests_update" ON guests FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'guests_delete' AND tablename = 'guests') THEN
    CREATE POLICY "guests_delete" ON guests FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_select' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_select" ON checkins FOR SELECT USING (is_super_admin() OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_insert' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_insert" ON checkins FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_update' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_update" ON checkins FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkins_delete' AND tablename = 'checkins') THEN
    CREATE POLICY "checkins_delete" ON checkins FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cash_select' AND tablename = 'cash_movements') THEN
    CREATE POLICY "cash_select" ON cash_movements FOR SELECT USING (is_super_admin() OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cash_insert' AND tablename = 'cash_movements') THEN
    CREATE POLICY "cash_insert" ON cash_movements FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cash_update' AND tablename = 'cash_movements') THEN
    CREATE POLICY "cash_update" ON cash_movements FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cash_delete' AND tablename = 'cash_movements') THEN
    CREATE POLICY "cash_delete" ON cash_movements FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closures_select' AND tablename = 'cash_closures') THEN
    CREATE POLICY "closures_select" ON cash_closures FOR SELECT USING (is_super_admin() OR hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closures_insert' AND tablename = 'cash_closures') THEN
    CREATE POLICY "closures_insert" ON cash_closures FOR INSERT WITH CHECK (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closures_update' AND tablename = 'cash_closures') THEN
    CREATE POLICY "closures_update" ON cash_closures FOR UPDATE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'closures_delete' AND tablename = 'cash_closures') THEN
    CREATE POLICY "closures_delete" ON cash_closures FOR DELETE USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotels_super_admin' AND tablename = 'hotels') THEN
    CREATE POLICY "hotels_super_admin" ON hotels FOR ALL USING (get_my_role() = 'super_admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotels_admin_own' AND tablename = 'hotels') THEN
    CREATE POLICY "hotels_admin_own" ON hotels FOR SELECT USING (id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotels_admin_update' AND tablename = 'hotels') THEN
    CREATE POLICY "hotels_admin_update" ON hotels FOR UPDATE USING (id = get_my_hotel_id()) WITH CHECK (id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_self' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles_self" ON profiles FOR SELECT USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_hotel' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles_hotel" ON profiles FOR SELECT USING (hotel_id = get_my_hotel_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'profiles_super_admin' AND tablename = 'profiles') THEN
    CREATE POLICY "profiles_super_admin" ON profiles FOR ALL USING (get_my_role() = 'super_admin');
  END IF;
END;
$$;

-- 3. Índices de Rendimiento

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id        ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id       ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_checkins_hotel_id     ON checkins(hotel_id);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cash_hotel_id         ON cash_movements(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_dni            ON guests(hotel_id, dni);
CREATE INDEX IF NOT EXISTS idx_reservations_dates    ON reservations(hotel_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_rooms_status          ON rooms(hotel_id, status);

-- 4. Constraints de integridad (CHECK) para campos tipo enum
-- Nota: Se agregan como NOT VALID para no fallar si hay datos históricos inválidos.
-- Luego ejecutar: ALTER TABLE ... VALIDATE CONSTRAINT ... para verificar datos existentes.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rooms_type_check') THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_type_check CHECK (type IN ('simple','doble','triple','matrimonial','familiar','suite')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rooms_status_check') THEN
    ALTER TABLE rooms ADD CONSTRAINT rooms_status_check CHECK (status IN ('available','occupied','cleaning','maintenance')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkins_status_check') THEN
    ALTER TABLE checkins ADD CONSTRAINT checkins_status_check CHECK (status IN ('active','checked_out')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkins_payment_status_check') THEN
    ALTER TABLE checkins ADD CONSTRAINT checkins_payment_status_check CHECK (payment_status IN ('pending','paid')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checkins_payment_method_check') THEN
    ALTER TABLE checkins ADD CONSTRAINT checkins_payment_method_check CHECK (payment_method IN ('cash','card','yape','plin')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cash_movements_type_check') THEN
    ALTER TABLE cash_movements ADD CONSTRAINT cash_movements_type_check CHECK (type IN ('income','expense')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cash_movements_category_check') THEN
    ALTER TABLE cash_movements ADD CONSTRAINT cash_movements_category_check CHECK (category IN ('checkin','service','supply','salary','other')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cash_movements_payment_method_check') THEN
    ALTER TABLE cash_movements ADD CONSTRAINT cash_movements_payment_method_check CHECK (payment_method IN ('cash','card','yape','plin')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin','hotel_admin','receptionist')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hotels_status_check') THEN
    ALTER TABLE hotels ADD CONSTRAINT hotels_status_check CHECK (status IN ('active','suspended','deleted')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hotels_plan_check') THEN
    ALTER TABLE hotels ADD CONSTRAINT hotels_plan_check CHECK (plan IN ('prueba','mensual','trimestral','semestral','anual')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hotels_theme_check') THEN
    ALTER TABLE hotels ADD CONSTRAINT hotels_theme_check CHECK (theme IN ('default','ocean','emerald','sunset','midnight','rose','amber','violet')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reservations_status_check') THEN
    ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ('pending','confirmed','cancelled','completed')) NOT VALID;
  END IF;
END;
$$;

-- 5b. Migración: corregir tipos inválidos en rooms
UPDATE rooms SET type = 'simple'
WHERE type NOT IN ('simple','doble','triple','matrimonial','familiar','suite');

-- Validar rooms_type_check ahora que los datos están limpios
ALTER TABLE rooms VALIDATE CONSTRAINT rooms_type_check;

-- 6. Trigger: Actualizar estado de habitación en check-in/out
-- NOTA: Este trigger DUPLICA las actualizaciones que ya hacen las server actions
-- (performCheckin, performCheckout) y el RPC perform_checkin_v2.
-- Se mantiene como respaldo de seguridad por si una inserción directa en checkins
-- no pasa por las server actions (ej: desde el SQL Editor).
-- Para desactivarlo si causa problemas: DROP TRIGGER IF EXISTS trigger_room_status ON checkins;

CREATE OR REPLACE FUNCTION update_room_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
  ELSIF NEW.status = 'checked_out' THEN
    UPDATE rooms SET status = 'cleaning' WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_room_status') THEN
    CREATE TRIGGER trigger_room_status
    AFTER INSERT OR UPDATE ON checkins
    FOR EACH ROW EXECUTE FUNCTION update_room_on_checkin();
  END IF;
END;
$$;

-- 7. Storage — Buckets en Supabase

-- Nota: Esto debe ejecutarse en el editor SQL de Supabase.
-- Algunos entornos de Supabase requieren permisos especiales para insertar en storage.buckets.
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-logos', 'hotel-logos', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_logos_upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "hotel_logos_upload" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'hotel-logos'
        AND (storage.foldername(name))[1] = get_my_hotel_id()::text
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_logos_update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "hotel_logos_update" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'hotel-logos'
        AND (storage.foldername(name))[1] = get_my_hotel_id()::text
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_logos_delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "hotel_logos_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'hotel-logos'
        AND (storage.foldername(name))[1] = get_my_hotel_id()::text
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'hotel_logos_select' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "hotel_logos_select" ON storage.objects
      FOR SELECT TO public
      USING (bucket_id = 'hotel-logos');
  END IF;
END;
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Auditoría de acciones — policies ya definidas arriba

-- 9. Función RPC: Check-in transaccional

CREATE OR REPLACE FUNCTION perform_checkin_v2(
  p_hotel_id         UUID,
  p_guest_id         UUID,
  p_room_id          UUID,
  p_price            NUMERIC,
  p_payment_method   TEXT,
  p_nights           INT,
  p_notes            TEXT DEFAULT NULL,
  p_price_per_night  NUMERIC DEFAULT NULL,
  p_room_number      TEXT DEFAULT '',
  p_guest_name       TEXT DEFAULT ''
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checkin_id UUID;
  v_user_id    UUID := auth.uid();
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_user_id AND hotel_id = p_hotel_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM rooms
    WHERE id = p_room_id AND hotel_id = p_hotel_id AND status = 'available'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Habitación no disponible');
  END IF;

  -- Normalizar tipo de habitación inválido antes del UPDATE
  UPDATE rooms SET type = 'simple'
  WHERE id = p_room_id AND type NOT IN ('simple','doble','triple','matrimonial','familiar','suite');

  INSERT INTO checkins (hotel_id, guest_id, room_id, price_per_night, total_price, payment_method, nights, notes, created_by, payment_status, status)
  VALUES (p_hotel_id, p_guest_id, p_room_id, COALESCE(p_price_per_night, p_price), p_price, p_payment_method, p_nights, p_notes, v_user_id, 'paid', 'active')
  RETURNING id INTO v_checkin_id;

  INSERT INTO cash_movements (hotel_id, amount, type, payment_method, checkin_id, created_by, category, description)
  VALUES (p_hotel_id, p_price, 'income', p_payment_method, v_checkin_id, v_user_id, 'checkin', CONCAT('Check-in Hab ', p_room_number, ' - ', p_guest_name));

  UPDATE rooms SET status = 'occupied' WHERE id = p_room_id;

  RETURN json_build_object('success', true, 'checkin_id', v_checkin_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 10. RPC: Check-out transaccional (simétrico a perform_checkin_v2)
-- Sin p_room_id: deriva la habitación del checkin para eliminar riesgo de mismatch.
CREATE OR REPLACE FUNCTION perform_checkout_v2(
  p_hotel_id    UUID,
  p_checkin_id  UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_room_id UUID;
  v_check_out_at TIMESTAMPTZ := NOW();
BEGIN
  -- Verificar acceso del usuario al hotel
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND hotel_id = p_hotel_id) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;

  -- Obtener room_id del checkin y validar en un solo paso
  SELECT room_id INTO v_room_id FROM checkins
  WHERE id = p_checkin_id AND hotel_id = p_hotel_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Check-in no encontrado o ya finalizado');
  END IF;

  -- Normalizar tipo de habitación inválido antes del UPDATE (evita que el trigger falle)
  UPDATE rooms SET type = 'simple'
  WHERE id = v_room_id AND type NOT IN ('simple','doble','triple','matrimonial','familiar','suite');

  -- Actualizar checkin (dispara trigger_room_status → UPDATE rooms)
  UPDATE checkins
  SET status = 'checked_out', check_out_at = v_check_out_at
  WHERE id = p_checkin_id;

  -- Actualizar habitación a limpieza
  UPDATE rooms SET status = 'cleaning' WHERE id = v_room_id;

  -- Registrar auditoría
  INSERT INTO audit_log (hotel_id, user_id, action, entity, entity_id)
  VALUES (p_hotel_id, v_user_id, 'checkout.completed', 'checkin', p_checkin_id);

  RETURN json_build_object('success', true, 'checkin_id', p_checkin_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 11. Índices de rendimiento (adicionales)
-- NOTA: Los índices simples (hotel_id) ya están en la sección 3.
-- Estos son índices compuestos para queries específicas.

-- Dashboard: cash_movements del día por hotel
CREATE INDEX IF NOT EXISTS idx_cash_movements_hotel_date
  ON cash_movements(hotel_id, created_at DESC);

-- Dashboard: checkins del día por hotel
CREATE INDEX IF NOT EXISTS idx_checkins_hotel_date
  ON checkins(hotel_id, created_at DESC);

-- Dashboard: ingresos vs egresos por hotel
CREATE INDEX IF NOT EXISTS idx_cash_movements_hotel_type_date
  ON cash_movements(hotel_id, type, created_at DESC);

-- Dashboard: habitaciones ocupadas (filtro rápido)
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_status
  ON rooms(hotel_id, status);

-- Búsqueda de huéspedes por nombre o DNI (soporte para ILIKE)
-- Requiere ejecutar manualmente: CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Luego descomentar y ejecutar los índices:
-- CREATE INDEX IF NOT EXISTS idx_guests_full_name_trgm ON guests USING gin (full_name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_guests_dni_trgm ON guests USING gin (dni gin_trgm_ops);
-- Los índices se aplican en la migración 001_enable_pg_trgm.sql

-- 12. RPC: Cierre de caja transaccional (atomic: insert closure + tag movements)
CREATE OR REPLACE FUNCTION perform_cash_closure(
  p_hotel_id    UUID,
  p_closed_by   UUID,
  p_closed_by_role TEXT DEFAULT 'hotel_admin',
  p_notes       TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_closure_id  UUID;
  v_total_income  NUMERIC;
  v_total_expense NUMERIC;
  v_count        INT;
BEGIN
  -- Verificar acceso
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_closed_by AND hotel_id = p_hotel_id) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;

  -- Calcular totales de movimientos aún no cerrados
  SELECT COALESCE(SUM(amount), 0) INTO v_total_income
  FROM cash_movements
  WHERE hotel_id = p_hotel_id AND type = 'income' AND closure_id IS NULL;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
  FROM cash_movements
  WHERE hotel_id = p_hotel_id AND type = 'expense' AND closure_id IS NULL;

  SELECT COUNT(*) INTO v_count
  FROM cash_movements
  WHERE hotel_id = p_hotel_id AND closure_id IS NULL;

  IF v_count = 0 THEN
    RETURN json_build_object('success', false, 'error', 'No hay movimientos para cerrar');
  END IF;

  -- Insertar registro de cierre
  INSERT INTO cash_closures (hotel_id, date, total_income, total_expense, closed_by, closed_by_role, notes)
  VALUES (p_hotel_id, (CURRENT_DATE AT TIME ZONE 'America/Lima'), v_total_income, v_total_expense, p_closed_by, p_closed_by_role, p_notes)
  RETURNING id INTO v_closure_id;

  -- Marcar movimientos como cerrados
  UPDATE cash_movements SET closure_id = v_closure_id
  WHERE hotel_id = p_hotel_id AND closure_id IS NULL;

  RETURN json_build_object(
    'success', true,
    'closure_id', v_closure_id,
    'total_income', v_total_income,
    'total_expense', v_total_expense,
    'movements_count', v_count
  );
END;
$$;

-- Índice para búsqueda por closure_id (movimientos abiertos / por cierre)
CREATE INDEX IF NOT EXISTS idx_cash_movements_closure
  ON cash_movements(hotel_id, closure_id);

-- ============================================
-- 13. HOTEL_ROOM_TYPES (migración 005)
-- ============================================
CREATE TABLE IF NOT EXISTS hotel_room_types (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id   UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  label      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, name)
);

INSERT INTO hotel_room_types (hotel_id, name, label)
SELECT h.id, v.name, v.label
FROM hotels h
CROSS JOIN (
  VALUES ('simple', 'Simple'), ('doble', 'Doble'), ('triple', 'Triple'),
         ('matrimonial', 'Matrimonial'), ('familiar', 'Familiar'), ('suite', 'Suite')
) AS v(name, label)
ON CONFLICT (hotel_id, name) DO NOTHING;

-- ============================================
-- 14. FACTURACIÓN ELECTRÓNICA (migración 007)
-- ============================================
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

-- ============================================
-- 15. PLANES (migración 006 + 008)
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  name TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO plans (name, label, duration_days, price, description, sort_order) VALUES
  ('basico', 'Básico', 30, 45, 'Sin facturación electrónica', 1),
  ('pro', 'Pro', 30, 65, 'Con facturación electrónica SUNAT', 2)
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  duration_days = EXCLUDED.duration_days,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- End of schema
-- ============================================
