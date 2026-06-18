'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'

export async function createReservation(raw: {
  hotel_id: string
  room_id: string
  guest_id: string
  check_in_date: string
  check_out_date: string
  total_price: number
  notes?: string
}) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await authClient
    .from('profiles').select('hotel_id').eq('id', user.id).single()
  if (!profile || profile.hotel_id !== raw.hotel_id) throw new Error('Acceso denegado')

  const svc = createServiceClient()
  const { error } = await svc.from('reservations').insert({
    hotel_id: raw.hotel_id,
    room_id: raw.room_id,
    guest_id: raw.guest_id,
    check_in_date: raw.check_in_date,
    check_out_date: raw.check_out_date,
    total_price: raw.total_price,
    status: 'confirmed',
    notes: raw.notes || null,
  })

  if (error) throw new Error('Error al registrar reserva: ' + error.message)

  return { success: true }
}

export async function fetchReservations(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data, error } = await svc
    .from('reservations')
    .select('*, rooms(number, type), guests(full_name)')
    .eq('hotel_id', hotelId)
    .order('check_in_date', { ascending: false })

  if (error) throw new Error('Error al cargar reservas')
  return data
}

export async function fetchRoomsWithData(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()

  const [roomsResult, checkinsResult, reservationsResult] = await Promise.all([
    svc.from('rooms').select('*').eq('hotel_id', hotelId).order('number'),
    svc.from('checkins').select('*, guests(full_name)').eq('hotel_id', hotelId).eq('status', 'active'),
    svc.from('reservations').select('*, guests(full_name)').eq('hotel_id', hotelId).in('status', ['pending', 'confirmed']),
  ])

  if (roomsResult.error) throw new Error('Error al cargar habitaciones')

  return (roomsResult.data || []).map(room => ({
    ...room,
    activeCheckin: checkinsResult.data?.find(c => c.room_id === room.id) || null,
    upcomingReservations: reservationsResult.data?.filter(r => r.room_id === room.id) || [],
  }))
}

export async function updateReservationStatus(reservationId: string, status: string) {
  const svc = createServiceClient()
  const { data: reservation } = await svc.from('reservations').select('hotel_id').eq('id', reservationId).single()
  if (!reservation) throw new Error('Reserva no encontrada')
  const supabase = await createClient()
  await assertHotelAccess(supabase, reservation.hotel_id)
  const { error } = await svc.from('reservations').update({ status }).eq('id', reservationId)
  if (error) throw new Error('Error al actualizar estado')
}

export async function deleteReservation(reservationId: string) {
  const svc = createServiceClient()
  const { data: reservation } = await svc.from('reservations').select('hotel_id').eq('id', reservationId).single()
  if (!reservation) throw new Error('Reserva no encontrada')
  const supabase = await createClient()
  await assertHotelAccess(supabase, reservation.hotel_id)
  const { error } = await svc.from('reservations').delete().eq('id', reservationId)
  if (error) throw new Error('Error al eliminar reserva')
}

export async function fetchRoomsAndReservations(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()

  const [roomsResult, checkinsResult, reservationsResult] = await Promise.all([
    svc.from('rooms').select('*').eq('hotel_id', hotelId).order('number'),
    svc.from('checkins').select('*, guests(full_name)').eq('hotel_id', hotelId).eq('status', 'active'),
    svc.from('reservations').select('*, rooms(number, type), guests(full_name)').eq('hotel_id', hotelId).in('status', ['pending', 'confirmed']),
  ])

  if (roomsResult.error) throw new Error('Error al cargar habitaciones')

  const rooms = (roomsResult.data || []).map(room => ({
    ...room,
    activeCheckin: checkinsResult.data?.find(c => c.room_id === room.id) || null,
  }))

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
  const upcoming = (reservationsResult.data || []).filter(r => r.check_in_date >= today)

  return { rooms, upcoming }
}
