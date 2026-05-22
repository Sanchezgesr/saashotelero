export function PlanPieChart({ plans }: { plans: Record<string, number> }) {
  const total = Object.values(plans).reduce((a, b) => a + b, 0)
  if (total === 0) return <div className="flex items-center justify-center h-full text-sm text-gray-400">Sin datos</div>

  const fills = ['#9ca3af', '#3b82f6', '#6366f1', '#8b5cf6', '#f59e0b']
  const colors = ['bg-gray-400', 'bg-primary/100', 'bg-indigo-500', 'bg-violet-500', 'bg-amber-500']
  const segments = Object.entries(plans).map(([name, count], i) => ({ label: name, count, color: colors[i % colors.length], fill: fills[i % fills.length] })).filter(s => s.count > 0)

  let accumulatedAngle = 0
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <svg width="150" height="150" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="20" />
        {segments.map((s, i) => {
          const percentage = s.count / total; const dashArray = `${percentage * 251.2} 251.2`
          const dashOffset = 251.2 - accumulatedAngle; accumulatedAngle += percentage * 251.2
          return <circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={s.fill} strokeWidth="20" strokeDasharray={dashArray} strokeDashoffset={dashOffset} transform="rotate(-90 50 50)" className="transition-all duration-500" />
        })}
        <circle cx="50" cy="50" r="28" fill="#ffffff" />
      </svg>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span className={`w-3 h-3 rounded-full ${s.color}`} />
            <span className="font-medium">{s.label}:</span>
            <span className="font-bold">{s.count} ({Math.round((s.count / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
