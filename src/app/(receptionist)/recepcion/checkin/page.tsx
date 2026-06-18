'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, ArrowRight, ArrowLeft, Check, UserPlus, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { performCheckin, createGuest, getAvailableRooms, getHotelPlan } from './actions'
import { useRouter } from 'next/navigation'
import { fmtDateTime } from '@/lib/utils/dates'
import { printNotaVenta } from '@/components/print/NotaVentaPrint'

type Step = 'guest' | 'room' | 'confirm'

export default function CheckinPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [step, setStep] = useState<Step>('guest')
  const [guest, setGuest] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [dni, setDni] = useState('')
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestPhone, setNewGuestPhone] = useState('')
  const [newGuestEmail, setNewGuestEmail] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checkinResult, setCheckinResult] = useState<any>(null)
  const [hotel, setHotel] = useState<any>(null)

  useEffect(() => {
    if (!profile?.hotel_id) return
    getHotelPlan(profile.hotel_id).then((data) => {
      if (data) setHotel(data)
    })
  }, [profile?.hotel_id])

  const handleSearch = async () => {
    if (!dni) return
    setLoading(true)
    const supabase = createClient()
    const escaped = dni.replace(/[%_]/g, '\\$&')
    const { data } = await supabase
      .from('guests').select('*')
      .eq('hotel_id', profile?.hotel_id)
      .or(`dni.ilike.%${escaped}%,full_name.ilike.%${escaped}%`)
      .limit(10)
    setSearchResults(data ?? [])
    setLoading(false)
  }

  const selectGuest = (g: any) => {
    setGuest(g)
    loadRooms()
    setStep('room')
  }

  const loadRooms = async () => {
    if (!profile?.hotel_id) return
    const rooms = await getAvailableRooms(profile.hotel_id)
    setAvailableRooms(rooms)
  }

  const handleNewGuest = async () => {
    if (!profile?.hotel_id || !newGuestName || !newGuestPhone) return
    const g = await createGuest({
      hotel_id: profile.hotel_id,
      full_name: newGuestName,
      dni,
      phone: newGuestPhone,
      email: newGuestEmail || undefined,
    })
    setGuest(g)
    loadRooms()
    setStep('room')
  }

  const selectRoom = (r: any) => {
    setRoom(r)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!profile?.hotel_id || !guest || !room || submitting) return
    setSubmitting(true)
    try {
      const r = await performCheckin({
        hotel_id: profile.hotel_id,
        guest_id: guest.id,
        room_id: room.id,
        price_per_night: room.price_per_night,
        notes,
      })
      toast.success('Check-in registrado exitosamente')
      setCheckinResult({ ...r, guest, room })
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar check-in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Check-in</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-xs">
        {['Cliente', 'Habitación', 'Confirmar'].map((s, i) => {
          const steps: Step[] = ['guest', 'room', 'confirm']
          const currentIdx = steps.indexOf(step)
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                currentIdx >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{i + 1}</span>
              <span className={currentIdx >= i ? 'font-medium' : 'text-muted-foreground'}>{s}</span>
              {i < 2 && <div className="w-6 h-px bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Guest */}
      {step === 'guest' && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
          <div>
            <label htmlFor="search-dni" className="block text-sm font-medium mb-2">Buscar por DNI o nombre</label>
            <div className="flex gap-2">
              <input id="search-dni" value={dni} onChange={(e) => setDni(e.target.value)}
                placeholder="12345678"
                className="flex-1 border border-border rounded-lg px-4 py-3 text-base min-h-[48px]" />
              <button onClick={handleSearch} disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium min-h-[48px] hover:opacity-90 disabled:opacity-50">
                <Search size={18} /> Buscar
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((g) => (
                <button key={g.id} onClick={() => selectGuest(g)}
                  className="w-full text-left bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors">
                  <p className="font-medium">{g.full_name}</p>
                  <p className="text-sm text-muted-foreground">DNI: {g.dni} | {g.phone ?? '—'}</p>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && dni && !loading && (
            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium">Registrar nuevo cliente</p>
              <input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Nombre completo *"
                className="w-full border border-border rounded-lg px-4 py-3 text-base min-h-[48px]" />
              <input value={newGuestPhone} onChange={(e) => setNewGuestPhone(e.target.value)}
                placeholder="Teléfono *"
                className="w-full border border-border rounded-lg px-4 py-3 text-base min-h-[48px]" />
              <input value={newGuestEmail} onChange={(e) => setNewGuestEmail(e.target.value)}
                placeholder="Email (opcional)"
                className="w-full border border-border rounded-lg px-4 py-3 text-base min-h-[48px]" />
              <button onClick={handleNewGuest}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg text-sm font-medium min-h-[48px] hover:opacity-90 w-full justify-center disabled:opacity-50"
                disabled={!newGuestName || !newGuestPhone}>
                <UserPlus size={18} /> Registrar y continuar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Room */}
      {step === 'room' && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
          <p className="text-sm">Cliente: <strong>{guest?.full_name}</strong></p>
          <p className="text-sm font-medium">Seleccionar habitación disponible</p>
          <div className="grid grid-cols-2 gap-3">
            {availableRooms.map((r) => (
              <button key={r.id} onClick={() => selectRoom(r)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  room?.id === r.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
                }`}>
                <p className="text-lg font-bold">{r.number}</p>
                <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
                <p className="text-sm font-medium text-primary">S/. {r.price_per_night}</p>
              </button>
            ))}
          </div>
          {availableRooms.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No hay habitaciones disponibles</p>
          )}
          <button onClick={() => { setStep('guest') }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && !checkinResult && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
          <h2 className="font-semibold">Confirmar check-in</h2>
          <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Cliente:</span> <strong>{guest?.full_name}</strong></p>
            <p><span className="text-muted-foreground">Habitación:</span> <strong>{room?.number}</strong> ({room?.type})</p>
            <p><span className="text-muted-foreground">Precio:</span> <strong>S/. {room?.price_per_night}</strong> / noche</p>
            <p><span className="text-muted-foreground">Entrada:</span> {fmtDateTime(new Date())}</p>
          </div>
          <div>
            <label htmlFor="checkin-notes" className="block text-sm font-medium mb-1">Notas</label>
            <textarea id="checkin-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-border rounded-lg px-4 py-3 text-base min-h-[48px]" rows={2} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('room')}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium min-h-[48px] hover:bg-gray-200">
              <ArrowLeft size={18} /> Volver
            </button>
             <button onClick={handleConfirm} disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-semibold min-h-[48px] hover:bg-green-700 disabled:opacity-50">
              <Check size={20} /> {submitting ? 'REGISTRANDO...' : 'REGISTRAR CHECK-IN'}
            </button>
          </div>
        </div>
      )}

      {/* Success + Print Nota de Venta */}
      {checkinResult && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Check-in registrado</h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ ÉXITO</span>
          </div>
          <div className="bg-muted rounded-lg p-3 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Cliente:</span> <strong>{checkinResult.guest?.full_name}</strong></p>
            <p><span className="text-muted-foreground">Habitación:</span> <strong>{checkinResult.room?.number}</strong></p>
            <p><span className="text-muted-foreground">Total:</span> <strong>S/. {Number(checkinResult.room?.price_per_night).toFixed(2)}</strong></p>
          </div>
          <button onClick={() => printNotaVenta({
            hotelName: hotel?.name,
            guestName: checkinResult.guest?.full_name,
            guestDoc: checkinResult.guest?.dni,
            roomNumber: checkinResult.room?.number,
            checkIn: fmtDateTime(new Date()),
            total: Number(checkinResult.room?.price_per_night),
            paymentMethod: 'cash',
            tipo: 'checkin',
          })}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-900">
            <Printer size={18} /> Imprimir Nota de Venta
          </button>
          <button onClick={() => router.push('/recepcion/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-200">
            Ir al Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
