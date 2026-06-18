'use client'

import { useEffect, useState } from 'react'
import { X, UserPlus, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { searchGuests, createGuest, performCheckin } from '@/lib/supabase/checkin-actions'

interface CheckinModalProps {
  hotelId: string
  room: any
  onClose: () => void
  variant?: 'admin' | 'receptionist'
}

const s = {
  admin: { container: 'max-w-md', input: 'px-3 py-2 text-sm', inputLarge: 'px-3 py-2 text-sm', btnSm: 'px-4 py-2 text-sm', btnLg: 'px-4 py-2 text-sm', body: 'text-sm', title: 'text-lg', minH: '' },
  receptionist: { container: 'max-w-sm', input: 'px-4 py-3 text-base', inputLarge: 'px-4 py-3 text-base min-h-[48px]', btnSm: 'px-4 py-3 text-sm min-h-[48px]', btnLg: 'px-4 py-3 text-base min-h-[48px]', body: 'text-base', title: 'text-lg', minH: 'min-h-[48px]' },
}

export function CheckinModal({ hotelId, room, onClose, variant = 'admin' }: CheckinModalProps) {
  const st = s[variant]
  const [step, setStep] = useState<'search' | 'register' | 'payment'>('search')
  const [dni, setDni] = useState('')
  const [guest, setGuest] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [nights, setNights] = useState(1)
  const [totalPrice, setTotalPrice] = useState(room.price_per_night)
  const [newGuest, setNewGuest] = useState({ full_name: '', dni: '', phone: '', email: '', nationality: 'Peruana' })

  useEffect(() => {
    if (dni.length === 8 && /^\d+$/.test(dni)) {
      setLoading(true)
      searchGuests(hotelId, dni).then((results) => { setSearchResults(results); setLoading(false) })
    } else { setSearchResults([]) }
  }, [dni, hotelId])

  const selectGuest = (g: any) => { setGuest(g); setStep('payment') }
  const showRegisterForm = () => { setNewGuest({ full_name: '', dni, phone: '', email: '', nationality: 'Peruana' }); setStep('register') }

  const handleRegister = async () => {
    if (!newGuest.full_name) { toast.error('El nombre es obligatorio'); return }
    const g = await createGuest({ hotel_id: hotelId, full_name: newGuest.full_name, dni: newGuest.dni, phone: newGuest.phone, email: newGuest.email, nationality: newGuest.nationality })
    setGuest(g); setStep('payment')
  }

  const handleCheckin = async () => {
    if (!guest || !paymentMethod) { toast.error('Selecciona un método de pago'); return }
    await performCheckin({
      hotel_id: hotelId, guest_id: guest.id, room_id: room.id,
      room_number: room.number, price_per_night: room.price_per_night,
      total_price: totalPrice, nights, payment_method: paymentMethod,
      guest_name: guest.full_name, notes,
    })
    toast.success('Check-in registrado'); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      role="dialog" aria-modal="true" aria-label="Check-in">
      <div className={`bg-white rounded-xl shadow-lg p-6 ${st.container} w-full mx-4`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${st.title} font-bold`}>Check-in — Hab. {room.number}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {step === 'search' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ingresa DNI del cliente</label>
              <input value={dni} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 8); setDni(v) }}
                placeholder="12345678" maxLength={8} autoFocus
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge} text-center text-lg tracking-widest ${st.minH}`} />
            </div>
            {loading && <p className="text-sm text-gray-500 text-center">Buscando...</p>}
            {searchResults.length > 0 && !loading && (
              <div className="space-y-2">
                {searchResults.map((g) => (
                  <div key={g.id} className={`bg-green-50 border border-green-200 rounded-lg p-${variant === 'receptionist' ? '4' : '3'} text-center`}>
                    <p className="font-medium text-lg">{g.full_name}</p>
                    <p className="text-sm text-gray-500">DNI: {g.dni} | {g.phone ?? '—'}</p>
                    <button onClick={() => selectGuest(g)}
                      className={`mt-3 bg-primary text-primary-foreground ${st.btnLg} rounded-lg ${variant === 'receptionist' ? 'text-base' : 'text-sm'} font-medium hover:opacity-90 ${st.minH}`}>
                      Continuar
                    </button>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && dni.length === 8 && !loading && (
              <button onClick={showRegisterForm}
                className={`flex items-center gap-2 bg-orange-500 text-white ${st.btnLg} rounded-lg font-medium hover:bg-orange-600 w-full justify-center ${st.minH}`}>
                <UserPlus size={variant === 'receptionist' ? 18 : 16} /> Registrar nuevo cliente
              </button>
            )}
          </div>
        )}

        {step === 'register' && (
          <div className="space-y-4">
            <p className={`text-sm text-gray-500 ${st.body}`}>Cliente no encontrado. Ingresa sus datos:</p>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo *</label>
              <input value={newGuest.full_name} onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                placeholder="Juan García"
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge} ${st.minH}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                placeholder="987 654 321"
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge} ${st.minH}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                placeholder="cliente@email.com"
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge}`} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('search')}
                className={`flex items-center gap-1 ${st.btnSm} border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 ${st.minH}`}>
                <ArrowLeft size={variant === 'receptionist' ? 18 : 16} /> Volver
              </button>
              <button onClick={handleRegister}
                className={`flex-1 bg-primary text-primary-foreground ${st.btnLg} rounded-lg font-semibold hover:opacity-90 ${st.minH}`}>
                <Check size={variant === 'receptionist' ? 20 : 16} className="inline mr-1" /> Registrar y continuar
              </button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className={`bg-gray-50 rounded-lg p-${variant === 'receptionist' ? '4' : '3'} space-y-2 text-sm`}>
              <p><span className="text-gray-500">Cliente:</span> <strong>{guest?.full_name}</strong></p>
              <p><span className="text-gray-500">Habitación:</span> <strong>{room.number}</strong> ({room.type})</p>
              <p><span className="text-gray-500">Precio/noche:</span> <strong>S/. {room.price_per_night}</strong></p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Noches a pagar</label>
              <input type="number" min={1} value={nights}
                onChange={(e) => { const n = +e.target.value; setNights(n); setTotalPrice(n * room.price_per_night) }}
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge} ${st.minH}`} />
              <p className="text-sm text-gray-500 mt-1">Total: <strong>S/. {totalPrice.toFixed(2)}</strong></p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Método de pago</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Efectivo', color: 'border-yellow-400 bg-yellow-50 text-yellow-700', colorActive: 'border-yellow-500 bg-yellow-100 text-yellow-800' },
                  { id: 'card', label: 'Tarjeta', color: 'border-gray-200 text-gray-600 hover:border-gray-400', colorActive: 'border-primary bg-primary/10 text-primary' },
                  { id: 'yape', label: 'Yape', color: 'border-purple-300 bg-purple-50 text-purple-700', colorActive: 'border-purple-500 bg-purple-100 text-purple-800' },
                  { id: 'plin', label: 'Plin', color: 'border-primary/40 bg-primary/10 text-primary', colorActive: 'border-primary bg-primary/20 text-primary' },
                ].map((pm) => (
                  <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                    className={`px-3 py-${variant === 'receptionist' ? '3' : '2'} rounded-lg border-2 text-sm font-medium transition-colors ${st.minH} ${
                      paymentMethod === pm.id ? pm.colorActive : pm.color
                    }`}>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                className={`w-full border border-gray-300 rounded-lg ${st.inputLarge} ${st.minH}`} rows={2} />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('search')}
                className={`flex items-center gap-1 ${st.btnSm} border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 ${st.minH}`}>
                <ArrowLeft size={variant === 'receptionist' ? 18 : 16} /> Volver
              </button>
              <button onClick={handleCheckin} disabled={!paymentMethod}
                className={`flex-1 bg-green-600 text-white ${st.btnLg} rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 ${st.minH}`}>
                <Check size={variant === 'receptionist' ? 20 : 16} className="inline mr-1" /> Cobrar y Check-in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
