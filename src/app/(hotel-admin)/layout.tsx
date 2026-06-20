import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { HotelThemeLoader } from '@/components/HotelThemeLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionWatcher } from '@/components/SessionWatcher'
import { ConnectionStatus } from '@/components/ConnectionStatus'

export const metadata: Metadata = {
  title: 'Panel del Hotel — HControl',
  description: 'Dashboard de gestión hotelera: habitaciones, check-ins, caja, facturación SUNAT y reportes.',
}

export default function HotelAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <HotelThemeLoader />
      <SessionWatcher />
      <ConnectionStatus />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 p-4 md:p-8 bg-background">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  )
}
