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
  plan:    z.enum(['basico_mensual', 'basico_trimestral', 'basico_semestral', 'basico_anual', 'pro_mensual', 'pro_trimestral', 'pro_semestral', 'pro_anual']),
  lucode_token: z.string().optional().or(z.literal('')),
})

export const createGuestSchema = z.object({
  hotel_id:    z.string().uuid(),
  full_name:   z.string().min(2).max(100).trim(),
  dni:         z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  phone:       z.string().max(20).optional().or(z.literal('')),
  email:       z.string().email().optional().or(z.literal('')),
  nationality: z.string().max(50).optional().or(z.literal('')),
})

export const INCOME_CATEGORIES = ['checkin', 'service', 'other'] as const
export const EXPENSE_CATEGORIES = [
  'Limpieza y mantenimiento',
  'Servicios básicos',
  'Compras de insumos',
  'Comisiones',
  'Gastos de personal',
  'Otros',
] as const

export const cashMovementSchema = z.object({
  hotel_id:       z.string().uuid(),
  type:           z.enum(['income', 'expense']),
  category:       z.string().min(1).max(50),
  amount:         z.number().positive().max(999999),
  description:    z.string().max(300).trim(),
  payment_method: z.enum(['cash', 'card', 'yape', 'plin']),
})

export const emitirComprobanteSchema = z.object({
  hotel_id: z.string().uuid(),
  checkin_id: z.string().uuid(),
  tipo: z.enum(['boleta', 'factura']),
  cliente_tipo_documento: z.enum(['1', '6'], { message: 'Tipo documento: 1=DNI, 6=RUC' }),
  cliente_numero_documento: z.string(),
  cliente_denominacion: z.string().min(1).max(100).trim(),
  cliente_direccion: z.preprocess(
    (v) => (v == null ? '' : v),
    z.string().max(200).trim()
  ),
}).refine(data => {
  if (data.cliente_tipo_documento === '1') return /^\d{8}$/.test(data.cliente_numero_documento)
  if (data.cliente_tipo_documento === '6') return /^\d{11}$/.test(data.cliente_numero_documento)
  return false
}, { message: 'Documento debe tener 8 dígitos (DNI) u 11 dígitos (RUC)', path: ['cliente_numero_documento'] })
.refine(data => {
  if (data.tipo === 'factura' && !data.cliente_direccion) return false
  return true
}, { message: 'Dirección es obligatoria para Factura', path: ['cliente_direccion'] })

export const createReservationSchema = z.object({
  hotel_id: z.string().uuid(),
  room_id: z.string().uuid(),
  guest_id: z.string().uuid(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha formato YYYY-MM-DD'),
  total_price: z.number().positive().max(999999),
  notes: z.string().max(500).optional(),
})

export function parseAction<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const msg = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { error: msg, data: null as T | null }
  }
  return { error: null, data: result.data }
}
