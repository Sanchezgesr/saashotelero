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

const INCOME_CATEGORIES = [
  { value: 'checkin', label: 'Check-in' },
  { value: 'service', label: 'Servicio' },
  { value: 'other', label: 'Otro' },
]

const EXPENSE_CATEGORIES = [
  { value: 'Limpieza y mantenimiento', label: 'Limpieza y mantenimiento' },
  { value: 'Servicios básicos', label: 'Servicios básicos (agua/luz/internet)' },
  { value: 'Compras de insumos', label: 'Compras de insumos' },
  { value: 'Comisiones', label: 'Comisiones' },
  { value: 'Gastos de personal', label: 'Gastos de personal' },
  { value: 'Otros', label: 'Otros' },
]

export function CashForm({ hotelId, onCreated }: { hotelId: string; onCreated: () => void }) {
  const [form, setForm] = useState<FormState>({
    type: 'income', category: 'service', amount: '', description: '', payment_method: 'cash',
  })
  const [saving, setSaving] = useState(false)

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = async () => {
    const parsed = Number(form.amount)
    if (!form.amount || isNaN(parsed) || parsed <= 0) return
    setSaving(true)
    try {
      await createCashMovement({ ...form, amount: parsed, hotel_id: hotelId })
      toast.success('Movimiento registrado')
      setForm({ type: 'income', category: 'service', amount: '', description: '', payment_method: 'cash' })
      onCreated()
    } catch {
      toast.error('Error al registrar movimiento')
    } finally {
      setSaving(false)
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
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
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
      <button onClick={handleSubmit} disabled={saving}
        className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
        {saving ? 'Guardando...' : 'Registrar movimiento'}
      </button>
    </div>
  )
}
