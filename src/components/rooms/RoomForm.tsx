'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { normalizeRoomType } from '@/lib/supabase/checkin-actions'
import type { Room } from '@/types'

export function RoomForm({
  hotelId, editingRoom, onCreated, onCancel
}: {
  hotelId: string; editingRoom: Room | null; onCreated: () => void; onCancel: () => void
}) {
  const [form, setForm] = useState({
    number: '', type: 'simple', capacity: 2, price_per_night: '', floor: 1, description: '', status: 'available',
  })
  const [priceWarning, setPriceWarning] = useState('')

  useEffect(() => {
    if (editingRoom) {
      setForm({
        number: editingRoom.number, type: editingRoom.type, capacity: editingRoom.capacity,
        price_per_night: editingRoom.price_per_night.toString(), floor: editingRoom.floor || 1,
        description: editingRoom.description || '', status: editingRoom.status,
      })
    }
  }, [editingRoom])

  const handlePriceChange = (val: string) => {
    setForm({ ...form, price_per_night: val })
    if (!val) { setPriceWarning(''); return }
    const num = Number(val.replace(',', '.'))
    if (isNaN(num) || num < 0) setPriceWarning('Ingresa un monto numérico válido')
    else if (num === 0) setPriceWarning('El precio debe ser mayor a 0')
    else setPriceWarning('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(form.price_per_night)
    if (!form.number || !form.price_per_night || isNaN(price) || price <= 0) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    const supabase = createClient()
    if (editingRoom) {
      await normalizeRoomType(editingRoom.id)
      const { error } = await supabase.from('rooms').update({ ...form, price_per_night: price }).eq('id', editingRoom.id)
      if (error) { toast.error('Error al actualizar: ' + error.message) } else { toast.success('Habitación actualizada'); onCreated() }
    } else {
      const { error } = await supabase.from('rooms').insert({ ...form, price_per_night: price, hotel_id: hotelId })
      if (error) { toast.error('Error al crear: ' + error.message) } else { toast.success('Habitación creada'); onCreated() }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="font-bold text-foreground">{editingRoom ? 'Editar Habitación' : 'Registrar Habitación'}</h3>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Número *</label>
          <input type="text" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground" placeholder="101" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo *</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground">
            <option value="simple">Simple</option><option value="doble">Doble</option>
            <option value="triple">Triple</option><option value="matrimonial">Matrimonial</option><option value="familiar">Familiar</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Capacidad *</label>
          <input type="number" required min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Precio *</label>
          <input type="text" inputMode="decimal" value={form.price_per_night} onChange={(e) => handlePriceChange(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm bg-card text-foreground ${priceWarning ? 'border-red-400' : 'border-border'}`} placeholder="0.00" />
          {priceWarning && <p className="text-xs text-red-500 mt-1">{priceWarning}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Piso *</label>
          <input type="number" required min={1} value={form.floor} onChange={(e) => setForm({ ...form, floor: +e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Estado *</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground">
            <option value="available">Disponible</option><option value="occupied">Ocupada</option>
            <option value="cleaning">Limpieza</option><option value="maintenance">Mantenimiento</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Descripción</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground placeholder:text-muted-foreground" placeholder="Opcional" />
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer">Cancelar</button>
        <button type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
          {editingRoom ? 'Guardar cambios' : 'Registrar habitación'}
        </button>
      </div>
    </form>
  )
}
