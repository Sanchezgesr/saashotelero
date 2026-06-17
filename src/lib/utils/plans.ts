export type PlanConfig = {
  name: string
  label: string
  duration_days: number
  price: number
  description: string
  sort_order: number
}

export function calculateExpiry(durationDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() + durationDays)
  return date.toISOString()
}

export function getPlanLabel(planId?: string, plans?: PlanConfig[]): string {
  if (!planId) return 'Sin plan'
  const found = plans?.find(p => p.name === planId)
  return found?.label ?? planId
}
