'use server'

import { createServiceClient } from '@/lib/supabase/service'

export async function fetchUpcomingReservations(hotelId: string) {
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
