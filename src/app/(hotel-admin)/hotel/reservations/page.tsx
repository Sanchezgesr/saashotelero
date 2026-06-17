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
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Reservas</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gestiona el calendario de futuras estadías y reservas.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
          <CalendarIcon size={16} /> {showForm ? 'Cerrar' : 'Nueva'}
        </button>
      </div>

      {showForm && <ReservationForm hotelId={profile?.hotel_id!} onCreated={() => { setShowForm(false); fetchList() }} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-36 mb-2" />
              <div className="h-3 bg-muted rounded w-24 mb-2" />
              <div className="h-3 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay reservas registradas.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Huésped</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Habitación</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Check-in</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Check-out</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Total</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs">Estado</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground uppercase text-xs text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">{r.guests?.full_name ?? '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">Hab. {r.rooms?.number ?? '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{fmtDate(r.check_in_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{fmtDate(r.check_out_date)}</td>
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{r.guests?.full_name ?? '—'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge[r.status]}`}>{statusLabel[r.status]}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Hab. {r.rooms?.number ?? '—'}</span>
                  <span className="text-right font-bold text-primary">S/. {r.total_price?.toFixed(2)}</span>
                  <span>Entrada: {fmtDate(r.check_in_date)}</span>
                  <span className="text-right">Salida: {fmtDate(r.check_out_date)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {r.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'confirmed')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg border border-green-200 cursor-pointer">
                      <CheckCircle size={12} /> Confirmar
                    </button>
                  )}
                  {r.status !== 'cancelled' && r.status !== 'completed' && (
                    <button onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg border border-orange-200 cursor-pointer">
                      <XCircle size={12} /> Cancelar
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    className="p-2.5 text-red-600 bg-red-50 rounded-lg border border-red-200 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
