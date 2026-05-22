'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { BarChart3, TrendingUp, Building2, Users, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import IncomeChart from '@/components/charts/IncomeChart'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const BAR_COLORS = ['var(--primary)', '#16a34a', '#d97706', '#7c3aed', '#0891b2']

export default function ReportsPage() {
  const { profile } = useUser()
  const [monthlyIncome, setMonthlyIncome] = useState<any[]>([])
  const [occupancy, setOccupancy] = useState(0)
  const [topGuests, setTopGuests] = useState<any[]>([])
  const [cashClosures, setCashClosures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    const hid = profile.hotel_id
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const loadReports = async () => {
      setLoading(true)

      const [incomeRes, roomsRes, checkinsRes, closuresRes] = await Promise.all([
        supabase.from('cash_movements').select('amount, created_at').eq('hotel_id', hid).eq('type', 'income').gte('created_at', sixMonthsAgo.toISOString()).order('created_at'),
        supabase.from('rooms').select('status').eq('hotel_id', hid),
        supabase.from('checkins').select('guest_id').eq('hotel_id', hid),
        supabase.from('cash_closures').select('*').eq('hotel_id', hid).order('date', { ascending: false }),
      ])

      setMonthlyIncome(incomeRes.data ?? [])

      const total = roomsRes.data?.length ?? 0
      const occ = roomsRes.data?.filter(r => r.status === 'occupied').length ?? 0
      setOccupancy(total > 0 ? Math.round((occ / total) * 100) : 0)

      // Fix N+1: count guest_ids then fetch all names at once
      const guestCounts: Record<string, number> = {}
      checkinsRes.data?.forEach(g => { guestCounts[g.guest_id] = (guestCounts[g.guest_id] ?? 0) + 1 })
      const sorted = Object.entries(guestCounts).sort(([, a], [, b]) => b - a).slice(0, 5)
      if (sorted.length > 0) {
        const { data: guests } = await supabase.from('guests').select('id, full_name').in('id', sorted.map(([id]) => id))
        const guestMap = Object.fromEntries((guests || []).map(g => [g.id, g.full_name]))
        setTopGuests(sorted.map(([id, count]) => ({ name: guestMap[id] || '—', visits: count })))
      }

      setCashClosures(closuresRes.data ?? [])
      setLoading(false)
    }

    loadReports()
  }, [profile?.hotel_id])

  // Build chart data
  const incomeByMonth: Record<string, number> = {}
  monthlyIncome.forEach(m => {
    const month = m.created_at?.slice(0, 7)
    if (month) incomeByMonth[month] = (incomeByMonth[month] ?? 0) + Number(m.amount)
  })
  const chartData = Object.entries(incomeByMonth).map(([m, total]) => {
    const [y, mn] = m.split('-')
    return { label: `${MONTHS[parseInt(mn) - 1]} ${y.slice(2)}`, income: total }
  })

  const totalIncome = monthlyIncome.reduce((s, m) => s + Number(m.amount), 0)
  const totalClosures = cashClosures.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Estadísticas y rendimiento del hotel.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-border p-6 h-32 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-primary mb-2">
                <BarChart3 size={18} />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Ingresos</span>
              </div>
              <p className="text-2xl font-bold text-foreground">S/ {totalIncome.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 6 meses</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Building2 size={18} />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Ocupación</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{occupancy}%</p>
              <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${occupancy}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Users size={18} />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Top Huéspedes</span>
              </div>
              <div className="space-y-1">
                {topGuests.map((g, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground truncate">{g.name}</span>
                    <span className="font-bold text-primary ml-2">{g.visits}</span>
                  </div>
                ))}
                {topGuests.length === 0 && <p className="text-xs text-muted-foreground">Sin datos</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <Receipt size={18} />
                <span className="text-xs font-semibold text-muted-foreground uppercase">Cierres de Caja</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalClosures}</p>
              <p className="text-xs text-muted-foreground mt-1">Histórico total</p>
            </div>
          </div>

          {/* Income Bar Chart with recharts */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" /> Ingresos Mensuales
            </h3>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin datos de ingresos</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Cash Closures Table */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Historial de Cierres de Caja
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Fecha</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Ingresos</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Egresos</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cashClosures.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-sm text-foreground">{c.date?.slice(0, 10)}</td>
                      <td className="px-5 py-3 text-sm text-green-600 font-medium">S/ {Number(c.total_income).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm text-red-500 font-medium">S/ {Number(c.total_expense).toFixed(2)}</td>
                      <td className="px-5 py-3 text-sm font-bold text-foreground">S/ {Number(c.balance).toFixed(2)}</td>
                    </tr>
                  ))}
                  {cashClosures.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">Sin cierres registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
