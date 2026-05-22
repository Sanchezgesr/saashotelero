'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Guest } from '@/types'

export function GuestForm({ hotelId, editingGuest, onCreated, onCancel }: {
  hotelId: string; editingGuest: Guest | null; onCreated: () => void; onCancel: () => void
}) {
  const [form, setForm] = useState({ full_name: '', dni: '', phone: '', email: '', nationality: 'Peruana', address: '' })

  useEffect(() => {
    if (editingGuest) {
      setForm({
        full_name: editingGuest.full_name, dni: editingGuest.dni || '', phone: editingGuest.phone || '',
        email: editingGuest.email || '', nationality: editingGuest.nationality || 'Peruana', address: editingGuest.address || '',
      })
    }
  }, [editingGuest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name) { toast.error('El nombre completo es requerido'); return }
    const supabase = createClient()
    if (editingGuest) {
      const { error } = await supabase.from('guests').update({
        full_name: form.full_name, dni: form.dni || null, phone: form.phone || null,
        email: form.email || null, nationality: form.nationality, address: form.address || null,
      }).eq('id', editingGuest.id)
      if (error) toast.error('Error al actualizar cliente: ' + error.message)
      else { toast.success('Cliente actualizado'); onCreated() }
    } else {
      const { error } = await supabase.from('guests').insert({ ...form, hotel_id: hotelId })
      if (error) toast.error('Error al registrar cliente: ' + error.message)
      else { toast.success('Cliente registrado'); onCreated() }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{editingGuest ? 'Editar Cliente' : 'Registrar Cliente'}</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo *</label>
          <input type="text" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Juan García" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">DNI (opcional)</label>
          <input type="text" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="12345678" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono (opcional)</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="987 654 321" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email (opcional)</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="cliente@email.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nacionalidad</label>
          <input type="text" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección (opcional)</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancelar</button>
        <button type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 cursor-pointer">
          {editingGuest ? 'Guardar Cambios' : 'Registrar Cliente'}
        </button>
      </div>
    </form>
  )
}
