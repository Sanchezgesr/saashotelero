import type { CashMovement, CashSummary } from '@/types'

export function calcSummary(movements: CashMovement[]): CashSummary {
  const income = movements.filter(x => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0)
  const expense = movements.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0)
  const byCash = movements.filter(x => x.payment_method === 'cash').reduce((s, x) => s + Number(x.amount), 0)
  const byCard = movements.filter(x => x.payment_method === 'card').reduce((s, x) => s + Number(x.amount), 0)
  const byYape = movements.filter(x => x.payment_method === 'yape').reduce((s, x) => s + Number(x.amount), 0)
  const byPlin = movements.filter(x => x.payment_method === 'plin').reduce((s, x) => s + Number(x.amount), 0)

  return { totalIncome: income, totalExpense: expense, balance: income - expense, byCash, byCard, byYape, byPlin }
}
