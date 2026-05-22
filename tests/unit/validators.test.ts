import { roomSchema } from '@/lib/validators'

describe('roomSchema', () => {
  it('debe fallar si el precio es negativo', () => {
    const result = roomSchema.safeParse({ 
      number: '101', 
      type: 'simple', 
      capacity: 1, 
      price_per_night: -10 
    })
    expect(result.success).toBe(false)
  })

  it('debe pasar con datos válidos', () => {
    const result = roomSchema.safeParse({ 
      number: '101', 
      type: 'simple', 
      capacity: 1, 
      price_per_night: 80 
    })
    expect(result.success).toBe(true)
  })
})
