# ETAPA 7 — MÓDULOS DEL RECEPCIONISTA

> Panel operativo simplificado para el personal de recepción. Solo lo necesario para el día a día.

---

## 1. Principio de Diseño

El panel del recepcionista debe ser:

- **Rápido:** pocas pantallas, flujo directo
- **Simple:** sin opciones que no necesita
- **Optimizado para celular:** pantallas táctiles, botones grandes
- **Sin errores:** validaciones claras y mensajes entendibles

---

## 2. Layout del Recepcionista

```typescript
// src/app/(receptionist)/layout.tsx
const menuItems = [
  { label: 'Inicio',       icon: 'Home',      href: '/recepcion/dashboard' },
  { label: 'Check-in',     icon: 'LogIn',     href: '/recepcion/checkin' },
  { label: 'Check-out',    icon: 'LogOut',    href: '/recepcion/checkout' },
  { label: 'Habitaciones', icon: 'BedDouble', href: '/recepcion/rooms' },
  { label: 'Clientes',     icon: 'Users',     href: '/recepcion/guests' },
  { label: 'Caja',         icon: 'Wallet',    href: '/recepcion/cash' },
]
```

> El menú del recepcionista NO incluye: Reservas, Reportes, Empleados ni Configuración.

---

## 3. Módulo 1: Dashboard Operativo

**Ruta:** `/recepcion/dashboard`

### Diseño optimizado para celular

```
┌──────────────────────────┐
│  Bienvenido, María       │
│  Hotel Junín · Recepción │
├──────────────────────────┤
│  🟢 Libres:  8           │
│  🔴 Ocupadas: 12         │
│  🟡 Limpieza: 2          │
├──────────────────────────┤
│  Hoy                     │
│  ↳ Check-in:    5        │
│  ↳ Check-out:   3        │
│  ↳ Alojados:   12        │
├──────────────────────────┤
│  [➕ Check-in] [➖ Check-out] │
└──────────────────────────┘
```

### Query del dashboard

```typescript
// Solo datos del hotel del recepcionista (RLS aplica automáticamente)
const [rooms, todayCheckins, todayCheckouts, currentGuests] = await Promise.all([
  supabase.from('rooms').select('status'),
  supabase.from('checkins').select('id').gte('check_in_at', todayStart),
  supabase.from('checkins').select('id').gte('check_out_at', todayStart).eq('status','checked_out'),
  supabase.from('checkins').select('id').eq('status', 'active'),
])
```

---

## 4. Módulo 2: Check-in

**Ruta:** `/recepcion/checkin`

### Flujo visual paso a paso

```
┌─────────────────────────────┐
│  PASO 1 DE 3: CLIENTE       │
├─────────────────────────────┤
│  Buscar por DNI:            │
│  [_____________] [Buscar]   │
│                             │
│  ✅ Juan García Quispe       │
│     DNI: 12345678           │
│     📱 987 654 321           │
│                             │
│  ¿No existe? [+ Registrar]  │
├─────────────────────────────┤
│              [Siguiente →]  │
└─────────────────────────────┘

┌─────────────────────────────┐
│  PASO 2 DE 3: HABITACIÓN    │
├─────────────────────────────┤
│  Habitaciones disponibles:  │
│                             │
│  ┌────┐ ┌────┐ ┌────┐      │
│  │101 │ │103 │ │201 │      │
│  │S/.80│ │S/.80│ │S/.100│   │
│  │Smp │ │Smp │ │Dbl │      │
│  └────┘ └────┘ └────┘      │
│                             │
│  Seleccionada: 101 ✅       │
├─────────────────────────────┤
│  [← Volver]  [Siguiente →] │
└─────────────────────────────┘

┌─────────────────────────────┐
│  PASO 3 DE 3: CONFIRMAR     │
├─────────────────────────────┤
│  Cliente:  Juan García      │
│  Hab.:     101 (Simple)     │
│  Precio:   S/. 80 / noche   │
│  Entrada:  10/06/2026 14:30 │
│                             │
│  Notas: [____________]      │
├─────────────────────────────┤
│  [← Volver] [✅ REGISTRAR] │
└─────────────────────────────┘
```

### Código del componente de Check-in

```typescript
// src/app/(receptionist)/recepcion/checkin/page.tsx
'use client'

import { useState } from 'react'
import { searchGuestByDNI, performCheckin } from './actions'

type Step = 'guest' | 'room' | 'confirm'

export default function CheckinPage() {
  const [step, setStep] = useState<Step>('guest')
  const [guest, setGuest] = useState(null)
  const [room, setRoom]   = useState(null)
  const [notes, setNotes] = useState('')
  const [dniSearch, setDniSearch] = useState('')

  const handleSearchGuest = async () => {
    const found = await searchGuestByDNI(dniSearch)
    if (found) {
      setGuest(found)
    } else {
      // Mostrar modal para registrar cliente nuevo
    }
  }

  const handleConfirmCheckin = async () => {
    await performCheckin({
      guestId:       guest.id,
      roomId:        room.id,
      pricePerNight: room.price_per_night,
      notes,
    })
    // Mostrar éxito y redirigir
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 'guest'   && <GuestStep    onNext={() => setStep('room')} />}
      {step === 'room'    && <RoomStep     onNext={() => setStep('confirm')} />}
      {step === 'confirm' && <ConfirmStep  onConfirm={handleConfirmCheckin} />}
    </div>
  )
}
```

---

## 5. Módulo 3: Check-out

**Ruta:** `/recepcion/checkout`

### Vista de habitaciones ocupadas

```
┌─────────────────────────────┐
│  HABITACIONES OCUPADAS      │
├─────────────────────────────┤
│  🔴 101 │ Juan García       │
│     2 noches │ S/. 160      │
│     Entró: 08/06 14:30      │
│     [Hacer Check-out]       │
├─────────────────────────────┤
│  🔴 202 │ María López       │
│     1 noche  │ S/. 100      │
│     Entró: 09/06 12:00      │
│     [Hacer Check-out]       │
└─────────────────────────────┘
```

### Modal de Check-out

```
┌─────────────────────────────┐
│  CHECK-OUT — Hab. 101       │
├─────────────────────────────┤
│  Huésped:   Juan García     │
│  Entrada:   08/06 14:30     │
│  Salida:    10/06 10:45     │
│  Noches:    2               │
│  Precio/n.: S/. 80          │
│  TOTAL:     S/. 160         │
├─────────────────────────────┤
│  Método de pago:            │
│  [💵 Efectivo] [💳 Tarjeta] │
│  [📱 Yape]    [📱 Plin]    │
├─────────────────────────────┤
│  [Cancelar] [✅ CONFIRMAR]  │
└─────────────────────────────┘
```

### Query de habitaciones ocupadas

```typescript
// Mostrar solo las ocupadas del hotel del recepcionista
const { data: occupied } = await supabase
  .from('checkins')
  .select(`
    id, check_in_at, price_per_night,
    guests (full_name, dni, phone),
    rooms (number, type)
  `)
  .eq('status', 'active')
  .order('check_in_at')
```

---

## 6. Módulo 4: Ver Habitaciones

**Ruta:** `/recepcion/rooms`

Solo visualización. El recepcionista **no puede** crear, editar ni eliminar habitaciones.

```typescript
// Vista de solo lectura
const { data: rooms } = await supabase
  .from('rooms')
  .select('number, type, capacity, price_per_night, status, floor')
  .order('number')

// No hay botones de Editar ni Eliminar en esta vista
```

### Vista en grid con colores

```
┌─────────────────────────────┐
│  ESTADO DE HABITACIONES     │
│  ● Libre  ● Ocupada         │
│  ● Limpieza  ● Mantenimiento│
├─────────────────────────────┤
│  PISO 1                     │
│  [🟢101] [🔴102] [🟡103]   │
│  PISO 2                     │
│  [🟢201] [🟢202] [⚫203]   │
└─────────────────────────────┘
```

---

## 7. Módulo 5: Clientes

**Ruta:** `/recepcion/guests`

El recepcionista puede:
- ✅ Registrar clientes nuevos
- ✅ Editar datos básicos del cliente
- ✅ Ver historial de estadías
- ❌ Eliminar clientes

```typescript
// Búsqueda rápida por DNI o nombre
const handleSearch = async (query: string) => {
  const { data } = await supabase
    .from('guests')
    .select('id, full_name, dni, phone')
    .or(`full_name.ilike.%${query}%,dni.ilike.%${query}%`)
    .limit(10)

  return data
}
```

---

## 8. Módulo 6: Caja Básica

**Ruta:** `/recepcion/cash`

El recepcionista tiene acceso **limitado**:

| Función | Recepcionista |
|---------|:-------------:|
| Ver movimientos del día | ✅ |
| Registrar pago de check-out | ✅ (automático) |
| Registrar ingreso manual | ✅ |
| Registrar egreso | ❌ |
| Cerrar caja | ✅ |
| Ver cierres anteriores | ❌ |
| Ver reportes históricos | ❌ |

### Vista de caja básica

```
┌─────────────────────────────┐
│  CAJA DEL DÍA               │
│  10 de junio de 2026        │
├─────────────────────────────┤
│  Ingresos:   S/. 850        │
│  Egresos:    S/. 0          │
│  Balance:    S/. 850        │
├─────────────────────────────┤
│  MOVIMIENTOS                │
│  ↳ Check-out 101  S/. 160  │
│  ↳ Check-out 202  S/. 100  │
│  ↳ Servicio extra S/. 30   │
├─────────────────────────────┤
│  [+ Registrar pago]         │
│  [🔒 Cerrar caja]           │
└─────────────────────────────┘
```

---

## 9. Consideraciones de UX Móvil

El recepcionista trabajará principalmente desde el celular:

```typescript
// Tamaños mínimos táctiles
const mobileStyles = {
  button:  'min-h-[48px] text-base font-medium',
  input:   'min-h-[48px] text-base',
  card:    'rounded-xl shadow-sm p-4',
  spacing: 'gap-4 p-4',
}

// Usar bottom navigation en móvil en lugar de sidebar
const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 md:hidden">
    <NavItem icon="Home"      label="Inicio"   href="/recepcion/dashboard" />
    <NavItem icon="LogIn"     label="Check-in" href="/recepcion/checkin" />
    <NavItem icon="LogOut"    label="Check-out" href="/recepcion/checkout" />
    <NavItem icon="BedDouble" label="Habs."    href="/recepcion/rooms" />
    <NavItem icon="Wallet"    label="Caja"     href="/recepcion/cash" />
  </nav>
)
```

---

## ✅ Checklist de esta Etapa

- [ ] Layout del recepcionista (sidebar + bottom nav móvil)
- [ ] Dashboard operativo con datos en tiempo real
- [ ] Check-in en 3 pasos (cliente → habitación → confirmar)
- [ ] Registro de cliente nuevo desde el check-in
- [ ] Check-out con cálculo automático y método de pago
- [ ] Vista de habitaciones (solo lectura, con colores)
- [ ] Búsqueda de clientes por DNI y nombre
- [ ] Caja básica (movimientos del día + cierre)
- [ ] Diseño optimizado para celular (botones grandes, bottom nav)
- [ ] Validaciones y mensajes de error claros

---

**Siguiente etapa:** [ETAPA 8 — Testing y Control de Calidad](./ETAPA-8-Testing-QA.md)
