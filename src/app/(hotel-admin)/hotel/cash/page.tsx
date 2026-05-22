'use client'

import { useState } from 'react'
import { CashTodayTab } from '@/components/cash/CashTodayTab'
import { CashClosuresTab } from '@/components/cash/CashClosuresTab'
import { CashReportTab } from '@/components/cash/CashReportTab'

type Tab = 'hoy' | 'cierres' | 'reporte'

export default function CashPage() {
  const [tab, setTab] = useState<Tab>('hoy')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Caja</h1>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {(['hoy', 'cierres', 'reporte'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'hoy' ? 'Hoy' : t === 'cierres' ? 'Cierres' : 'Reporte'}
          </button>
        ))}
      </div>

      {tab === 'hoy' && <CashTodayTab />}
      {tab === 'cierres' && <CashClosuresTab />}
      {tab === 'reporte' && <CashReportTab />}
    </div>
  )
}
