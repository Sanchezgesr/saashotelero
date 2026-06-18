'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, Plus, Eye, UserPlus, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function GuestsPage() {
  const { profile } = useUser()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!query) return
    setSearching(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('guests').select('*').eq('hotel_id', profile?.hotel_id)
      .or(`full_name.ilike.%${query}%,dni.ilike.%${query}%`)
      .limit(10)
    
    if (error) {
      toast.error('Error al realizar búsqueda')
    } else {
      setResults(data ?? [])
    }
    setSearching(false)
  }

  const viewHistory = async (guest: any) => {
    setSelectedGuest(guest)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('checkins')
      .select('id, check_in_at, check_out_at, total_price, payment_method, rooms(number, type)')
      .eq('guest_id', guest.id)
      .order('check_in_at', { ascending: false })
    
    if (error) {
      toast.error('Error al cargar historial')
    } else {
      setHistory(data ?? [])
    }
  }

  const handleCreateGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const supabase = createClient()
    
    const guestData = {
      hotel_id: profile?.hotel_id,
      full_name: form.get('full_name'),
      dni: form.get('dni') || null,
      phone: form.get('phone') || null,
      email: form.get('email') || null,
      nationality: form.get('nationality') || 'Peruana',
    }

    const { error } = await supabase.from('guests').insert(guestData)
    
    if (error) {
      toast.error('Error al registrar cliente: ' + error.message)
    } else {
      toast.success('Cliente registrado exitosamente')
      setShowForm(false)
      setQuery((form.get('dni') || form.get('full_name')) as string)
      
      // Perform immediate search
      const { data } = await supabase
        .from('guests').select('*').eq('hotel_id', profile?.hotel_id)
        .or(`full_name.ilike.%${guestData.full_name}%,dni.eq.${guestData.dni}`)
        .limit(10)
      setResults(data ?? [])
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Búsqueda de Clientes</h1>
          <p className="text-xs text-gray-500 font-semibold font-mono">Control y registro de huéspedes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-colors cursor-pointer"
        >
          <Plus size={16} /> 
          {showForm ? 'Cerrar' : 'Nuevo'}
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="DNI o Nombre completo..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={searching}
          className="bg-primary hover:opacity-90 text-white px-5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:bg-gray-300"
        >
          {searching ? '...' : 'Buscar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateGuest} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-primary" /> Registrar Cliente</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre completo *</label>
              <input name="full_name" placeholder="Ej. Juan García" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">DNI (opcional)</label>
                <input name="dni" placeholder="Ej. 12345678"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Teléfono</label>
                <input name="phone" placeholder="Ej. 987 654 321"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
              <input name="email" placeholder="cliente@email.com" type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nacionalidad</label>
              <input name="nationality" placeholder="Nacionalidad" defaultValue="Peruana"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-colors shadow-sm cursor-pointer mt-2"
          >
            Registrar Huésped
          </button>
        </form>
      )}

      <div className="space-y-3">
        {results.map((g) => (
          <div key={g.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="font-bold text-gray-900 text-sm">{g.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">DNI: {g.dni ?? '—'} | Teléf: {g.phone ?? '—'}</p>
            </div>
            <button 
              onClick={() => viewHistory(g)}
              className="flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Eye size={14} /> Historial
            </button>
          </div>
        ))}
      </div>

      {query && results.length === 0 && !searching && (
        <p className="text-center text-gray-500 text-sm py-4">No se encontraron clientes.</p>
      )}

      {selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGuest(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setSelectedGuest(null) }}
          role="dialog" aria-modal="true" aria-label="Detalle del huésped">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">{selectedGuest.full_name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">DNI: {selectedGuest.dni ?? '—'}</p>
              </div>
              <button onClick={() => setSelectedGuest(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={18} />
              </button>
            </div>
            
            <div className="p-5 max-h-[300px] overflow-y-auto space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Estadías Registradas</h3>
              {history.length === 0 && <p className="text-xs text-gray-500 italic py-2">Sin estadías registradas.</p>}
              
              <div className="space-y-2">
                {history.map((h: any) => (
                  <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">Habitación {h.rooms?.number} ({h.rooms?.type})</p>
                      <p className="text-[10px] text-gray-500 mt-1">Ingreso: {h.check_in_at?.split('T')[0]}</p>
                      <p className="text-[10px] text-gray-500">Salida: {h.check_out_at?.split('T')[0] ?? 'Activo'}</p>
                    </div>
                    {h.total_price && (
                      <div className="text-right">
                        <span className="font-bold text-primary">S/. {h.total_price.toFixed(2)}</span>
                        <span className="block text-[9px] text-gray-400 capitalize mt-0.5">{h.payment_method}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedGuest(null)}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
