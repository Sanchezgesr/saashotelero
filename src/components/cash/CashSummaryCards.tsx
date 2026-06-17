import { Wallet } from 'lucide-react'
import type { CashSummary } from '@/types'

export function CashSummaryCards({ summary, compact }: { summary: CashSummary; compact?: boolean }) {
  const cls = compact ? 'p-4' : 'p-5'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      <div className={`bg-card rounded-xl shadow-sm border border-border ${cls}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-green-100 p-2 md:p-3 rounded-lg"><Wallet className="text-green-600" size={18} /></div>
          <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Ingresos</p><p className="text-base md:text-xl font-bold text-green-600 truncate">S/. {summary.totalIncome.toFixed(2)}</p></div>
        </div>
      </div>
      <div className={`bg-card rounded-xl shadow-sm border border-border ${cls}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-red-100 p-2 md:p-3 rounded-lg"><Wallet className="text-red-600" size={18} /></div>
          <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Egresos</p><p className="text-base md:text-xl font-bold text-red-600 truncate">S/. {summary.totalExpense.toFixed(2)}</p></div>
        </div>
      </div>
      <div className={`bg-card rounded-xl shadow-sm border border-border ${cls}`}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-primary/20 p-2 md:p-3 rounded-lg"><Wallet className="text-primary" size={18} /></div>
          <div className="min-w-0"><p className="text-xs md:text-sm text-muted-foreground">Balance</p><p className="text-base md:text-xl font-bold truncate">S/. {summary.balance.toFixed(2)}</p></div>
        </div>
      </div>
      <div className={`bg-card rounded-xl shadow-sm border border-border ${cls}`}>
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Por método</p>
        <div className="space-y-0.5 md:space-y-1 text-[11px] md:text-xs">
          <p>Efectivo: S/. {summary.byCash.toFixed(2)}</p>
          <p>Tarjeta: S/. {summary.byCard.toFixed(2)}</p>
          <p>Yape: S/. {summary.byYape.toFixed(2)}</p>
          <p>Plin: S/. {summary.byPlin.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
