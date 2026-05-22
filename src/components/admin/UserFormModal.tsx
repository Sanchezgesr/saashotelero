'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface UserFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  hotels: { id: string; name: string }[]
}

export function UserFormModal({ open, onClose, onSaved, hotels }: UserFormModalProps) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', hotelId: '', role: 'hotel_admin' as 'hotel_admin' | 'receptionist' })
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password || !form.hotelId) { toast.error('Todos los campos son requeridos'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password, hotelId: form.hotelId, role: form.role }),
      })
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else { toast.success('Usuario registrado exitosamente'); onClose(); onSaved() }
    } catch { toast.error('Error al crear usuario') }
    finally { setCreating(false) }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Registrar Nuevo Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo *</label>
              <input type="text" required value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})}
                placeholder="Ej. Juan Pérez" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="admin@hotel.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña *</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="********" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hotel *</label>
              <select required value={form.hotelId} onChange={(e) => setForm({...form, hotelId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Seleccionar...</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rol *</label>
              <select required value={form.role} onChange={(e) => setForm({...form, role: e.target.value as any})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="hotel_admin">Admin Hotel</option>
                <option value="receptionist">Recepcionista</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancelar</button>
            <button type="submit" disabled={creating}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors cursor-pointer disabled:bg-gray-300">
              {creating ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
