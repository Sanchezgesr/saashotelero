import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { syncHotelPlanStatus } from '@/lib/plan-check'
import { rateLimit } from '@/lib/rate-limit'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`proxy:${ip}`, 300, 60_000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

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

  const publicRoutes = ['/login', '/auth/callback']
  if (publicRoutes.includes(pathname)) {
    return supabaseResponse
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const sessionStart = request.cookies.get('_session_start')?.value
  if (!sessionStart) {
    supabaseResponse.cookies.set('_session_start', String(Date.now()), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 86400 })
  } else if (Date.now() - Number(sessionStart) > 24 * 60 * 60 * 1000) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await admin
    .from('profiles')
    .select('id, role, is_active, hotel_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!profile.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (profile.hotel_id) {
    const { data: hotel } = await admin
      .from('hotels')
      .select('status, plan_expires_at')
      .eq('id', profile.hotel_id)
      .maybeSingle()

    if (hotel?.status === 'suspended') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (hotel?.plan_expires_at && new Date(hotel.plan_expires_at) < new Date()) {
      await syncHotelPlanStatus(profile.hotel_id)
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const role = profile.role
  const isSuperAdminRoute = pathname.startsWith('/admin')

  if (isSuperAdminRoute && role !== 'super_admin') {
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
