'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { markRoomAvailable } from '@/lib/supabase/checkin-actions'
import { fetchUpcomingReservations } from './actions'
import { CheckinModal } from '@/components/rooms/CheckinModal'
import { CheckoutModal } from '@/components/rooms/CheckoutModal'
import { ReservationDetailModal } from '@/components/rooms/ReservationDetailModal'

const statusConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
  available:   { label: 'Disponible',   color: 'bg-green-500', border: 'border-green-200', bg: 'bg-green-50/50 text-green-700' },
  occupied:    { label: 'Ocupada',      color: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50/50 text-red-700' },
  cleaning:    { label: 'Limpieza',     color: 'bg-yellow-500', border: 'border-yellow-200', bg: 'bg-yellow-50/50 text-yellow-700' },
  maintenance: { label: 'Mantenimiento',color: 'bg-gray-500', border: 'border-gray-200', bg: 'bg-gray-50/50 text-gray-700' },
}

export default function RoomsPage() {
  const { profile } = useUser()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkinRoom, setCheckinRoom] = useState<any>(null)
  const [checkoutRoom, setCheckoutRoom] = useState<any>(null)
  const [activeCheckin, setActiveCheckin] = useState<any>(null)
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([])
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const handleDeleteReservation = async (e: React.MouseEvent, resId: string) => {
    e.stopPropagation()
    if (!confirm('¿Eliminar esta reserva?')) return
    try {
      const { deleteReservation } = await import('@/app/(hotel-admin)/hotel/reservations/actions')
      await deleteReservation(resId)
      toast.success('Reserva eliminada')
      fetchRooms()
    } catch {
      toast.error('Error al eliminar reserva')
    }
  }

  const fetchRooms = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    try {
      const { data: dbRooms, error } = await createClient()
        .from('rooms').select('*').eq('hotel_id', profile.hotel_id).order('number')
      if (error) throw error
      setRooms((dbRooms || []).map((r: any) => ({ ...r, activeCheckin: null })))
      setLoading(false)

      const [checkinsRes, upcoming] = await Promise.all([
        createClient().from('checkins').select('*, guests(full_name)').eq('hotel_id', profile.hotel_id).eq('status', 'active'),
        fetchUpcomingReservations(profile.hotel_id),
      ])
      setRooms((dbRooms || []).map((r: any) => ({
        ...r,
        activeCheckin: checkinsRes.data?.find((c: any) => c.room_id === r.id) || null,
      })))
      setUpcomingReservations(upcoming)
    } catch {
      toast.error('Error al cargar habitaciones')
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [profile?.hotel_id])

  const handleRoomClick = async (room: any) => {
    if (room.status === 'available') {
      setCheckinRoom(room)
    } else if (room.status === 'occupied') {
      const supabase = createClient()
      const { data } = await supabase
        .from('checkins')
        .select('*, guests(full_name, dni, phone), rooms(number, type, price_per_night)')
        .eq('room_id', room.id).eq('status', 'active').single()
      if (data) { setActiveCheckin(data); setCheckoutRoom(room) }
      else { toast.error('No se encontró check-in activo') }
    } else if (room.status === 'cleaning') {
      if (confirm('¿Marcar habitación ' + room.number + ' como disponible?')) {
        await markRoomAvailable(room.id, profile?.hotel_id)
        toast.success('Habitación disponible')
        fetchRooms()
      }
    }
  }

  const filteredRooms = selectedFilter ? rooms.filter(r => r.status === selectedFilter) : rooms
  const floors = [...new Set(filteredRooms.map(r => r.floor).filter(f => f != null))].sort()

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Estado de Habitaciones</h1>
          <p className="text-xs text-muted-foreground font-semibold">Click en disponible para check-in, ocupada para check-out.</p>
        </div>
        <button onClick={fetchRooms}
          className="p-2 text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl shadow-sm transition-colors cursor-pointer">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="bg-card p-3 rounded-xl border border-border flex gap-2 text-[10px] font-bold uppercase justify-around">
        <button onClick={() => setSelectedFilter(null)}
          className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${selectedFilter === null ? 'bg-primary text-primary-foreground' : ''}`}>Todas</button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setSelectedFilter(selectedFilter === key ? null : key)}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedFilter === key ? `${cfg.color} text-white` : ''
            }`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${cfg.color}`} />{cfg.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Cargando habitaciones...</div>
      ) : (
        <div className="space-y-6">
          {floors.map((floor) => (
            <div key={floor} className="bg-card p-4 rounded-2xl border border-border shadow-sm">
              <h2 className="font-bold text-foreground text-sm mb-3">Piso {floor}</h2>
              <div className="grid grid-cols-3 gap-3">
                {filteredRooms.filter(r => r.floor === floor).map((r) => {
                  const cfg = statusConfig[r.status]
                  return (
                    <button key={r.id} onClick={() => handleRoomClick(r)}
                      className={`rounded-xl border p-3.5 text-center flex flex-col justify-between items-center transition-all cursor-pointer ${
                        cfg.bg} ${cfg.border} ${
                        r.status === 'available' ? 'hover:border-green-500 hover:shadow-md' :
                        r.status === 'occupied' ? 'hover:border-red-500 hover:shadow-md' :
                        r.status === 'cleaning' ? 'hover:border-yellow-500 hover:shadow-md' : ''
                      }`}>
                      <span className="text-sm font-bold text-foreground">{r.number}</span>
                      <span className="text-[9px] uppercase font-semibold text-muted-foreground mt-0.5">{r.type} · {r.capacity} pers</span>
                      <span className="text-[10px] font-bold text-foreground mt-1">S/. {r.price_per_night}</span>
                      {r.activeCheckin && (
                        <span className="text-[8px] text-muted-foreground mt-1 truncate max-w-full">{r.activeCheckin.guests?.full_name}</span>
                      )}
                      <span className={`w-2 h-2 rounded-full mt-1 ${cfg.color}`} />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No hay habitaciones registradas.</p>
      )}

      {!loading && upcomingReservations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <h3 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
            <span>📋</span> Reservas Próximas
          </h3>
          <div className="space-y-2">
            {upcomingReservations.slice(0, 5).map((res: any) => (
              <div key={res.id}
                onClick={() => setSelectedReservation(res)}
                className="bg-white rounded-lg border border-amber-200 p-2.5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow relative group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{res.guests?.full_name}</p>
                  <p className="text-[10px] text-muted-foreground">{res.rooms?.type || res.rooms?.number || '-'} · {res.check_in_date?.slice(0,10)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pendiente</span>
                  <button
                    onClick={(e) => handleDeleteReservation(e, res.id)}
                    className="p-1 bg-red-50 text-red-500 rounded border border-red-100 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Eliminar reserva"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {checkinRoom && (
        <CheckinModal
          hotelId={profile?.hotel_id!}
          room={checkinRoom}
          onClose={() => { setCheckinRoom(null); fetchRooms() }}
          variant="receptionist"
        />
      )}

      {checkoutRoom && activeCheckin && (
        <CheckoutModal
          checkin={activeCheckin}
          onClose={() => { setCheckoutRoom(null); setActiveCheckin(null); fetchRooms() }}
          variant="receptionist"
        />
      )}

      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          compact
        />
      )}
    </div>
  )
}
