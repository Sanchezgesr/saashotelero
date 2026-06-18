'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'

export async function fetchUpcomingReservations(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc
    .from('reservations')
    .select('*, rooms(number, type), guests(full_name)')
    .eq('hotel_id', hotelId)
    .in('status', ['pending', 'confirmed'])
    .gte('check_in_date', new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' }))
    .order('check_in_date', { ascending: true })
  return data || []
}
