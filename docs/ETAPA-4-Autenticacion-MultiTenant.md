# ETAPA 4 — AUTENTICACIÓN Y MULTI-TENANT

> Implementar login, registro, protección de rutas y aislamiento de datos por hotel.

---

## 1. Flujo de Autenticación

```
Usuario ingresa email + contraseña
          │
          ▼
    Supabase Auth valida
          │
          ▼
    JWT generado con user.id
          │
          ▼
    Middleware lee JWT
          │
          ▼
    Busca perfil en tabla profiles
          │
     ┌────┴────┐
     │  role   │
     │         │
super_admin  hotel_admin / receptionist
     │              │
  /admin/*     /hotel/* (con hotel_id)
```

---

## 2. Configurar Supabase Auth

En el panel de Supabase → **Authentication → Settings**:

- **Site URL:** `http://localhost:3000` (desarrollo), luego tu dominio de producción
- **Redirect URLs:** `http://localhost:3000/auth/callback`
- Desactivar **Confirm email** para desarrollo (activar en producción)
- Habilitar **Email provider**

---

## 3. Middleware de Protección de Rutas

Crear `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas públicas (no requieren login)
  const publicRoutes = ['/login', '/auth/callback']
  if (publicRoutes.includes(pathname)) {
    return supabaseResponse
  }

  // Si no hay sesión, redirigir a login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Obtener rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = profile.role

  // Proteger rutas por rol
  if (pathname.startsWith('/admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
  }

  if (pathname.startsWith('/hotel') && role === 'super_admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  if (pathname.startsWith('/recepcion') && role === 'super_admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

---

## 4. Página de Login

Crear `src/app/(auth)/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Credenciales incorrectas')
      setLoading(false)
      return
    }

    // Obtener rol para redirigir
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    if (profile?.role === 'super_admin') {
      router.push('/admin/dashboard')
    } else if (profile?.role === 'hotel_admin') {
      router.push('/hotel/dashboard')
    } else {
      router.push('/recepcion/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🏨 SControl
        </h1>
        <p className="text-center text-gray-500 mb-8">Inicia sesión en tu cuenta</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@hotel.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Callback de Autenticación

Crear `src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/hotel/dashboard`)
}
```

---

## 6. Hook: Obtener Usuario Actual

Crear `src/hooks/useUser.ts`:

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()
  }, [])

  return { profile, loading }
}
```

---

## 7. Acción de Logout

```typescript
// src/lib/supabase/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

---

## 8. Crear Super Admin Inicial

Ejecutar en Supabase → SQL Editor:

```sql
-- 1. Crear usuario en Supabase Auth (usar la interfaz de Authentication > Users)
-- O via SQL:
SELECT auth.uid(); -- verificar que estás autenticado

-- 2. Insertar perfil de Super Admin
-- (Reemplazar el UUID con el id del usuario creado en Auth)
INSERT INTO profiles (id, hotel_id, full_name, email, role)
VALUES (
  'UUID-DEL-USUARIO-EN-AUTH',
  NULL,
  'Super Admin',
  'admin@saashotelero.com',
  'super_admin'
);
```

---

## 9. Crear Admin de Hotel

Flujo desde el Super Admin:

```typescript
// Crear hotel + usuario admin en un solo proceso
async function createHotelWithAdmin(hotelData, adminData) {
  const supabase = createClient()

  // 1. Crear el hotel
  const { data: hotel } = await supabase
    .from('hotels')
    .insert(hotelData)
    .select()
    .single()

  // 2. Crear usuario en Auth (desde el backend con service_role)
  const { data: { user } } = await supabaseAdmin.auth.admin.createUser({
    email: adminData.email,
    password: adminData.password,
    email_confirm: true,
  })

  // 3. Crear perfil vinculado al hotel
  await supabase.from('profiles').insert({
    id: user.id,
    hotel_id: hotel.id,
    full_name: adminData.full_name,
    email: adminData.email,
    role: 'hotel_admin',
  })
}
```

---

## ✅ Checklist de esta Etapa

- [ ] Supabase Auth configurado
- [ ] Middleware de protección de rutas creado
- [ ] Página de login funcional
- [ ] Redirección por rol funcional
- [ ] Hook `useUser` implementado
- [ ] Logout funcional
- [ ] Super Admin creado en la base de datos
- [ ] Prueba de login exitosa con los 3 roles

---

**Siguiente etapa:** [ETAPA 5 — Módulos del Super Admin](./ETAPA-5-Super-Admin.md)
