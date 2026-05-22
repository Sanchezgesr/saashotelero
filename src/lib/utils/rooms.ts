import type { RoomStatus, RoomType } from '@/types'

export function getRoomStatusColor(status: RoomStatus): string {
  const colors: Record<RoomStatus, string> = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    cleaning: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

export function getRoomStatusLabel(status: RoomStatus): string {
  const labels: Record<RoomStatus, string> = {
    available: 'Disponible',
    occupied: 'Ocupada',
    cleaning: 'Limpieza',
    maintenance: 'Mantenimiento',
  }
  return labels[status]
}

export function getRoomTypeLabel(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    simple: 'Simple',
    doble: 'Doble',
    triple: 'Triple',
    matrimonial: 'Matrimonial',
    familiar: 'Familiar',
  }
  return labels[type]
}
