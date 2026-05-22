'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, CheckCircle2, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { fmtDate } from '@/lib/utils/dates'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, newThisMonth: 0 })
  const [recentHotels, setRecentHotels] = useState<any[]>([])
  const [growthData, setGrowthData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: hotels, error } = await supabase
      .from('hotels').select('id, status, created_at, name, city, plan')
      .order('created_at', { ascending: false })

    if (error) { toast.error('Error al cargar datos'); setLoading(false); return }

    const total = hotels?.length || 0
    const active = hotels?.filter(h => h.status === 'active').length || 0
    const suspended = hotels?.filter(h => h.status === 'suspended').length || 0
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
    const newThisMonth = hotels?.filter(h => new Date(h.created_at) >= startOfMonth).length || 0
    setStats({ total, active, suspended, newThisMonth })
    setRecentHotels(hotels?.slice(0, 5) || [])

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthlyData: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      monthlyData[`${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`] = 0
    }
    hotels?.forEach(h => {
      const d = new Date(h.created_at)
      const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`
      if (key in monthlyData) monthlyData[key]++
    })
    let runningTotal = 0
    setGrowthData(Object.entries(monthlyData).map(([month, count]) => { runningTotal += count; return { month, hoteles: runningTotal } }))
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const statCards = [
    { label: 'Total Hoteles', value: stats.total, icon: Building2, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%', trendType: 'up' },
    { label: 'Hoteles Activos', value: stats.active, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', trend: '+8%', trendType: 'up' },
    { label: 'Suspendidos', value: stats.suspended, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', trend: '-2%', trendType: 'down' },
    { label: 'Nuevos (Mes)', value: stats.newThisMonth, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%', trendType: 'up' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
        <p className="text-muted-foreground">Bienvenido al centro de gestión de SControl.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-lg`}><stat.icon className="w-6 h-6" /></div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend} {stat.trendType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-foreground mt-1">{loading ? '...' : stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary" /> Crecimiento de Suscriptores
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Hoteles totales registrados (últimos 6 meses).</p>
          <div className="h-52">
            {loading ? <div className="text-center py-12 text-muted-foreground text-sm">Cargando...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="hoteles" stroke="var(--primary)" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 4, fill: 'var(--primary)' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Config */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Configuración Rápida</h3>
            <p className="text-xs text-muted-foreground mb-4">Acciones directas de administración general.</p>
            <div className="space-y-2">
              <Link href="/admin/hotels" className="block text-center text-xs font-semibold bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-colors">
                Gestionar Hoteles
              </Link>
              <Link href="/admin/users" className="block text-center text-xs font-semibold border border-border text-foreground py-2 rounded-lg hover:bg-muted transition-colors">
                Listado de Usuarios
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Hotels */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Hoteles Recientes</h2>
            <Link href="/admin/hotels" className="text-sm text-primary font-medium hover:underline">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Hotel</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Ciudad</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Plan</th>
                  <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-foreground">{hotel.name}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(hotel.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{hotel.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">{hotel.plan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hotel.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {hotel.status === 'active' ? 'activo' : 'suspendido'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentHotels.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">No hay hoteles registrados recientemente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
