'use client'

import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { fmtDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { fetchReservations, updateReservationStatus, deleteReservation } from './actions'
import { ReservationForm } from '@/components/reservations/ReservationForm'

type Reservation = {
  id: string; room_id: string; guest_id: string; check_in_date: string; check_out_date: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number; notes?: string
  rooms: { number: string } | null; guests: { full_name: string } | null
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-primary/20 text-primary border-primary/30',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}
const statusLabel: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada',
}

export default function ReservationsPage() {
  const { profile } = useUser()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchList = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    try { const data = await fetchReservations(profile.hotel_id); setReservations(data as any || []) }
    catch { toast.error('Error al cargar reservas') }
    setLoading(false)
  }

  useEffect(() => { fetchList() }, [profile?.hotel_id])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try { await updateReservationStatus(id, newStatus); toast.success(`Reserva ${newStatus === 'cancelled' ? 'cancelada' : 'confirmada'}`); fetchList() }
    catch (e: any) { toast.error('Error al actualizar estado: ' + e.message) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva?')) return
    try { await deleteReservation(id); toast.success('Reserva eliminada'); fetchList() }
    catch (e: any) { toast.error('Error al eliminar reserva: ' + e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 font-medium">Gestiona el calendario de futuras estadías y reservas.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
          <CalendarIcon size={18} /> {showForm ? 'Cerrar' : 'Nueva reserva'}
        </button>
      </div>

      {showForm && <ReservationForm hotelId={profile?.hotel_id!} onCreated={() => { setShowForm(false); fetchList() }} onCancel={() => setShowForm(false)} />}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-36" /><div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-24" /><div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" /><div className="h-6 bg-gray-200 rounded-full w-24" /><div className="h-4 bg-gray-200 rounded w-16 ml-auto" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Huésped</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Habitación</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Check-in</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Check-out</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 uppercase text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{r.guests?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">Hab. {r.rooms?.number ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{fmtDate(r.check_in_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{fmtDate(r.check_out_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">S/. {r.total_price?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${statusBadge[r.status]}`}>{statusLabel[r.status]}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'pending' && (
                          <button onClick={() => handleUpdateStatus(r.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-50 border border-green-100 rounded cursor-pointer" title="Confirmar Reserva">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {r.status !== 'cancelled' && r.status !== 'completed' && (
                          <button onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                            className="p-1 text-orange-600 hover:bg-orange-50 border border-orange-100 rounded cursor-pointer" title="Cancelar Reserva">
                            <XCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)}
                          className="p-1 text-red-600 hover:bg-red-50 border border-red-100 rounded cursor-pointer" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!loading && reservations.length === 0) && <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No hay reservas registradas.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
