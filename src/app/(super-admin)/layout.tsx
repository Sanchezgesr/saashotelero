import Sidebar from '@/components/layout/SuperAdminSidebar'
import Header from '@/components/layout/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SessionWatcher } from '@/components/SessionWatcher'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SessionWatcher />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
