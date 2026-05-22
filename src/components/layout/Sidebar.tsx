'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BedDouble, Calendar, Users,
  LogIn, Wallet, BarChart3, UserCog, Settings,
  LogOut, Building2
} from 'lucide-react'
import { signOut } from '@/lib/supabase/actions'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

const menuItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, href: '/hotel/dashboard' },
  { label: 'Habitaciones', icon: BedDouble,       href: '/hotel/rooms' },
  { label: 'Reservas',     icon: Calendar,        href: '/hotel/reservations' },
  { label: 'Clientes',     icon: Users,           href: '/hotel/guests' },
  { label: 'Check-in/out', icon: LogIn,           href: '/hotel/checkin' },
  { label: 'Caja',         icon: Wallet,          href: '/hotel/cash' },
  { label: 'Reportes',     icon: BarChart3,       href: '/hotel/reports' },
  { label: 'Empleados',    icon: UserCog,         href: '/hotel/staff' },
  { label: 'Configuración',icon: Settings,        href: '/hotel/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useUser()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoKey, setLogoKey] = useState(0)
  const [hotelName, setHotelName] = useState('')

  const fetchHotel = useCallback(async (hotelId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('hotels').select('name, logo_url').eq('id', hotelId).single()
    if (data) {
      setHotelName(data.name)
      if (data.logo_url) setLogoUrl(data.logo_url)
    }
  }, [])

  useEffect(() => {
    if (!profile?.hotel_id) return
    fetchHotel(profile.hotel_id)
  }, [profile?.hotel_id, fetchHotel])

  useEffect(() => {
    const handler = () => {
      if (profile?.hotel_id) {
        fetchHotel(profile.hotel_id)
        setLogoKey(k => k + 1)
      }
    }
    window.addEventListener('logo-updated', handler)
    return () => window.removeEventListener('logo-updated', handler)
  }, [profile?.hotel_id, fetchHotel])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-sidebar to-[#0f172a] flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="text-primary" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-semibold">Bienvenido</p>
            <p className="text-white font-bold text-sm truncate leading-tight mt-0.5">{hotelName || 'SControl'}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/5" />

      <nav className="overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={18} className={cn(isActive ? 'text-white' : 'text-sidebar-foreground/50')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {logoUrl && (
        <div className="mx-4 h-px bg-white/5" />
      )}

      {logoUrl && (
        <div className="flex-1 flex items-center justify-center px-6">
          <img key={logoKey} src={logoUrl} alt="Logo hotel" className="max-h-40 max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      )}

      <div className="mx-4 h-px bg-white/5" />

      <div className="p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-white hover:bg-white/10 w-full transition-all duration-200"
          >
            <LogOut size={18} className="text-sidebar-foreground/50" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
