export function SidebarSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 bg-sidebar flex-col p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-sidebar-hover rounded-lg" />
        <div className="h-px bg-white/5" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-10 bg-sidebar-hover rounded-lg" />)}
      </aside>
      <main className="flex-1 p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </main>
    </div>
  )
}
