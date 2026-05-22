'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { ArrowLeft, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { performCheckout } from '@/lib/supabase/checkin-actions'
import { fmtDateTime } from '@/lib/utils/dates'

export default function CheckoutPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [activeCheckins, setActiveCheckins] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')

  const fetch = async () => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    const { data } = await supabase
      .from('checkins')
      .select('*, guests(full_name, dni, phone), rooms(number, type, price_per_night)')
      .eq('hotel_id', profile.hotel_id)
      .eq('status', 'active')
      .order('check_in_at')
    setActiveCheckins(data ?? [])
  }

  useEffect(() => { fetch() }, [profile?.hotel_id])

  const filtered = activeCheckins.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.rooms?.number?.toLowerCase().includes(q) ||
      c.guests?.full_name?.toLowerCase().includes(q)
    )
  })

  const selectCheckin = (c: any) => {
    setSelected(c)
  }

  const handleConfirm = async () => {
    if (!selected || !profile?.hotel_id) return
    try {
      await performCheckout({
        checkin_id: selected.id,
        room_id: selected.room_id,
        hotel_id: profile.hotel_id,
        room_number: selected.rooms?.number,
      })
      toast.success('Check-out completado')
      setSelected(null)
      fetch()
    } catch {
      toast.error('Error al hacer check-out')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Check-out</h1>

      {!selected ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por habitación o huésped..."
              className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-base min-h-[48px]" />
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {search ? 'Sin resultados' : 'No hay huéspedes alojados actualmente.'}
            </p>
          )}
          {filtered.map((c) => (
            <button key={c.id} onClick={() => selectCheckin(c)}
              className="w-full text-left bg-card rounded-xl shadow-sm border border-border p-4 hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    {c.rooms?.number}
                  </p>
                  <p className="text-sm">{c.guests?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Entró: {fmtDateTime(c.check_in_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">S/. {c.price_per_night}/noche</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
            <h2 className="font-semibold">Check-out — Hab. {selected.rooms?.number}</h2>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Huésped:</span> <strong>{selected.guests?.full_name}</strong></p>
              <p><span className="text-muted-foreground">Entrada:</span> {fmtDateTime(selected.check_in_at)}</p>
              <p><span className="text-muted-foreground">Pagado en check-in:</span> <strong>S/. {Number(selected.total_price).toFixed(2)}</strong></p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium min-h-[48px] hover:bg-gray-200">
                <ArrowLeft size={18} /> Cancelar
              </button>
              <button onClick={handleConfirm}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-semibold min-h-[48px] hover:bg-green-700">
                CONFIRMAR CHECK-OUT
              </button>
            </div>
          </div>
      )}
    </div>
  )
}
