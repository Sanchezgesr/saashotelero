'use client'

import { type LucideIcon } from 'lucide-react'

type TrendDir = 'up' | 'down' | 'neutral'

export default function KpiCard({
  title, value, icon: Icon, trend, trendLabel, color = 'primary',
}: {
  title: string
  value: string
  icon: LucideIcon
  trend?: TrendDir
  trendLabel?: string
  color?: 'primary' | 'green' | 'amber' | 'red'
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }

  const trendColors: Record<string, string> = {
    up: 'text-green-600',
    down: 'text-red-500',
    neutral: 'text-gray-400',
  }

  const trendIcons: Record<string, string> = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-lg border ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1 truncate">{value}</p>
        {trend && (
          <p className={`text-xs font-medium mt-1 flex items-center gap-0.5 ${trendColors[trend]}`}>
            <span>{trendIcons[trend]}</span>
            {trendLabel || ''}
          </p>
        )}
      </div>
    </div>
  )
}
