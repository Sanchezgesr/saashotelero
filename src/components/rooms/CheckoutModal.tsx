'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { performCheckout } from '@/lib/supabase/checkin-actions'
import { fmtDateTime } from '@/lib/utils/dates'

interface CheckoutModalProps {
  checkin: any
  onClose: () => void
  variant?: 'admin' | 'receptionist'
}

const s = {
  admin: { container: 'max-w-md', btn: 'px-4 py-2', btnConfirm: 'px-4 py-2 text-sm font-semibold', body: 'text-sm' },
  receptionist: { container: 'max-w-sm', btn: 'flex-1 px-4 py-3 min-h-[48px]', btnConfirm: 'flex-1 px-4 py-3 text-base font-semibold min-h-[48px]', body: 'text-base' },
}

export function CheckoutModal({ checkin, onClose, variant = 'admin' }: CheckoutModalProps) {
  const st = s[variant]
  const [loading, setLoading] = useState(false)
  const checkInTime = new Date(checkin.check_in_at)

  const handleCheckout = async () => {
    setLoading(true)
    await performCheckout({
      checkin_id: checkin.id, room_id: checkin.room_id,
      hotel_id: checkin.hotel_id, room_number: checkin.rooms?.number,
    })
    toast.success('Check-out completado')
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      role="dialog" aria-modal="true" aria-label="Checkout">
      <div className={`bg-white rounded-xl shadow-lg p-6 ${st.container} w-full mx-4`} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Check-out — Hab. {checkin.rooms?.number}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className={`bg-gray-50 rounded-lg p-${variant === 'receptionist' ? '4' : '3'} space-y-2 ${st.body} mb-4`}>
          <p><span className="text-gray-500">Huésped:</span> <strong>{checkin.guests?.full_name}</strong></p>
          <p><span className="text-gray-500">Entrada:</span> {fmtDateTime(checkInTime)}</p>
          <p><span className="text-gray-500">Pagado en check-in:</span> <strong>S/. {Number(checkin.total_price).toFixed(2)}</strong></p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className={`${st.btn} border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50`}>Cancelar</button>
          <button onClick={handleCheckout} disabled={loading}
            className={`${st.btnConfirm} bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50`}>
            {loading ? 'Procesando...' : 'Confirmar Check-out'}
          </button>
        </div>
      </div>
    </div>
  )
}
