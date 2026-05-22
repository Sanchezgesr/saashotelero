# Planes de corrección de seguridad — SControl

> Deuda técnica estimada: **~12 horas** · Puntuación actual: 6.3/10 → objetivo: 8.5/10

---

## Sprint 1 — Configuración inmediata
**Duración estimada:** ~30 minutos  
**Tipo:** Sin código nuevo, solo configuración  
**Prioridad:** 🔴 Bloquea producción

---

### Tarea 1 · Ejecutar schema.sql completo en Supabase
**Tiempo:** 10 min  
**Riesgo que cierra:** C-1 — RLS sin policies en tablas operativas

Ir al SQL Editor de Supabase y ejecutar el schema completo. Luego verificar que las 4 tablas operativas tienen RLS habilitado y sus policies activas.

```sql
-- Verificar que RLS está activo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('checkins', 'guests', 'rooms', 'cash_movements');

-- Debe devolver rowsecurity = true en las 4 filas.
-- Si alguna es false:
ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;

-- Verificar que las policies existen
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

---

### Tarea 2 · Activar rate limiting en Supabase Auth
**Tiempo:** 5 min  
**Riesgo que cierra:** C-3 — Sin rate limiting en login

En el dashboard de Supabase: **Authentication → Settings → Rate Limits**. Configurar:

| Límite | Valor recomendado |
|---|---|
| Sign-in attempts | 5 por 15 min por IP |
| Token refresh | 150 por hora |
| Password reset | 3 por hora |

> Si estás en el free tier y no tienes acceso a esta configuración, implementar middleware con Upstash como alternativa (ver Sprint 2, sección de rate limiting).

---

### Tarea 3 · Agregar security headers en Vercel
**Tiempo:** 15 min  
**Riesgo que cierra:** R-5 — Sin headers de seguridad

Crear o editar `vercel.json` en la raíz del proyecto:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

## Sprint 2 — Validación y seguridad de inputs
**Duración estimada:** 4–5 horas  
**Tipo:** Requiere código  
**Prioridad:** 🟡 Alta

---

### Tarea 4 · Instalar Zod y crear schemas de validación centralizados
**Tiempo:** 45 min  
**Riesgo que cierra:** C-4 — Sin validación de entrada en server actions

```bash
npm install zod
```

Crear `src/lib/validations.ts`:

```typescript
import { z } from 'zod'

export const checkinSchema = z.object({
  hotel_id:        z.string().uuid(),
  guest_id:        z.string().uuid(),
  room_id:         z.string().uuid(),
  total_price:     z.number().positive().max(99999),
  payment_method:  z.enum(['cash', 'card', 'yape', 'plin']),
  nights:          z.number().int().min(1).max(365),
  notes:           z.string().max(500).optional(),
})

export const createHotelSchema = z.object({
  name:  z.string().min(2).max(100).trim(),
  ruc:   z.string().regex(/^\d{11}$/, 'RUC debe tener 11 dígitos'),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
})

export const guestSchema = z.object({
  name:     z.string().min(2).max(100).trim(),
  dni:      z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  email:    z.string().email().optional().or(z.literal('')),
  phone:    z.string().max(20).optional(),
  hotel_id: z.string().uuid(),
})

// Helper reutilizable para todas las server actions
export function parseAction<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.errors.map(e => e.message).join(', ')
    return { error: msg, data: null }
  }
  return { error: null, data: result.data }
}
```

---

### Tarea 5 · Aplicar validación en todas las server actions
**Tiempo:** 1.5 h  
**Riesgo que cierra:** C-4 — XSS almacenado, datos corruptos

Patrón uniforme a aplicar en cada action (ejemplo con `createHotel`):

```typescript
// src/app/(super-admin)/admin/hotels/actions.ts
import { createHotelSchema, parseAction } from '@/lib/validations'

export async function createHotel(formData: FormData) {
  const raw = {
    name:  formData.get('name'),
    ruc:   formData.get('ruc'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  }

  const { error, data } = parseAction(createHotelSchema, raw)
  if (error) return { error }

  // A partir de aquí: data es tipado y validado
  const supabase = await createClient()
  const { error: dbError } = await supabase
    .from('hotels')
    .insert(data)

  if (dbError) return { error: 'Error al crear hotel' }
  return { success: true }
}
```

Aplicar el mismo patrón en: `createGuest`, `updateGuest`, `performCheckin`, `performCheckout`, `createCashMovement`, `updateHotel`, `suspendHotel`.

---

### Tarea 6 · Corregir upload de logo con validación server-side real
**Tiempo:** 30 min  
**Riesgo que cierra:** C-2 — Path traversal, MIME bypass, sin límite de tamaño

Reemplazar el bloque vulnerable en `src/app/(hotel-admin)/hotel/settings/actions.ts`:

```typescript
export async function updateLogoAction(formData: FormData) {
  const file = formData.get('logo')

  if (!(file instanceof File)) return { error: 'Archivo inválido' }

  // 1. Validar tipo MIME real (no solo extensión del nombre)
  const allowedMimes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedMimes.includes(file.type)) {
    return { error: 'Solo PNG, JPG o WebP' }
  }

  // 2. Validar tamaño server-side (2 MB máximo)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return { error: 'Máximo 2MB' }
  }

  // 3. Nombre sanitizado — nunca usar file.name para construir el path
  const extMap: Record<string, string> = {
    'image/png':  'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  }
  const ext = extMap[file.type]

  // hotelId viene de la sesión del usuario, no del formulario
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('hotel_id').eq('id', user!.id).single()

  const path = `${profile.hotel_id}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('hotel-logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: 'Error al subir logo' }
  return { success: true }
}
```

---

### Tarea 7 · Agregar verificación explícita de hotel_id en operaciones críticas
**Tiempo:** 45 min  
**Riesgo que cierra:** M-2 — Server actions sin autorización explícita

Crear `src/lib/supabase/auth-guards.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js'

export async function assertHotelAccess(
  supabase: SupabaseClient,
  hotelId: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', user.id)
    .single()

  if (profile?.hotel_id !== hotelId) {
    throw new Error('Acceso denegado')
  }

  return user.id
}
```

Usarlo al inicio de cada operación financiera:

```typescript
// En performCheckin, performCheckout, createCashMovement:
export async function performCheckin(data: CheckinInput) {
  const supabase = await createClient()

  // Verificación explícita — no confiar solo en RLS
  await assertHotelAccess(supabase, data.hotel_id)

  // ... resto de la lógica
}
```

---

## Sprint 3 — Integridad de datos y observabilidad
**Duración estimada:** 6–7 horas  
**Tipo:** SQL + TypeScript  
**Prioridad:** 🟡 Alta (crítico en producción con dinero real)

---

### Tarea 8 · Crear función RPC para check-in con transacción SQL atómica
**Tiempo:** 1.5 h (check-in + checkout)  
**Riesgo que cierra:** M-3 — Sin transacciones en operaciones críticas

Ejecutar en el SQL Editor de Supabase:

```sql
CREATE OR REPLACE FUNCTION perform_checkin_v2(
  p_hotel_id       UUID,
  p_guest_id       UUID,
  p_room_id        UUID,
  p_price          NUMERIC,
  p_payment_method TEXT,
  p_nights         INT,
  p_notes          TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_checkin_id UUID;
  v_user_id    UUID := auth.uid();
BEGIN
  -- Verificar que el usuario pertenece al hotel
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_user_id AND hotel_id = p_hotel_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Acceso denegado');
  END IF;

  -- Verificar disponibilidad de la habitación
  IF NOT EXISTS (
    SELECT 1 FROM rooms
    WHERE id = p_room_id
      AND hotel_id = p_hotel_id
      AND status = 'available'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Habitación no disponible');
  END IF;

  -- Las 3 operaciones dentro de la misma transacción atómica
  INSERT INTO checkins (
    hotel_id, guest_id, room_id,
    total_price, payment_method, nights, notes, created_by
  ) VALUES (
    p_hotel_id, p_guest_id, p_room_id,
    p_price, p_payment_method, p_nights, p_notes, v_user_id
  ) RETURNING id INTO v_checkin_id;

  INSERT INTO cash_movements (
    hotel_id, amount, type, payment_method, checkin_id, created_by
  ) VALUES (
    p_hotel_id, p_price, 'income', p_payment_method, v_checkin_id, v_user_id
  );

  UPDATE rooms
  SET status = 'occupied', updated_at = NOW()
  WHERE id = p_room_id;

  RETURN json_build_object('success', true, 'checkin_id', v_checkin_id);

EXCEPTION WHEN OTHERS THEN
  -- Rollback automático — ninguna operación queda a medias
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

Llamar desde TypeScript:

```typescript
const { data, error } = await supabase.rpc('perform_checkin_v2', {
  p_hotel_id:       hotelId,
  p_guest_id:       guestId,
  p_room_id:        roomId,
  p_price:          totalPrice,
  p_payment_method: paymentMethod,
  p_nights:         nights,
  p_notes:          notes ?? null,
})

if (error || !data.success) {
  return { error: data?.error ?? 'Error en check-in' }
}
return { success: true, checkinId: data.checkin_id }
```

---

### Tarea 9 · Crear tabla audit_log y registrar acciones críticas
**Tiempo:** 2 h  
**Riesgo que cierra:** M-1 — Sin logs de auditoría

**Paso 1:** Crear la tabla en Supabase:

```sql
CREATE TABLE audit_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id   UUID REFERENCES hotels(id) ON DELETE SET NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  UUID,
  details    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Staff del hotel puede ver sus propios logs
CREATE POLICY "hotel staff can view own logs"
  ON audit_log FOR SELECT
  USING (hotel_id = get_my_hotel_id());

-- Solo inserción — nunca UPDATE ni DELETE (log inmutable)
CREATE POLICY "system inserts only"
  ON audit_log FOR INSERT
  WITH CHECK (true);
```

**Paso 2:** Crear helper en `src/lib/supabase/audit.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js'

type AuditAction =
  | 'checkin.created'
  | 'checkout.completed'
  | 'payment.received'
  | 'guest.created'
  | 'guest.updated'
  | 'room.status_changed'
  | 'hotel.plan_changed'
  | 'hotel.suspended'

interface AuditParams {
  hotelId:  string
  action:   AuditAction
  entity?:  string
  entityId?: string
  details?: Record<string, unknown>
}

export async function logAudit(
  supabase: SupabaseClient,
  params: AuditParams
) {
  await supabase.from('audit_log').insert({
    hotel_id:  params.hotelId,
    action:    params.action,
    entity:    params.entity,
    entity_id: params.entityId,
    details:   params.details,
  })
}
```

**Paso 3:** Integrar en operaciones críticas (ejemplo en checkout):

```typescript
import { logAudit } from '@/lib/supabase/audit'

export async function performCheckout(data: CheckoutInput) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)

  // ... lógica de checkout ...

  await logAudit(supabase, {
    hotelId:  data.hotel_id,
    action:   'checkout.completed',
    entity:   'checkin',
    entityId: data.checkin_id,
    details:  { room_id: data.room_id, total_paid: data.total_paid },
  })
}
```

---

### Tarea 10 · Índices de base de datos y paginación en listados
**Tiempo:** 1.5 h  
**Riesgo que cierra:** M-5 — Sin paginación; R-1 — Sin índices

**Índices (SQL Editor de Supabase):**

```sql
CREATE INDEX idx_cash_movements_hotel_date
  ON cash_movements(hotel_id, created_at DESC);

CREATE INDEX idx_checkins_hotel_date
  ON checkins(hotel_id, created_at DESC);

CREATE INDEX idx_guests_hotel
  ON guests(hotel_id);

CREATE INDEX idx_rooms_hotel_status
  ON rooms(hotel_id, status);
```

**Paginación en queries de TypeScript:**

```typescript
const PAGE_SIZE = 50

export async function getCashMovements(hotelId: string, page = 0) {
  const from = page * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const { data, count, error } = await supabase
    .from('cash_movements')
    .select('*', { count: 'exact' })
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .range(from, to)

  return {
    data,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    currentPage: page,
  }
}
```

Aplicar el mismo patrón en: `getCheckins`, `getGuests`, `getRooms`, `getAuditLog`.

---

## Checklist de verificación final

Antes de hacer deploy a producción, verificar que todos estos ítems estén completos:

### Sprint 1
- [ ] RLS activo y policies presentes en `checkins`, `guests`, `rooms`, `cash_movements`
- [ ] Rate limiting activado en Supabase Auth (o middleware Upstash)
- [ ] Security headers configurados en `vercel.json`

### Sprint 2
- [ ] Schema Zod creado en `src/lib/validations.ts`
- [ ] Validación con `parseAction()` aplicada en todas las server actions
- [ ] Upload de logo con validación MIME y tamaño server-side
- [ ] `assertHotelAccess()` en `performCheckin`, `performCheckout`, `createCashMovement`

### Sprint 3
- [ ] Función RPC `perform_checkin_v2` creada y en uso (reemplaza las 3 operaciones separadas)
- [ ] Tabla `audit_log` creada y `logAudit()` integrado en checkin, checkout y pagos
- [ ] Índices de BD creados y `.range()` en todos los listados

---

*Completar los 3 sprints lleva el sistema de 6.3 → ~8.5/10 en la evaluación de seguridad.*
