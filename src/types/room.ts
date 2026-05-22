export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance'
export type RoomType = 'simple' | 'doble' | 'triple' | 'matrimonial' | 'familiar'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Room {
  id: string
  hotel_id: string
  number: string
  type: RoomType
  capacity: number
  price_per_night: number
  status: RoomStatus
  floor?: number
  description?: string
}
