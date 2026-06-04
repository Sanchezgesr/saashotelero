'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileSearch, Clock, User, Building, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/Pagination'
import { fmtDateTime } from '@/lib/utils/dates'

const ITEMS_PER_PAGE = 50

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact', head: false })
    if (filterAction) query = query.eq('action', filterAction)
    if (filterEntity) query = query.eq('entity', filterEntity)

    if (searchQuery) {
      const esc = searchQuery.replace(/[%_]/g, '\\$&')
      query = query.or(`action.ilike.%${esc}%,entity.ilike.%${esc}%,details::text.ilike.%${esc}%`)
    }

    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)

    if (error) {
      if (error.message?.includes('audit_log') && error.message?.includes('schema cache')) {
        toast.error('La tabla audit_log no existe. Ejecuta el script SQL provisto en Supabase Dashboard.')
      } else {
        toast.error('Error al cargar logs: ' + error.message)
      }
      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(l => l.user_id).filter(Boolean))]
      const hotelIds = [...new Set(data.map(l => l.hotel_id).filter(Boolean))]

      const [profilesRes, hotelsRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from('profiles').select('id, full_name, email').in('id', userIds)
          : { data: [] },
        hotelIds.length > 0
          ? supabase.from('hotels').select('id, name').in('id', hotelIds)
          : { data: [] },
      ])

      const profileMap = Object.fromEntries((profilesRes.data ?? []).map(p => [p.id, p]))
      const hotelMap = Object.fromEntries((hotelsRes.data ?? []).map(h => [h.id, h]))

      setLogs(data.map(l => ({
        ...l,
        profiles: l.user_id ? profileMap[l.user_id] ?? null : null,
        hotels: l.hotel_id ? hotelMap[l.hotel_id] ?? null : null,
      })))
    } else {
      setLogs([])
    }
    setTotalLogs(count ?? 0)
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [page, filterAction, filterEntity, searchQuery])

  useEffect(() => { setPage(1) }, [filterAction, filterEntity, searchQuery])

  const totalPages = Math.max(1, Math.ceil(totalLogs / ITEMS_PER_PAGE))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registro de Auditoría</h1>
          <p className="text-gray-500">Historial completo de acciones críticas realizadas en la plataforma.</p>
        </div>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer ${
            showFilter ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 text-current" />
          Filtrar Registros
        </button>
      </div>

      {showFilter && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Acción</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Todas las acciones</option>
              <option value="create">CREATE</option>
              <option value="update">UPDATE</option>
              <option value="delete">DELETE</option>
              <option value="checkin">CHECKIN</option>
              <option value="checkout">CHECKOUT</option>
              <option value="login">LOGIN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Entidad</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">Todas las entidades</option>
              <option value="room">ROOM</option>
              <option value="checkin">CHECKIN</option>
              <option value="guest">GUEST</option>
              <option value="user">USER</option>
              <option value="hotel">HOTEL</option>
              <option value="payment">PAYMENT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Buscar texto</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Acción, entidad, detalles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando registros de auditoría...</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entidad</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Metadatos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                            <FileSearch className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 capitalize">{log.action.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-gray-500">{log.entity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <div className="text-sm text-gray-700">
                            <div>{log.profiles?.full_name || 'Sistema'}</div>
                            <div className="text-[10px] text-gray-400">{log.profiles?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          {log.hotels?.name || 'Global'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {fmtDateTime(log.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-400 font-mono">
                        {log.details ? (
                          <button 
                            onClick={() => alert(JSON.stringify(log.details, null, 2))}
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors text-[10px] cursor-pointer"
                          >
                            Ver JSON
                          </button>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!loading && logs.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No hay registros de auditoría disponibles con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
