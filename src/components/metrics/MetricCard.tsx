import type { LucideIcon } from 'lucide-react'

export function MetricCard({ label, value, icon: Icon, trend, trendUp, color, bg }: {
  label: string; value: string; icon: LucideIcon; trend?: string; trendUp?: boolean; color: string; bg: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bg} ${color} p-2.5 rounded-lg`}><Icon className="w-5 h-5" /></div>
        {trend && <div className={`flex items-center text-xs font-bold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>{trend}</div>}
      </div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  )
}
