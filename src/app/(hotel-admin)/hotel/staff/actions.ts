'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { revalidatePath } from 'next/cache'

export async function getStaff(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data, error } = await svc
    .from('profiles')
    .select('*')
    .eq('hotel_id', hotelId)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function toggleStaffStatus(userId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: callerProfile } = await supabase
    .from('profiles').select('role, hotel_id').eq('id', user.id).single()
  if (!callerProfile) throw new Error('Acceso denegado')

  const { data: targetProfile } = await supabase
    .from('profiles').select('hotel_id, role').eq('id', userId).single()
  if (!targetProfile) throw new Error('Usuario no encontrado')

  if (callerProfile.role !== 'super_admin' &&
      (callerProfile.role !== 'hotel_admin' || callerProfile.hotel_id !== targetProfile.hotel_id)) {
    throw new Error('Acceso denegado')
  }

  const svc = createServiceClient()
  const { error: authError } = await svc.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? 'none' : '876000h',
  })
  if (authError) throw new Error(authError.message)

  const { error: profileError } = await svc
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
  if (profileError) throw new Error(profileError.message)

  revalidatePath('/hotel/staff')
  return { success: true }
}
