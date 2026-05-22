'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { BedDouble, LogIn, LogOut, DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'
import { localDate, tzOffset, fmtDate } from '@/lib/utils/dates'
import KpiCard from '@/components/charts/KpiCard'
import IncomeChart from '@/components/charts/IncomeChart'
import OccupancyChart from '@/components/charts/OccupancyChart'

interface Room { id: string; number: string; floor?: number; status: string; type: string; price_per_night: number }

export default function DashboardPage() {
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ free: 0, occupied: 0, cleaning: 0, maintenance: 0, todayCheckins: 0, todayCheckouts: 0, todayIncome: 0, todayExpense: 0, activeGuests: 0, weekIncome: 0, yesterdayIncome: 0, yesterdayCheckins: 0, yesterdayCheckouts: 0 })
  const [rooms, setRooms] = useState<Room[]>([])
  const [incomeData, setIncomeData] = useState<{ label: string; income: number; expense: number }[]>([])

  const loadDashboard = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    const supabase = createClient()
    const hid = profile.hotel_id
    const today = localDate()
    const todayStart = `${today}T00:00:00${tzOffset()}`
    const todayEnd = `${today}T23:59:59${tzOffset()}`

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
    const yStart = `${yStr}T00:00:00${tzOffset()}`
    const yEnd = `${yStr}T23:59:59${tzOffset()}`

    const [roomsRes, checkinsToday, checkoutsToday, checkinsYest, checkoutsYest, incomeToday, expenseToday, incomeYest, activeGuests] = await Promise.all([
      supabase.from('rooms').select('*').eq('hotel_id', hid).order('number'),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hid).gte('check_in_at', todayStart).lte('check_in_at', todayEnd),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hid).gte('check_out_at', todayStart).lte('check_out_at', todayEnd).eq('status', 'checked_out'),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hid).gte('check_in_at', yStart).lte('check_in_at', yEnd),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hid).gte('check_out_at', yStart).lte('check_out_at', yEnd).eq('status', 'checked_out'),
      supabase.from('cash_movements').select('amount').eq('hotel_id', hid).eq('type', 'income').gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('cash_movements').select('amount').eq('hotel_id', hid).eq('type', 'expense').gte('created_at', todayStart).lte('created_at', todayEnd),
      supabase.from('cash_movements').select('amount').eq('hotel_id', hid).eq('type', 'income').gte('created_at', yStart).lte('created_at', yEnd),
      supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hid).eq('status', 'active'),
    ])

    const roomList = roomsRes.data || []
    setRooms(roomList)
    const stateCounts = { free: 0, occupied: 0, cleaning: 0, maintenance: 0 }
    roomList.forEach(r => { if (r.status === 'available') stateCounts.free++; else if (r.status === 'occupied') stateCounts.occupied++; else if (r.status === 'cleaning') stateCounts.cleaning++; else if (r.status === 'maintenance') stateCounts.maintenance++ })

    const sum = (arr: { amount: number }[] | null) => arr?.reduce((s, m) => s + Number(m.amount), 0) ?? 0

    setStats({
      ...stateCounts,
      todayCheckins: checkinsToday.count ?? 0,
      todayCheckouts: checkoutsToday.count ?? 0,
      todayIncome: sum(incomeToday.data),
      todayExpense: sum(expenseToday.data),
      activeGuests: activeGuests.count ?? 0,
      weekIncome: 0,
      yesterdayIncome: sum(incomeYest.data),
      yesterdayCheckins: checkinsYest.count ?? 0,
      yesterdayCheckouts: checkoutsYest.count ?? 0,
    })

    // 7-day income data
    const chartData: { label: string; income: number; expense: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
      const dsStart = `${ds}T00:00:00${tzOffset()}`
      const dsEnd = `${ds}T23:59:59${tzOffset()}`
      const [inc, exp] = await Promise.all([
        supabase.from('cash_movements').select('amount').eq('hotel_id', hid).eq('type', 'income').gte('created_at', dsStart).lte('created_at', dsEnd),
        supabase.from('cash_movements').select('amount').eq('hotel_id', hid).eq('type', 'expense').gte('created_at', dsStart).lte('created_at', dsEnd),
      ])
      const dayLabel = d.toLocaleDateString('es-PE', { weekday: 'short', timeZone: 'America/Lima' })
      chartData.push({ label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3), income: sum(inc.data), expense: sum(exp.data) })
    }
    setIncomeData(chartData)
    setLoading(false)
  }

  useEffect(() => { loadDashboard() }, [profile?.hotel_id])

  const trendDir = (curr: number, prev: number) => curr > prev ? 'up' : curr < prev ? 'down' : 'neutral'
  const pct = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? '+100%' : '0%') : `${((curr - prev) / prev * 100).toFixed(0)}%`
  const trendLabel = (curr: number, prev: string) => `${pct(curr, Number(prev))} vs ayer`

  const roomsByFloor = rooms.reduce<Record<number, Room[]>>((acc, room) => {
    const f = room.floor || 1; if (!acc[f]) acc[f] = []; acc[f].push(room); return acc
  }, {})

  return (
    <div className="space-y-6">
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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Libres" value={String(stats.free)} icon={BedDouble} color="green" />
            <KpiCard title="Ocupadas" value={String(stats.occupied)} icon={BedDouble} color="red" />
            <KpiCard title="Huéspedes" value={String(stats.activeGuests)} icon={Users} color="primary" />
            <KpiCard title="Ingresos hoy" value={`S/ ${stats.todayIncome.toFixed(2)}`} icon={DollarSign} color="primary"
              trend={trendDir(stats.todayIncome, stats.yesterdayIncome)} trendLabel={trendLabel(stats.todayIncome, String(stats.yesterdayIncome))} />
          </div>

          {/* Operations Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Check-ins hoy" value={String(stats.todayCheckins)} icon={LogIn} color="green"
              trend={trendDir(stats.todayCheckins, stats.yesterdayCheckins)} trendLabel={trendLabel(stats.todayCheckins, String(stats.yesterdayCheckins))} />
            <KpiCard title="Check-outs hoy" value={String(stats.todayCheckouts)} icon={LogOut} color="amber"
              trend={trendDir(stats.todayCheckouts, stats.yesterdayCheckouts)} trendLabel={trendLabel(stats.todayCheckouts, String(stats.yesterdayCheckouts))} />
            <KpiCard title="Gastos hoy" value={`S/ ${stats.todayExpense.toFixed(2)}`} icon={DollarSign} color="red" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeChart data={incomeData} title="Últimos 7 días — Ingresos vs Egresos" />
            <OccupancyChart data={{ available: stats.free, occupied: stats.occupied, cleaning: stats.cleaning, maintenance: stats.maintenance }} />
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Resumen del día</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Ocupación</p>
                <p className="text-lg font-bold text-foreground">{rooms.length ? Math.round(stats.occupied / rooms.length * 100) : 0}%</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Check-ins hoy</p>
                <p className="text-lg font-bold text-foreground">{stats.todayCheckins} {stats.todayCheckins > stats.yesterdayCheckins ? '📈' : stats.todayCheckins < stats.yesterdayCheckins ? '📉' : '➡️'}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Balance</p>
                <p className={`text-lg font-bold ${stats.todayIncome - stats.todayExpense >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  S/ {(stats.todayIncome - stats.todayExpense).toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Habitaciones libres</p>
                <p className="text-lg font-bold text-foreground">{stats.free} / {rooms.length}</p>
              </div>
            </div>
          </div>

          {/* Room Map */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground">Mapa de Habitaciones</h2>
              <div className="flex gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> Libre</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Ocupada</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500" /> Limpieza</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-500" /> Mant.</span>
              </div>
            </div>
            {rooms.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No hay habitaciones registradas.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(roomsByFloor).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorRooms]) => (
                  <div key={floor} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <h3 className="text-sm font-bold text-foreground mb-3">Piso {floor}</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {floorRooms.map(room => {
                        const sc = room.status === 'available' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          room.status === 'occupied' ? 'bg-red-500 hover:bg-red-600 text-white' :
                          room.status === 'cleaning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'
                        return (
                          <div key={room.id} title={`Hab ${room.number} - ${room.status}`}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer shadow-sm ${sc}`}>
                            <span className="text-sm font-bold">{room.number}</span>
                            <span className="text-[8px] uppercase tracking-wider opacity-90">{room.type.substring(0, 3)}</span>
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
