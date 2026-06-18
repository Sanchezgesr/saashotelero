import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { setCsrfCookie, CSRF_COOKIE } from '@/lib/csrf'
import { proxyRateLimit } from '@/lib/rate-limit'

function buildCSP(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lcuojjmgkgzfferoollp.supabase.co'
  const wss = url.replace('https://', 'wss://')
  const storage = `${url}/storage/v1/object/public/`
  return [
    "default-src 'self'",
    `connect-src 'self' ${url} ${wss}`,
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${storage}`,
    "font-src 'self' data:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ')
}

function setSecurityHeaders(resp: NextResponse) {
  resp.headers.set('Content-Security-Policy', buildCSP())
}

async function safeSignOut(supabase: ReturnType<typeof createServerClient>) {
  try { await supabase.auth.signOut() } catch { /* ignore */ }
}

export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1'
  const rl = await proxyRateLimit(ip)
  if (!rl.allowed) {
    const resp = new NextResponse('Demasiadas solicitudes', { status: 429 })
    setSecurityHeaders(resp)
    return resp
  }

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
  const publicRoutes = ['/login', '/auth/callback', '/api/health']
  if (publicRoutes.includes(pathname)) {
    setSecurityHeaders(supabaseResponse)
    return supabaseResponse
  }

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
    setSecurityHeaders(resp)
    return resp
  }

  const user = session.user

  const profileReq = await supabase
    .from('profiles').select('role, is_active, hotel_id').eq('id', user.id).single()
  const profile = profileReq.data

  if (!profile || !profile.is_active) {
    await safeSignOut(supabase)
    const resp = NextResponse.redirect(new URL('/login', request.url))
    setSecurityHeaders(resp)
    return resp
  }

  if (profile.hotel_id) {
    const { data: hotel } = await supabase
      .from('hotels').select('status').eq('id', profile.hotel_id).single()
    if (!hotel || hotel.status === 'suspended') {
      await safeSignOut(supabase)
      const resp = NextResponse.redirect(new URL('/login', request.url))
      setSecurityHeaders(resp)
      return resp
    }
  }

  supabaseResponse.cookies.set('_user_role', profile.role, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 })
  if (profile.hotel_id) {
    supabaseResponse.cookies.set('_user_hotel_id', profile.hotel_id, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 })
  }

  if (profile.role === 'super_admin') {
    if (pathname.startsWith('/hotel') || pathname.startsWith('/recepcion')) {
      const resp = NextResponse.redirect(new URL('/admin/dashboard', request.url))
      setSecurityHeaders(resp)
      return resp
    }
  } else {
    if (pathname.startsWith('/admin')) {
      const resp = NextResponse.redirect(new URL('/hotel/dashboard', request.url))
      setSecurityHeaders(resp)
      return resp
    }
  }

  if (!request.cookies.get(CSRF_COOKIE)) {
    const csrfCookie = setCsrfCookie()
    const existing = supabaseResponse.headers.get('Set-Cookie')
    supabaseResponse.headers.set('Set-Cookie', existing ? [existing, csrfCookie].join(', ') : csrfCookie)
  }

  setSecurityHeaders(supabaseResponse)
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
