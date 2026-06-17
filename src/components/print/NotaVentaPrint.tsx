'use client'

interface NotaVentaData {
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
}

export function printNotaVenta(data: NotaVentaData) {
  const title = data.isInvoice
    ? (data.serie?.startsWith('F') ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA')
    : data.tipo === 'checkin' ? 'NOTA DE VENTA - CHECK-IN' : 'NOTA DE VENTA - CHECK-OUT'

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; padding: 3mm; color: #000; }
  .c { text-align: center; }
  .h { font-size: 14px; font-weight: bold; margin-bottom: 1mm; }
  .s { font-size: 9px; color: #555; margin-bottom: 3mm; }
  .l { border-top: 1px dashed #000; margin: 2mm 0; }
  .r { display: flex; justify-content: space-between; padding: 0.3mm 0; font-size: 11px; }
  .b { font-weight: bold; }
  .t { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 1mm; margin-top: 1mm; }
  .f { font-size: 8px; text-align: center; margin-top: 3mm; color: #888; }
</style></head><body>
  <div class="c">
    <div class="h">${data.hotelName || 'HControl'}</div>
    ${data.hotelRuc ? `<div class="s">RUC: ${data.hotelRuc}</div>` : ''}
    <div class="s">${title}${data.serie ? ' - ' + data.serie + '-' + String(data.numero).padStart(3, '0') : ''}</div>
  </div>
  <div class="l"></div>
  <div class="r"><span>Huésped</span><span class="b">${data.guestName}</span></div>
  ${data.guestDoc ? `<div class="r"><span>Doc.</span><span>${data.guestDoc}</span></div>` : ''}
  <div class="r"><span>Habitación</span><span class="b">${data.roomNumber}</span></div>
  <div class="r"><span>Entrada</span><span>${data.checkIn}</span></div>
  ${data.checkOut ? `<div class="r"><span>Salida</span><span>${data.checkOut}</span></div>` : ''}
  <div class="r"><span>Pago</span><span>${data.paymentMethod || 'cash'}</span></div>
  <div class="l"></div>
  <div class="r t"><span>TOTAL</span><span>S/. ${data.total.toFixed(2)}</span></div>
  <div class="f">${new Date().toLocaleString('es-PE')}<br>Gracias por su preferencia</div>
</body></html>`

  const win = window.open('', '_blank', 'width=380,height=600,menubar=no,toolbar=no,location=no')
  if (!win) { alert('Permite ventanas emergentes para imprimir'); return }
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 300)
}
