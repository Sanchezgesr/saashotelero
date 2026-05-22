import type { PlanId } from '@/types'
export type { PlanId }

export type PlanConfig = {
  name: string
  durationDays: number
  price: number
  description: string
}

export const PLANS: Record<PlanId, PlanConfig> = {
  prueba:   { name: 'Prueba',     durationDays: 30,  price: 0,   description: '30 días de prueba gratuita' },
  mensual:  { name: 'Mensual',    durationDays: 30,  price: 50,  description: 'Facturación mensual' },
  trimestral: { name: 'Trimestral', durationDays: 90,  price: 140, description: 'Facturación trimestral' },
  semestral: { name: 'Semestral',  durationDays: 180, price: 270, description: 'Facturación semestral' },
  anual:    { name: 'Anual',      durationDays: 365, price: 480, description: 'Facturación anual' },
}

export function calculateExpiry(planId: PlanId): string {
  const plan = PLANS[planId]
  const date = new Date()
  date.setDate(date.getDate() + plan.durationDays)
  return date.toISOString()
}

export function getPlanLabel(planId?: string): string {
  if (!planId || !(planId in PLANS)) return planId ?? 'Sin plan'
  return PLANS[planId as PlanId].name
}
