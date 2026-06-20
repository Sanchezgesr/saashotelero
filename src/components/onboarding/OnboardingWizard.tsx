'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Check, Building2, CreditCard, FileText, Users, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingWizardProps {
  onComplete: () => void
}

type Step = 'hotel' | 'lucode' | 'series' | 'staff'

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: 'hotel', label: 'Datos del hotel', icon: Building2 },
  { id: 'lucode', label: 'Token SUNAT', icon: CreditCard },
  { id: 'series', label: 'Series facturación', icon: FileText },
  { id: 'staff', label: 'Primer recepcionista', icon: Users },
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { profile } = useUser()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const [hotel, setHotel] = useState({ name: '', ruc: '', address: '', phone: '' })
  const [lucodeToken, setLucodeToken] = useState('')
  const [series, setSeries] = useState({ boleta: 'B001', factura: 'F001' })
  const [staff, setStaff] = useState({ email: '', password: '', full_name: '' })

  useEffect(() => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    supabase.from('hotels').select('name, ruc, address, phone').eq('id', profile.hotel_id).single().then(({ data }) => {
      if (data) setHotel({ name: data.name || '', ruc: data.ruc || '', address: data.address || '', phone: data.phone || '' })
    })
    supabase.from('hotel_fiscal_config').select('lucode_token, serie_boleta, serie_factura').eq('hotel_id', profile.hotel_id).single().then(({ data }) => {
      if (data) { setLucodeToken(data.lucode_token || ''); setSeries({ boleta: data.serie_boleta || 'B001', factura: data.serie_factura || 'F001' }) }
    })
  }, [profile?.hotel_id])

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'hotel': return hotel.name.trim().length > 0
      case 'lucode': return lucodeToken.trim().length > 0
      case 'series': return series.boleta.trim().length > 0 && series.factura.trim().length > 0
      case 'staff': return staff.email.trim().length > 0 && staff.password.length >= 6 && staff.full_name.trim().length > 0
    }
  }

  const handleSave = async () => {
    if (!profile?.hotel_id) return
    setLoading(true)
    const supabase = createClient()

    try {
      switch (STEPS[currentStep].id) {
        case 'hotel':
          await supabase.from('hotels').update({
            name: hotel.name, ruc: hotel.ruc || null, address: hotel.address || null, phone: hotel.phone || null,
          }).eq('id', profile.hotel_id)
          break
        case 'lucode':
          if (lucodeToken) {
            const { error: verifyError } = await supabase.from('hotel_fiscal_config').upsert({
              hotel_id: profile.hotel_id, lucode_token: lucodeToken, enabled: true,
            }, { onConflict: 'hotel_id' })
            if (verifyError) throw verifyError
          }
          break
        case 'series':
          await supabase.from('hotel_fiscal_config').upsert({
            hotel_id: profile.hotel_id, serie_boleta: series.boleta, serie_factura: series.factura,
          }, { onConflict: 'hotel_id' })
          break
        case 'staff':
          if (staff.email && staff.password) {
            const res = await fetch('/api/staff/create', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                hotel_id: profile.hotel_id, email: staff.email, password: staff.password,
                full_name: staff.full_name, role: 'receptionist',
              }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Error al crear recepcionista')
            await supabase.from('hotels').update({ onboarding_completed: true }).eq('id', profile.hotel_id)
          }
          break
      }

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        toast.success('Configuración completada')
        onComplete()
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const skipStep = async () => {
    if (currentStep === STEPS.length - 1) {
      const supabase = createClient()
      await supabase.from('hotels').update({ onboarding_completed: true }).eq('id', profile?.hotel_id)
      onComplete()
      return
    }
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Configuración inicial</h2>
            <button onClick={skipStep} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < currentStep ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-primary text-primary-foreground' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < currentStep ? <Check size={16} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Completa los datos de tu hotel para empezar a operar.</p>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del hotel *</label>
                <input value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RUC</label>
                <input value={hotel.ruc} onChange={(e) => setHotel({ ...hotel, ruc: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="20123456789" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input value={hotel.address} onChange={(e) => setHotel({ ...hotel, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input value={hotel.phone} onChange={(e) => setHotel({ ...hotel, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Ingresa tu token de Lucode para habilitar la facturación electrónica SUNAT.</p>
              <div>
                <label className="block text-sm font-medium mb-1">Token Lucode *</label>
                <input value={lucodeToken} onChange={(e) => setLucodeToken(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="Ingresa tu token" />
              </div>
              <p className="text-xs text-gray-400">Puedes obtener tu token en https://app.apisunat.pe</p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Configura las series para tus comprobantes electrónicos.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Serie Boleta</label>
                  <input value={series.boleta} onChange={(e) => setSeries({ ...series, boleta: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="B001" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Serie Factura</label>
                  <input value={series.factura} onChange={(e) => setSeries({ ...series, factura: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="F001" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Crea el primer recepcionista para que pueda operar el sistema.</p>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input value={staff.full_name} onChange={(e) => setStaff({ ...staff, full_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="María García" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo electrónico *</label>
                <input type="email" value={staff.email} onChange={(e) => setStaff({ ...staff, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="recepcion@hotel.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña *</label>
                <input type="password" value={staff.password} onChange={(e) => setStaff({ ...staff, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Mínimo 6 caracteres" minLength={6} />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <ArrowLeft size={16} /> Anterior
            </button>
            <div className="flex gap-2">
              <button onClick={skipStep}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
                {currentStep === STEPS.length - 1 ? 'Omitir' : 'Omitir paso'}
              </button>
              <button onClick={handleSave} disabled={!canProceed() || loading}
                className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : currentStep === STEPS.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
                {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
