'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'
import { syncHotelPlanStatus } from '@/lib/plan-check'
import { calculateExpiry } from '@/lib/utils/plans'
import type { PlanConfig } from '@/lib/utils/plans'

export async function getPlans(): Promise<PlanConfig[]> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('plans').select('*').order('sort_order')
  return data ?? []
}

export async function updateHotelPlan(hotelId: string, planName: string) {
  const serviceSupabase = createServiceClient()

  const { data: plan } = await serviceSupabase
    .from('plans').select('duration_days').eq('name', planName).single()
  if (!plan) return { error: 'Plan no encontrado' }

  const plan_expires_at = calculateExpiry(plan.duration_days)

  const { error } = await serviceSupabase
    .from('hotels')
    .update({ plan: planName, plan_expires_at })
    .eq('id', hotelId)

  if (error) {
    console.error('Error updating hotel plan:', error)
    return { error: error.message }
  }

  await syncHotelPlanStatus(hotelId)

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (user) {
    await logAction({
      supabase: serviceSupabase,
      hotelId,
      userId: user.id,
      action: 'update_hotel_plan',
      entity: 'hotel',
      entityId: hotelId,
      metadata: { plan: planName, plan_expires_at },
    })
  }

  revalidatePath('/admin/plans')
  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
