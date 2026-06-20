import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = adminClient()

  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, status, plan_expires_at')
    .not('plan_expires_at', 'is', null)

  const now = new Date()
  let suspended = 0
  let reactivated = 0

  for (const hotel of hotels ?? []) {
    const isExpired = new Date(hotel.plan_expires_at!) < now

    if (isExpired && hotel.status !== 'suspended') {
      await supabase.from('hotels').update({ status: 'suspended' }).eq('id', hotel.id)
      await supabase.from('profiles').update({ is_active: false }).eq('hotel_id', hotel.id)
      const { data: profiles } = await supabase
        .from('profiles').select('id').eq('hotel_id', hotel.id)
      for (const p of profiles ?? []) {
        await supabase.auth.admin.updateUserById(p.id, { ban_duration: '876000h' })
      }
      suspended++
    } else if (!isExpired && hotel.status === 'suspended') {
      await supabase.from('hotels').update({ status: 'active' }).eq('id', hotel.id)
      await supabase.from('profiles').update({ is_active: true }).eq('hotel_id', hotel.id)
      const { data: profiles } = await supabase
        .from('profiles').select('id').eq('hotel_id', hotel.id)
      for (const p of profiles ?? []) {
        await supabase.auth.admin.updateUserById(p.id, { ban_duration: 'none' })
      }
      reactivated++
    }
  }

  return NextResponse.json({ ok: true, checked: hotels?.length ?? 0, suspended, reactivated })
}
