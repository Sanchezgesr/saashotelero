'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { BedDouble, LogIn, LogOut, DollarSign, TrendingUp, Users, Receipt, Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { fmtDate, fmtDateTime } from '@/lib/utils/dates'
import KpiCard from '@/components/charts/KpiCard'
import IncomeChart from '@/components/charts/IncomeChart'
import OccupancyChart from '@/components/charts/OccupancyChart'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts'
import type { Room } from '@/types'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

interface DashboardData {
  rooms: Room[]
  free: number
  occupied: number
  cleaning: number
  maintenance: number
  todayCheckins: number
  todayCheckouts: number
  yesterdayCheckins: number
  yesterdayCheckouts: number
  todayIncome: number
  todayExpense: number
  yesterdayIncome: number
  activeGuests: number
  weekly: { date: string; income: number; expense: number }[]
}

const ROOM_TYPE_COLORS: Record<string, string> = {
  simple: '#16a34a', doble: '#2563eb', triple: '#d97706',
  matrimonial: '#dc2626', familiar: '#7c3aed', suite: '#0891b2',
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  simple: 'Simple', doble: 'Doble', triple: 'Triple',
  matrimonial: 'Matrimonial', familiar: 'Familiar', suite: 'Suite',
}

export default function DashboardPage() {
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [prevWeek, setPrevWeek] = useState<{ label: string; income: number; expense: number }[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false)

  const loadDashboard = async () => {
    if (!profile?.hotel_id) {
      setLoading(false)
      return
    }
    setLoading(true)
    const supabase = createClient()
    const hotelId = profile.hotel_id

    const [{ data: result, error }, { data: checkins }, { data: prevMonthMovs }] = await Promise.all([
      supabase.rpc('get_dashboard_data', { p_hotel_id: hotelId }),
      supabase.from('checkins')
        .select('*, guests(full_name), rooms(number)')
        .eq('hotel_id', hotelId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('cash_movements')
        .select('created_at, amount, type')
        .eq('hotel_id', hotelId)
        .gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString())
        .lt('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ])

    if (error) {
      toast.error('Error al cargar dashboard: ' + error.message)
    } else if (result && typeof result === 'object' && 'error' in result) {
      toast.error((result as any).error)
    } else if (result) {
      setData(result as unknown as DashboardData)
    }

    const { data: hotelCheck } = await supabase.from('hotels').select('onboarding_completed, ruc').eq('id', hotelId).single()
    if (hotelCheck && !hotelCheck.onboarding_completed) {
      setOnboardingIncomplete(true)
    }

    setRecentCheckins((checkins ?? []) as any[])

    if (prevMonthMovs) {
      const weekdays: Record<string, string> = { Mon: 'Lun', Tue: 'Mar', Wed: 'Mié', Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb', Sun: 'Dom' }
      const grouped: Record<string, { income: number; expense: number }> = {}
      for (const m of prevMonthMovs as any[]) {
        const date = new Date(m.created_at)
        const dayKey = date.toISOString().split('T')[0]
        if (!grouped[dayKey]) grouped[dayKey] = { income: 0, expense: 0 }
        if (m.type === 'income') grouped[dayKey].income += Number(m.amount)
        else grouped[dayKey].expense += Number(m.amount)
      }
      const prevWeekData = Object.entries(grouped).map(([date, vals]) => {
        const enDay = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
        return { label: weekdays[enDay] ?? enDay.slice(0, 3), income: vals.income, expense: vals.expense }
      })
      setPrevWeek(prevWeekData)
    }

    setLoading(false)
  }

  useEffect(() => { loadDashboard() }, [profile?.hotel_id])

  const stats = data ?? {
    free: 0, occupied: 0, cleaning: 0, maintenance: 0,
    todayCheckins: 0, todayCheckouts: 0,
    todayIncome: 0, todayExpense: 0,
    activeGuests: 0, yesterdayIncome: 0,
    yesterdayCheckins: 0, yesterdayCheckouts: 0,
  }

  const rooms = data?.rooms ?? []

  const incomeData = useMemo(() => {
    if (!data?.weekly) return []
    const weekdays: Record<string, string> = { Mon: 'Lun', Tue: 'Mar', Wed: 'Mié', Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb', Sun: 'Dom' }
    return data.weekly.map((d) => {
      const date = new Date(d.date + 'T12:00:00')
      const enDay = date.toLocaleDateString('en-US', { weekday: 'short' })
      return { label: weekdays[enDay] ?? enDay.slice(0, 3), income: d.income, expense: d.expense }
    })
  }, [data?.weekly])

  const roomsByFloor = useMemo(() => {
    return rooms.reduce<Record<number, Room[]>>((acc, room) => {
      const f = room.floor || 1
      if (!acc[f]) acc[f] = []
      acc[f].push(room)
      return acc
    }, {})
  }, [rooms])

  const roomsByType = useMemo(() => {
    const counts: Record<string, { total: number; occupied: number }> = {}
    for (const room of rooms) {
      const t = room.type || 'simple'
      if (!counts[t]) counts[t] = { total: 0, occupied: 0 }
      counts[t].total++
      if (room.status === 'occupied') counts[t].occupied++
    }
    return Object.entries(counts).map(([type, data]) => ({
      name: ROOM_TYPE_LABELS[type] || type,
      value: data.total,
      occupied: data.occupied,
      fill: ROOM_TYPE_COLORS[type] || '#6b7280',
    }))
  }, [rooms])

  const revPAR = useMemo(() => {
    if (!rooms.length) return 0
    const totalRooms = rooms.length
    const totalIncome = data?.todayIncome ?? 0
    return totalRooms > 0 ? totalIncome / totalRooms : 0
  }, [rooms, data?.todayIncome])

  const trendDir = (curr: number, prev: number) => curr > prev ? 'up' : curr < prev ? 'down' : 'neutral'
  const pct = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? '+100%' : '0%') : `${((curr - prev) / prev * 100).toFixed(0)}%`
  const trendLabel = (curr: number, prev: number) => `${pct(curr, prev)} vs ayer`

  return (
    <div className="space-y-6">
      {onboardingIncomplete && !showOnboarding && (
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Rocket size={24} className="shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">Configuración inicial pendiente</h3>
                <p className="text-sm text-white/80 mt-1">Completa los datos de tu hotel, token SUNAT y crea tu primer recepcionista.</p>
              </div>
            </div>
            <button onClick={() => setShowOnboarding(true)}
              className="shrink-0 bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
              Configurar ahora
            </button>
          </div>
        </div>
      )}

      {showOnboarding && <OnboardingWizard onComplete={() => { setShowOnboarding(false); setOnboardingIncomplete(false) }} />}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel del Hotel</h1>
        <p className="text-muted-foreground">{fmtDate(new Date())} — Resumen operativo diario</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-border p-5 h-28 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Libres" value={String(stats.free)} icon={BedDouble} color="green" />
            <KpiCard title="Ocupadas" value={String(stats.occupied)} icon={BedDouble} color="red" />
            <KpiCard title="Huéspedes" value={String(stats.activeGuests)} icon={Users} color="primary" />
            <KpiCard title="Ingresos hoy" value={`S/ ${stats.todayIncome.toFixed(2)}`} icon={DollarSign} color="primary"
              trend={trendDir(stats.todayIncome, stats.yesterdayIncome)} trendLabel={trendLabel(stats.todayIncome, stats.yesterdayIncome)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Check-ins hoy" value={String(stats.todayCheckins)} icon={LogIn} color="green"
              trend={trendDir(stats.todayCheckins, stats.yesterdayCheckins)} trendLabel={trendLabel(stats.todayCheckins, stats.yesterdayCheckins)} />
            <KpiCard title="Check-outs hoy" value={String(stats.todayCheckouts)} icon={LogOut} color="amber"
              trend={trendDir(stats.todayCheckouts, stats.yesterdayCheckouts)} trendLabel={trendLabel(stats.todayCheckouts, stats.yesterdayCheckouts)} />
            <KpiCard title="Gastos hoy" value={`S/ ${stats.todayExpense.toFixed(2)}`} icon={DollarSign} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeChart data={incomeData} title="Últimos 7 días — Ingresos vs Egresos" />
            <OccupancyChart data={{ available: stats.free, occupied: stats.occupied, cleaning: stats.cleaning, maintenance: stats.maintenance }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Resumen del día</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Ocupación</p>
                  <p className="text-lg font-bold text-foreground">{rooms.length ? Math.round(stats.occupied / rooms.length * 100) : 0}%</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Check-ins hoy</p>
                  <p className="text-lg font-bold text-foreground">{stats.todayCheckins}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">RevPAR</p>
                  <p className="text-lg font-bold text-foreground">S/ {revPAR.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Habitaciones libres</p>
                  <p className="text-lg font-bold text-foreground">{stats.free} / {rooms.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Habitaciones por tipo</h3>
              {roomsByType.every(d => d.value === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={roomsByType} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">
                        {roomsByType.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5">
                    {roomsByType.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="font-bold text-foreground">{d.value}</span>
                        {d.occupied > 0 && <span className="text-red-500">({d.occupied} occ.)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {prevWeek.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4">Semana anterior — Ingresos vs Egresos</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={prevWeek} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="income" name="Ingresos" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Egresos" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {recentCheckins.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Últimos check-ins</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Huésped</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Habitación</th>
                      <th className="text-left py-2 px-2 text-muted-foreground font-medium">Check-in</th>
                      <th className="text-right py-2 px-2 text-muted-foreground font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCheckins.map((c: any) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium">{c.guests?.full_name || '—'}</td>
                        <td className="py-2 px-2 text-muted-foreground">{c.rooms?.number || '—'}</td>
                        <td className="py-2 px-2 text-muted-foreground">{fmtDateTime(c.check_in_at)}</td>
                        <td className="py-2 px-2 text-right font-semibold">S/ {Number(c.total_price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Mapa de Habitaciones</h2>
              <div className="flex gap-2 md:gap-3 text-[11px] md:text-xs font-semibold">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> Libre</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> Ocupada</span>
                <span className="hidden sm:flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> Limpieza</span>
                <span className="hidden sm:flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-500" /> Mant.</span>
              </div>
            </div>
            {rooms.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No hay habitaciones registradas.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(roomsByFloor).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
                  <div key={floor} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <h3 className="text-sm font-bold text-foreground mb-3">Piso {floor}</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 md:gap-2">
                      {floorRooms.map(room => {
                        const sc = room.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          room.status === 'occupied' ? 'bg-red-500 hover:bg-red-600 text-white' :
                          room.status === 'cleaning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
                        return (
                          <div key={room.id} title={`Hab ${room.number} - ${room.status}`}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer shadow-sm ${sc}`}>
                            <span className="text-sm font-bold">{room.number}</span>
                            <span className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-90">{room.type.substring(0, 3)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
