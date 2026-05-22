export type HotelStatus = 'active' | 'suspended' | 'deleted'
export type ThemeId = 'default' | 'ocean' | 'emerald' | 'sunset' | 'midnight' | 'rose' | 'amber' | 'violet'
export type UserRole = 'super_admin' | 'hotel_admin' | 'receptionist'

import type { PlanId } from './plan'

export interface Hotel {
  id: string
  name: string
  ruc?: string
  address?: string
  city?: string
  phone?: string
  logo_url?: string
  status: HotelStatus
  plan: PlanId
  theme?: ThemeId
  plan_expires_at?: string
  created_at: string
}

export interface Profile {
  id: string
  hotel_id?: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}
