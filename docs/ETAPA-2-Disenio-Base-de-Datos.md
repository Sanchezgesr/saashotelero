# ETAPA 2 — DISEÑO DE BASE DE DATOS

> Diseño completo del esquema PostgreSQL en Supabase con soporte multi-tenant, RLS y relaciones entre tablas.

---

## 1. Principio Multi-Tenant

Todas las tablas del hotel incluyen la columna `hotel_id`.  
Supabase usará **Row Level Security (RLS)** para que cada hotel solo vea sus propios datos.

```sql
-- Ejemplo de política RLS
CREATE POLICY "hotel_isolation" ON rooms
  USING (hotel_id = (SELECT hotel_id FROM profiles WHERE id = auth.uid()));
```

---

## 2. Diagrama de Tablas

```
profiles ──────────── hotels
    │                    │
    │              ┌─────┴──────┐
    │           rooms        reservations
    │              │               │
    │           bookings ──── guests
    │
    └──────────── cash_movements
                      │
                  checkouts
```

---

## 3. Tablas del Sistema

### 3.1 `hotels` — Hoteles registrados

```sql
CREATE TABLE hotels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  ruc         TEXT,
  address     TEXT,
  city        TEXT,
  phone       TEXT,
  logo_url    TEXT,
  status      TEXT DEFAULT 'active',   -- active | suspended | deleted
  plan        TEXT DEFAULT 'basic',    -- basic | standard | premium
  plan_expires_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3.2 `profiles` — Usuarios del sistema

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel_id    UUID REFERENCES hotels(id),   -- NULL para Super Admin
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL,   -- super_admin | hotel_admin | receptionist
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

> El `id` coincide con el `id` de `auth.users` de Supabase Auth.

---

### 3.3 `rooms` — Habitaciones

```sql
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  number      TEXT NOT NULL,           -- Número o nombre: "101", "Suite A"
  type        TEXT NOT NULL,           -- simple | doble | triple | suite
  capacity    INT NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'available', -- available | occupied | cleaning | maintenance
  floor       INT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(hotel_id, number)
);
```

---

### 3.4 `guests` — Huéspedes / Clientes

```sql
CREATE TABLE guests (
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
```

---

### 3.5 `reservations` — Reservas anticipadas

```sql
CREATE TABLE reservations (
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
```

---

### 3.6 `checkins` — Check-in / Check-out

```sql
CREATE TABLE checkins (
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
```

---

### 3.7 `cash_movements` — Movimientos de Caja

```sql
CREATE TABLE cash_movements (
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
```

---

### 3.8 `cash_closures` — Cierre de Caja Diario

```sql
CREATE TABLE cash_closures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id        UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  total_income    NUMERIC(10,2) DEFAULT 0,
  total_expense   NUMERIC(10,2) DEFAULT 0,
  balance         NUMERIC(10,2) GENERATED ALWAYS AS (total_income - total_expense) STORED,
  closed_by       UUID REFERENCES profiles(id),
  closed_at       TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,

  UNIQUE(hotel_id, date)
);
```

---

### 3.9 `audit_logs` — Auditoría del Sistema

```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID REFERENCES hotels(id),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,       -- hotel_created | checkin | checkout | room_edited ...
  entity      TEXT,                -- hotels | rooms | guests | checkins
  entity_id   UUID,
  metadata    JSONB,               -- datos adicionales del evento
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Políticas RLS (Row Level Security)

### Habilitar RLS en todas las tablas

```sql
ALTER TABLE hotels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closures   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs      ENABLE ROW LEVEL SECURITY;
```

### Función auxiliar para obtener hotel_id del usuario

```sql
CREATE OR REPLACE FUNCTION get_my_hotel_id()
RETURNS UUID AS $$
  SELECT hotel_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
```

### Función para obtener el rol del usuario

```sql
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
```

### Políticas por tabla

```sql
-- ROOMS: solo el hotel del usuario puede ver sus habitaciones
CREATE POLICY "rooms_hotel_isolation" ON rooms
  FOR ALL USING (hotel_id = get_my_hotel_id());

-- GUESTS: solo el hotel del usuario
CREATE POLICY "guests_hotel_isolation" ON guests
  FOR ALL USING (hotel_id = get_my_hotel_id());

-- CHECKINS: solo el hotel del usuario
CREATE POLICY "checkins_hotel_isolation" ON checkins
  FOR ALL USING (hotel_id = get_my_hotel_id());

-- CASH_MOVEMENTS: solo el hotel del usuario
CREATE POLICY "cash_hotel_isolation" ON cash_movements
  FOR ALL USING (hotel_id = get_my_hotel_id());

-- HOTELS: Super Admin puede ver todos
CREATE POLICY "hotels_super_admin" ON hotels
  FOR ALL USING (get_my_role() = 'super_admin');

-- HOTELS: Admin solo puede ver su hotel
CREATE POLICY "hotels_admin_own" ON hotels
  FOR SELECT USING (id = get_my_hotel_id());
```

---

## 5. Índices de Rendimiento

```sql
-- Búsquedas frecuentes por hotel_id
CREATE INDEX idx_rooms_hotel_id        ON rooms(hotel_id);
CREATE INDEX idx_guests_hotel_id       ON guests(hotel_id);
CREATE INDEX idx_checkins_hotel_id     ON checkins(hotel_id);
CREATE INDEX idx_reservations_hotel_id ON reservations(hotel_id);
CREATE INDEX idx_cash_hotel_id         ON cash_movements(hotel_id);

-- Búsqueda de huéspedes por DNI
CREATE INDEX idx_guests_dni ON guests(hotel_id, dni);

-- Búsqueda de reservas por fecha
CREATE INDEX idx_reservations_dates ON reservations(hotel_id, check_in_date, check_out_date);

-- Estado de habitaciones
CREATE INDEX idx_rooms_status ON rooms(hotel_id, status);
```

---

## 6. Trigger: Actualizar estado de habitación en check-in/out

```sql
-- Marcar habitación como ocupada al hacer check-in
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

CREATE TRIGGER trigger_room_status
AFTER INSERT OR UPDATE ON checkins
FOR EACH ROW EXECUTE FUNCTION update_room_on_checkin();
```

---

## 7. Storage — Buckets en Supabase

| Bucket | Uso | Acceso |
|--------|-----|--------|
| `hotel-logos` | Logo de cada hotel | Público |
| `room-images` | Fotos de habitaciones | Público |
| `documents` | Documentos internos | Privado |

```sql
-- Crear bucket para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-logos', 'hotel-logos', true);
```

---

## ✅ Entregables de esta Etapa

- [x] Esquema SQL ejecutado en Supabase (Preparado en `supabase/schema.sql`)
- [x] RLS habilitado en todas las tablas
- [x] Funciones auxiliares creadas
- [x] Triggers configurados
- [x] Índices creados
- [x] Buckets de Storage configurados
- [x] Diagrama de base de datos exportado

---

**Siguiente etapa:** [ETAPA 3 — Configuración del Entorno](./ETAPA-3-Configuracion-Entorno.md)
