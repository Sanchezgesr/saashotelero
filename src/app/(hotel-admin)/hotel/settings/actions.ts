'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { validateLogoFile, getLogoPath, getCacheBustedUrl } from '@/lib/storage/upload'

export async function uploadLogo(hotelId: string, formData: FormData) {
  const file = formData.get('logo')

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Archivo inválido' }
  }

  const validationError = await validateLogoFile(file)
  if (validationError) return { error: validationError }

  const path = getLogoPath(hotelId, file.type)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: uploadError } = await supabase.storage
    .from('hotel-logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: 'Error al subir logo' }

  const { data: { publicUrl } } = supabase.storage.from('hotel-logos').getPublicUrl(path)
  const cacheBustedUrl = getCacheBustedUrl(publicUrl)

  const { error: updateError } = await supabase
    .from('hotels')
    .update({ logo_url: cacheBustedUrl })
    .eq('id', hotelId)

  if (updateError) return { error: 'Error al actualizar logo' }

  revalidatePath('/hotel/settings')
  return { success: true, url: cacheBustedUrl }
}

export async function getRoomTypes(hotelId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data, error } = await supabase.from('hotel_room_types').select('name, label').eq('hotel_id', hotelId).order('name')
  if (error) return { error: error.message }
  return { data: data ?? [] }
}

export async function addRoomType(hotelId: string, name: string, label: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await supabase.from('hotel_room_types').insert({ hotel_id: hotelId, name, label })
  if (error && !error.message?.includes('duplicate key')) return { error: error.message }
  revalidatePath('/hotel/settings')
  return { success: true }
}

export async function removeRoomType(hotelId: string, name: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await supabase.from('hotel_room_types').delete().eq('hotel_id', hotelId).eq('name', name)
  if (error) return { error: error.message }
  revalidatePath('/hotel/settings')
  return { success: true }
}
