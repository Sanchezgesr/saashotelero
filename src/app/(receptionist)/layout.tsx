'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, LogIn, LogOut, BedDouble, Users, Wallet, Building2, FileText } from 'lucide-react'
import { signOut } from '@/lib/supabase/actions'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider } from '@/components/ThemeProvider'
import { HotelThemeLoader } from '@/components/HotelThemeLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionWatcher } from '@/components/SessionWatcher'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { DarkModeToggle } from '@/components/DarkModeToggle'

const menuItems = [
  { label: 'Inicio',       icon: Home,      href: '/recepcion/dashboard' },
  { label: 'Check-in',     icon: LogIn,     href: '/recepcion/checkin' },
  { label: 'Check-out',    icon: LogOut,    href: '/recepcion/checkout' },
  { label: 'Habitaciones', icon: BedDouble, href: '/recepcion/rooms' },
  { label: 'Clientes',     icon: Users,     href: '/recepcion/guests' },
  { label: 'Caja',         icon: Wallet,    href: '/recepcion/cash' },
  { label: 'Comprobantes', icon: FileText,  href: '/recepcion/invoices' },
]

function Sidebar() {
  const pathname = usePathname()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoKey, setLogoKey] = useState(0)
  const [hotelName, setHotelName] = useState('')
  const hotelIdRef = useRef<string | null>(null)

  const fetchHotelId = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('hotel_id').eq('id', user.id).single()
    if (data?.hotel_id) hotelIdRef.current = data.hotel_id
    return data?.hotel_id ?? null
  }, [])

  const fetchHotel = useCallback(async (hotelId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('hotels').select('name, logo_url').eq('id', hotelId).single()
    if (data) {
      setHotelName(data.name)
      if (data.logo_url) setLogoUrl(data.logo_url)
    }
  }, [])

  useEffect(() => {
    fetchHotelId().then(id => { if (id) fetchHotel(id) })
  }, [fetchHotelId, fetchHotel])

  useEffect(() => {
    const handler = async () => {
      const id = hotelIdRef.current || await fetchHotelId()
      if (id) { fetchHotel(id); setLogoKey(k => k + 1) }
    }
    window.addEventListener('logo-updated', handler)
    return () => window.removeEventListener('logo-updated', handler)
  }, [fetchHotelId, fetchHotel])

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-sidebar to-[#0f172a] flex-col hidden md:flex">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="text-primary" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-semibold">Bienvenido</p>
            <p className="text-white font-bold text-sm truncate leading-tight mt-0.5">{hotelName || 'Recepción'}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/5" />

      <nav className="overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/10'
              )}>
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

      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-sidebar-foreground/40 font-medium">Apariencia</span>
          <DarkModeToggle className="text-sidebar-foreground/70 hover:text-white hover:bg-white/10" />
        </div>
        <form action={signOut}>
          <button type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-white hover:bg-white/10 w-full transition-all duration-200">
            <LogOut size={18} className="text-sidebar-foreground/50" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}

function BottomNav() {
  const pathname = usePathname()

  const mobileItems = [
    { label: 'Inicio',       icon: Home,      href: '/recepcion/dashboard' },
    { label: 'Check-in',     icon: LogIn,     href: '/recepcion/checkin' },
    { label: 'Check-out',    icon: LogOut,    href: '/recepcion/checkout' },
    { label: 'Habitaciones', icon: BedDouble, href: '/recepcion/rooms' },
    { label: 'Clientes',     icon: Users,     href: '/recepcion/guests' },
    { label: 'Caja',         icon: Wallet,    href: '/recepcion/cash' },
    { label: 'Comp.',        icon: FileText,  href: '/recepcion/invoices' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <nav className="overflow-x-auto bg-white border-t border-border scrollbar-hide">
        <div className="flex items-center min-w-max px-1 py-1.5 gap-0.5">
          {mobileItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-colors shrink-0',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}>
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
          <DarkModeToggle className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground shrink-0" />
          <form action={signOut} className="shrink-0">
            <button type="submit"
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer">
              <LogOut size={18} /> Salir
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <HotelThemeLoader />
      <SessionWatcher />
      <ConnectionStatus />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <BottomNav />
      </div>
    </ThemeProvider>
  )
}
