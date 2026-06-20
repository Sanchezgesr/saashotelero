'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createHotel } from '@/app/(super-admin)/admin/hotels/actions'
import type { Hotel } from '@/types'
import { calculateExpiry } from '@/lib/utils/plans'
import type { PlanConfig } from '@/lib/utils/plans'
import { getPlans } from '@/app/(super-admin)/admin/plans/actions'
import { verifyLucodeToken } from '@/lib/facturacion/lucode'

interface HotelFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  selectedHotel: Hotel | null
}

export function HotelFormModal({ open, onClose, onSaved, selectedHotel }: HotelFormModalProps) {
  const [plans, setPlans] = useState<PlanConfig[]>([])
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle')
  const [tokenMessage, setTokenMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', ruc: '', city: '', address: '', phone: '',
    plan: '', plan_expires_at: '', lucode_token: '',
  })

  useEffect(() => { getPlans().then(setPlans) }, [])

  const updatePlan = (planName: string) => {
    const p = plans.find(x => x.name === planName)
    const days = p?.duration_days ?? 30
    setForm({ ...form, plan: planName, plan_expires_at: calculateExpiry(days).split('T')[0] })
  }

  useEffect(() => {
    if (plans.length === 0) return
    const defaultPlan = plans[0]?.name ?? ''
    if (selectedHotel) {
      setForm({
        name: selectedHotel.name, ruc: selectedHotel.ruc || '', city: selectedHotel.city || '',
        address: selectedHotel.address || '', phone: selectedHotel.phone || '',
        plan: selectedHotel.plan,
        plan_expires_at: selectedHotel.plan_expires_at?.split('T')[0] ?? calculateExpiry(plans.find(p => p.name === selectedHotel.plan)?.duration_days ?? 30).split('T')[0],
        lucode_token: '',
      })
    } else {
      setForm({
        name: '', ruc: '', city: '', address: '', phone: '',
        plan: defaultPlan,
        plan_expires_at: calculateExpiry(plans[0]?.duration_days ?? 30).split('T')[0],
        lucode_token: '',
      })
    }
  }, [selectedHotel, open, plans])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.city) { toast.error('Nombre y Ciudad son requeridos'); return }
    setSaving(true)
    const supabase = createClient()

    try {
      if (selectedHotel) {
        const { error } = await supabase.from('hotels').update({
          name: form.name, ruc: form.ruc || null, city: form.city,
          address: form.address || null, phone: form.phone || null,
          plan: form.plan,
          plan_expires_at: form.plan_expires_at ? new Date(form.plan_expires_at).toISOString() : null,
        }).eq('id', selectedHotel.id)
        if (error) { toast.error('Error al actualizar hotel: ' + error.message) }
        else { toast.success('Hotel actualizado exitosamente'); onClose(); onSaved() }
      } else {
        const formData = new FormData()
        formData.append('name', form.name); formData.append('ruc', form.ruc)
        formData.append('city', form.city); formData.append('address', form.address)
        formData.append('phone', form.phone); formData.append('plan', form.plan)
        formData.append('lucode_token', form.lucode_token)
        const res = await createHotel(formData)
        if (res.error) { toast.error('Error al crear hotel: ' + res.error) }
        else {
          if (res.data?.id) {
            const p = plans.find(x => x.name === form.plan)
            await supabase.from('hotels').update({ plan_expires_at: calculateExpiry(p?.duration_days ?? 30) }).eq('id', res.data.id)
          }
          toast.success('Hotel registrado exitosamente'); onClose(); onSaved()
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{selectedHotel ? 'Editar Hotel' : 'Registrar Nuevo Hotel'}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Hotel *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Ej. Gran Hotel Tarma"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">RUC (opcional)</label>
              <input type="text" value={form.ruc} onChange={(e) => setForm({...form, ruc: e.target.value})}
                placeholder="20123456789"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad *</label>
              <input type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                placeholder="Ej. Tarma"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección (opcional)</label>
              <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="Ej. Av. Arequipa 123"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono (opcional)</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                placeholder="Ej. 987654321"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Plan *</label>
              <select value={form.plan} onChange={(e) => updatePlan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {plans.map((p) => (
                  <option key={p.name} value={p.name}>{p.label} {p.price > 0 ? `- S/${p.price}` : ''}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Vencimiento (calculado automáticamente)</label>
              <input type="date" value={form.plan_expires_at} readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Token Lucode (facturación electrónica)</label>
              <div className="flex gap-2">
                <input type="text" value={form.lucode_token} onChange={(e) => { setForm({...form, lucode_token: e.target.value}); setTokenStatus('idle'); setTokenMessage('') }}
                  placeholder="Token de API para SUNAT"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={async () => {
                  if (!form.lucode_token.trim()) { toast.error('Ingresa un token para verificar'); return }
                  setTokenStatus('verifying')
                  setTokenMessage('Verificando...')
                  const res = await verifyLucodeToken(form.lucode_token.trim())
                  setTokenStatus(res.valid ? 'valid' : 'invalid')
                  setTokenMessage(res.message)
                  if (res.valid) toast.success('Token Lucode verificado correctamente')
                  else toast.error(res.message)
                }} disabled={tokenStatus === 'verifying'}
                  className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 whitespace-nowrap">
                  {tokenStatus === 'verifying' ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
              {tokenStatus !== 'idle' && (
                <p className={`text-xs mt-1 ${tokenStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
                  {tokenStatus === 'verifying' ? 'Verificando token...' : tokenMessage}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer">
              {saving ? 'Guardando...' : (selectedHotel ? 'Guardar Cambios' : 'Registrar Hotel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
