'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Download, Printer } from 'lucide-react'
import { fmtDate, fmtTime } from '@/lib/utils/dates'
import type { CashClosure } from '@/types'
import { exportExcel, exportPDF } from '@/lib/cash/exports'
import { Pagination } from '@/components/Pagination'

export function CashClosuresTab() {
  const { profile } = useUser()
  const supabase = createClient()
  const [closures, setClosures] = useState<CashClosure[]>([])
  const [page, setPage] = useState(1)
  const itemsPerPage = 20

  const fetchClosures = async () => {
    if (!profile?.hotel_id) return
    const { data } = await supabase
      .from('cash_closures').select('*, profiles(full_name, role)')
      .eq('hotel_id', profile.hotel_id)
      .order('date', { ascending: false })
    if (data) setClosures(data.map((c: any) => ({ ...c, closed_by_name: c.profiles?.full_name, closed_by_role: c.profiles?.role })))
  }

  useEffect(() => { fetchClosures() }, [profile?.hotel_id])

  const totalPages = Math.max(1, Math.ceil(closures.length / itemsPerPage))
  const paginated = closures.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const handleExportExcel = () => {
    const rows = closures.map(c => ({
      Fecha: fmtDate(c.date),
      Hora: fmtTime(c.closed_at),
      Ingresos: Number(c.total_income).toFixed(2),
      Egresos: Number(c.total_expense).toFixed(2),
      Balance: Number(c.balance).toFixed(2),
      Responsable: c.closed_by_name || '—',
      Rol: c.closed_by_role === 'receptionist' ? 'Recepcionista' : c.closed_by_role === 'hotel_admin' ? 'Administrador' : c.closed_by_role || '—',
      Observaciones: c.notes || '—',
    }))
    exportExcel(rows, 'cierres_caja_completo')
  }

  const handleExportPDF = () => {
    const headers = ['Fecha', 'Hora', 'Ingresos', 'Egresos', 'Balance', 'Responsable', 'Rol', 'Observaciones']
    const rows = closures.map(c => [
      fmtDate(c.date),
      fmtTime(c.closed_at),
      `S/. ${Number(c.total_income).toFixed(2)}`,
      `S/. ${Number(c.total_expense).toFixed(2)}`,
      `S/. ${Number(c.balance).toFixed(2)}`,
      c.closed_by_name || '—',
      c.closed_by_role === 'receptionist' ? 'Recepcionista' : c.closed_by_role === 'hotel_admin' ? 'Administrador' : c.closed_by_role || '—',
      c.notes || '—',
    ])
    exportPDF('Historial Completo de Cierres de Caja', headers, rows, 'cierres_caja_completo')
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-2">
        <button onClick={handleExportExcel}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
          <Download size={14} /> Excel
        </button>
        <button onClick={handleExportPDF}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
          <Printer size={14} /> PDF
        </button>
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Ingresos</th>
              <th className="px-4 py-3 font-medium">Egresos</th>
              <th className="px-4 py-3 font-medium">Balance</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Observaciones</th>
              <th className="px-4 py-3 font-medium">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((c) => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{fmtDate(c.date)}</td>
                <td className="px-4 py-3 text-green-600 font-medium">S/. {Number(c.total_income).toFixed(2)}</td>
                <td className="px-4 py-3 text-red-600 font-medium">S/. {Number(c.total_expense).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">S/. {Number(c.balance).toFixed(2)}</td>
                <td className="px-4 py-3">{c.closed_by_name || '—'}</td>
                <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{c.closed_by_role || '—'}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{c.notes || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{fmtTime(c.closed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {closures.length === 0 && <p className="text-center text-muted-foreground py-8">Sin cierres registrados.</p>}
        {closures.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>
    </>
  )
}
