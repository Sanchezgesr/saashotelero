import type { SupabaseClient } from '@supabase/supabase-js'

export async function assertHotelAccess(
  supabase: SupabaseClient,
  hotelId: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.hotel_id !== hotelId) {
    throw new Error('Acceso denegado')
  }

  return user.id
}
