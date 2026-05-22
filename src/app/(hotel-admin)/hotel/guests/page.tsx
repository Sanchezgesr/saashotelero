'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, Plus, Eye, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Guest } from '@/types'
import { Pagination } from '@/components/Pagination'
import { GuestForm } from '@/components/guests/GuestForm'
import { GuestHistoryModal } from '@/components/guests/GuestHistoryModal'

const ITEMS_PER_PAGE = 25

export default function GuestsPage() {
  const { profile } = useUser()
  const [guests, setGuests] = useState<Guest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchGuests = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('guests').select('*').eq('hotel_id', profile.hotel_id)
    if (search) { const esc = search.replace(/[%_]/g, '\\$&'); query = query.or(`full_name.ilike.%${esc}%,dni.ilike.%${esc}%`) }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) toast.error('Error al cargar clientes')
    else setGuests(data || [])
    setLoading(false)
  }

  useEffect(() => { setPage(1); fetchGuests() }, [profile?.hotel_id, search])

  const totalPages = Math.max(1, Math.ceil(guests.length / ITEMS_PER_PAGE))
  const paginatedGuests = useMemo(() => guests.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [guests, page])

  const viewHistory = async (guest: Guest) => {
    setSelectedGuest(guest)
    const { data, error } = await createClient()
      .from('checkins').select('id, check_in_at, check_out_at, total_price, payment_method, rooms(number, type)')
      .eq('guest_id', guest.id).order('check_in_at', { ascending: false })
    if (error) toast.error('Error al cargar historial')
    else setHistory(data || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 font-medium">Administra el padrón de huéspedes del hotel y su historial.</p>
        </div>
        <button onClick={() => { setEditingGuest(null); setShowForm(!showForm) }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
          <Plus size={18} /> {showForm && !editingGuest ? 'Cerrar' : 'Nuevo cliente'}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o DNI..."
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {showForm && (
        <GuestForm hotelId={profile?.hotel_id!} editingGuest={editingGuest}
          onCreated={() => { setShowForm(false); setEditingGuest(null); fetchGuests() }}
          onCancel={() => { setShowForm(false); setEditingGuest(null) }} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="p-12 text-center text-gray-500">Cargando huéspedes...</div>
          : (<><table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase">DNI</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase">Nacionalidad</th>
                <th className="px-6 py-3 font-semibold text-gray-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedGuests.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{g.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{g.dni ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{g.phone ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{g.email ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{g.nationality}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => viewHistory(g)}
                        className="flex items-center gap-1 text-primary border border-primary/20 bg-primary/10 px-2 py-1 rounded text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
                        <Eye size={12} /> Historial
                      </button>
                      <button onClick={() => { setEditingGuest(g); setShowForm(true) }}
                        className="flex items-center gap-1 text-gray-600 border border-gray-200 bg-gray-50 px-2 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
                        <Pencil size={12} /> Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!loading && paginatedGuests.length === 0) && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay clientes registrados.</td></tr>}
            </tbody>
          </table><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>)}
        </div>
      </div>

      {selectedGuest && <GuestHistoryModal guest={selectedGuest} history={history} onClose={() => setSelectedGuest(null)} />}
    </div>
  )
}
