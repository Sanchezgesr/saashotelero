import { Sidebar } from '@/components/layout/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { HotelThemeLoader } from '@/components/HotelThemeLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionWatcher } from '@/components/SessionWatcher'

export default function HotelAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <HotelThemeLoader />
      <SessionWatcher />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-64 flex-1 p-8 bg-background">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  )
}
