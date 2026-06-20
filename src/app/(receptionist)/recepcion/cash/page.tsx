'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Plus, Lock, Wallet, ArrowUpRight, ArrowDownRight, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { localDate, tzOffset, fmtDate, fmtTime } from '@/lib/utils/dates'
import { createCashMovement, performCashClosure } from '@/app/(hotel-admin)/hotel/cash/actions'
import { calcSummary } from '@/lib/cash/calculations'
import type { CashMovement, CashSummary } from '@/types'
import { CashClosureModal } from '@/components/cash/CashClosureModal'

export default function CashPage() {
  const { profile } = useUser()
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [todayClosures, setTodayClosures] = useState<any[]>([])
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [summary, setSummary] = useState<CashSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, byCash: 0, byCard: 0, byYape: 0, byPlin: 0 })
  const [loading, setLoading] = useState(true)
  const [closureNotes, setClosureNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(localDate())

  const fetchMovements = async (date?: string) => {
    if (!profile?.hotel_id) return
    setLoading(true)
    const supabase = createClient()
    const day = date ?? selectedDate
    const nd = new Date(day + 'T00:00:00')
    nd.setDate(nd.getDate() + 1)
    const nextDay = localDate(nd)
    const dayStart = `${day}T00:00:00${tzOffset()}`
    const dayEnd = `${nextDay}T00:00:00${tzOffset()}`

    const { data: lastClosures } = await supabase
      .from('cash_closures').select('closed_at')
      .eq('hotel_id', profile.hotel_id)
      .lte('closed_at', dayEnd)
      .order('closed_at', { ascending: false }).limit(1)

    const lastClosureAt = lastClosures?.[0]?.closed_at

    let query = supabase
      .from('cash_movements').select('*')
      .eq('hotel_id', profile.hotel_id)
      .gte('created_at', dayStart)
      .lt('created_at', dayEnd)

    if (lastClosureAt) {
      query = query.gte('created_at', lastClosureAt)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Error al cargar movimientos de caja')
    } else {
      const list = (data ?? []) as CashMovement[]
      setMovements(list)
      setSummary(calcSummary(list))
    }

    const { data: closures } = await supabase
      .from('cash_closures').select('*')
      .eq('hotel_id', profile.hotel_id).eq('date', localDate())
      .order('closed_at', { ascending: false })
    setTodayClosures(closures ?? [])
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMovements() }, [profile?.hotel_id])

  const closuresCount = todayClosures.length
  const maxClosures = 999
  const canClose = closuresCount < maxClosures

  const handleClose = async () => {
    if (!profile?.hotel_id) return
    if (!canClose) { toast.error(`Límite de ${maxClosures} cierres por día alcanzado.`); setShowConfirmModal(false); return }
    try {
      await performCashClosure(profile.hotel_id, closureNotes)
      toast.success('Cierre de caja registrado con éxito')
      setShowConfirmModal(false)
      setClosureNotes('')
      fetchMovements()
    } catch (e: any) { toast.error(e.message || 'Error al cerrar caja') }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Caja del Día</h1>
          <p className="text-xs text-gray-500 font-semibold font-mono">Restricción: Recepcionista (Solo Ingresos)</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); fetchMovements(e.target.value) }}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs" />
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-orange-800">
        <ShieldAlert className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Privilegios Limitados:</span> Solo tienes permitido registrar ingresos (cobros). El registro de egresos y gastos de caja chica está reservado para el perfil Administrador.
        </div>
      </div>

      {todayClosures.map((tc, i) => (
        <div key={tc.id} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl px-4 py-3">
          <span>✅</span>
          Cierre #{i + 1} — {fmtTime(tc.closed_at)}
        </div>
      ))}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1.5"><ArrowUpRight className="w-4 h-4 text-green-500" /> Ingresos</span>
          <span className="font-bold text-green-600">S/. {Number(summary.totalIncome).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1.5"><ArrowDownRight className="w-4 h-4 text-red-500" /> Egresos (Bloqueado)</span>
          <span className="font-bold text-red-500">S/. {Number(summary.totalExpense).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="font-bold text-gray-800">Balance de Caja</span>
          <span className="font-extrabold text-xl text-gray-900">S/. {Number(summary.balance).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setShowForm(!showForm)}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-colors cursor-pointer">
          <Plus size={18} /> Registrar Pago
        </button>
        <button onClick={() => setShowConfirmModal(true)}
          className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 rounded-xl text-sm font-bold shadow-sm hover:bg-black transition-colors cursor-pointer">
          <Lock size={18} /> Cerrar Caja
        </button>
      </div>

      {showForm && (
        <CashFormRecepcion
          hotelId={profile?.hotel_id!}
          onCreated={() => { setShowForm(false); fetchMovements() }}
        />
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Movimientos Recientes</h3>
        {loading ? (
          <div className="text-center py-6 text-gray-500 text-xs">Cargando movimientos...</div>
        ) : (
          <div className="space-y-3">
            {movements.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="text-sm font-bold text-gray-800 capitalize">{m.category}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description || 'Sin descripción'}</p>
                    <p className="text-[10px] text-gray-400 mt-1 capitalize font-medium">
                      {m.payment_method} · {fmtDate(m.created_at)} {fmtTime(m.created_at)}
                    </p>
                </div>
                <span className={`font-bold text-sm ${m.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.type === 'income' ? '+' : '-'} S/. {Number(m.amount).toFixed(2)}
                </span>
              </div>
            ))}
            {movements.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-6">Sin movimientos registrados hoy.</p>
            )}
          </div>
        )}
      </div>

      <CashClosureModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleClose}
        summary={summary}
        closuresCount={closuresCount}
        maxClosures={maxClosures}
        notes={closureNotes}
        onNotesChange={setClosureNotes}
        canClose={canClose}
      />
    </div>
  )
}

function CashFormRecepcion({ hotelId, onCreated }: { hotelId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ amount: 0, description: '', payment_method: 'cash', category: 'service' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || form.amount <= 0) { toast.error('Ingresa un monto válido mayor a 0'); return }
    setSaving(true)
    try {
      await createCashMovement({
        hotel_id: hotelId, type: 'income', amount: Number(form.amount),
        category: form.category, description: form.description,
        payment_method: form.payment_method as 'cash' | 'card' | 'yape' | 'plin',
      })
      toast.success('Ingreso registrado exitosamente')
      setForm({ amount: 0, description: '', payment_method: 'cash', category: 'service' })
      onCreated()
    } catch (err: any) { toast.error('Error al registrar: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-gray-800 text-sm pb-2 border-b border-gray-100">Registrar Ingreso</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Monto (S/.) *</label>
          <input type="number" required min={0.01} step={0.01} placeholder="0.00"
            value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: +e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción *</label>
          <input type="text" required placeholder="Ej. Pago por hospedaje hab. 104"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Medio de Pago</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="service">Servicio</option>
              <option value="supply">Insumo</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      </div>
      <button type="submit" disabled={saving}
        className="w-full bg-primary hover:opacity-90 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:bg-gray-300">
        {saving ? 'Guardando...' : 'Registrar Cobro'}
      </button>
    </form>
  )
}
