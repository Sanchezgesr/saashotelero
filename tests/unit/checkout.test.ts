import { calculateStayTotal } from '@/lib/utils/dates'

describe('calculateStayTotal', () => {
  it('debe calcular correctamente 1 noche', () => {
    const result = calculateStayTotal('2026-06-10T14:00:00', '2026-06-11T14:00:00', 80)
    expect(result.nights).toBe(1)
    expect(result.total).toBe(80)
  })

  it('debe calcular correctamente 3 noches', () => {
    const result = calculateStayTotal('2026-06-10T14:00:00', '2026-06-13T14:00:00', 80)
    expect(result.nights).toBe(3)
    expect(result.total).toBe(240)
  })

  it('debe redondear horas parciales al día siguiente si superan las 24h', () => {
    const result = calculateStayTotal('2026-06-10T14:00:00', '2026-06-11T15:00:00', 100)
    expect(result.nights).toBe(2)
  })
})
