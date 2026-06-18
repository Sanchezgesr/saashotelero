'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { normalizeRoomType } from '@/lib/supabase/checkin-actions'
import { parseAction } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { logAction } from '@/lib/audit'
import { z } from 'zod'

export async function getHotelPlan(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc
    .from('hotels')
    .select('name, plan')
    .eq('id', hotelId)
    .single()
  return data
}

const createGuestSchema = z.object({
  hotel_id:    z.string().uuid(),
  full_name:   z.string().min(2).max(100).trim(),
  dni:         z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  phone:       z.string().min(7, 'Teléfono requerido').max(20),
  email:       z.string().email().optional().or(z.literal('')),
  nationality: z.string().max(50).optional().or(z.literal('')),
})

const checkinSchema = z.object({
  hotel_id:        z.string().uuid(),
  guest_id:        z.string().uuid(),
  room_id:         z.string().uuid(),
  price_per_night: z.number().positive().max(99999),
  notes:           z.string().max(500).optional(),
})

export async function createGuest(data: {
  hotel_id: string; full_name: string; dni: string; phone: string; email?: string; nationality?: string
}) {
  const { error: validationError, data: validated } = parseAction(createGuestSchema, data)
  if (validationError || !validated) throw new Error(validationError || 'Datos inválidos')

  const supabase = await createClient()
  await assertHotelAccess(supabase, validated.hotel_id)
  const { data: guest, error } = await supabase
    .from('guests').insert(validated).select().single()
  if (error) throw new Error(error.message)
  return guest
}

export async function performCheckin(data: {
  hotel_id: string; guest_id: string; room_id: string
  price_per_night: number; notes?: string
}) {
  const rl = await rateLimit(`checkin:${data.hotel_id}`, 30, 60_000)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const { error: validationError, data: validated } = parseAction(checkinSchema, data)
  if (validationError || !validated) throw new Error(validationError || 'Datos inválidos')

  const supabase = await createClient()
  await assertHotelAccess(supabase, validated.hotel_id)

  await normalizeRoomType(validated.room_id, validated.hotel_id)

  // Fetch guest name and room number for cash movement audit description
  const { data: guest } = await supabase.from('guests').select('full_name').eq('id', validated.guest_id).single()
  const { data: room } = await supabase.from('rooms').select('number').eq('id', validated.room_id).single()

  const { data: result, error } = await supabase.rpc('perform_checkin_v2', {
    p_hotel_id: validated.hotel_id,
    p_guest_id: validated.guest_id,
    p_room_id: validated.room_id,
    p_price: validated.price_per_night, // Total price for 1 night
    p_payment_method: 'cash',
    p_nights: 1,
    p_notes: validated.notes || null,
    p_price_per_night: validated.price_per_night,
    p_room_number: room?.number || '',
    p_guest_name: guest?.full_name || '',
  })

  if (error) throw new Error(error.message)
  const r = result as { success: boolean; error?: string; checkin_id?: string }
  if (!r.success) throw new Error(r.error ?? 'Error al registrar check-in')

  revalidatePath('/recepcion/dashboard')
  revalidatePath('/recepcion/checkin')
  revalidatePath('/recepcion/rooms')

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase, hotelId: validated.hotel_id, userId: user.id,
      action: 'checkin.created', entity: 'checkins',
      entityId: r.checkin_id,
      details: { guest_name: guest?.full_name, room_number: room?.number },
    })
  }

  return { id: r.checkin_id }
}

export async function searchGuests(query: string) {
  const supabase = await createClient()
  const escaped = query.replace(/[%_]/g, '\\$&')
  const { data } = await supabase
    .from('guests').select('id, full_name, dni, phone')
    .or(`full_name.ilike.%${escaped}%,dni.ilike.%${escaped}%`)
    .limit(10)
  return data ?? []
}

export async function getAvailableRooms(hotelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rooms').select('*')
    .eq('hotel_id', hotelId)
    .eq('status', 'available')
    .order('number')
  return data ?? []
}
