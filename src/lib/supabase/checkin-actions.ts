'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkinSchema, createGuestSchema, parseAction } from '@/lib/validations'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { rateLimit } from '@/lib/rate-limit'
import { logAction } from '@/lib/audit'
import { createServiceClient } from '@/lib/supabase/service'
import { consultarDni } from '@/lib/facturacion/lucode'

const VALID_TYPES = ['simple', 'doble', 'triple', 'matrimonial', 'familiar']

export async function normalizeRoomType(roomId: string, hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
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
  try {
    const rl = await rateLimit(`checkin:${raw.hotel_id}`, 30, 60_000)
    if (!rl.allowed) return { success: false, error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' }

    const { error: validationError, data } = parseAction(checkinSchema, raw)
    if (validationError || !data) return { success: false, error: validationError || 'Datos inválidos' }

    const supabase = await createClient()
    await assertHotelAccess(supabase, data.hotel_id)

    await normalizeRoomType(data.room_id, data.hotel_id)

    const { data: { user } } = await supabase.auth.getUser()

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
      p_created_by: user?.id ?? null,
    })

    if (error) { console.error('perform_checkin_v2 RPC error:', error); return { success: false, error: 'Error al registrar check-in: ' + error.message } }

    const r = result as { success: boolean; error?: string; checkin_id?: string }
    if (!r.success) { console.error('perform_checkin_v2 returned error:', r.error); return { success: false, error: r.error ?? 'Error al registrar check-in' } }

    revalidatePath('/hotel/rooms')
    revalidatePath('/recepcion/rooms')

    if (user) {
      await logAction({
        supabase, hotelId: data.hotel_id, userId: user.id,
        action: 'checkin.created', entity: 'checkins',
        entityId: r.checkin_id,
        details: { guest_name: data.guest_name, room_number: data.room_number, total_price: data.total_price },
      })
    }

    return { success: true, checkin_id: r.checkin_id }
  } catch (e: any) {
    console.error('performCheckin error:', e)
    return { success: false, error: e?.message || 'Error al registrar check-in' }
  }
}

export async function performCheckout(data: {
  checkin_id: string; room_id: string; hotel_id: string; room_number?: string
}) {
  const rl = await rateLimit(`checkout:${data.hotel_id}`, 30, 60_000)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)

  await normalizeRoomType(data.room_id, data.hotel_id)

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

  try {
    const svc = createServiceClient()
    const { data: checkin } = await svc
      .from('checkins')
      .select('*, guests(full_name, email), rooms(number)')
      .eq('id', data.checkin_id)
      .single()
    const { data: hotel } = await svc
      .from('hotels')
      .select('name')
      .eq('id', data.hotel_id)
      .single()

    if (checkin?.guests?.email && hotel?.name) {
      const { sendCheckoutEmail } = await import('@/lib/email')
      await sendCheckoutEmail({
        to: checkin.guests.email,
        guestName: checkin.guests.full_name,
        hotelName: hotel.name,
        roomNumber: checkin.rooms?.number || '',
        total: Number(checkin.total_price),
        checkIn: new Date(checkin.check_in_at).toLocaleString('es-PE'),
        checkOut: new Date().toLocaleString('es-PE'),
      })
    }
  } catch {
    /* email sending is best-effort */
  }
}

export async function markRoomAvailable(roomId: string, hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  await normalizeRoomType(roomId, hotelId)
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

export async function consultarDniEnCheckin(hotelId: string, dni: string): Promise<{ nombres: string; apellido_paterno: string; apellido_materno: string } | null> {
  const svc = createServiceClient()
  const { data: config } = await svc
    .from('hotel_fiscal_config')
    .select('lucode_token')
    .eq('hotel_id', hotelId)
    .single()
  if (!config?.lucode_token) return null
  return consultarDni(config.lucode_token, dni)
}
