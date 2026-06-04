'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart3,
  Hotel,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/supabase/actions'

const menuItems = [
  { label: 'Dashboard',     icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Hoteles',       icon: Building2,        href: '/admin/hotels' },
  { label: 'Usuarios',      icon: Users,            href: '/admin/users' },
  { label: 'Planes',        icon: CreditCard,       href: '/admin/plans' },
  { label: 'Auditoría',     icon: FileText,         href: '/admin/audit' },
  { label: 'Métricas',      icon: BarChart3,        href: '/admin/metrics' },
]

export default function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 flex items-center gap-2">
        <Hotel className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-bold text-gray-800">HControl</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Super Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@hotelsaas.com</p>
          </div>
        </div>
        <form action={signOut}>
          <button type="submit"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors cursor-pointer">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
