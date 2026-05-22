'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'
import { syncHotelPlanStatus } from '@/lib/plan-check'
import { calculateExpiry, type PlanId } from '@/lib/utils/plans'

export async function updateHotelPlan(hotelId: string, plan: PlanId) {
  const supabase = await createClient()

  const plan_expires_at = calculateExpiry(plan)

  const { error } = await supabase
    .from('hotels')
    .update({ plan, plan_expires_at })
    .eq('id', hotelId)

  if (error) {
    console.error('Error updating hotel plan:', error)
    return { error: error.message }
  }

  await syncHotelPlanStatus(hotelId)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId,
      userId: user.id,
      action: 'update_hotel_plan',
      entity: 'hotel',
      entityId: hotelId,
      metadata: { plan, plan_expires_at },
    })
  }

  revalidatePath('/admin/plans')
  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
