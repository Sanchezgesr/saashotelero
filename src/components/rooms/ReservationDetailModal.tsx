'use client'

import { X } from 'lucide-react'
import { fmtDate } from '@/lib/utils/dates'

export function ReservationDetailModal({ reservation, onClose, compact }: { reservation: any; onClose: () => void; compact?: boolean }) {
  const w = compact ? 'max-w-sm' : 'max-w-md'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      role="dialog" aria-modal="true" aria-label="Detalle de reserva">
      <div className={`bg-white rounded-xl shadow-lg p-6 ${w} w-full mx-4`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Detalle de Reserva</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Huésped:</span>
              <strong>{reservation.guests?.full_name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Habitación:</span>
              <strong>{reservation.rooms?.type || reservation.rooms?.number || '-'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in:</span>
              <strong>{fmtDate(reservation.check_in_date)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out:</span>
              <strong>{fmtDate(reservation.check_out_date)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total:</span>
              <strong>S/. {Number(reservation.total_price).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className="text-amber-700 font-semibold capitalize">{reservation.status}</span>
            </div>
          </div>

          {reservation.notes && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Notas:</p>
              <p className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-gray-700 whitespace-pre-wrap">{reservation.notes}</p>
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="mt-4 w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors">
          Cerrar
        </button>
      </div>
    </div>
  )
}
