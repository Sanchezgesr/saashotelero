'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Upload, Building2, MapPin, Phone, FileText, CreditCard, Calendar, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS, type PlanId } from '@/lib/utils/plans'
import { THEMES, type ThemeId } from '@/lib/themes'
import { useTheme } from '@/components/ThemeProvider'
import type { Hotel } from '@/types'
import { uploadLogo } from './actions'
import { fmtDate } from '@/lib/utils/dates'

export default function SettingsPage() {
  const { profile } = useUser()
  const supabase = createClient()
  const { themeId, setTheme } = useTheme()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile?.hotel_id) return
    supabase.from('hotels').select('*').eq('id', profile.hotel_id).single().then(({ data }) => {
      if (data) setHotel(data)
    })
  }, [profile?.hotel_id])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !profile?.hotel_id) return

    setUploading(true)
    const formData = new FormData()
    formData.append('logo', selectedFile)

    const result = await uploadLogo(profile.hotel_id, formData)
    if (result.error) {
      toast.error('Error: ' + result.error)
    } else {
      toast.success('Logo actualizado')
      setHotel(prev => prev ? { ...prev, logo_url: result.url } : prev)
      window.dispatchEvent(new CustomEvent('logo-updated'))
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
    }
    setUploading(false)
  }

  if (!hotel) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración del Hotel</h1>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Información general</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{hotel.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">RUC</p>
              <p className="font-medium">{hotel.ruc || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="font-medium">{hotel.address || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Ciudad</p>
              <p className="font-medium">{hotel.city || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{hotel.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-medium">{PLANS[hotel.plan as PlanId]?.name ?? hotel.plan}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Vencimiento del plan</p>
              <p className="font-medium">{hotel.plan_expires_at ? fmtDate(hotel.plan_expires_at) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Logo del hotel</h2>
        {hotel.logo_url && (
          <img src={hotel.logo_url} alt="Logo" className="h-20 mb-4 object-contain rounded-lg border border-border" />
        )}
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept=".png" onChange={handleFileSelect}
            className="text-sm" />
          <button onClick={handleUpload} disabled={!selectedFile || uploading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            <Upload size={16} /> {uploading ? 'Subiendo...' : 'Agregar logo'}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Palette size={18} /> Tema del hotel</h2>
        <p className="text-sm text-muted-foreground mb-4">Elige un color primario y tema para tu hotel. Todos los usuarios lo verán.</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {(Object.entries(THEMES) as [ThemeId, typeof THEMES['default']][]).map(([id, theme]) => (
            <button
              key={id}
              onClick={async () => {
                if (!profile?.hotel_id) return
                try {
                  await setTheme(profile.hotel_id, id)
                  setHotel(prev => prev ? { ...prev, theme: id } : prev)
                  toast.success(`Tema "${theme.name}" aplicado`)
                } catch {
                  toast.error('Error al cambiar tema')
                }
              }}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                (hotel.theme || themeId) === id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primary }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.sidebar }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{theme.name}</span>
              {(hotel.theme || themeId) === id && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-[8px]">✓</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
