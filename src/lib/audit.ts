import type { SupabaseClient } from '@supabase/supabase-js'

type AuditAction =
  | 'checkin.created'
  | 'checkout.completed'
  | 'payment.received'
  | 'guest.created'
  | 'guest.updated'
  | 'room.status_changed'
  | 'hotel.plan_changed'
  | 'hotel.suspended'
  | 'active_hotel'
  | 'create_hotel'
  | 'delete_hotel'
  | 'hotel.created'
  | 'update_hotel_plan'
  | 'staff.toggled'
  | 'block_user'
  | 'unblock_user'
  | 'cash.closed'

interface AuditParams {
  supabase: SupabaseClient
  hotelId: string
  userId?: string
  action: string
  entity?: string
  entityId?: string
  details?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logAction(params: AuditParams) {
  const { supabase, hotelId, userId, action, entity, entityId, details } = params

  const { error } = await supabase.from('audit_log').insert({
    hotel_id: hotelId,
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    details,
  })

  if (error) console.error('Audit log error:', error.message)
}
