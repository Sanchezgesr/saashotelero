'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Room } from '@/types'
import { markRoomAvailable } from '@/lib/supabase/checkin-actions'
import { fetchUpcomingReservations } from './actions'
import { fmtDate } from '@/lib/utils/dates'
import { RoomForm } from '@/components/rooms/RoomForm'
import { ReservationDetailModal } from '@/components/rooms/ReservationDetailModal'
import { CheckinModal } from '@/components/rooms/CheckinModal'
import { CheckoutModal } from '@/components/rooms/CheckoutModal'

const statusColors: Record<string, string> = {
  available: 'bg-green-500', occupied: 'bg-red-500', cleaning: 'bg-blue-500', maintenance: 'bg-yellow-500',
}

const statusBgColors: Record<string, string> = {
  available: 'bg-green-50', occupied: 'bg-red-50', cleaning: 'bg-blue-50', maintenance: 'bg-yellow-50',
}

const statusBorderColors: Record<string, string> = {
  available: 'border-green-300', occupied: 'border-red-300', cleaning: 'border-blue-300', maintenance: 'border-yellow-300',
}

const statusBorderHover: Record<string, string> = {
  available: 'hover:border-green-500', occupied: 'hover:border-red-500', cleaning: 'hover:border-blue-500', maintenance: 'hover:border-yellow-500',
}

const statusLabels: Record<string, string> = {
  available: 'Disponible', occupied: 'Ocupada', cleaning: 'Limpieza', maintenance: 'Mantenimiento',
}

export default function RoomsPage() {
  const { profile } = useUser()
  const [rooms, setRooms] = useState<Room[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkinRoom, setCheckinRoom] = useState<Room | null>(null)
  const [checkoutRoom, setCheckoutRoom] = useState<Room | null>(null)
  const [activeCheckin, setActiveCheckin] = useState<any>(null)
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const allStatuses = ['available', 'occupied', 'cleaning', 'maintenance']

  const filteredRooms = selectedFilter ? rooms.filter(r => r.status === selectedFilter) : rooms
  const floors = [...new Set(filteredRooms.map(r => r.floor).filter(f => f != null))].sort()

  const handleDeleteReservation = async (e: React.MouseEvent, resId: string) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta reserva?')) return
    try {
      const { deleteReservation } = await import('@/app/(hotel-admin)/hotel/reservations/actions')
      await deleteReservation(resId)
      toast.success('Reserva eliminada')
      fetchRooms()
    } catch { toast.error('Error al eliminar reserva') }
  }

  const fetchRooms = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    try {
      const { data: dbRooms, error } = await createClient()
        .from('rooms').select('*').eq('hotel_id', profile.hotel_id).order('floor').order('number')
      if (error) throw error
      setRooms((dbRooms || []) as any)
      setLoading(false)

      const [checkinsRes, upcoming] = await Promise.all([
        createClient().from('checkins').select('*, guests(full_name)').eq('hotel_id', profile.hotel_id).eq('status', 'active'),
        fetchUpcomingReservations(profile.hotel_id),
      ])
      setRooms((dbRooms || []).map((room: any) => ({
        ...room, activeCheckin: checkinsRes.data?.find((c: any) => c.room_id === room.id) || null,
      })) as any)
      setUpcomingReservations(upcoming)
    } catch { toast.error('Error al cargar habitaciones'); setLoading(false) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRooms() }, [profile?.hotel_id])

  const handleDelete = async (roomId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta habitación?')) return
    const { error } = await createClient().from('rooms').delete().eq('id', roomId)
    if (error) toast.error('Error al eliminar: ' + error.message)
    else { toast.success('Habitación eliminada'); fetchRooms() }
  }

  const handleRoomClick = async (room: Room) => {
    if (room.status === 'available') { setCheckinRoom(room) }
    else if (room.status === 'occupied') {
      const { data } = await createClient()
        .from('checkins').select('*, guests(full_name, dni, phone), rooms(number, type, price_per_night)')
        .eq('room_id', room.id).eq('status', 'active').single()
      if (data) { setActiveCheckin(data); setCheckoutRoom(room) }
      else toast.error('No se encontró check-in activo para esta habitación')
    } else if (room.status === 'cleaning') {
      if (confirm('¿Marcar habitación ' + room.number + ' como disponible?')) {
        await markRoomAvailable(room.id, profile?.hotel_id)
        toast.success('Habitación disponible'); fetchRooms()
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habitaciones</h1>
          <p className="text-muted-foreground">Registra y gestiona los tipos de habitación y sus estados.</p>
        </div>
        <button onClick={() => { setEditingRoom(null); setShowForm(!showForm) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
          <Plus size={18} /> {showForm && !editingRoom ? 'Cerrar' : 'Nueva habitación'}
        </button>
      </div>

      {showForm && (
        editingRoom ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowForm(false); setEditingRoom(null) }}>
            <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <RoomForm hotelId={profile?.hotel_id!} editingRoom={editingRoom}
                onCreated={() => { setShowForm(false); setEditingRoom(null); fetchRooms() }}
                onCancel={() => { setShowForm(false); setEditingRoom(null) }} />
            </div>
          </div>
        ) : (
          <RoomForm hotelId={profile?.hotel_id!} editingRoom={editingRoom}
            onCreated={() => { setShowForm(false); setEditingRoom(null); fetchRooms() }}
            onCancel={() => { setShowForm(false); setEditingRoom(null) }} />
        )
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-muted rounded w-20" /><div className="w-3 h-3 bg-muted rounded-full" />
              </div>
              <div className="h-3 bg-muted rounded w-16 mb-2" /><div className="h-3 bg-muted rounded w-12 mb-2" />
              <div className="h-3 bg-muted rounded w-24 mb-4" /><div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                selectedFilter === null ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'
              }`}>Todas</button>
            {allStatuses.map((s) => (
              <button key={s} onClick={() => setSelectedFilter(selectedFilter === s ? null : s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedFilter === s
                    ? s === 'available' ? 'bg-green-600 text-white border-green-600'
                    : s === 'occupied' ? 'bg-red-600 text-white border-red-600'
                    : s === 'cleaning' ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-yellow-600 text-white border-yellow-600'
                    : 'bg-card text-muted-foreground border-border'
                }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                  s === 'available' ? 'bg-green-500' : s === 'occupied' ? 'bg-red-500' : s === 'cleaning' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                {statusLabels[s]}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            {floors.map((floor) => (
              <div key={floor}>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  Piso {floor}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {filteredRooms.filter(r => r.floor === floor).map((room) => (
                    <div key={room.id} onClick={() => handleRoomClick(room)}
                      className={`rounded-xl shadow-sm border p-5 flex flex-col justify-between hover:shadow-md transition-shadow group relative cursor-pointer ${
                        statusBgColors[room.status] || 'bg-card'
                      } ${
                        statusBorderColors[room.status] || 'border-border'
                      } ${
                        statusBorderHover[room.status] || 'hover:border-border'
                      }`}>
                      <div className="absolute top-4 right-4 flex gap-1.5 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setEditingRoom(room); setShowForm(true) }} title="Editar"
                          className="p-1.5 bg-primary/10 text-primary rounded border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(room.id)} title="Eliminar"
                          className="p-1.5 bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-foreground">Hab. {room.number}</span>
                          <span className={`w-3 h-3 rounded-full ${statusColors[room.status]}`} />
                        </div>
                        <p className="text-xs text-muted-foreground capitalize font-medium mb-1">Tipo: {room.type}</p>
                        <p className="text-xs text-muted-foreground">Capacidad: {room.capacity} pers.</p>
                        {(room as any).activeCheckin && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Huésped</p>
                            <p className="text-xs font-bold text-foreground truncate">{(room as any).activeCheckin.guests?.full_name}</p>
                            <p className="text-[10px] text-muted-foreground">Entrada: {fmtDate((room as any).activeCheckin.check_in_at)}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">S/. {room.price_per_night}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          room.status === 'available' ? 'bg-green-100 text-green-700' :
                          room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                          room.status === 'cleaning' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{statusLabels[room.status]}</span>
                      </div>
                      {room.status === 'available' && <p className="text-xs text-center text-green-600 font-medium mt-2">Click para check-in</p>}
                      {room.status === 'occupied' && <p className="text-xs text-center text-red-600 font-medium mt-2">Click para check-out</p>}
                      {room.status === 'cleaning' && <p className="text-xs text-center text-blue-600 font-medium mt-2">Click para marcar disponible</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {upcomingReservations.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2"><span>📋</span> Reservas Próximas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {upcomingReservations.map((res: any) => (
                  <div key={res.id} onClick={() => setSelectedReservation(res)}
                    className="bg-white rounded-lg border border-amber-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group">
                    <button onClick={(e) => handleDeleteReservation(e, res.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-50 text-red-500 rounded border border-red-100 hover:bg-red-100 transition-colors md:opacity-0 md:group-hover:opacity-100 cursor-pointer" title="Eliminar reserva">
                      <Trash2 size={12} />
                    </button>
                    <p className="text-xs font-bold text-gray-800 truncate pr-6">{res.guests?.full_name}</p>
                    <p className="text-[10px] text-gray-500">{res.rooms?.type || res.rooms?.number || '-'}</p>
                    <p className="text-[10px] text-amber-700 mt-1">{fmtDate(res.check_in_date)} - {fmtDate(res.check_out_date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && rooms.length === 0 && <p className="text-center text-muted-foreground py-12">No hay habitaciones registradas. Crea la primera.</p>}

      {checkinRoom && <CheckinModal hotelId={profile?.hotel_id!} room={checkinRoom} onClose={() => { setCheckinRoom(null); fetchRooms() }} />}

      {checkoutRoom && activeCheckin && <CheckoutModal checkin={activeCheckin} onClose={() => { setCheckoutRoom(null); setActiveCheckin(null); fetchRooms() }} />}

      {selectedReservation && <ReservationDetailModal reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />}
    </div>
  )
}
