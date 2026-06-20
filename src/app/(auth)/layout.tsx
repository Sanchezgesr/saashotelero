import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión — HControl',
  description: 'Sistema de gestión hotelera multi-tenant. Accede al panel de control de tu hotel.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
