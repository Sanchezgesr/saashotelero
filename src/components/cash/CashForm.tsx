'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createCashMovement } from '@/app/(hotel-admin)/hotel/cash/actions'

type FormState = {
  type: 'income' | 'expense'
  category: string
  amount: string
  description: string
  payment_method: 'cash' | 'card' | 'yape' | 'plin'
}

export function CashForm({ hotelId, onCreated }: { hotelId: string; onCreated: () => void }) {
  const [form, setForm] = useState<FormState>({
    type: 'income', category: 'service', amount: '', description: '', payment_method: 'cash',
  })

  const handleSubmit = async () => {
    const parsed = Number(form.amount)
    if (!form.amount || isNaN(parsed) || parsed <= 0) return
    try {
      await createCashMovement({ ...form, amount: parsed, hotel_id: hotelId })
      setForm({ type: 'income', category: 'service', amount: '', description: '', payment_method: 'cash' })
      onCreated()
    } catch {
      toast.error('Error al registrar movimiento')
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm">
            <option value="income">Ingreso</option>
            <option value="expense">Egreso</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm">
            <option value="checkin">Check-in</option>
            <option value="service">Servicio</option>
            <option value="supply">Insumo</option>
            <option value="salary">Sueldo</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monto</label>
          <input type="text" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Método de pago</label>
          <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as 'cash' | 'card' | 'yape' | 'plin' })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm">
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
      </div>
      <button onClick={handleSubmit}
        className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
        Registrar movimiento
      </button>
    </div>
  )
}
