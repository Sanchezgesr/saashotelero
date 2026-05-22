# ETAPA 6 — MÓDULOS DEL ADMIN DEL HOTEL

> Construir todos los módulos que el dueño/administrador del hospedaje usará cada día.

---

## 1. Layout del Admin del Hotel

```typescript
// src/app/(hotel-admin)/layout.tsx
const menuItems = [
  { label: 'Dashboard',    icon: 'LayoutDashboard', href: '/hotel/dashboard' },
  { label: 'Habitaciones', icon: 'BedDouble',        href: '/hotel/rooms' },
  { label: 'Reservas',     icon: 'Calendar',         href: '/hotel/reservations' },
  { label: 'Clientes',     icon: 'Users',            href: '/hotel/guests' },
  { label: 'Check-in/out', icon: 'LogIn',            href: '/hotel/checkin' },
  { label: 'Caja',         icon: 'Wallet',           href: '/hotel/cash' },
  { label: 'Reportes',     icon: 'BarChart3',        href: '/hotel/reports' },
  { label: 'Empleados',    icon: 'UserCog',          href: '/hotel/staff' },
  { label: 'Configuración',icon: 'Settings',         href: '/hotel/settings' },
]
```

---

## 2. Módulo 1: Dashboard del Hotel

**Ruta:** `/hotel/dashboard`

### Tarjetas de resumen del día

```typescript
// Queries del dashboard
const today = new Date().toISOString().split('T')[0]

// Habitaciones por estado
const { data: roomStats } = await supabase
  .from('rooms')
  .select('status')
  .eq('hotel_id', hotelId)

// Check-ins y check-outs del día
const { data: todayCheckins } = await supabase
  .from('checkins')
  .select('id')
  .eq('hotel_id', hotelId)
  .gte('check_in_at', `${today}T00:00:00`)

// Ingresos del día
const { data: todayIncome } = await supabase
  .from('cash_movements')
  .select('amount')
  .eq('hotel_id', hotelId)
  .eq('type', 'income')
  .gte('created_at', `${today}T00:00:00`)
```

### Vista del Dashboard

```
┌──────────┬──────────┬──────────┬──────────┐
│  Libres  │ Ocupadas │ Limpieza │  Mant.   │
│    8     │   12     │    2     │    1     │
├──────────┴──────────┴──────────┴──────────┤
│  Ingresos hoy: S/. 850                    │
│  Check-in hoy: 5     Check-out hoy: 3     │
├───────────────────────────────────────────┤
│  Habitaciones ocupadas (mapa visual)       │
└───────────────────────────────────────────┘
```

---

## 3. Módulo 2: Habitaciones

**Ruta:** `/hotel/rooms`

### Estados posibles

```typescript
const roomStatusConfig = {
  available:   { label: 'Disponible',   color: 'green'  },
  occupied:    { label: 'Ocupada',      color: 'red'    },
  cleaning:    { label: 'Limpieza',     color: 'yellow' },
  maintenance: { label: 'Mantenimiento',color: 'gray'   },
}
```

### Formulario: Crear/Editar Habitación

```typescript
interface RoomForm {
  number:          string   // "101", "Suite A"
  type:            'simple' | 'doble' | 'triple' | 'suite'
  capacity:        number
  price_per_night: number
  floor:           number
  description:     string
  status:          RoomStatus
}
```

### Actions del servidor

```typescript
// src/app/hotel/rooms/actions.ts
export async function createRoom(hotelId: string, data: RoomForm) {
  const supabase = await createClient()
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ ...data, hotel_id: hotelId })
    .select()
    .single()

  if (error) throw error
  return room
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
  const supabase = await createClient()
  await supabase.from('rooms')
    .update({ status })
    .eq('id', roomId)
}
```

### Vista de Habitaciones (grid)

```
┌────┬────┬────┬────┐
│101 │102 │103 │104 │
│🟢  │🔴  │🟡  │⚫  │
│S/.80│S/.100│S/.80│S/.80│
├────┼────┼────┼────┤
│201 │202 │203 │204 │
│🟢  │🟢  │🔴  │🟢  │
└────┴────┴────┴────┘
Leyenda: 🟢 Libre  🔴 Ocupada  🟡 Limpieza  ⚫ Mantenimiento
```

---

## 4. Módulo 3: Reservas

**Ruta:** `/hotel/reservations`

### Formulario: Crear Reserva

```typescript
interface ReservationForm {
  room_id:        string
  guest_id:       string
  check_in_date:  string   // "2026-06-10"
  check_out_date: string   // "2026-06-12"
  notes:          string
}
```

### Validaciones de reserva

```typescript
// Verificar disponibilidad de habitación
async function isRoomAvailable(roomId: string, checkIn: string, checkOut: string) {
  const { data } = await supabase
    .from('reservations')
    .select('id')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .or(`check_in_date.lte.${checkOut},check_out_date.gte.${checkIn}`)

  return data?.length === 0
}
```

### Calendario de Reservas

Mostrar reservas en vista de calendario (usar `react-calendar` o vista propia):

```
JUNIO 2026
┌───┬───┬───┬───┬───┬───┬───┐
│Lun│Mar│Mié│Jue│Vie│Sáb│Dom│
├───┼───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │[3-García-101]     │
│   │   │[4-López-202 ]     │
└───┴───┴───┴───┴───┴───┴───┘
```

---

## 5. Módulo 4: Clientes (Huéspedes)

**Ruta:** `/hotel/guests`

### Formulario: Registrar Cliente

```typescript
interface GuestForm {
  full_name:   string  // requerido
  dni:         string  // requerido, único por hotel
  phone:       string
  email:       string
  nationality: string  // default: "Peruana"
  address:     string
}
```

### Historial de Estadías del Cliente

```typescript
async function getGuestHistory(guestId: string) {
  const { data } = await supabase
    .from('checkins')
    .select(`
      id, check_in_at, check_out_at, total_price, payment_method,
      rooms (number, type)
    `)
    .eq('guest_id', guestId)
    .order('check_in_at', { ascending: false })

  return data
}
```

### Vista del perfil del cliente

```
┌─────────────────────────────────────┐
│ Juan García Quispe                  │
│ DNI: 12345678  📱 987 654 321       │
│ Nacionalidad: Peruana               │
├─────────────────────────────────────┤
│ HISTORIAL DE ESTADÍAS               │
│ 10/06/2026 → 12/06/2026 | Hab 101  │
│ 2 noches | S/. 160 | Yape           │
│                                     │
│ 15/04/2026 → 16/04/2026 | Hab 202  │
│ 1 noche  | S/. 100 | Efectivo       │
└─────────────────────────────────────┘
```

---

## 6. Módulo 5: Check-in / Check-out

**Ruta:** `/hotel/checkin`

### Flujo de Check-in

```
Paso 1: Buscar cliente (por DNI)
         │
         ▼
Paso 2: Si no existe → Registrar cliente nuevo
         │
         ▼
Paso 3: Seleccionar habitación disponible
         │
         ▼
Paso 4: Confirmar precio por noche
         │
         ▼
Paso 5: Registrar check-in → habitación pasa a "Ocupada"
```

### Código de Check-in

```typescript
export async function performCheckin(data: {
  guestId:       string
  roomId:        string
  hotelId:       string
  pricePerNight: number
  reservationId?: string
  notes?:        string
}) {
  const supabase = await createClient()

  // 1. Crear registro de check-in
  const { data: checkin, error } = await supabase
    .from('checkins')
    .insert({
      hotel_id:       data.hotelId,
      guest_id:       data.guestId,
      room_id:        data.roomId,
      reservation_id: data.reservationId,
      price_per_night: data.pricePerNight,
      status:         'active',
      notes:          data.notes,
    })
    .select()
    .single()

  if (error) throw error

  // 2. El trigger de BD actualizará el estado de la habitación a "occupied"
  return checkin
}
```

### Flujo de Check-out

```
Paso 1: Seleccionar habitación ocupada
         │
         ▼
Paso 2: Ver resumen (noches, precio total)
         │
         ▼
Paso 3: Registrar método de pago
         │
         ▼
Paso 4: Confirmar checkout → habitación pasa a "Limpieza"
         │
         ▼
Paso 5: Registrar movimiento en caja automáticamente
```

### Código de Check-out

```typescript
export async function performCheckout(checkinId: string, paymentMethod: PaymentMethod) {
  const supabase = await createClient()

  const { data: checkin } = await supabase
    .from('checkins')
    .select('*, rooms(price_per_night)')
    .eq('id', checkinId)
    .single()

  const checkInTime = new Date(checkin.check_in_at)
  const checkOutTime = new Date()
  const nights = Math.ceil((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = nights * checkin.price_per_night

  // Actualizar checkin
  await supabase.from('checkins').update({
    check_out_at:   checkOutTime.toISOString(),
    nights:         nights,
    total_price:    totalPrice,
    payment_method: paymentMethod,
    payment_status: 'paid',
    status:         'checked_out',
  }).eq('id', checkinId)

  // Registrar en caja
  await supabase.from('cash_movements').insert({
    hotel_id:       checkin.hotel_id,
    type:           'income',
    category:       'checkin',
    amount:         totalPrice,
    description:    `Checkout habitación ${checkin.room_id}`,
    payment_method: paymentMethod,
    checkin_id:     checkinId,
  })

  // El trigger actualizará habitación a "cleaning"
}
```

---

## 7. Módulo 6: Caja

**Ruta:** `/hotel/cash`

### Secciones de la Caja

**a) Resumen del día**

```typescript
const todaySummary = {
  totalIncome:  // suma de cash_movements.type = 'income' del día
  totalExpense: // suma de cash_movements.type = 'expense' del día
  balance:      // income - expense
  byCash:       // suma por payment_method = 'cash'
  byCard:       // suma por payment_method = 'card'
  byYape:       // suma por payment_method = 'yape'
  byPlin:       // suma por payment_method = 'plin'
}
```

**b) Registrar movimiento manual**

```typescript
interface CashMovementForm {
  type:           'income' | 'expense'
  category:       string   // checkin | service | supply | salary | other
  amount:         number
  description:    string
  payment_method: PaymentMethod
}
```

**c) Cierre de caja**

```typescript
export async function closeCash(hotelId: string, userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Calcular totales del día
  const { data: movements } = await supabase
    .from('cash_movements')
    .select('type, amount')
    .eq('hotel_id', hotelId)
    .gte('created_at', `${today}T00:00:00`)

  const totalIncome  = movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)
  const totalExpense = movements.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0)

  await supabase.from('cash_closures').upsert({
    hotel_id:      hotelId,
    date:          today,
    total_income:  totalIncome,
    total_expense: totalExpense,
    closed_by:     userId,
  })
}
```

---

## 8. Módulo 7: Empleados

**Ruta:** `/hotel/staff`

```typescript
// Crear recepcionista
export async function createReceptionist(hotelId: string, data: {
  full_name: string
  email:     string
  password:  string
}) {
  // Crear en Supabase Auth (requiere service role en API route)
  const response = await fetch('/api/staff/create', {
    method: 'POST',
    body: JSON.stringify({ ...data, hotelId, role: 'receptionist' }),
  })
  return response.json()
}
```

---

## 9. Módulo 8: Reportes

**Ruta:** `/hotel/reports`

### Reportes disponibles

| Reporte | Datos | Gráfico |
|---------|-------|---------|
| Ingresos diarios | `cash_movements` por día | Línea |
| Ingresos mensuales | Agrupado por mes | Barras |
| Ocupación del hotel | % habitaciones ocupadas | Gauge |
| Clientes frecuentes | Top 10 por visitas | Tabla |
| Historial de caja | Cierres anteriores | Tabla |

### Query: Ingresos por mes

```typescript
const { data } = await supabase
  .from('cash_movements')
  .select('amount, created_at')
  .eq('hotel_id', hotelId)
  .eq('type', 'income')
  .gte('created_at', sixMonthsAgo)
  .order('created_at')
```

---

## 10. Módulo 9: Configuración del Hotel

**Ruta:** `/hotel/settings`

```typescript
interface HotelSettingsForm {
  name:    string
  address: string
  phone:   string
  city:    string
  ruc:     string
  logo:    File | null   // subir a Supabase Storage
}

// Subir logo
export async function uploadLogo(hotelId: string, file: File) {
  const supabase = createClient()
  const path = `${hotelId}/logo.${file.name.split('.').pop()}`

  const { data } = await supabase.storage
    .from('hotel-logos')
    .upload(path, file, { upsert: true })

  const { data: { publicUrl } } = supabase.storage
    .from('hotel-logos')
    .getPublicUrl(path)

  await supabase.from('hotels')
    .update({ logo_url: publicUrl })
    .eq('id', hotelId)
}
```

---

## ✅ Checklist de esta Etapa

- [ ] Layout del Admin con sidebar completo
- [ ] Dashboard con estadísticas en tiempo real
- [ ] CRUD de habitaciones + cambio de estado
- [ ] Vista grid de habitaciones con colores
- [ ] CRUD de clientes con búsqueda por DNI
- [ ] Reservas con validación de disponibilidad
- [ ] Check-in completo (paso a paso)
- [ ] Check-out con cálculo automático y registro en caja
- [ ] Módulo de caja (ingresos, egresos, cierre)
- [ ] Gestión de empleados (crear recepcionistas)
- [ ] Reportes con gráficos
- [ ] Configuración del hotel + subida de logo

---

**Siguiente etapa:** [ETAPA 7 — Módulos del Recepcionista](./ETAPA-7-Recepcionista.md)
