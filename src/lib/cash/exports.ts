import { fmtDate } from '@/lib/utils/dates'
import type { CashClosure, CashMovement } from '@/types'
import { exportToExcel } from '@/lib/excel'
import { generatePDF, initJSPDF } from '@/lib/pdf'

export { exportToExcel as exportExcel }
export { generatePDF as exportPDF }

export async function downloadCashReportPDF(
  hotelId: string,
  from: string,
  to: string,
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  closures: CashClosure[],
) {
  const parts = to.split('-')
  const nd = new Date(+parts[0], +parts[1] - 1, +parts[2])
  nd.setDate(nd.getDate() + 1)

  const { tzOffset, localDate } = await import('@/lib/utils/dates')

  const { data: movs } = await supabase
    .from('cash_movements').select('*')
    .eq('hotel_id', hotelId)
    .gte('created_at', `${from}T00:00:00${tzOffset()}`)
    .lt('created_at', `${localDate(nd)}T00:00:00${tzOffset()}`)
    .order('created_at', { ascending: false }) as { data: CashMovement[] | null }

  if (!movs || !movs.length) return

  const inc = movs.filter(x => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0)
  const exp = movs.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0)
  const cash = movs.filter(x => x.payment_method === 'cash').reduce((s, x) => s + Number(x.amount), 0)
  const card = movs.filter(x => x.payment_method === 'card').reduce((s, x) => s + Number(x.amount), 0)
  const yape = movs.filter(x => x.payment_method === 'yape').reduce((s, x) => s + Number(x.amount), 0)
  const plin = movs.filter(x => x.payment_method === 'plin').reduce((s, x) => s + Number(x.amount), 0)

  const jsPDF = await initJSPDF()
  const doc = new jsPDF()
  let y = 15
  doc.setFontSize(14); doc.text('Reporte de Caja', 14, y); y += 10
  doc.setFontSize(10)
  doc.text(`Período: ${from} al ${to}`, 14, y); y += 8
  doc.text(`Ingresos: S/. ${inc.toFixed(2)}  |  Egresos: S/. ${exp.toFixed(2)}  |  Balance: S/. ${(inc - exp).toFixed(2)}`, 14, y); y += 6
  doc.text(`Efectivo: S/. ${cash.toFixed(2)}  |  Tarjeta: S/. ${card.toFixed(2)}  |  Yape: S/. ${yape.toFixed(2)}  |  Plin: S/. ${plin.toFixed(2)}`, 14, y); y += 12

  const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto', 'Método', 'Descripción']
  const rows = movs.map(m => [
    fmtDate(m.created_at), m.type === 'income' ? 'Ingreso' : 'Egreso', m.category,
    `S/. ${Number(m.amount).toFixed(2)}`, m.payment_method, m.description || '',
  ])
  ;(doc as any).autoTable({ head: [headers], body: rows, startY: y })
  const finalY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(12); doc.text('Cierres de Caja', 14, finalY)
  const cy = finalY + 8
  const closureHeaders = ['Fecha', 'Ingresos', 'Egresos', 'Balance', 'Responsable']
  const closureRows = closures.filter(c => c.date >= from && c.date <= to).map(c => [
    fmtDate(c.date), `S/. ${Number(c.total_income).toFixed(2)}`, `S/. ${Number(c.total_expense).toFixed(2)}`,
    `S/. ${Number(c.balance).toFixed(2)}`, c.closed_by_name || '—',
  ])
  if (closureRows.length) {;(doc as any).autoTable({ head: [closureHeaders], body: closureRows, startY: cy })}
  doc.save(`reporte_caja_${from}_${to}.pdf`)
}
