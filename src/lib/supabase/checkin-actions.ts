'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkinSchema, createGuestSchema, parseAction } from '@/lib/validations'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { rateLimit } from '@/lib/rate-limit'
import { logAction } from '@/lib/audit'

const VALID_TYPES = ['simple', 'doble', 'triple', 'matrimonial', 'familiar']

export async function normalizeRoomType(roomId: string) {
  const supabase = await createClient()
  const { data: room } = await supabase.from('rooms').select('type').eq('id', roomId).single()
  if (room && !VALID_TYPES.includes(room.type)) {
    await supabase.from('rooms').update({ type: 'simple' }).eq('id', roomId)
  }
}

export async function searchGuests(hotelId: string, query: string) {
  const supabase = await createClient()
  const escaped = query.replace(/[%_]/g, '\\$&')
  const { data } = await supabase
    .from('guests').select('id, full_name, dni, phone')
    .eq('hotel_id', hotelId)
    .or(`full_name.ilike.%${escaped}%,dni.ilike.%${escaped}%`)
    .limit(10)
  return data ?? []
}

export async function createGuest(raw: {
  hotel_id: string; full_name: string; dni: string; phone?: string; email?: string; nationality?: string
}) {
  const { error: validationError, data } = parseAction(createGuestSchema, raw)
  if (validationError || !data) throw new Error(validationError || 'Datos inválidos')

  const supabase = await createClient()
  const { data: guest, error: dbError } = await supabase
    .from('guests').insert(data).select().single()
  if (dbError) throw new Error(dbError.message)
  return guest
}

export async function performCheckin(raw: {
  hotel_id: string; guest_id: string; room_id: string; room_number: string
  price_per_night: number; total_price: number; nights: number
  payment_method: string; guest_name: string; notes?: string
}) {
  const rl = await rateLimit(`checkin:${raw.hotel_id}`, 30, 60_000)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const { error: validationError, data } = parseAction(checkinSchema, raw)
  if (validationError || !data) throw new Error(validationError || 'Datos inválidos')

  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)

  await normalizeRoomType(data.room_id)

  const { data: result, error } = await supabase.rpc('perform_checkin_v2', {
    p_hotel_id: data.hotel_id,
    p_guest_id: data.guest_id,
    p_room_id: data.room_id,
    p_price: data.total_price,
    p_payment_method: data.payment_method,
    p_nights: data.nights,
    p_notes: data.notes || null,
    p_price_per_night: data.price_per_night,
    p_room_number: data.room_number,
    p_guest_name: data.guest_name,
  })

  if (error) throw new Error('Error al registrar check-in')

  const r = result as { success: boolean; error?: string; checkin_id?: string }
  if (!r.success) throw new Error(r.error ?? 'Error al registrar check-in')

  revalidatePath('/hotel/rooms')
  revalidatePath('/recepcion/rooms')

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase, hotelId: data.hotel_id, userId: user.id,
      action: 'checkin.created', entity: 'checkins',
      entityId: r.checkin_id,
      details: { guest_name: data.guest_name, room_number: data.room_number, total_price: data.total_price },
    })
  }

  return r
}

export async function performCheckout(data: {
  checkin_id: string; room_id: string; hotel_id: string; room_number?: string
}) {
  const rl = await rateLimit(`checkout:${data.hotel_id}`, 30, 60_000)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)

  await normalizeRoomType(data.room_id)

  const { data: result, error } = await supabase.rpc('perform_checkout_v2', {
    p_hotel_id: data.hotel_id,
    p_checkin_id: data.checkin_id,
  })
  if (error) throw new Error('Error al hacer check-out')

  const r = result as { success: boolean; error?: string; checkin_id?: string }
  if (!r.success) throw new Error(r.error ?? 'Error al hacer check-out')

  revalidatePath('/hotel/rooms')
  revalidatePath('/recepcion/rooms')

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase, hotelId: data.hotel_id, userId: user.id,
      action: 'checkout.completed', entity: 'checkins',
      entityId: data.checkin_id,
      details: { room_id: data.room_id },
    })
  }
}

export async function markRoomAvailable(roomId: string, hotelId?: string) {
  const supabase = await createClient()
  if (hotelId) {
    await assertHotelAccess(supabase, hotelId)
  }
  await normalizeRoomType(roomId)
  await supabase.from('rooms').update({ status: 'available' }).eq('id', roomId)
  revalidatePath('/hotel/rooms')
  revalidatePath('/recepcion/rooms')

  const { data: { user } } = await supabase.auth.getUser()
  if (user && hotelId) {
    await logAction({
      supabase, hotelId, userId: user.id,
      action: 'room.status_changed', entity: 'rooms',
      entityId: roomId,
      details: { new_status: 'available' },
    })
  }
}
