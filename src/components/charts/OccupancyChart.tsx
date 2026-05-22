'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#16a34a', '#dc2626', '#d97706', '#6b7280']
const LABELS: Record<string, string> = { available: 'Disponible', occupied: 'Ocupada', cleaning: 'Limpieza', maintenance: 'Mantenimiento' }

export default function OccupancyChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([k, v]) => ({ name: LABELS[k] || k, value: v }))

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-bold text-foreground mb-4">Estado de Habitaciones</h3>
      {chartData.every(d => d.value === 0) ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
      ) : (
        <div className="flex items-center gap-6">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="value">
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {chartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
