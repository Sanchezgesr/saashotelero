'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'
import { createHotelSchema, parseAction } from '@/lib/validations'
import { mutationRateLimit } from '@/lib/rate-limit'

export async function createHotel(formData: FormData) {
  const rl = await mutationRateLimit('admin:hotels')
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')
  const supabase = await createClient()

  const raw = {
    name:    formData.get('name'),
    ruc:     formData.get('ruc'),
    address: formData.get('address'),
    city:    formData.get('city'),
    phone:   formData.get('phone'),
    plan:    formData.get('plan') || 'basico_mensual',
  }

  const { error: validationError, data: hotelData } = parseAction(createHotelSchema, raw)
  if (validationError || !hotelData) return { error: validationError || 'Datos inválidos' }

  const { data, error } = await supabase
    .from('hotels')
    .insert({ ...hotelData, status: 'active' })
    .select()
    .single()

  if (error) {
    console.error('Error creating hotel:', error)
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId: data.id,
      userId: user.id,
      action: 'create_hotel',
      entity: 'hotel',
      entityId: data.id,
      metadata: hotelData,
    })
  }

  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { data }
}

export async function updateHotelStatus(hotelId: string, status: 'active' | 'suspended') {
  const rl = await mutationRateLimit(`admin:hotels:${hotelId}`)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('hotels')
    .update({ status })
    .eq('id', hotelId)

  if (error) {
    console.error(`Error updating hotel status to ${status}:`, error)
    return { error: error.message }
  }

  const isActive = status === 'active'

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('hotel_id', hotelId)

  if (profileError) {
    console.error('Error updating profiles:', profileError)
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('hotel_id', hotelId)

  if (profiles && profiles.length > 0) {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    for (const p of profiles) {
      await adminClient.auth.admin.updateUserById(p.id, {
        ban_duration: isActive ? 'none' : '876000h',
      })
      if (!isActive) {
        await adminClient.auth.admin.signOut(p.id)
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId,
      userId: user.id,
      action: `${status}_hotel`,
      entity: 'hotel',
      entityId: hotelId,
      metadata: { status },
    })
  }

  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function deleteHotel(hotelId: string) {
  const rl = await mutationRateLimit(`admin:hotels:${hotelId}`)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')
  const supabase = await createClient()

  const { error } = await supabase
    .from('hotels')
    .update({ status: 'deleted' })
    .eq('id', hotelId)

  if (error) {
    console.error('Error marking hotel as deleted:', error)
    return { error: error.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('hotel_id', hotelId)

  if (profileError) {
    console.error('Error disabling profiles for deleted hotel:', profileError)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId,
      userId: user.id,
      action: 'delete_hotel',
      entity: 'hotel',
      entityId: hotelId,
    })
  }

  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

export async function restoreHotel(hotelId: string) {
  const rl = await mutationRateLimit(`admin:hotels:${hotelId}`)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')
  const supabase = await createClient()

  const { error } = await supabase
    .from('hotels')
    .update({ status: 'active' })
    .eq('id', hotelId)

  if (error) {
    console.error('Error restoring hotel:', error)
    return { error: error.message }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('hotel_id', hotelId)

  if (profileError) {
    console.error('Error restoring profiles for hotel:', profileError)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await logAction({
      supabase,
      hotelId,
      userId: user.id,
      action: 'restore_hotel',
      entity: 'hotel',
      entityId: hotelId,
    })
  }

  revalidatePath('/admin/hotels')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
