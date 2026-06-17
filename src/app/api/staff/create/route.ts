import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { validateCsrfToken } from '@/lib/csrf'

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || request.headers.get('referer') || ''
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://hcontrol.org.pe',
      'https://prueba-iota-two.vercel.app',
      'http://localhost:3000',
    ].filter(Boolean) as string[]
    if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    if (!(await validateCsrfToken(request))) {
      return NextResponse.json({ error: 'CSRF token inválido' }, { status: 403 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get('cookie')?.split(';').filter(Boolean).map(c => {
              const [name, ...rest] = c.trim().split('=')
              return { name, value: rest.join('=') }
            }) ?? []
          },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'super_admin' && profile.role !== 'hotel_admin')) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { full_name, email, password, hotelId, role } = await request.json()

    if (!full_name || !email || !password || !hotelId || !role) {
      return NextResponse.json({ error: 'Campos requeridos faltantes' }, { status: 400 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user: newUser }, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError || !newUser) {
      return NextResponse.json({ error: authError?.message ?? 'Error creating user' }, { status: 400 })
    }

    const { error: profileError } = await adminClient.from('profiles').insert({
      id: newUser.id,
      hotel_id: hotelId,
      full_name,
      email,
      role,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: newUser })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
