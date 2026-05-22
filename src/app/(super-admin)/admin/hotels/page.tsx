'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Trash2 } from 'lucide-react'
import { updateHotelStatus, deleteHotel, restoreHotel } from './actions'
import { toast } from 'sonner'
import type { Hotel } from '@/types'
import { HotelFormModal } from '@/components/hotels/HotelFormModal'
import { HotelsTable } from '@/components/hotels/HotelsTable'

const ITEMS_PER_PAGE = 25

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [page, setPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)

  const fetchHotels = async () => {
    setLoading(true)
    const { data, error } = await createClient()
      .from('hotels').select('*').order('created_at', { ascending: false })
    if (error) toast.error('Error al cargar hoteles')
    else setHotels(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchHotels() }, [])
  useEffect(() => { setPage(1) }, [search, showDeleted])

  const filteredHotels = useMemo(() =>
    hotels.filter(h => {
      if (!showDeleted && h.status === 'deleted') return false
      if (showDeleted && h.status !== 'deleted') return false
      return h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.ruc && h.ruc.includes(search)) ||
        (h.city && h.city.toLowerCase().includes(search.toLowerCase()))
    }), [hotels, search, showDeleted])

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / ITEMS_PER_PAGE))
  const paginatedHotels = filteredHotels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleStatusChange = async (hotelId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const res = await updateHotelStatus(hotelId, newStatus)
    if (res.error) toast.error('Error al actualizar estado: ' + res.error)
    else { toast.success(newStatus === 'active' ? 'Hotel activado' : 'Hotel suspendido'); fetchHotels() }
  }

  const handleDelete = async (hotelId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este hotel y todos sus datos relacionados permanentemente?')) return
    const res = await deleteHotel(hotelId)
    if (res.error) toast.error('Error al eliminar: ' + res.error)
    else { toast.success('Hotel eliminado'); fetchHotels() }
  }

  const handleRestore = async (hotelId: string) => {
    const res = await restoreHotel(hotelId)
    if (res.error) toast.error('Error al restaurar: ' + res.error)
    else { toast.success('Hotel restaurado'); fetchHotels() }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Hoteles</h1>
          <p className="text-gray-500">Administra todos los hoteles registrados en la plataforma.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleted(!showDeleted)}
            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${
              showDeleted ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
            <Trash2 className="w-4 h-4" />
            {showDeleted ? 'Ver activos' : 'Eliminados'}
          </button>
          <button onClick={() => { setSelectedHotel(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Registrar Hotel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre, RUC o ciudad..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
        </div>

        <HotelsTable
          hotels={paginatedHotels}
          loading={loading}
          page={page}
          totalPages={totalPages}
          showDeleted={showDeleted}
          onPageChange={setPage}
          onEdit={(h) => { setSelectedHotel(h); setShowModal(true) }}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </div>

      <HotelFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchHotels}
        selectedHotel={selectedHotel}
      />
    </div>
  )
}
