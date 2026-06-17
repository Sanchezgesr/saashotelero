import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { setCsrfCookie, CSRF_COOKIE } from '@/lib/csrf'

async function safeSignOut(supabase: ReturnType<typeof createServerClient>) {
  try { await supabase.auth.signOut() } catch { /* ignore */ }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  const publicRoutes = ['/login', '/auth/callback']
  if (publicRoutes.includes(pathname)) return supabaseResponse

  let session
  try {
    const res = await supabase.auth.getSession()
    session = res.data.session
  } catch {
    session = null
  }
  if (!session) {
    const resp = NextResponse.redirect(new URL('/login', request.url))
    resp.cookies.delete('sb-lcuojjmgkgzfferoollp-auth-token')
    resp.cookies.delete('sb-lcuojjmgkgzfferoollp-auth-token-code-verifier')
    return resp
  }

  const user = session.user

  const profileReq = await supabase
    .from('profiles').select('role, is_active, hotel_id').eq('id', user.id).single()
  const profile = profileReq.data

  if (!profile || !profile.is_active) {
    await safeSignOut(supabase)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (profile.hotel_id) {
    const { data: hotel } = await supabase
      .from('hotels').select('status').eq('id', profile.hotel_id).single()
    if (!hotel || hotel.status === 'suspended') {
      await safeSignOut(supabase)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  supabaseResponse.cookies.set('_user_role', profile.role, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 })
  if (profile.hotel_id) {
    supabaseResponse.cookies.set('_user_hotel_id', profile.hotel_id, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 })
  }

  if (profile.role === 'super_admin') {
    if (pathname.startsWith('/hotel') || pathname.startsWith('/recepcion'))
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  } else {
    if (pathname.startsWith('/admin'))
      return NextResponse.redirect(new URL('/hotel/dashboard', request.url))
  }

  if (!request.cookies.get(CSRF_COOKIE)) {
    const csrfCookie = setCsrfCookie()
    const existing = supabaseResponse.headers.get('Set-Cookie')
    supabaseResponse.headers.set('Set-Cookie', existing ? [existing, csrfCookie].join(', ') : csrfCookie)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
