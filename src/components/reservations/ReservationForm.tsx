'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createReservation } from '@/app/(hotel-admin)/hotel/reservations/actions'

const ROOM_TYPES = ['simple', 'doble', 'triple', 'matrimonial', 'familiar']

export function ReservationForm({ hotelId, onCreated, onCancel }: {
  hotelId: string; onCreated: () => void; onCancel: () => void
}) {
  const [guests, setGuests] = useState<{ id: string; full_name: string }[]>([])
  const [form, setForm] = useState({ room_type: '', guest_id: '', check_in_date: '', check_out_date: '', notes: '' })
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('guests').select('id, full_name').eq('hotel_id', hotelId).then(({ data }) => setGuests(data ?? []))
  }, [hotelId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.room_type || !form.guest_id || !form.check_in_date || !form.check_out_date) { toast.error('Todos los campos son requeridos'); return }
    const checkIn = new Date(form.check_in_date); const checkOut = new Date(form.check_out_date)
    if (checkOut <= checkIn) { toast.error('La fecha de salida debe ser posterior a la de entrada'); return }

    setChecking(true)
    const supabase = createClient()
    const { data: available } = await supabase.from('rooms').select('id, number').eq('hotel_id', hotelId).eq('type', form.room_type).limit(1)
    const room = available?.[0]
    if (!room) { toast.error(`No hay habitaciones tipo "${form.room_type}" en este hotel`); setChecking(false); return }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const { data: priceData } = await supabase.from('rooms').select('price_per_night').eq('id', room.id).single()
    const total_price = nights * Number(priceData?.price_per_night ?? 0)

    try {
      await createReservation({ hotel_id: hotelId, room_id: room.id, guest_id: form.guest_id, check_in_date: form.check_in_date, check_out_date: form.check_out_date, total_price, notes: form.notes })
      setChecking(false); toast.success(`Reserva creada — ${form.room_type}`); onCreated()
    } catch (e: any) { setChecking(false); toast.error(e.message || 'Error al registrar reserva') }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Nueva Reserva</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Huésped *</label>
          <select required value={form.guest_id} onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Seleccionar...</option>
            {guests.map((g) => <option key={g.id} value={g.id}>{g.full_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Habitación *</label>
          <select required value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Seleccionar...</option>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Check-in *</label>
          <input type="date" required value={form.check_in_date} onChange={(e) => setForm({ ...form, check_in_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Check-out *</label>
          <input type="date" required value={form.check_out_date} onChange={(e) => setForm({ ...form, check_out_date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Notas</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancelar</button>
        <button type="submit" disabled={checking}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors cursor-pointer disabled:bg-gray-300">
          {checking ? 'Verificando...' : 'Crear Reserva'}
        </button>
      </div>
    </form>
  )
}
