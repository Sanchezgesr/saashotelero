import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ checkinId: string }> }) {
  const { checkinId } = await params
  if (!checkinId) return new NextResponse('Missing checkinId', { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return new NextResponse('No autorizado', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('hotel_id')
    .eq('id', session.user.id)
    .single()

  const svc = createServiceClient()
  const { data: checkin } = await svc
    .from('checkins')
    .select('*, guests!inner(full_name, dni, phone), rooms!inner(number, type, price_per_night)')
    .eq('id', checkinId)
    .single()

  if (!checkin) return new NextResponse('Not found', { status: 404 })

  if (profile?.hotel_id && checkin.hotel_id !== profile.hotel_id) {
    return new NextResponse('Acceso denegado', { status: 403 })
  }

  const { data: hotel } = await svc
    .from('hotels')
    .select('name, ruc, address')
    .eq('id', checkin.hotel_id)
    .single()

  const hotelName = hotel?.name || 'HControl'
  const hotelRuc = hotel?.ruc || ''
  const hotelAddress = hotel?.address || ''
  const total = Number(checkin.total_price).toFixed(2)
  const paymentMethod = (checkin.payment_method || 'cash').toUpperCase()
  const checkIn = new Date(checkin.check_in_at).toLocaleString('es-PE')
  const checkOut = checkin.check_out_at ? new Date(checkin.check_out_at).toLocaleString('es-PE') : ''
  const guestName = checkin.guests?.full_name || ''
  const guestDoc = checkin.guests?.dni || ''
  const roomNumber = checkin.rooms?.number || ''
  const now = new Date().toLocaleString('es-PE')
  const host = req.headers.get('host') || 'hcontrol.org.pe'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Comprobante de Pago - ${hotelName}</title>
<meta property="og:title" content="Comprobante de Pago - ${hotelName}"/>
<meta property="og:description" content="Huésped: ${guestName} | Total: S/ ${total}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${protocol}://${host}/api/ticket/${checkinId}"/>
<style>
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Courier New', monospace;
    font-size: 12px; width: 100%; max-width: 400px;
    margin: 0 auto; padding: 16px; color: #111;
  }
  .header { text-align: center; margin-bottom: 16px; }
  .header .hotel { font-size: 20px; font-weight: 800; }
  .header .ruc { font-size: 11px; color: #444; margin-top: 2px; }
  .header .title {
    font-size: 13px; font-weight: 700; letter-spacing: 1px;
    background: #111; color: #fff; display: inline-block;
    padding: 6px 16px; border-radius: 4px; margin-top: 8px;
  }
  .divider { border-top: 1px dashed #999; margin: 12px 0; }
  .divider-thick { border-top: 2px solid #111; margin: 16px 0; }
  .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .row .label { color: #555; }
  .row .value { font-weight: 600; text-align: right; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
  .total-row .label { font-size: 16px; font-weight: 800; }
  .total-row .value { font-size: 20px; font-weight: 900; }
  .footer { text-align: center; margin-top: 12px; font-size: 10px; color: #888; }
  .footer .thanks { font-size: 12px; font-weight: 600; color: #333; margin-bottom: 4px; }
  @media print {
    body { padding: 8px; max-width: 80mm; }
  }
</style></head><body>
  <div class="header">
    <div class="hotel">${hotelName}</div>
    ${hotelAddress ? `<div class="ruc">${hotelAddress}</div>` : ''}
    ${hotelRuc ? `<div class="ruc">RUC: ${hotelRuc}</div>` : ''}
    <div class="title">COMPROBANTE DE PAGO</div>
  </div>
  <div class="divider-thick"></div>
  <div class="row"><span class="label">Huésped</span><span class="value">${guestName}</span></div>
  ${guestDoc ? `<div class="row"><span class="label">Documento</span><span class="value">${guestDoc}</span></div>` : ''}
  <div class="row"><span class="label">Habitación</span><span class="value">${roomNumber}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Método de pago</span><span class="value">${paymentMethod}</span></div>
  <div class="divider-thick"></div>
  <div class="total-row"><span class="label">TOTAL</span><span class="value">S/ ${total}</span></div>
  <div class="footer">
    <div class="thanks">¡Gracias por su preferencia!</div>
    ${now}
  </div>
  <div class="divider"></div>
  <div style="text-align:center;font-size:9px;color:#aaa;margin-top:4px;">
    ${protocol}://${host}/api/ticket/${checkinId}
  </div>
</body></html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
