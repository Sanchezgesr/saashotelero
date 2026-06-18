'use client'

export interface NotaVentaData {
  hotelName?: string
  hotelRuc?: string
  guestName: string
  guestDoc?: string
  roomNumber: string
  checkIn: string
  checkOut?: string
  total: number
  paymentMethod?: string
  tipo: 'checkin' | 'checkout'
  isInvoice?: boolean
  serie?: string
  numero?: number
  checkinId?: string
}

function formatCurrency(n: number) { return `S/ ${n.toFixed(2)}` }

export function getWhatsAppMessage(data: NotaVentaData): string {
  const lines: string[] = []
  lines.push(`🏨 *${data.hotelName || 'HControl'}*`)
  lines.push('')
  lines.push(`📋 *COMPROBANTE DE PAGO*`)
  lines.push('')
  lines.push(`👤 Huésped: ${data.guestName}`)
  if (data.guestDoc) lines.push(`📄 Documento: ${data.guestDoc}`)
  lines.push(`🚪 Habitación: ${data.roomNumber}`)
  lines.push(`💳 Pago: ${data.paymentMethod || 'cash'}`)
  lines.push('')
  lines.push(`💵 *TOTAL: ${formatCurrency(data.total)}*`)
  lines.push('')
  lines.push(`📅 ${new Date().toLocaleString('es-PE')}`)
  lines.push('✅ ¡Gracias por su preferencia!')
  return lines.join('\n')
}

export function getWhatsAppLink(data: NotaVentaData, phone: string): string {
  if (data.checkinId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://hcontrol.org.pe')
    const url = `${origin}/api/ticket/${data.checkinId}`
    const msg = `🏨 *${data.hotelName || 'HControl'}*\n\n📋 *COMPROBANTE DE PAGO*\n\nAbre el enlace para ver tu comprobante:\n${url}`
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`
  }
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(data))}`
}

export function printNotaVenta(data: NotaVentaData) {
  const title = data.isInvoice
    ? (data.serie?.startsWith('F') ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA')
    : 'COMPROBANTE DE PAGO'

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Courier New', monospace;
    font-size: 11px; width: 72mm; padding: 3mm; color: #111;
  }
  .header { text-align: center; margin-bottom: 4mm; }
  .header .hotel { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
  .header .ruc { font-size: 9px; color: #444; margin-top: 1mm; }
  .header .title {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    background: #111; color: #fff; display: inline-block;
    padding: 1.5mm 4mm; border-radius: 2px; margin-top: 2mm;
  }
  .divider { border-top: 1px dashed #666; margin: 2.5mm 0; }
  .divider-thick { border-top: 2px solid #111; margin: 3mm 0; }
  .row { display: flex; justify-content: space-between; padding: 0.5mm 0; font-size: 11px; }
  .row .label { color: #555; }
  .row .value { font-weight: 600; text-align: right; max-width: 60%; }
  .total-row { display: flex; justify-content: space-between; padding: 1.5mm 0; }
  .total-row .label { font-size: 13px; font-weight: 800; }
  .total-row .value { font-size: 15px; font-weight: 900; }
  .footer { text-align: center; margin-top: 3mm; font-size: 8px; color: #888; }
  .footer .thanks { font-size: 10px; font-weight: 600; color: #333; margin-bottom: 1mm; }
</style></head><body>
  <div class="header">
    <div class="hotel">${data.hotelName || 'HControl'}</div>
    ${data.hotelRuc ? `<div class="ruc">RUC: ${data.hotelRuc}</div>` : ''}
    <div class="title">${title}</div>
  </div>
  <div class="divider-thick"></div>
  <div class="row"><span class="label">Huésped</span><span class="value">${data.guestName}</span></div>
  ${data.guestDoc ? `<div class="row"><span class="label">Documento</span><span class="value">${data.guestDoc}</span></div>` : ''}
  <div class="row"><span class="label">Habitación</span><span class="value">${data.roomNumber}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Método de pago</span><span class="value">${(data.paymentMethod || 'cash').toUpperCase()}</span></div>
  <div class="divider-thick"></div>
  <div class="total-row"><span class="label">TOTAL</span><span class="value">${formatCurrency(data.total)}</span></div>
  <div class="footer">
    <div class="thanks">¡Gracias por su preferencia!</div>
    ${new Date().toLocaleString('es-PE')}
  </div>
</body></html>`

  const win = window.open('', '_blank', 'width=380,height=600,menubar=no,toolbar=no,location=no')
  if (!win) { alert('Permite ventanas emergentes para imprimir'); return }
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 300)
}
