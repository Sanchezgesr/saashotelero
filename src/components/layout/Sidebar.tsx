'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BedDouble, Calendar, Users,
  LogIn, Wallet, BarChart3, UserCog, Settings,
  LogOut, Building2, Menu, X
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
  const [mobileOpen, setMobileOpen] = useState(false)
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
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border p-2.5 rounded-xl shadow-md cursor-pointer hover:bg-accent transition-colors">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-sidebar to-[#0f172a] flex-col transition-transform duration-300',
        'md:flex',
        mobileOpen ? 'flex translate-x-0' : 'hidden -translate-x-full md:translate-x-0'
      )}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/hcontrol.png" alt="HControl" className="w-12 h-12 object-contain" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-semibold">Bienvenido</p>
              <p className="text-white font-bold text-sm truncate leading-tight mt-0.5">{hotelName || 'HControl'}</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/60 hover:text-white p-1 cursor-pointer">
            <X size={20} />
          </button>
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
                onClick={() => setMobileOpen(false)}
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

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-border flex justify-around items-center py-1 md:hidden z-50">
        {[
          { label: 'Dashboard',    icon: LayoutDashboard, href: '/hotel/dashboard' },
          { label: 'Hab.',         icon: BedDouble,       href: '/hotel/rooms' },
          { label: 'Caja',         icon: Wallet,          href: '/hotel/cash' },
          { label: 'Reservas',     icon: Calendar,        href: '/hotel/reservations' },
          { label: 'Empleados',    icon: UserCog,         href: '/hotel/staff' },
        ].map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-colors',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}>
              <Icon size={18} /> {item.label}
            </Link>
          )
        })}
        <form action={signOut}>
          <button type="submit"
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] text-muted-foreground cursor-pointer">
            <LogOut size={18} /> Salir
          </button>
        </form>
      </nav>
    </>
  )
}
