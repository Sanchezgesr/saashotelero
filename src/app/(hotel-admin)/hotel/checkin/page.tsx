'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { performCheckin } from '@/lib/supabase/checkin-actions'
import { NewGuestForm } from '@/components/checkin/NewGuestForm'
import { ActiveCheckins } from '@/components/checkin/ActiveCheckins'

export default function CheckinPage() {
  const { profile } = useUser()
  const [step, setStep] = useState(1)
  const [dni, setDni] = useState('')
  const [guest, setGuest] = useState<any>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [pricePerNight, setPricePerNight] = useState(0)
  const [notes, setNotes] = useState('')

  const searchGuest = async () => {
    if (!profile?.hotel_id || !dni) return
    const { data } = await createClient().from('guests').select('*').eq('hotel_id', profile.hotel_id).eq('dni', dni).single()
    if (data) { setGuest(data); setStep(3) } else setStep(2)
  }

  const loadRooms = async () => {
    const hotelId = profile?.hotel_id
    if (!hotelId) return
    const { data } = await createClient().from('rooms').select('*').eq('hotel_id', hotelId).eq('status', 'available')
    setRooms(data ?? [])
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRooms() }, [profile?.hotel_id])

  const resetForm = () => { setStep(1); setDni(''); setGuest(null); setSelectedRoom(null); setPricePerNight(0); setNotes('') }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Check-in / Check-out</h1>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo Check-in</h2>

        <div className="flex items-center gap-1 mb-6 text-sm overflow-x-auto scrollbar-hide">
          {['Buscar', 'Registrar', 'Hab.', 'Confirmar'].map((s, i) => (
            <div key={s} className="flex items-center gap-1 shrink-0">
              <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${step >= i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
              <span className={`text-xs md:text-sm ${step >= i + 1 ? 'text-foreground' : 'text-muted-foreground'} hidden md:inline`}>{['Buscar cliente', 'Registrar cliente', 'Seleccionar habitación', 'Confirmar'][i]}</span>
              <span className={`text-xs md:hidden ${step >= i + 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < 3 && <div className="w-4 md:w-8 h-px bg-border shrink-0" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <label className="block text-sm font-medium mb-2">Buscar cliente por DNI</label>
            <div className="flex gap-2">
              <input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="12345678"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm" />
              <button onClick={searchGuest}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                <Search size={16} /> Buscar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Cliente no encontrado. Regístralo:</p>
            <NewGuestForm hotelId={profile?.hotel_id!} dni={dni} onCreated={(g) => { setGuest(g); setStep(3) }} />
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm mb-4">Cliente: <strong>{guest?.full_name}</strong> ({guest?.dni})</p>
            <label className="block text-sm font-medium mb-2">Seleccionar habitación disponible</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {rooms.map((r) => (
                <button key={r.id} onClick={() => { setSelectedRoom(r); setPricePerNight(r.price_per_night) }}
                  className={`p-3 rounded-lg border text-left text-sm transition-colors ${selectedRoom?.id === r.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
                  <p className="font-bold">{r.number}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
                  <p className="text-xs text-primary font-medium">S/. {r.price_per_night}</p>
                </button>
              ))}
            </div>
            {rooms.length === 0 && <p className="text-sm text-muted-foreground">No hay habitaciones disponibles.</p>}
            {selectedRoom && (
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Precio por noche</label>
                  <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(+e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1">Notas</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm" rows={2} /></div>
                <button onClick={async () => {
                  if (!profile?.hotel_id || !guest || !selectedRoom) return
                  const r = await performCheckin({ hotel_id: profile.hotel_id, guest_id: guest.id, room_id: selectedRoom.id, room_number: selectedRoom.number, price_per_night: Number(pricePerNight), total_price: Number(pricePerNight), nights: 1, payment_method: 'cash', guest_name: guest.full_name, notes: notes || undefined })
                  if (r.error) { toast.error(r.error); return }
                  toast.success('Check-in registrado exitosamente'); resetForm(); loadRooms()
                }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">Confirmar Check-in</button>
              </div>
            )}
          </div>
        )}
      </div>

      <ActiveCheckins hotelId={profile?.hotel_id!} />
    </div>
  )
}
