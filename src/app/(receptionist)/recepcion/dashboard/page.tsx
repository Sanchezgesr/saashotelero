'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { LogIn, LogOut, BedDouble, Users, Hotel, TrendingUp } from 'lucide-react'
import { localDate, tzOffset } from '@/lib/utils/dates'
import Link from 'next/link'
import { toast } from 'sonner'
import OccupancyChart from '@/components/charts/OccupancyChart'

export default function ReceptionistDashboard() {
  const { profile } = useUser()
  const [stats, setStats] = useState({
    free: 0, occupied: 0, cleaning: 0,
    todayCheckins: 0, todayCheckouts: 0, currentGuests: 0,
  })
  const [hotelName, setHotelName] = useState('')

  useEffect(() => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    const hotelId = profile.hotel_id
    const today = localDate()
    const todayStart = `${today}T00:00:00${tzOffset()}`

    const loadData = async () => {
      const { data: hotelData } = await supabase.from('hotels').select('name').eq('id', hotelId).single()
      if (hotelData) setHotelName(hotelData.name)

      const { data: rooms } = await supabase.from('rooms').select('status').eq('hotel_id', hotelId)

      const [checkins, checkouts, active] = await Promise.all([
        supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).gte('check_in_at', todayStart),
        supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).gte('check_out_at', todayStart).eq('status', 'checked_out'),
        supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId).eq('status', 'active'),
      ])

      const free = rooms?.filter(r => r.status === 'available').length ?? 0
      const occupied = rooms?.filter(r => r.status === 'occupied').length ?? 0
      const cleaning = rooms?.filter(r => r.status === 'cleaning').length ?? 0

      setStats({ free, occupied, cleaning, todayCheckins: checkins.count ?? 0, todayCheckouts: checkouts.count ?? 0, currentGuests: active.count ?? 0 })
    }

    loadData()
  }, [profile?.hotel_id])

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-4 rounded-2xl">
        <div className="bg-primary text-primary-foreground p-2.5 rounded-xl">
          <Hotel className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Hola, {profile?.full_name?.split(' ')[0] ?? 'María'}</h1>
          <p className="text-xs text-muted-foreground font-semibold">{hotelName || 'Hotel'} · Recepción</p>
        </div>
      </div>

      {/* Occupancy Chart */}
      <OccupancyChart data={{ available: stats.free, occupied: stats.occupied, cleaning: stats.cleaning, maintenance: 0 }} />

      {/* Operations today */}
      <div className="bg-white rounded-2xl shadow-sm border border-border p-5 space-y-4">
        <h2 className="font-bold text-foreground text-sm tracking-wide uppercase">Operaciones de Hoy</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-muted rounded-2xl">
            <div className="bg-green-100 p-2 rounded-xl mb-2 text-green-600"><LogIn className="w-5 h-5" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Check-in</span>
            <span className="text-lg font-bold text-foreground mt-0.5">{stats.todayCheckins}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-2xl">
            <div className="bg-orange-100 p-2 rounded-xl mb-2 text-orange-600"><LogOut className="w-5 h-5" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Check-out</span>
            <span className="text-lg font-bold text-foreground mt-0.5">{stats.todayCheckouts}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted rounded-2xl">
            <div className="bg-primary/20 p-2 rounded-xl mb-2 text-primary"><Users className="w-5 h-5" /></div>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Alojados</span>
            <span className="text-lg font-bold text-foreground mt-0.5">{stats.currentGuests}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/recepcion/checkin"
          className="flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground p-4 rounded-2xl text-base font-bold hover:opacity-90 transition-colors shadow-sm cursor-pointer min-h-[72px]">
          <LogIn size={24} /> Registrar Check-in
        </Link>
        <Link href="/recepcion/checkout"
          className="flex flex-col items-center justify-center gap-2 bg-orange-600 text-white p-4 rounded-2xl text-base font-bold hover:bg-orange-700 transition-colors shadow-sm cursor-pointer min-h-[72px]">
          <LogOut size={24} /> Registrar Check-out
        </Link>
      </div>

      {/* Quick tip */}
      {stats.occupied > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <TrendingUp className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>{stats.occupied} habitaciones ocupadas</strong> — {stats.currentGuests} huéspedes alojados actualmente.
            {stats.free > 0 ? ` Quedan ${stats.free} habitaciones libres.` : ' Todas las habitaciones están ocupadas.'}
          </p>
        </div>
      )}
    </div>
  )
}
