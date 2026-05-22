'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { performCheckout } from '@/lib/supabase/checkin-actions'

export function ActiveCheckins({ hotelId }: { hotelId: string }) {
  const [checkins, setCheckins] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const fetch = async () => {
    if (!hotelId) return
    const supabase = createClient()
    const { data } = await supabase.from('checkins').select('*, guests(full_name, dni), rooms(number, type, price_per_night)')
      .eq('hotel_id', hotelId).eq('status', 'active')
    setCheckins(data ?? [])
  }

  useEffect(() => { fetch() }, [hotelId])

  const filtered = checkins.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.rooms?.number?.toLowerCase().includes(q) || c.guests?.full_name?.toLowerCase().includes(q)
  })

  const checkout = async (checkin: any) => {
    try {
      await performCheckout({ checkin_id: checkin.id, room_id: checkin.room_id, hotel_id: hotelId })
      toast.success('Check-out completado'); fetch()
    } catch { toast.error('Error al hacer check-out') }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">Check-ins activos</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por habitación o huésped..." className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm" />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{search ? 'Sin resultados' : 'No hay check-ins activos'}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-muted rounded-lg p-4">
              <div>
                <p className="font-medium">{c.guests?.full_name}</p>
                <p className="text-sm text-muted-foreground">Hab {c.rooms?.number} ({c.rooms?.type})</p>
                <p className="text-xs text-muted-foreground">Desde {c.check_in_at?.split('T')[0]}</p>
              </div>
              <button onClick={() => checkout(c)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Check-out</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
