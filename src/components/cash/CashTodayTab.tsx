'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { AlertTriangle, Plus, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { localDate, tzOffset, fmtTime } from '@/lib/utils/dates'
import { performCashClosure } from '@/app/(hotel-admin)/hotel/cash/actions'
import { calcSummary } from '@/lib/cash/calculations'
import type { CashMovement, CashClosure, CashSummary } from '@/types'
import { CashForm } from '@/components/cash/CashForm'
import { CashSummaryCards } from '@/components/cash/CashSummaryCards'
import { CashMovementsTable } from '@/components/cash/CashMovementsTable'
import { CashClosureModal } from '@/components/cash/CashClosureModal'

export function CashTodayTab() {
  const { profile } = useUser()
  const supabase = createClient()

  const [movements, setMovements] = useState<CashMovement[]>([])
  const [todayClosures, setTodayClosures] = useState<CashClosure[]>([])
  const [summary, setSummary] = useState<CashSummary>({ totalIncome: 0, totalExpense: 0, balance: 0, byCash: 0, byCard: 0, byYape: 0, byPlin: 0 })
  const [showForm, setShowForm] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [closureNotes, setClosureNotes] = useState('')

  const fetchData = async () => {
    if (!profile?.hotel_id) return
    const today = localDate()
    const nd = new Date()
    nd.setDate(nd.getDate() + 1)
    const nextDay = localDate(nd)
    const todayStart = `${today}T00:00:00${tzOffset()}`
    const todayEnd = `${nextDay}T00:00:00${tzOffset()}`

    const { data: lastClosures } = await supabase
      .from('cash_closures').select('closed_at')
      .eq('hotel_id', profile.hotel_id).eq('date', today)
      .order('closed_at', { ascending: false }).limit(1)

    const startFilter = lastClosures?.[0]?.closed_at ?? todayStart

    const { data: m } = await supabase
      .from('cash_movements').select('*, profiles(full_name)')
      .eq('hotel_id', profile.hotel_id)
      .gte('created_at', startFilter)
      .lt('created_at', todayEnd)
      .order('created_at', { ascending: false })
    const list = (m ?? []) as CashMovement[]
    setMovements(list)
    setSummary(calcSummary(list))

    const { data: closuresToday } = await supabase
      .from('cash_closures').select('*, profiles(full_name, role)')
      .eq('hotel_id', profile.hotel_id).eq('date', localDate())
      .order('closed_at', { ascending: false })
    setTodayClosures((closuresToday ?? []).map((c: any) => ({ ...c, closed_by_name: c.profiles?.full_name, closed_by_role: c.profiles?.role })))
  }

  useEffect(() => { fetchData() }, [profile?.hotel_id])

  const closuresCount = todayClosures.length
  const maxClosures = 999
  const canClose = closuresCount < maxClosures

  const handleClose = async () => {
    if (!profile?.hotel_id) return
    if (!canClose) { toast.error(`Límite de ${maxClosures} cierres por día alcanzado.`); setShowConfirmModal(false); return }
    try {
      await performCashClosure(profile.hotel_id, closureNotes)
      toast.success('Cierre de caja registrado')
      setShowConfirmModal(false)
      setClosureNotes('')
      fetchData()
    } catch (e: any) { toast.error(e.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={18} /> {showForm ? 'Cerrar' : 'Movimiento'}
        </button>
        <button onClick={() => setShowConfirmModal(true)}
          className="flex items-center gap-2 bg-warning text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Lock size={18} /> Cierre de caja
        </button>
      </div>

      {todayClosures.map((tc, i) => (
        <div key={tc.id} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          <AlertTriangle size={16} />
          Cierre #{i + 1} — {fmtTime(tc.closed_at)} por {tc.closed_by_name || '—'} <span className="text-green-500 text-xs capitalize">({tc.closed_by_role || 'admin'})</span>
        </div>
      ))}

      <CashSummaryCards summary={summary} />

      {showForm && <CashForm hotelId={profile?.hotel_id!} onCreated={() => { setShowForm(false); fetchData() }} />}
      <CashMovementsTable movements={movements} />

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
