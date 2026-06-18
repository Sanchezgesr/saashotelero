'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { emitirComprobante } from '@/lib/facturacion/lucode'
import { revalidatePath } from 'next/cache'
import { emitirComprobanteSchema, parseAction } from '@/lib/validations'

export async function getPendingCheckins(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data: invoiceRows } = await svc
    .from('invoices')
    .select('checkin_id')
    .eq('hotel_id', hotelId)
    .limit(100)
  const excludeIds = invoiceRows?.map(i => i.checkin_id).filter(Boolean) ?? []
  let query = svc
    .from('checkins')
    .select('*, guests!inner(full_name, dni, phone), rooms!inner(number, type, price_per_night)')
    .eq('hotel_id', hotelId)
    .eq('status', 'active')
    .eq('payment_status', 'paid')
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }
  const { data } = await query.order('check_in_at', { ascending: false })
  return data ?? []
}

export async function getFiscalConfig(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc
    .from('hotel_fiscal_config')
    .select('*')
    .eq('hotel_id', hotelId)
    .single()
  return data
}

export async function getHotelName(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc.from('hotels').select('name').eq('id', hotelId).single()
  return data?.name ?? ''
}

async function getLastInvoiceNumber(hotelId: string, tipo: string, serie: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc
    .from('invoices')
    .select('numero')
    .eq('hotel_id', hotelId)
    .eq('tipo', tipo)
    .eq('serie', serie)
    .order('numero', { ascending: false })
    .limit(1)
    .single()
  return data?.numero ?? null
}

export async function emitirComprobanteAction(formData: FormData) {
  const hotelId = formData.get('hotel_id') as string
  const checkinId = formData.get('checkin_id') as string
  const tipo = formData.get('tipo') as 'boleta' | 'factura'
  const clienteTipoDoc = formData.get('cliente_tipo_documento') as string
  const clienteNumDoc = formData.get('cliente_numero_documento') as string
  const clienteDenom = formData.get('cliente_denominacion') as string
  const clienteDireccion = formData.get('cliente_direccion') as string

  const raw = { hotel_id: hotelId, checkin_id: checkinId, tipo, cliente_tipo_documento: clienteTipoDoc, cliente_numero_documento: clienteNumDoc, cliente_denominacion: clienteDenom, cliente_direccion: clienteDireccion }
  const { error: validationError, data: validated } = parseAction(emitirComprobanteSchema, raw)
  if (validationError || !validated) return { error: validationError || 'Datos inválidos' }

  const supabase = await createClient()
  await assertHotelAccess(supabase, validated.hotel_id)

  const svc = createServiceClient()

  const { data: hotel } = await svc.from('hotels').select('plan').eq('id', validated.hotel_id).single()
  if (!hotel?.plan?.startsWith('pro')) return { error: 'Plan Básico no incluye facturación electrónica. Actualiza a Pro.' }

  const config = await getFiscalConfig(validated.hotel_id)
  if (!config?.enabled || !config.lucode_token) {
    return { error: 'Facturación electrónica no configurada. Configúrala en Ajustes.' }
  }

  const serie = validated.tipo === 'factura' ? config.serie_factura : config.serie_boleta
  const lastNum = await getLastInvoiceNumber(validated.hotel_id, validated.tipo, serie)
  const numero = (lastNum ?? 0) + 1

  const { data: checkin } = await svc
    .from('checkins')
    .select('*, guests(full_name, dni), rooms(number)')
    .eq('id', validated.checkin_id)
    .single()

  if (!checkin) return { error: 'Check-in no encontrado' }

  const total = Number(checkin.total_price)
  const valorUnitario = total / 1.18
  const igv = total - valorUnitario

  const items = [{
    unidad_de_medida: 'ZZ',
    descripcion: `Alojamiento - Hab. ${checkin.rooms?.number} - ${checkin.guests?.full_name}`,
    cantidad: 1,
    valor_unitario: Math.round(valorUnitario * 1000000) / 1000000,
    porcentaje_igv: 18,
    codigo_tipo_afectacion_igv: '10',
    nombre_tributo: 'IGV',
  }]

  const result = await emitirComprobante({
    token: config.lucode_token,
    tipo: validated.tipo,
    serie,
    numero,
    cliente_tipo_documento: validated.cliente_tipo_documento,
    cliente_numero_documento: validated.cliente_numero_documento,
    cliente_denominacion: validated.cliente_denominacion,
    cliente_direccion: validated.cliente_direccion,
    items,
    total,
    sandbox: true,
  })

  if (!result.success) {
    return { error: result.message }
  }

  const { error: dbError } = await svc.from('invoices').insert({
    hotel_id: validated.hotel_id,
    checkin_id: validated.checkin_id,
    tipo: validated.tipo,
    serie,
    numero,
    monto: total,
    cliente_tipo_documento: validated.cliente_tipo_documento,
    cliente_numero_documento: validated.cliente_numero_documento,
    cliente_denominacion: validated.cliente_denominacion,
    estado: result.payload?.estado ?? 'pendiente',
    hash: result.payload?.hash,
    xml_url: result.payload?.xml,
    cdr_url: result.payload?.cdr,
    pdf_url: result.payload?.pdf.ticket,
  })

  if (dbError) {
    return { error: 'Comprobante emitido pero error al guardar: ' + dbError.message }
  }

  revalidatePath('/hotel/invoices')

  return {
    success: true,
    tipo: validated.tipo,
    serie,
    numero,
    estado: result.payload?.estado,
    pdfUrl: result.payload?.pdf.ticket,
  }
}
