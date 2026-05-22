'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, CheckCircle, AlertTriangle, Clock, Shield, Zap, Star, Crown, Sparkles, X } from 'lucide-react'
import { updateHotelPlan } from './actions'
import { toast } from 'sonner'
import { PLANS, type PlanId } from '@/lib/utils/plans'
import type { Hotel } from '@/types'
import { fmtDate } from '@/lib/utils/dates'

const planIcons: Record<PlanId, typeof Shield> = {
  prueba: Clock,
  mensual: Zap,
  trimestral: Star,
  semestral: Crown,
  anual: Sparkles,
}

const planColors: Record<PlanId, string> = {
  prueba: 'from-gray-400 to-gray-500',
  mensual: 'from-blue-400 to-blue-600',
  trimestral: 'from-indigo-400 to-indigo-600',
  semestral: 'from-violet-400 to-violet-600',
  anual: 'from-amber-400 to-orange-500',
}

export default function PlansPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'upcoming'>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  const fetchHotels = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('plan_expires_at', { ascending: true })

    if (error) {
      toast.error('Error al cargar suscripciones')
    } else {
      setHotels(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchHotels() }, [])

  const getStatusInfo = (expiryDate?: string) => {
    if (!expiryDate) return { label: 'Sin plan', color: 'text-gray-500 bg-gray-100', icon: Clock, type: 'expired' }
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24))

    if (diffDays < 0) return { label: 'Vencido', color: 'text-red-700 bg-red-100', icon: AlertTriangle, type: 'expired' }
    if (diffDays <= 15) return { label: 'Próx. a vencer', color: 'text-orange-700 bg-orange-100', icon: AlertTriangle, type: 'upcoming' }
    return { label: 'Activo', color: 'text-green-700 bg-green-100', icon: CheckCircle, type: 'active' }
  }

  const handleOpenModal = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setShowModal(true)
  }

  const handleSelectPlan = async (planId: PlanId) => {
    if (!selectedHotel) return
    const res = await updateHotelPlan(selectedHotel.id, planId)
    if (res.error) {
      toast.error('Error: ' + res.error)
    } else {
      toast.success(`Plan ${PLANS[planId].name} asignado a ${selectedHotel.name}`)
      setShowModal(false)
      fetchHotels()
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
                  return (
                    <tr key={hotel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{hotel.name}</div>
                        <div className="text-xs text-gray-500">ID: {hotel.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${planColors[hotel.plan as PlanId] || 'from-gray-400 to-gray-500'}`}>
                          {hotel.plan ? PLANS[hotel.plan as PlanId]?.name ?? hotel.plan : 'Sin plan'}
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
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron suscripciones en esta categoría.
                    </td>
                  </tr>
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

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([id, plan]) => {
                const Icon = planIcons[id]
                const isCurrent = selectedHotel.plan === id
                return (
                  <button key={id} onClick={() => handleSelectPlan(id)}
                    className={`relative text-left p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                      isCurrent ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-primary/40'
                    }`}>
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-xs font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${planColors[id]} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-base font-bold text-gray-900">{plan.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{plan.description}</div>
                    <div className="mt-3 flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-2xl font-bold text-gray-900">Gratis</span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-gray-900">S/{plan.price}</span>
                          <span className="text-sm text-gray-500">/mes</span>
                        </>
                      )}
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
