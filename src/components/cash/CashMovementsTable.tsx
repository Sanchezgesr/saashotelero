import { fmtTime } from '@/lib/utils/dates'
import type { CashMovement } from '@/types'

export function CashMovementsTable({ movements, showDate }: { movements: CashMovement[]; showDate?: boolean }) {
  if (movements.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Sin movimientos.</p>
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left">
          <tr>
            {showDate && <th className="px-4 py-3 font-medium">Fecha</th>}
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Monto</th>
            <th className="px-4 py-3 font-medium">Método</th>
            <th className="px-4 py-3 font-medium">Descripción</th>
            <th className="px-4 py-3 font-medium">Responsable</th>
            {!showDate && <th className="px-4 py-3 font-medium">Hora</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {movements.map((m) => (
            <tr key={m.id} className="hover:bg-muted/50">
              {showDate && <td className="px-4 py-3 text-xs text-muted-foreground">{fmtTime(m.created_at)}</td>}
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {m.type === 'income' ? 'Ingreso' : 'Egreso'}
                </span>
              </td>
              <td className="px-4 py-3 capitalize">{m.category}</td>
              <td className="px-4 py-3 font-medium">S/. {Number(m.amount).toFixed(2)}</td>
              <td className="px-4 py-3 capitalize">{m.payment_method}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.description}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{m.profiles?.full_name || '—'}</td>
              {!showDate && <td className="px-4 py-3 text-muted-foreground text-xs">{fmtTime(m.created_at)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
