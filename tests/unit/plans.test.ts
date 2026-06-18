import { calculateExpiry, getPlanLabel } from '@/lib/utils/plans'
import type { PlanConfig } from '@/lib/utils/plans'

const mockPlans: PlanConfig[] = [
  { name: 'basico_mensual', label: 'Básico Mensual', duration_days: 30, price: 45, description: 'Sin facturación electrónica. Pago mensual.', sort_order: 1 },
  { name: 'pro_mensual', label: 'Pro Mensual', duration_days: 30, price: 65, description: 'Con facturación electrónica SUNAT. Pago mensual.', sort_order: 5 },
]

describe('calculateExpiry', () => {
  it('debe devolver fecha futura para 30 días', () => {
    const expiry = calculateExpiry(30)
    const now = new Date()
    const diffDays = (new Date(expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThan(25)
    expect(diffDays).toBeLessThan(35)
  })

  it('debe devolver fecha futura para 365 días', () => {
    const expiry = calculateExpiry(365)
    const diffDays = (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBeGreaterThan(360)
    expect(diffDays).toBeLessThan(370)
  })
})

describe('getPlanLabel', () => {
  it('debe devolver label correcto cuando encuentra el plan', () => {
    expect(getPlanLabel('basico_mensual', mockPlans)).toBe('Básico Mensual')
    expect(getPlanLabel('pro_mensual', mockPlans)).toBe('Pro Mensual')
  })

  it('debe devolver el planId si no se encuentra', () => {
    expect(getPlanLabel('plan_inexistente', mockPlans)).toBe('plan_inexistente')
  })

  it('debe devolver Sin plan si planId es undefined', () => {
    expect(getPlanLabel(undefined, mockPlans)).toBe('Sin plan')
  })
})
