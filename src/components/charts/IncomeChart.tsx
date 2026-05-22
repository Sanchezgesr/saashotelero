'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type DataPoint = { label: string; income: number; expense: number }

export default function IncomeChart({ data, title = 'Ingresos vs Egresos' }: { data: DataPoint[]; title?: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8, border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="income" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="Ingresos" />
            <Line type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} name="Egresos" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
