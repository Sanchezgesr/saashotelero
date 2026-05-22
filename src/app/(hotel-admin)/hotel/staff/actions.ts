'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function getStaff(hotelId: string) {
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('hotel_id', hotelId)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function toggleStaffStatus(userId: string, isActive: boolean) {
  const supabase = adminClient()

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? 'none' : '876000h',
  })
  if (authError) throw new Error(authError.message)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
  if (profileError) throw new Error(profileError.message)

  revalidatePath('/hotel/staff')
  return { success: true }
}
