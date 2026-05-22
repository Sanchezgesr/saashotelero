'use client'

import { X } from 'lucide-react'
import type { CashSummary } from '@/types'

interface CashClosureModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  summary: CashSummary
  closuresCount: number
  maxClosures: number
  notes: string
  onNotesChange: (v: string) => void
  canClose: boolean
}

export function CashClosureModal({
  open, onClose, onConfirm, summary, closuresCount, maxClosures, notes, onNotesChange, canClose,
}: CashClosureModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Cierre de caja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        {!canClose ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-3 text-sm">
              Límite alcanzado ({closuresCount}/{maxClosures} cierres por día).
            </div>
            <button onClick={onClose}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:opacity-90">Cerrar</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Ingresos</span><span className="font-bold text-green-600">S/. {summary.totalIncome.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Egresos</span><span className="font-bold text-red-600">S/. {summary.totalExpense.toFixed(2)}</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="font-semibold">Balance</span><span className="font-bold text-lg">S/. {summary.balance.toFixed(2)}</span></div>
            </div>
            <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Observaciones (opcional)"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" rows={2} />
            <p className="text-xs text-gray-500 text-center">Al confirmar se registrará el cierre de los movimientos actuales</p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={onConfirm}
                className="flex-1 bg-warning text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">Confirmar cierre</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
