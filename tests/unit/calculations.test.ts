import { calcSummary } from '@/lib/cash/calculations'
import type { CashMovement } from '@/types'

const makeMovement = (overrides: Partial<CashMovement>): CashMovement => ({
  id: '00000000-0000-4000-8000-000000000001',
  hotel_id: '00000000-0000-4000-8000-000000000002',
  type: 'income',
  category: 'checkin',
  amount: 100,
  payment_method: 'cash',
  description: 'Test',
  created_by: '00000000-0000-4000-8000-000000000003',
  created_at: new Date().toISOString(),
  closure_id: null,
  ...overrides,
})

describe('calcSummary', () => {
  it('debe retornar ceros para lista vacía', () => {
    const result = calcSummary([])
    expect(result.totalIncome).toBe(0)
    expect(result.totalExpense).toBe(0)
    expect(result.balance).toBe(0)
    expect(result.byCash).toBe(0)
    expect(result.byCard).toBe(0)
    expect(result.byYape).toBe(0)
    expect(result.byPlin).toBe(0)
  })

  it('debe sumar correctamente ingresos y egresos', () => {
    const movements = [
      makeMovement({ type: 'income', amount: 200, payment_method: 'cash' }),
      makeMovement({ type: 'income', amount: 150, payment_method: 'card' }),
      makeMovement({ type: 'expense', amount: 50, payment_method: 'cash' }),
    ]
    const result = calcSummary(movements)
    expect(result.totalIncome).toBe(350)
    expect(result.totalExpense).toBe(50)
    expect(result.balance).toBe(300)
  })

  it('debe agrupar por método de pago', () => {
    const movements = [
      makeMovement({ amount: 100, payment_method: 'cash' }),
      makeMovement({ amount: 200, payment_method: 'card' }),
      makeMovement({ amount: 50, payment_method: 'yape' }),
      makeMovement({ amount: 30, payment_method: 'plin' }),
      makeMovement({ amount: 20, payment_method: 'cash' }),
    ]
    const result = calcSummary(movements)
    expect(result.byCash).toBe(120)
    expect(result.byCard).toBe(200)
    expect(result.byYape).toBe(50)
    expect(result.byPlin).toBe(30)
  })

  it('debe sumar todos los movimientos por método de pago (sin filtrar por tipo)', () => {
    const movements = [
      makeMovement({ type: 'income', amount: 100, payment_method: 'cash' }),
      makeMovement({ type: 'expense', amount: 30, payment_method: 'cash' }),
    ]
    const result = calcSummary(movements)
    expect(result.byCash).toBe(130)
    expect(result.totalIncome).toBe(100)
    expect(result.totalExpense).toBe(30)
    expect(result.balance).toBe(70)
  })
})
