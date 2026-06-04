'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, TrendingUp, Users, Percent, BarChart3, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS, type PlanId } from '@/lib/utils/plans'
import { MetricCard } from '@/components/metrics/MetricCard'
import { GrowthChart } from '@/components/metrics/GrowthChart'
import { PlanPieChart } from '@/components/metrics/PlanPieChart'
import { StatusChart } from '@/components/metrics/StatusChart'

export default function MetricsPage() {
  const [data, setData] = useState({
    mrr: 0, totalUsers: 0, activeHotels: 0, suspendedHotels: 0, hotelsExpiringSoon: 0,
    plans: {} as Record<string, number>, monthlyGrowth: [] as { month: string; count: number }[],
  })
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: hotels, error: hotelsError } = await supabase.from('hotels').select('plan, status, created_at, plan_expires_at')
    if (hotelsError) { toast.error('Error al cargar métricas'); setLoading(false); return }

    const { count: usersCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    const active = hotels?.filter(h => h.status === 'active') || []
    const suspended = hotels?.filter(h => h.status === 'suspended') || []
    const now = new Date(); const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringSoon = active.filter(h => { if (!h.plan_expires_at) return false; const exp = new Date(h.plan_expires_at); return exp > now && exp <= in30Days })
    const calculatedMRR = active.reduce((total, hotel) => total + (PLANS[hotel.plan as PlanId]?.price ?? 0), 0)
    const plansCount: Record<string, number> = {}
    hotels?.forEach(h => { const name = PLANS[h.plan as PlanId]?.name ?? h.plan; plansCount[name] = (plansCount[name] || 0) + 1 })

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthlyData: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); monthlyData[`${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`] = 0 }
    hotels?.forEach(h => { const d = new Date(h.created_at); const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`; if (key in monthlyData) monthlyData[key]++ })
    let runningTotal = 0
    const monthlyGrowth = Object.entries(monthlyData).map(([month, count]) => { runningTotal += count; return { month, count: runningTotal } })

    setData({ mrr: calculatedMRR, totalUsers: usersCount || 0, activeHotels: active.length, suspendedHotels: suspended.length, hotelsExpiringSoon: expiringSoon.length, plans: plansCount, monthlyGrowth })
    setLoading(false)
  }

  useEffect(() => { fetchMetrics() }, [])

  const avgRevenue = data.activeHotels > 0 ? data.mrr / data.activeHotels : 0
  const churnRate = data.activeHotels + data.suspendedHotels > 0 ? ((data.suspendedHotels / (data.activeHotels + data.suspendedHotels)) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas del Negocio</h1>
        <p className="text-gray-500">Analiza el crecimiento y rendimiento financiero de HControl.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="MRR (Mensual)" value={`S/ ${data.mrr.toLocaleString()}`} icon={DollarSign} trend="Calculado" trendUp color="text-green-600" bg="bg-green-50" />
        <MetricCard label="Ingreso Promedio x Hotel" value={`S/ ${avgRevenue.toLocaleString()}`} icon={TrendingUp} trend="Por hotel activo" trendUp color="text-primary" bg="bg-primary/10" />
        <MetricCard label="Usuarios Totales" value={data.totalUsers.toLocaleString()} icon={Users} trend="Incluye admins" trendUp color="text-purple-600" bg="bg-purple-50" />
        <MetricCard label="Churn Rate" value={`${churnRate}%`} icon={Percent} trend={`${data.suspendedHotels} hotel(es) suspendido(s)`} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Crecimiento de Hoteles</h3>
            <p className="text-sm text-gray-500">Número acumulativo de hoteles registrados (últimos 6 meses).</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {loading ? <div className="text-gray-500">Cargando...</div> : <GrowthChart data={data.monthlyGrowth} />}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-500" /> Distribución de Planes</h3>
            <p className="text-sm text-gray-500">Planes contratados por los hoteles activos.</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? <div className="text-gray-500">Cargando...</div> : <PlanPieChart plans={data.plans} />}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Estado Operativo de Hoteles</h3>
            <p className="text-sm text-gray-500">Relación de hoteles activos, suspendidos y próximos a vencer.</p>
          </div>
          {loading ? <div className="text-gray-500 text-center py-6">Cargando...</div> : <StatusChart activeHotels={data.activeHotels} suspendedHotels={data.suspendedHotels} expiringSoon={data.hotelsExpiringSoon} />}
        </div>
      </div>
    </div>
  )
}
