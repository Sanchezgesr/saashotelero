# ETAPA 5 — MÓDULOS DEL SUPER ADMIN

> Construir el panel de control completo del dueño del SaaS.

---

## 1. Layout del Super Admin

Crear `src/app/(super-admin)/layout.tsx`:

```typescript
import Sidebar from '@/components/layout/SuperAdminSidebar'
import Header from '@/components/layout/Header'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Menú lateral del Super Admin

```typescript
// src/components/layout/SuperAdminSidebar.tsx
const menuItems = [
  { label: 'Dashboard',     icon: 'LayoutDashboard', href: '/admin/dashboard' },
  { label: 'Hoteles',       icon: 'Building2',        href: '/admin/hotels' },
  { label: 'Usuarios',      icon: 'Users',            href: '/admin/users' },
  { label: 'Planes',        icon: 'CreditCard',       href: '/admin/plans' },
  { label: 'Auditoría',     icon: 'FileText',         href: '/admin/audit' },
  { label: 'Métricas',      icon: 'BarChart3',        href: '/admin/metrics' },
]
```

---

## 2. Módulo 1: Dashboard General

**Ruta:** `/admin/dashboard`

### Datos a mostrar

```typescript
// Queries necesarias
const stats = {
  totalHotels:     await supabase.from('hotels').select('id', { count: 'exact' }),
  activeHotels:    await supabase.from('hotels').select('id', { count: 'exact' }).eq('status', 'active'),
  suspendedHotels: await supabase.from('hotels').select('id', { count: 'exact' }).eq('status', 'suspended'),
  newThisMonth:    await supabase.from('hotels').select('id', { count: 'exact' })
                     .gte('created_at', startOfMonth),
}
```

### Componentes del Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Total Hoteles  │  Activos  │  Suspendidos  │  Nuevos │
│      48         │    42     │      6        │    3    │
├─────────────────────────────────────────────────────┤
│   Gráfico de crecimiento de hoteles (últimos 6 meses)│
├─────────────────────────────────────────────────────┤
│   Últimos hoteles registrados (tabla)                │
└─────────────────────────────────────────────────────┘
```

---

## 3. Módulo 2: Gestión de Hoteles

**Ruta:** `/admin/hotels`

### Lista de hoteles

```typescript
// Columnas de la tabla
const columns = [
  { key: 'name',       label: 'Hotel' },
  { key: 'city',       label: 'Ciudad' },
  { key: 'plan',       label: 'Plan' },
  { key: 'status',     label: 'Estado' },
  { key: 'created_at', label: 'Registrado' },
  { key: 'actions',    label: 'Acciones' },
]

// Acciones por hotel
type HotelAction = 'view' | 'edit' | 'suspend' | 'activate' | 'delete'
```

### Formulario: Crear/Editar Hotel

**Campos:**
```
- Nombre del hotel        (requerido)
- RUC                     (opcional)
- Ciudad                  (requerido)
- Dirección               (opcional)
- Teléfono                (opcional)
- Plan                    (básico / estándar / premium)
- Fecha vencimiento plan  (date picker)
```

### Query: Crear hotel + admin

```typescript
// src/app/admin/hotels/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createHotel(formData: FormData) {
  const supabase = await createClient()

  const hotelData = {
    name:    formData.get('name') as string,
    ruc:     formData.get('ruc') as string,
    city:    formData.get('city') as string,
    address: formData.get('address') as string,
    phone:   formData.get('phone') as string,
    plan:    formData.get('plan') as string,
    status:  'active',
  }

  const { data, error } = await supabase
    .from('hotels')
    .insert(hotelData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function suspendHotel(hotelId: string) {
  const supabase = await createClient()
  await supabase.from('hotels')
    .update({ status: 'suspended' })
    .eq('id', hotelId)
}

export async function activateHotel(hotelId: string) {
  const supabase = await createClient()
  await supabase.from('hotels')
    .update({ status: 'active' })
    .eq('id', hotelId)
}
```

---

## 4. Módulo 3: Gestión de Usuarios

**Ruta:** `/admin/users`

### Lista de todos los usuarios

```typescript
const { data: users } = await supabase
  .from('profiles')
  .select(`
    *,
    hotels (name, city)
  `)
  .order('created_at', { ascending: false })
```

### Acciones

| Acción | Descripción |
|--------|-------------|
| Ver perfil | Ver datos del usuario |
| Bloquear | Marcar `is_active = false` |
| Desbloquear | Marcar `is_active = true` |
| Resetear contraseña | Enviar email de recuperación |

```typescript
export async function blockUser(userId: string) {
  const supabase = await createClient()
  await supabase.from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })
}
```

---

## 5. Módulo 4: Planes y Suscripciones

**Ruta:** `/admin/plans`

### Vista de planes actuales por hotel

```typescript
const { data } = await supabase
  .from('hotels')
  .select('id, name, plan, plan_expires_at, status')
  .order('plan_expires_at', { ascending: true })
```

### Tabla de planes

```
┌──────────────┬──────────────┬────────────┬────────────────────┬──────────┐
│ Hotel        │ Plan         │ Vence      │ Estado             │ Acciones │
├──────────────┼──────────────┼────────────┼────────────────────┼──────────┤
│ Hotel Junín  │ Estándar     │ 30/06/2026 │ 🟢 Activo          │ Editar   │
│ Hostal Lima  │ Básico       │ 15/06/2026 │ 🟡 Próx. vencer    │ Editar   │
│ Hotel Tarma  │ Premium      │ 01/05/2026 │ 🔴 Vencido         │ Renovar  │
└──────────────┴──────────────┴────────────┴────────────────────┴──────────┘
```

### Cambiar plan de hotel

```typescript
export async function updateHotelPlan(
  hotelId: string,
  plan: 'basic' | 'standard' | 'premium',
  expiresAt: string
) {
  const supabase = await createClient()
  await supabase.from('hotels')
    .update({ plan, plan_expires_at: expiresAt })
    .eq('id', hotelId)
}
```

---

## 6. Módulo 5: Auditoría

**Ruta:** `/admin/audit`

### Lista de eventos

```typescript
const { data: logs } = await supabase
  .from('audit_logs')
  .select(`
    *,
    profiles (full_name, email),
    hotels (name)
  `)
  .order('created_at', { ascending: false })
  .limit(100)
```

### Función para registrar eventos

```typescript
// src/lib/audit.ts
export async function logAction(params: {
  supabase: any
  hotelId?: string
  userId: string
  action: string
  entity: string
  entityId?: string
  metadata?: object
}) {
  await params.supabase.from('audit_logs').insert({
    hotel_id:  params.hotelId,
    user_id:   params.userId,
    action:    params.action,
    entity:    params.entity,
    entity_id: params.entityId,
    metadata:  params.metadata,
  })
}
```

---

## 7. Módulo 6: Métricas del SaaS

**Ruta:** `/admin/metrics`

### KPIs del negocio

```typescript
// MRR (Monthly Recurring Revenue)
const planPrices = { basic: 49, standard: 89, premium: 149 }

const { data: hotels } = await supabase
  .from('hotels')
  .select('plan, status')
  .eq('status', 'active')

const mrr = hotels.reduce((total, hotel) => {
  return total + planPrices[hotel.plan]
}, 0)
```

### Gráficos a mostrar

| Gráfico | Tipo | Datos |
|---------|------|-------|
| Hoteles registrados por mes | Línea | `hotels.created_at` agrupado |
| Distribución de planes | Torta | Count por `plan` |
| MRR mensual | Barras | Cálculo por mes |
| Hoteles activos vs suspendidos | Donut | Status count |

---

## ✅ Checklist de esta Etapa

- [x] Layout y sidebar del Super Admin
- [x] Dashboard general con estadísticas reales
- [x] Módulo de hoteles (CRUD completo)
- [x] Módulo de usuarios (listado + bloqueo)
- [x] Módulo de planes (asignación y renovación)
- [x] Módulo de auditoría (log de eventos)
- [x] Módulo de métricas (MRR + gráficos)
- [x] Acciones de server implementadas

---

**Siguiente etapa:** [ETAPA 6 — Módulos del Admin del Hotel](./ETAPA-6-Admin-Hotel.md)
