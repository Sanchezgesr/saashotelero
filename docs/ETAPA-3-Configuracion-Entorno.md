# ETAPA 3 — CONFIGURACIÓN DEL ENTORNO DE DESARROLLO

> Instalar herramientas, crear el proyecto y conectar con Supabase y GitHub.

---

## 1. Herramientas Necesarias

Instalar en tu computadora:

| Herramienta | Versión | Descarga |
|------------|---------|---------|
| Node.js | 20 LTS o superior | https://nodejs.org |
| Git | Cualquier versión reciente | https://git-scm.com |
| VS Code | Última versión | https://code.visualstudio.com |
| Navegador | Chrome o Firefox | — |

### Extensiones de VS Code recomendadas

```
- Tailwind CSS IntelliSense
- Prisma (para autocompletado SQL)
- ESLint
- Prettier
- TypeScript
- GitLens
- Supabase (extensión oficial)
```

---

## 2. Crear Cuenta en Supabase

1. Ir a https://supabase.com
2. Crear cuenta gratuita con GitHub
3. Crear nuevo proyecto:
   - **Nombre:** `saas-hotelero`
   - **Contraseña de BD:** guardar en lugar seguro
   - **Región:** más cercana (São Paulo o us-east-1)
4. Esperar ~2 minutos a que el proyecto se inicialice

### Obtener credenciales

En el panel de Supabase → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   ← NUNCA exponer al frontend
```

---

## 3. Crear el Proyecto Next.js

Ejecutar en terminal:

```bash
npx create-next-app@latest saas-hotelero \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Responder:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ App Router: Yes
- ✅ src/ directory: Yes

---

## 4. Instalar Dependencias

```bash
cd saas-hotelero

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI Components (shadcn/ui)
npx shadcn@latest init

# Íconos
npm install lucide-react

# Formularios
npm install react-hook-form @hookform/resolvers zod

# Fechas
npm install date-fns

# Tablas
npm install @tanstack/react-table

# Notificaciones
npm install sonner

# Gráficos
npm install recharts
```

---

## 5. Estructura de Carpetas

```
saas-hotelero/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (super-admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── hotels/
│   │   │   ├── users/
│   │   │   └── metrics/
│   │   ├── (hotel-admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── rooms/
│   │   │   ├── reservations/
│   │   │   ├── guests/
│   │   │   ├── checkin/
│   │   │   ├── cash/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   ├── (receptionist)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── checkin/
│   │   │   ├── checkout/
│   │   │   ├── guests/
│   │   │   └── rooms/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              ← shadcn/ui components
│   │   ├── layout/          ← Sidebar, Header, Navbar
│   │   ├── rooms/
│   │   ├── guests/
│   │   ├── checkin/
│   │   └── cash/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts    ← cliente del navegador
│   │   │   └── server.ts    ← cliente del servidor
│   │   ├── utils.ts
│   │   └── validators/      ← esquemas Zod
│   ├── hooks/               ← hooks personalizados
│   ├── types/               ← tipos TypeScript
│   └── middleware.ts         ← protección de rutas
├── .env.local
├── .env.example
└── package.json
```

---

## 6. Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SControl
```

Crear `.env.example` (sin valores reales, para el repositorio):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
```

---

## 7. Configurar Supabase Client

### `src/lib/supabase/client.ts` (para el navegador)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `src/lib/supabase/server.ts` (para Server Components)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## 8. Tipos TypeScript del Proyecto

Crear `src/types/index.ts`:

```typescript
export type UserRole = 'super_admin' | 'hotel_admin' | 'receptionist'

export type HotelStatus = 'active' | 'suspended' | 'deleted'

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'

export type RoomType = 'simple' | 'doble' | 'triple' | 'suite'

export type PaymentMethod = 'cash' | 'card' | 'yape' | 'plin'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Hotel {
  id: string
  name: string
  ruc?: string
  address?: string
  city?: string
  phone?: string
  logo_url?: string
  status: HotelStatus
  plan: 'basic' | 'standard' | 'premium'
  plan_expires_at?: string
  created_at: string
}

export interface Profile {
  id: string
  hotel_id?: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Room {
  id: string
  hotel_id: string
  number: string
  type: RoomType
  capacity: number
  price_per_night: number
  status: RoomStatus
  floor?: number
  description?: string
}

export interface Guest {
  id: string
  hotel_id: string
  full_name: string
  dni?: string
  phone?: string
  email?: string
  nationality: string
  address?: string
  created_at: string
}
```

---

## 9. Configurar GitHub

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "feat: proyecto inicial Next.js + Supabase"

# Crear repositorio en GitHub (github.com/nuevo)
git remote add origin https://github.com/tu-usuario/saas-hotelero.git
git branch -M main
git push -u origin main
```

### `.gitignore` (verificar que incluya)

```
.env.local
.env.*.local
node_modules/
.next/
```

---

## 10. Ejecutar el Proyecto Localmente

```bash
npm run dev
```

Abrir en navegador: `http://localhost:3000`

---

## ✅ Checklist de esta Etapa

- [x] Node.js 20+ instalado
- [x] Proyecto Supabase creado
- [x] Proyecto Next.js creado
- [x] Dependencias instaladas
- [x] Variables de entorno configuradas
- [x] Cliente Supabase configurado
- [x] Tipos TypeScript definidos
- [x] Repositorio GitHub creado y subido
- [x] Proyecto corre en localhost sin errores

---

**Siguiente etapa:** [ETAPA 4 — Autenticación y Multi-Tenant](./ETAPA-4-Autenticacion-MultiTenant.md)
