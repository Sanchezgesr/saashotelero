import { createClient } from '@supabase/supabase-js'

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function syncHotelPlanStatus(hotelId: string) {
  const supabase = adminClient()

  const { data: hotel } = await supabase
    .from('hotels')
    .select('status, plan_expires_at')
    .eq('id', hotelId)
    .maybeSingle()

  if (!hotel) return

  const now = new Date()
  const isExpired = hotel.plan_expires_at !== null && new Date(hotel.plan_expires_at) < now

  if (isExpired) {
    if (hotel.status !== 'suspended') {
      await supabase.from('hotels').update({ status: 'suspended' }).eq('id', hotelId)
    }
    await supabase
      .from('profiles')
      .update({ is_active: false })
      .eq('hotel_id', hotelId)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('hotel_id', hotelId)
    for (const p of profiles ?? []) {
      await supabase.auth.admin.updateUserById(p.id, { ban_duration: '876000h' })
    }
  } else {
    if (hotel.status === 'suspended') {
      await supabase.from('hotels').update({ status: 'active' }).eq('id', hotelId)
    }
    await supabase
      .from('profiles')
      .update({ is_active: true })
      .eq('hotel_id', hotelId)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('hotel_id', hotelId)
    for (const p of profiles ?? []) {
      await supabase.auth.admin.updateUserById(p.id, { ban_duration: 'none' })
    }
  }
}
