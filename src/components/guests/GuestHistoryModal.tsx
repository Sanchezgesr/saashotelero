'use client'

import { XCircle } from 'lucide-react'
import { fmtDate } from '@/lib/utils/dates'

export function GuestHistoryModal({ guest, history, onClose }: {
  guest: any; history: any[]; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      role="dialog" aria-modal="true" aria-label="Historial del huésped">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{guest.full_name}</h2>
            <p className="text-xs text-gray-500 mt-1">DNI: {guest.dni ?? '—'} | Teléf: {guest.phone ?? '—'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700">Historial de Estadías</h3>
          {history.length === 0 && <p className="text-xs text-gray-500 italic">Sin estadías registradas.</p>}
          <div className="space-y-3">
            {history.map((h: any) => (
              <div key={h.id} className="border border-gray-200 rounded-lg p-3 text-xs bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">Habitación {h.rooms?.number} ({h.rooms?.type})</p>
                  <p className="text-gray-500 mt-0.5">Entrada: {fmtDate(h.check_in_at)}</p>
                  <p className="text-gray-500">Salida: {h.check_out_at ? fmtDate(h.check_out_at) : 'En curso'}</p>
                </div>
                {h.total_price && (
                  <div className="text-right">
                    <span className="font-bold text-primary">S/. {h.total_price.toFixed(2)}</span>
                    <span className="block text-[10px] text-gray-400 capitalize mt-0.5">{h.payment_method}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 cursor-pointer">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
