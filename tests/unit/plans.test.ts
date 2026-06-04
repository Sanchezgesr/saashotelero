import { calculateExpiry, getPlanLabel } from '@/lib/utils/plans'

describe('calculateExpiry', () => {
  it('debe devolver fecha futura para plan mensual', () => {
    const expiry = calculateExpiry('mensual')
    const now = new Date()
    const diffDays = (new Date(expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThan(25)
    expect(diffDays).toBeLessThan(35)
  })

  it('debe devolver fecha futura para plan anual', () => {
    const expiry = calculateExpiry('anual')
    const diffDays = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThan(360)
    expect(diffDays).toBeLessThan(370)
  })
})

describe('getPlanLabel', () => {
  it('debe devolver label correcto para cada plan', () => {
    expect(getPlanLabel('prueba')).toBe('Prueba')
    expect(getPlanLabel('mensual')).toBe('Mensual')
    expect(getPlanLabel('trimestral')).toBe('Trimestral')
    expect(getPlanLabel('semestral')).toBe('Semestral')
    expect(getPlanLabel('anual')).toBe('Anual')
  })
})
