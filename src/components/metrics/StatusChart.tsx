import { Building2, ShieldAlert, Calendar } from 'lucide-react'

export function StatusChart({ activeHotels, suspendedHotels, expiringSoon }: {
  activeHotels: number; suspendedHotels: number; expiringSoon: number
}) {
  const total = activeHotels + suspendedHotels
  if (total === 0) return <div className="text-gray-400 text-center py-6 text-sm">Sin datos</div>

  const activePct = Math.round((activeHotels / total) * 100)
  const suspendedPct = 100 - activePct

  const bars = [
    { label: 'Activos', count: activeHotels, pct: activePct, icon: Building2, color: 'text-green-600', barColor: 'bg-green-500' },
    { label: 'Suspendidos', count: suspendedHotels, pct: suspendedPct, icon: ShieldAlert, color: 'text-red-600', barColor: 'bg-red-500' },
    { label: 'Próximos a vencer (30d)', count: expiringSoon, pct: Math.round((expiringSoon / Math.max(total, 1)) * 100), icon: Calendar, color: 'text-orange-500', barColor: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-4">
      {bars.map((b) => (
        <div key={b.label}>
          <div className="flex justify-between text-sm font-semibold mb-1 text-gray-700">
            <span className="flex items-center gap-1.5"><b.icon className={`w-4 h-4 ${b.color}`} /> {b.label} ({b.count})</span>
            <span>{b.pct}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${b.barColor} rounded-full transition-all duration-500`} style={{ width: `${b.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
