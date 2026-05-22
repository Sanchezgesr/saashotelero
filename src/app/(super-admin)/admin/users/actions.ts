'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error('Error toggling user status:', error)
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', userId)
    .single()

  const { data: { user } } = await supabase.auth.getUser()
  if (user && profile) {
    await logAction({
      supabase,
      hotelId: profile.hotel_id,
      userId: user.id,
      action: currentStatus ? 'block_user' : 'unblock_user',
      entity: 'profile',
      entityId: userId,
    })
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function resetUserPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password`,
  })

  if (error) {
    console.error('Error resetting password:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles').select('hotel_id, full_name')
    .eq('id', userId)
    .single()

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) return { error: profileError.message }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) return { error: authError.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId: profile?.hotel_id ?? '',
      userId: user.id,
      action: 'delete_user',
      entity: 'profile',
      entityId: userId,
      details: { deleted_user: profile?.full_name },
    })
  }

  revalidatePath('/admin/users')
  return { success: true }
}
