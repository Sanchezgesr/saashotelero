'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { assertHotelAccess } from '@/lib/supabase/auth-guards'
import { emitirComprobante, emitirNotaCredito, consultarRuc, consultarDni } from '@/lib/facturacion/lucode'
import { revalidatePath } from 'next/cache'
import { emitirComprobanteSchema, parseAction } from '@/lib/validations'
import { mutationRateLimit } from '@/lib/rate-limit'

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

export async function getHotelInfo(hotelId: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data } = await svc.from('hotels').select('name, ruc, address').eq('id', hotelId).single()
  return data ?? { name: '', ruc: '', address: '' }
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
  const clienteDireccion = (formData.get('cliente_direccion') as string) || ''

  const raw = { hotel_id: hotelId, checkin_id: checkinId, tipo, cliente_tipo_documento: clienteTipoDoc, cliente_numero_documento: clienteNumDoc, cliente_denominacion: clienteDenom, cliente_direccion: clienteDireccion }
  const { error: validationError, data: validated } = parseAction(emitirComprobanteSchema, raw)
  if (validationError || !validated) return { error: validationError || 'Datos inválidos' }

  const rl = await mutationRateLimit(`invoices:${validated.hotel_id}`)
  if (!rl.allowed) throw new Error('Demasiadas solicitudes, intenta de nuevo en un minuto')

  const supabase = await createClient()
  await assertHotelAccess(supabase, validated.hotel_id)

  const svc = createServiceClient()

  const { data: hotel } = await svc.from('hotels').select('plan, name, ruc').eq('id', validated.hotel_id).single()
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
    .select('*, guests(full_name, dni, email), rooms(number)')
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
    porcentaje_igv: '18',
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
    sandbox: false,
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
  revalidatePath('/recepcion/invoices')

  try {
    if (checkin?.guests?.email) {
      const { sendInvoiceEmail } = await import('@/lib/email')
      await sendInvoiceEmail({
        to: checkin.guests.email,
        guestName: checkin.guests.full_name,
        hotelName: hotel?.name || '',
        hotelRuc: hotel?.ruc,
        roomNumber: checkin.rooms?.number || '',
        total: total,
        tipo: validated.tipo,
        serie,
        numero,
        pdfUrl: result.payload?.pdf.ticket,
        checkIn: new Date(checkin.check_in_at).toLocaleString('es-PE'),
        checkOut: checkin.check_out_at ? new Date(checkin.check_out_at).toLocaleString('es-PE') : undefined,
      })
    }
  } catch {
    /* email sending is best-effort */
  }

  return {
    success: true,
    tipo: validated.tipo,
    serie,
    numero,
    estado: result.payload?.estado,
    pdfUrl: result.payload?.pdf.ticket,
  }
}

export async function getCreditNoteSeries(hotelId: string, tipo: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const ultimo = await svc
    .from('invoices')
    .select('nota_credito_numero')
    .eq('hotel_id', hotelId)
    .eq('tipo', tipo)
    .not('nota_credito_numero', 'is', null)
    .order('nota_credito_numero', { ascending: false })
    .limit(1)
    .maybeSingle()
  const serie = tipo === 'factura' ? 'FC01' : 'BC01'
  const numero = (ultimo.data?.nota_credito_numero ?? 0) + 1
  return { serie, numero }
}

export async function anularComprobanteAction(invoiceId: string, hotelId: string, motivo: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const rl = await mutationRateLimit(`invoices:${hotelId}`)
  if (!rl.allowed) return { error: 'Demasiadas solicitudes, intenta de nuevo en un minuto' }

  const svc = createServiceClient()

  const { data: invoice } = await svc.from('invoices').select('*').eq('id', invoiceId).single()
  if (!invoice) return { error: 'Comprobante no encontrado' }
  if (invoice.estado === 'anulada') return { error: 'El comprobante ya está anulado' }

  const { data: config } = await svc.from('hotel_fiscal_config')
    .select('lucode_token')
    .eq('hotel_id', hotelId)
    .single()
  if (!config?.lucode_token) return { error: 'Facturación electrónica no configurada' }

  const { serie: ncSerie, numero: ncNumero } = await getCreditNoteSeries(hotelId, invoice.tipo)

  const items = invoice.monto > 0 ? [{
    unidad_de_medida: 'ZZ',
    descripcion: `Anulación: ${invoice.serie}-${invoice.numero}`,
    cantidad: 1,
    valor_unitario: 0,
    porcentaje_igv: '18',
    codigo_tipo_afectacion_igv: '10',
    nombre_tributo: 'IGV',
  }] : []

  const result = await emitirNotaCredito({
    token: config.lucode_token,
    tipo: invoice.tipo,
    serie: ncSerie,
    numero: ncNumero,
    serie_referencia: invoice.serie,
    numero_referencia: invoice.numero,
    motivo_baja: motivo,
    cliente_tipo_documento: invoice.cliente_tipo_documento || '1',
    cliente_numero_documento: invoice.cliente_numero_documento || '00000000',
    cliente_denominacion: invoice.cliente_denominacion || '',
    items,
    total: 0,
    sandbox: false,
  })

  const { error: dbError } = await svc.from('invoices').update({
    estado: 'anulada',
    motivo_baja: motivo,
    fecha_baja: new Date().toISOString(),
    nota_credito_serie: ncSerie,
    nota_credito_numero: ncNumero,
  }).eq('id', invoiceId)

  if (dbError) return { error: 'Error al actualizar: ' + dbError.message }

  revalidatePath('/hotel/invoices')
  revalidatePath('/recepcion/invoices')

  return {
    success: true,
    estado: 'anulada',
    nota_credito: `${ncSerie}-${String(ncNumero).padStart(3, '0')}`,
    message: result.success ? 'Comprobante anulado y Nota de Crédito emitida' : 'Anulado localmente (error en SUNAT: ' + result.message + ')',
  }
}

export async function consultarRucAction(hotelId: string, ruc: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data: config } = await svc
    .from('hotel_fiscal_config')
    .select('lucode_token')
    .eq('hotel_id', hotelId)
    .single()
  if (!config?.lucode_token) return null
  return consultarRuc(config.lucode_token, ruc)
}

export async function consultarDniAction(hotelId: string, dni: string) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, hotelId)
  const svc = createServiceClient()
  const { data: config } = await svc
    .from('hotel_fiscal_config')
    .select('lucode_token')
    .eq('hotel_id', hotelId)
    .single()
  if (!config?.lucode_token) return null
  return consultarDni(config.lucode_token, dni)
}

export async function emitirNotaVentaAction(data: {
  hotel_id: string
  checkin_id?: string
  guest_name: string
  guest_doc?: string
  room_number: string
  total: number
  payment_method?: string
  tipo?: string
}) {
  const supabase = await createClient()
  await assertHotelAccess(supabase, data.hotel_id)
  const svc = createServiceClient()

  const { data: hotel } = await svc.from('hotels').select('name, ruc, address').eq('id', data.hotel_id).single()

  const ultimo = await svc
    .from('notas_venta')
    .select('numero')
    .eq('hotel_id', data.hotel_id)
    .order('numero', { ascending: false })
    .limit(1)
    .maybeSingle()

  const numero = (ultimo.data?.numero ?? 0) + 1

  const { error } = await svc.from('notas_venta').insert({
    hotel_id: data.hotel_id,
    numero,
    checkin_id: data.checkin_id ?? null,
    guest_name: data.guest_name,
    guest_doc: data.guest_doc ?? null,
    room_number: data.room_number,
    total: data.total,
    payment_method: data.payment_method ?? null,
    tipo: data.tipo ?? 'checkin',
  })

  if (error) return { error: 'Error al registrar Nota de Venta: ' + error.message }

  return {
    serie: 'NV',
    numero,
    hotelName: hotel?.name || '',
    hotelRuc: hotel?.ruc || '',
    hotelAddress: hotel?.address || '',
  }
}
