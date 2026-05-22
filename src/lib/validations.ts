import { z } from 'zod'

export const checkinSchema = z.object({
  hotel_id:        z.string().uuid(),
  guest_id:        z.string().uuid(),
  room_id:         z.string().uuid(),
  room_number:     z.string().min(1).max(10),
  price_per_night: z.number().positive().max(99999),
  total_price:     z.number().positive().max(999999),
  payment_method:  z.enum(['cash', 'card', 'yape', 'plin']),
  guest_name:      z.string().min(1).max(100).trim(),
  nights:          z.number().int().min(1).max(365),
  notes:           z.string().max(500).optional(),
})

export const createHotelSchema = z.object({
  name:    z.string().min(2).max(100).trim(),
  ruc:     z.string().regex(/^\d{11}$/, 'RUC debe tener 11 dígitos').optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
  city:    z.string().max(100).optional().or(z.literal('')),
  phone:   z.string().max(20).optional().or(z.literal('')),
  plan:    z.enum(['prueba', 'mensual', 'trimestral', 'semestral', 'anual']),
})

export const createGuestSchema = z.object({
  hotel_id:    z.string().uuid(),
  full_name:   z.string().min(2).max(100).trim(),
  dni:         z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  phone:       z.string().max(20).optional().or(z.literal('')),
  email:       z.string().email().optional().or(z.literal('')),
  nationality: z.string().max(50).optional().or(z.literal('')),
})

export const cashMovementSchema = z.object({
  hotel_id:       z.string().uuid(),
  type:           z.enum(['income', 'expense']),
  category:       z.enum(['checkin', 'service', 'supply', 'salary', 'other']),
  amount:         z.number().positive().max(999999),
  description:    z.string().max(300).trim(),
  payment_method: z.enum(['cash', 'card', 'yape', 'plin']),
})

export function parseAction<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { error: msg, data: null as T | null }
  }
  return { error: null, data: result.data }
}
