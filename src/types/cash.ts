export type PaymentMethod = 'cash' | 'card' | 'yape' | 'plin'

export interface CashMovement {
  id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  payment_method: string
  created_at: string
  created_by?: string
  checkin_id?: string
  closure_id: string | null
  profiles?: { full_name: string } | null
}

export interface CashClosure {
  id: string
  date: string
  total_income: number
  total_expense: number
  balance: number
  closed_at: string
  closed_by: string
  closed_by_name?: string
  closed_by_role?: string
  notes?: string
}

export interface CashSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  byCash: number
  byCard: number
  byYape: number
  byPlin: number
}
