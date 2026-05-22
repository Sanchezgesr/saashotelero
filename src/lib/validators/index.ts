import { z } from 'zod'

export const roomSchema = z.object({
  number: z.string().min(1, "El número de habitación es requerido"),
  type: z.enum(['simple', 'doble', 'triple', 'matrimonial', 'familiar']),
  capacity: z.number().min(1),
  price_per_night: z.number().min(0, "El precio no puede ser negativo"),
  floor: z.number().optional(),
  description: z.string().optional(),
})
