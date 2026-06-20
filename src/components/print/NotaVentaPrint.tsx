'use client'

export interface NotaVentaData {
  hotelName?: string
  hotelRuc?: string
  hotelAddress?: string
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

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function formatCurrency(n: number) { return `S/ ${n.toFixed(2)}` }

export function getWhatsAppMessage(data: NotaVentaData): string {
  const lines: string[] = []
  lines.push(`🏨 *${data.hotelName || 'HControl'}*`)
  if (data.hotelRuc) lines.push(`📄 RUC: ${data.hotelRuc}`)
  if (data.hotelAddress) lines.push(`📍 ${data.hotelAddress}`)
  lines.push('')
  lines.push(`📋 *COMPROBANTE DE PAGO*`)
  if (data.serie && data.numero) lines.push(`📄 ${data.serie}-${String(data.numero).padStart(4, '0')}`)
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

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '')
  return digits.length >= 9
}

export function getWhatsAppLink(data: NotaVentaData, phone: string): string | null {
  if (!isValidPhone(phone)) return null
  const clean = phone.replace(/[^0-9]/g, '')
  if (data.checkinId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://hcontrol.org.pe')
    const url = `${origin}/api/ticket/${data.checkinId}`
    const msg = `🏨 *${data.hotelName || 'HControl'}*\n\n📋 *COMPROBANTE DE PAGO*\n\nAbre el enlace para ver tu comprobante:\n${url}`
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(getWhatsAppMessage(data))}`
}

export async function downloadPdfNotaVenta(data: NotaVentaData) {
  const jsPDF = (await import('jspdf')).default
  const html2canvas = (await import('html2canvas')).default

  const title = data.isInvoice
    ? (data.serie?.startsWith('F') ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA')
    : 'COMPROBANTE DE PAGO'

  const h = (s: string) => escapeHtml(s)
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${h(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Courier New', monospace;
    font-size: 11px; width: 72mm; padding: 3mm; color: #111; background: #fff;
  }
  .header { text-align: center; margin-bottom: 4mm; }
  .header .hotel { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
  .header .ruc { font-size: 9px; color: #444; margin-top: 1mm; }
  .header .title {
    font-size: 11px; font-weight: 700; letter-spacing: 1px;
    background: #111; color: #fff; display: inline-block;
    padding: 1.5mm 4mm; border-radius: 2px; margin-top: 2mm;
  }
  .header .serie { font-size: 9px; color: #666; margin-top: 1mm; }
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
    <div class="hotel">${h(data.hotelName || 'HControl')}</div>
    ${data.hotelAddress ? `<div class="ruc">${h(data.hotelAddress)}</div>` : ''}
    ${data.hotelRuc ? `<div class="ruc">RUC: ${h(data.hotelRuc)}</div>` : ''}
    <div class="title">${h(title)}</div>
    ${data.serie && data.numero ? `<div class="serie">${h(data.serie)}-${String(data.numero).padStart(4, '0')}</div>` : ''}
  </div>
  <div class="divider-thick"></div>
  <div class="row"><span class="label">Huésped</span><span class="value">${h(data.guestName)}</span></div>
  ${data.guestDoc ? `<div class="row"><span class="label">Documento</span><span class="value">${h(data.guestDoc)}</span></div>` : ''}
  <div class="row"><span class="label">Habitación</span><span class="value">${h(data.roomNumber)}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Método de pago</span><span class="value">${h((data.paymentMethod || 'cash').toUpperCase())}</span></div>
  <div class="divider-thick"></div>
  <div class="total-row"><span class="label">TOTAL</span><span class="value">${formatCurrency(data.total)}</span></div>
  <div class="footer">
    <div class="thanks">¡Gracias por su preferencia!</div>
    ${h(new Date().toLocaleString('es-PE'))}
  </div>
</body></html>`

  const container = document.createElement('div')
  container.innerHTML = html
  container.style.position = 'fixed'
  container.style.top = '-9999px'
  container.style.left = '-9999px'
  container.style.width = '72mm'
  container.style.background = '#fff'
  document.body.appendChild(container)

  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false })
  document.body.removeChild(container)

  const cw = canvas.width
  const ch = canvas.height
  const pdfWidth = 72
  const pdfHeight = (ch * pdfWidth) / cw

  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pdfWidth, pdfHeight] })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight)

  const filename = `${data.serie || 'NV'}-${String(data.numero || 0).padStart(4, '0')}.pdf`
  pdf.save(filename)
}

export function printNotaVenta(data: NotaVentaData) {
  const title = data.isInvoice
    ? (data.serie?.startsWith('F') ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA')
    : 'COMPROBANTE DE PAGO'

  const h = (s: string) => escapeHtml(s)
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${h(title)}</title>
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
  .header .serie { font-size: 9px; color: #666; margin-top: 1mm; }
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
    <div class="hotel">${h(data.hotelName || 'HControl')}</div>
    ${data.hotelAddress ? `<div class="ruc">${h(data.hotelAddress)}</div>` : ''}
    ${data.hotelRuc ? `<div class="ruc">RUC: ${h(data.hotelRuc)}</div>` : ''}
    <div class="title">${h(title)}</div>
    ${data.serie && data.numero ? `<div class="serie">${h(data.serie)}-${String(data.numero).padStart(4, '0')}</div>` : ''}
  </div>
  <div class="divider-thick"></div>
  <div class="row"><span class="label">Huésped</span><span class="value">${h(data.guestName)}</span></div>
  ${data.guestDoc ? `<div class="row"><span class="label">Documento</span><span class="value">${h(data.guestDoc)}</span></div>` : ''}
  <div class="row"><span class="label">Habitación</span><span class="value">${h(data.roomNumber)}</span></div>
  <div class="divider"></div>
  <div class="row"><span class="label">Método de pago</span><span class="value">${h((data.paymentMethod || 'cash').toUpperCase())}</span></div>
  <div class="divider-thick"></div>
  <div class="total-row"><span class="label">TOTAL</span><span class="value">${formatCurrency(data.total)}</span></div>
  <div class="footer">
    <div class="thanks">¡Gracias por su preferencia!</div>
    ${h(new Date().toLocaleString('es-PE'))}
  </div>
</body></html>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '0'
  iframe.style.width = '80mm'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow!.document
  doc.open()
  doc.write(html)
  doc.close()
  setTimeout(() => {
    iframe.contentWindow!.focus()
    iframe.contentWindow!.print()
    setTimeout(() => { document.body.removeChild(iframe) }, 1000)
  }, 300)
}
