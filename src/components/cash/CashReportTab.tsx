'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Download, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { localDate, tzOffset, fmtDate } from '@/lib/utils/dates'
import { calcSummary } from '@/lib/cash/calculations'
import { downloadCashReportPDF, exportExcel } from '@/lib/cash/exports'
import type { CashMovement, CashClosure, CashSummary } from '@/types'
import { CashSummaryCards } from '@/components/cash/CashSummaryCards'
import { CashMovementsTable } from '@/components/cash/CashMovementsTable'

export function CashReportTab() {
  const { profile } = useUser()
  const supabase = createClient()

  const [dateFrom, setDateFrom] = useState(localDate())
  const [dateTo, setDateTo] = useState(localDate())
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [summary, setSummary] = useState<CashSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, byCash: 0, byCard: 0, byYape: 0, byPlin: 0 })
  const [closures, setClosures] = useState<CashClosure[]>([])

  const fetchReport = useCallback(async (from?: string, to?: string) => {
    if (!profile?.hotel_id) return
    const f = from ?? dateFrom
    const t = to ?? dateTo
    if (!f || !t) return
    const parts = t.split('-')
    const nd = new Date(+parts[0], +parts[1] - 1, +parts[2])
    nd.setDate(nd.getDate() + 1)

    const { data } = await supabase
      .from('cash_movements').select('*, profiles(full_name)')
      .eq('hotel_id', profile.hotel_id)
      .gte('created_at', `${f}T00:00:00${tzOffset()}`)
      .lt('created_at', `${localDate(nd)}T00:00:00${tzOffset()}`)
      .order('created_at', { ascending: false })
    const list = (data ?? []) as CashMovement[]
    setMovements(list)
    setSummary(calcSummary(list))
  }, [profile?.hotel_id, dateFrom, dateTo])

  useEffect(() => { fetchReport() }, [profile?.hotel_id])

  // Fetch closures for PDF report
  useEffect(() => {
    if (!profile?.hotel_id) return
    supabase.from('cash_closures').select('*, profiles(full_name, role)')
      .eq('hotel_id', profile.hotel_id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) setClosures(data.map((c: any) => ({ ...c, closed_by_name: c.profiles?.full_name, closed_by_role: c.profiles?.role })))
      })
  }, [profile?.hotel_id])

  const handleFromChange = (v: string) => {
    setDateFrom(v)
    fetchReport(v, dateTo)
  }

  const handleToChange = (v: string) => {
    setDateTo(v)
    fetchReport(dateFrom, v)
  }

  const handleDownloadPDF = async () => {
    if (!profile?.hotel_id || !dateFrom || !dateTo) return
    if (movements.length === 0) { toast.error('No hay movimientos en el rango seleccionado'); return }
    await downloadCashReportPDF(profile.hotel_id, dateFrom, dateTo, supabase, closures)
  }

  const handleExportExcel = () => {
    const rows = movements.map(m => ({
      Fecha: fmtDate(m.created_at),
      Tipo: m.type === 'income' ? 'Ingreso' : 'Egreso',
      Categoría: m.category,
      Monto: Number(m.amount).toFixed(2),
      Método: m.payment_method,
      Descripción: m.description || '',
      Responsable: m.profiles?.full_name || '—',
    }))
    exportExcel(rows, 'reporte_movimientos')
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input type="date" value={dateFrom} onChange={(e) => handleFromChange(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input type="date" value={dateTo} onChange={(e) => handleToChange(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            <Printer size={16} /> Generar reporte
          </button>
        </div>
      </div>

      {movements.length > 0 && (
        <div className="flex items-center justify-end gap-2">
          <button onClick={handleExportExcel}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border">
            <Download size={14} /> Excel
          </button>
        </div>
      )}

      {movements.length > 0 && (
        <>
          <CashSummaryCards summary={summary} compact />
          <CashMovementsTable movements={movements} />
        </>
      )}
    </div>
  )
}
