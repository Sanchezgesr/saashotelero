'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { cashMovementSchema, parseAction } from '@/lib/validations'
import { logAction } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { localDate, tzOffset } from '@/lib/utils/dates'

export async function createCashMovement(raw: {
  hotel_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  payment_method: 'cash' | 'card' | 'yape' | 'plin'
}) {
  const rl = await rateLimit(`cash:${raw.hotel_id}`, 30, 60_000)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const { error: validationError, data } = parseAction(cashMovementSchema, raw)
  if (validationError || !data) throw new Error(validationError || 'Datos inválidos')

  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error: dbError } = await supabase.from('cash_movements').insert({
    ...data,
    created_by: user.id,
  })
  if (dbError) throw new Error('Error al registrar movimiento')

  await logAction({
    supabase,
    hotelId: data.hotel_id,
    userId: user.id,
    action: 'payment.received',
    entity: 'cash_movements',
    details: { type: data.type, amount: data.amount, category: data.category },
  })

  revalidatePath('/hotel/cash')
  revalidatePath('/recepcion/cash')
  return { success: true }
}

export async function performCashClosure(hotelId: string, notes?: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  // Calcular totales desde el último cierre (o desde medianoche si es el primero)
  const today = localDate()
  const nd = new Date()
  nd.setDate(nd.getDate() + 1)
  const nextDay = localDate(nd)
  const todayStart = `${today}T00:00:00${tzOffset()}`
  const todayEnd = `${nextDay}T00:00:00${tzOffset()}`

  const { data: lastClosures } = await supabase
    .from('cash_closures').select('closed_at')
    .eq('hotel_id', hotelId)
    .order('closed_at', { ascending: false }).limit(1)

  const startFilter = lastClosures?.[0]?.closed_at ?? todayStart

  const { data: movs } = await supabase
    .from('cash_movements').select('type, amount')
    .eq('hotel_id', hotelId)
    .gte('created_at', startFilter)
    .lt('created_at', todayEnd)

  if (!movs || movs.length === 0) throw new Error('No hay movimientos para cerrar')

  const totalIncome = movs.filter(m => m.type === 'income').reduce((s, m) => s + Number(m.amount), 0)
  const totalExpense = movs.filter(m => m.type === 'expense').reduce((s, m) => s + Number(m.amount), 0)

  const { data: closure, error } = await supabase
    .from('cash_closures').insert({
      hotel_id: hotelId,
      date: today,
      total_income: totalIncome,
      total_expense: totalExpense,
      closed_by: user.id,
      notes: notes || null,
    }).select().single()

  if (error) throw new Error('Error al realizar cierre de caja')

  await logAction({
    supabase,
    hotelId,
    userId: user.id,
    action: 'cash.closed',
    entity: 'cash_closures',
    entityId: closure.id,
    details: {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      notes: notes || null,
      role: profile?.role ?? 'hotel_admin',
    },
  })

  revalidatePath('/hotel/cash')
  revalidatePath('/recepcion/cash')
  return { success: true, closure_id: closure.id, total_income: totalIncome, total_expense: totalExpense }
}
