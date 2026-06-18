'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, CheckCircle, AlertTriangle, Clock, Shield, X, DollarSign, Zap } from 'lucide-react'
import { updateHotelPlan, getPlans } from './actions'
import { toast } from 'sonner'
import type { PlanConfig } from '@/lib/utils/plans'
import type { Hotel } from '@/types'
import { fmtDate } from '@/lib/utils/dates'

function getPlanStyle(name: string) {
  const isPro = name.startsWith('pro')
  return {
    icon: isPro ? Zap : DollarSign,
    gradient: isPro
      ? 'from-indigo-500 via-purple-500 to-pink-500'
      : 'from-emerald-400 via-emerald-500 to-teal-600',
    badge: isPro ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    shadow: isPro ? 'shadow-purple-200/50' : 'shadow-emerald-200/50',
    border: isPro ? 'border-indigo-200 hover:border-indigo-400' : 'border-emerald-200 hover:border-emerald-400',
  }
}

export default function PlansPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [plans, setPlans] = useState<PlanConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'upcoming'>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    const [plansRes, hotelsRes] = await Promise.all([
      getPlans(),
      supabase.from('hotels').select('*').order('plan_expires_at', { ascending: true }),
    ])
    setPlans(plansRes)
    if (hotelsRes.error) toast.error('Error al cargar suscripciones')
    else setHotels(hotelsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const getPlanConfig = (planId?: string) => plans.find(p => p.name === planId)

  const getStatusInfo = (expiryDate?: string) => {
    if (!expiryDate) return { label: 'Sin plan', color: 'text-gray-500 bg-gray-100', icon: Clock, type: 'expired' }
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24))
    if (diffDays < 0) return { label: 'Vencido', color: 'text-red-700 bg-red-100', icon: AlertTriangle, type: 'expired' }
    if (diffDays <= 15) return { label: 'Próx. a vencer', color: 'text-orange-700 bg-orange-100', icon: AlertTriangle, type: 'upcoming' }
    return { label: 'Activo', color: 'text-green-700 bg-green-100', icon: CheckCircle, type: 'active' }
  }

  const handleOpenModal = (hotel: Hotel) => { setSelectedHotel(hotel); setShowModal(true) }

  const handleSelectPlan = async (planName: string) => {
    if (!selectedHotel) return
    const res = await updateHotelPlan(selectedHotel.id, planName)
    if (res.error) toast.error('Error: ' + res.error)
    else {
      const plan = getPlanConfig(planName)
      toast.success(`Plan ${plan?.label ?? planName} asignado a ${selectedHotel.name}`)
      setShowModal(false)
      fetchData()
    }
  }

  const filteredHotels = hotels.filter((hotel) => {
    const status = getStatusInfo(hotel.plan_expires_at)
    if (filterType === 'expired') return status.type === 'expired'
    if (filterType === 'upcoming') return status.type === 'upcoming'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planes y Suscripciones</h1>
          <p className="text-gray-500">Controla el estado de las suscripciones de todos los hoteles.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
            <button onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                filterType === 'all' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`
              }>Todos</button>
            <button onClick={() => setFilterType('expired')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                filterType === 'expired' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`
              }>Vencidos</button>
            <button onClick={() => setFilterType('upcoming')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                filterType === 'upcoming' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`
              }>Próximos</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando planes...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hotel</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHotels.map((hotel) => {
                  const status = getStatusInfo(hotel.plan_expires_at)
                  const plan = getPlanConfig(hotel.plan)
                  return (
                    <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{hotel.name}</div>
                        <div className="text-xs text-gray-500">ID: {hotel.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getPlanStyle(hotel.plan || '').badge} border`}>
                          {plan?.label ?? hotel.plan ?? 'Sin plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {hotel.plan_expires_at ? fmtDate(hotel.plan_expires_at) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                          <status.icon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button onClick={() => handleOpenModal(hotel)}
                          className="inline-flex items-center gap-1.5 text-primary font-bold text-xs hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/20 cursor-pointer">
                          Cambiar plan
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {(!loading && filteredHotels.length === 0) && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron suscripciones en esta categoría.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Seleccionar Plan</h2>
                <p className="text-sm text-gray-500">{selectedHotel.name}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {plans.map((plan) => {
                const style = getPlanStyle(plan.name)
                const Icon = style.icon
                const isCurrent = selectedHotel.plan === plan.name
                const isPro = plan.name.startsWith('pro')
                return (
                  <button key={plan.name} onClick={() => handleSelectPlan(plan.name)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                      ${isCurrent
                        ? `border-${isPro ? 'indigo' : 'emerald'}-400 bg-gradient-to-br ${isPro ? 'from-indigo-50 to-purple-50' : 'from-emerald-50 to-teal-50'} shadow-lg`
                        : 'border-gray-200 bg-white hover:shadow-xl hover:-translate-y-0.5'
                      } ${style.shadow}`}>
                    {isCurrent && (
                      <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${style.badge} border`}>Actual</span>
                    )}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mb-4 shadow-lg ${style.shadow} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-lg font-extrabold text-gray-900 tracking-tight">{plan.label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">{plan.description}</div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">S/{plan.price}</span>
                      <span className="text-xs text-gray-400 ml-1">
                        /{plan.duration_days === 30 ? 'mes' : plan.duration_days === 90 ? 'trimestre' : plan.duration_days === 180 ? 'semestre' : 'año'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
