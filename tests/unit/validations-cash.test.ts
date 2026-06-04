import { cashMovementSchema } from '@/lib/validations'

const VALID_HOTEL_ID = '00000000-0000-4000-8000-000000000001'

describe('cashMovementSchema', () => {
  it('debe aceptar un movimiento de ingreso válido', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'income',
      category: 'checkin',
      amount: 150,
      payment_method: 'cash',
      description: 'Pago habitación 101',
    })
    expect(result.success).toBe(true)
  })

  it('debe aceptar un movimiento de egreso válido', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'expense',
      category: 'supply',
      amount: 50,
      payment_method: 'yape',
      description: 'Compra de jabón',
    })
    expect(result.success).toBe(true)
  })

  it('debe rechazar monto negativo', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'income',
      category: 'other',
      amount: -100,
      payment_method: 'cash',
      description: 'Monto negativo',
    })
    expect(result.success).toBe(false)
  })

  it('debe rechazar método de pago inválido', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'income',
      category: 'other',
      amount: 100,
      payment_method: 'bitcoin',
      description: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('debe rechazar tipo inválido', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'transfer',
      category: 'other',
      amount: 100,
      payment_method: 'cash',
      description: 'Test',
    })
    expect(result.success).toBe(false)
  })

  it('debe rechazar categoría inválida', () => {
    const result = cashMovementSchema.safeParse({
      hotel_id: VALID_HOTEL_ID,
      type: 'income',
      category: 'hospedaje',
      amount: 100,
      payment_method: 'cash',
      description: 'Test',
    })
    expect(result.success).toBe(false)
  })
})
