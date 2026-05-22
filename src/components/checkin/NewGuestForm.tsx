'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'

export function NewGuestForm({ hotelId, dni, onCreated }: { hotelId: string; dni: string; onCreated: (g: any) => void }) {
  const [form, setForm] = useState({ full_name: '', dni, phone: '', email: '', nationality: 'Peruana' })

  const handleSubmit = async () => {
    if (!form.full_name) return
    const supabase = createClient()
    const { data } = await supabase.from('guests').insert({ ...form, hotel_id: hotelId }).select().single()
    if (data) onCreated(data)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        placeholder="Nombre completo *" className="border border-border rounded-lg px-3 py-2 text-sm" />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="Teléfono" className="border border-border rounded-lg px-3 py-2 text-sm" />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="Email" className="border border-border rounded-lg px-3 py-2 text-sm" />
      <input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })}
        placeholder="Nacionalidad" className="border border-border rounded-lg px-3 py-2 text-sm" />
      <button onClick={handleSubmit}
        className="col-span-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
        <UserPlus size={16} className="inline mr-1" /> Registrar y continuar
      </button>
    </div>
  )
}
