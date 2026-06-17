'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { ArrowLeft, Search, FileText, Receipt, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { performCheckout } from '@/lib/supabase/checkin-actions'
import { fmtDateTime } from '@/lib/utils/dates'
import { emitirComprobanteAction } from './actions'
import { printNotaVenta } from '@/components/print/NotaVentaPrint'

export default function CheckoutPage() {
  const { profile } = useUser()
  const router = useRouter()
  const [activeCheckins, setActiveCheckins] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [checkedOut, setCheckedOut] = useState<any>(null)
  const [showFacturaForm, setShowFacturaForm] = useState(false)
  const [emitting, setEmitting] = useState(false)
  const [emitResult, setEmitResult] = useState<any>(null)
  const [hotel, setHotel] = useState<any>(null)

  useEffect(() => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    supabase.from('hotels').select('name, plan').eq('id', profile.hotel_id).single().then(({ data }) => {
      if (data) setHotel(data)
    })
  }, [profile?.hotel_id])

  const fetch = async () => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    const { data } = await supabase
      .from('checkins')
      .select('*, guests(full_name, dni, phone), rooms(number, type, price_per_night)')
      .eq('hotel_id', profile.hotel_id)
      .eq('status', 'active')
      .order('check_in_at')
    setActiveCheckins(data ?? [])
  }

  useEffect(() => { fetch() }, [profile?.hotel_id])

  const isPro = hotel?.plan === 'pro'

  const filtered = activeCheckins.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.rooms?.number?.toLowerCase().includes(q) ||
      c.guests?.full_name?.toLowerCase().includes(q)
    )
  })

  const selectCheckin = (c: any) => {
    setSelected(c)
  }

  const handleConfirm = async () => {
    if (!selected || !profile?.hotel_id) return
    try {
      await performCheckout({
        checkin_id: selected.id,
        room_id: selected.room_id,
        hotel_id: profile.hotel_id,
        room_number: selected.rooms?.number,
      })
      toast.success('Check-out completado')
      setCheckedOut(selected)
      setSelected(null)
      setEmitResult(null)
      setShowFacturaForm(false)
      fetch()
    } catch {
      toast.error('Error al hacer check-out')
    }
  }

  const handleEmitir = async (tipo: 'boleta' | 'factura') => {
    if (!checkedOut || !profile?.hotel_id) return
    setEmitting(true)
    setEmitResult(null)
    try {
      const fb = new FormData()
      fb.append('hotel_id', profile.hotel_id)
      fb.append('checkin_id', checkedOut.id)
      fb.append('tipo', tipo)
      fb.append('cliente_tipo_documento', tipo === 'factura' ? '6' : '1')
      fb.append('cliente_numero_documento', tipo === 'factura' ? (document.getElementById('fe-ruc') as HTMLInputElement)?.value ?? '' : checkedOut.guests?.dni ?? '00000000')
      fb.append('cliente_denominacion', tipo === 'factura' ? (document.getElementById('fe-razon') as HTMLInputElement)?.value ?? '' : checkedOut.guests?.full_name)
      fb.append('cliente_direccion', (document.getElementById('fe-direccion') as HTMLInputElement)?.value ?? '')
      const res = await emitirComprobanteAction(fb)
      if (res.error) { toast.error(res.error); return }
      setEmitResult(res)
      toast.success(`${tipo === 'boleta' ? 'Boleta' : 'Factura'} ${res.serie}-${res.numero} emitida`)
    } catch { toast.error('Error al emitir comprobante') }
    finally { setEmitting(false) }
  }

  const handlePrintNotaVenta = (c: any) => {
    printNotaVenta({
      hotelName: hotel?.name,
      guestName: c.guests?.full_name,
      roomNumber: c.rooms?.number,
      checkIn: fmtDateTime(c.check_in_at),
      checkOut: fmtDateTime(new Date()),
      total: Number(c.total_price),
      paymentMethod: c.payment_method,
      tipo: 'checkout',
    })
  }

  const handlePrintFE = () => {
    if (!emitResult || !checkedOut) return
    printNotaVenta({
      hotelName: hotel?.name,
      guestName: checkedOut.guests?.full_name,
      guestDoc: checkedOut.guests?.dni,
      roomNumber: checkedOut.rooms?.number,
      checkIn: fmtDateTime(checkedOut.check_in_at),
      checkOut: fmtDateTime(new Date()),
      total: Number(checkedOut.total_price),
      paymentMethod: checkedOut.payment_method,
      tipo: 'checkout',
      isInvoice: true,
      serie: emitResult.serie,
      numero: emitResult.numero,
    })
  }

  const handleNuevoCheckout = () => {
    setCheckedOut(null)
    setEmitResult(null)
    setShowFacturaForm(false)
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Check-out</h1>

      {checkedOut ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Check-out completado</h2>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ LISTO</span>
          </div>
          <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Huésped:</span> <strong>{checkedOut.guests?.full_name}</strong></p>
            <p><span className="text-muted-foreground">Habitación:</span> <strong>{checkedOut.rooms?.number}</strong></p>
            <p><span className="text-muted-foreground">Total pagado:</span> <strong>S/. {Number(checkedOut.total_price).toFixed(2)}</strong></p>
          </div>

          {emitResult ? (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-blue-800">
                  {emitResult.tipo === 'boleta' ? 'Boleta' : 'Factura'} {emitResult.serie}-{emitResult.numero}
                </p>
                <p className="text-blue-600">Estado: {emitResult.estado}</p>
              </div>
              <button onClick={handlePrintFE}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90">
                <Printer size={18} /> Imprimir {emitResult.tipo === 'boleta' ? 'Boleta' : 'Factura'}
              </button>
              <button onClick={handleNuevoCheckout}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-200">
                Nuevo check-out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => handlePrintNotaVenta(checkedOut)}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-900">
                <Printer size={18} /> Imprimir Nota de Venta
              </button>

              {isPro && (
                <>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-3">Facturación electrónica (SUNAT)</p>
                    <button onClick={() => handleEmitir('boleta')} disabled={emitting}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                      <Receipt size={18} /> {emitting ? 'Emitiendo...' : 'Emitir Boleta'}
                    </button>

                    {!showFacturaForm ? (
                      <button onClick={() => setShowFacturaForm(true)} disabled={emitting}
                        className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 mt-2">
                        <FileText size={18} /> Emitir Factura
                      </button>
                    ) : (
                      <div className="space-y-3 border border-border rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium">Datos para factura</p>
                        <input id="fe-ruc" placeholder="RUC"
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                        <input id="fe-razon" placeholder="Razón Social"
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                        <input id="fe-direccion" placeholder="Dirección (opcional)"
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                        <button onClick={() => handleEmitir('factura')} disabled={emitting}
                          className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                          {emitting ? 'Emitiendo...' : 'Emitir Factura'}
                        </button>
                        <button onClick={() => setShowFacturaForm(false)}
                          className="w-full text-xs text-muted-foreground underline">Cancelar</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button onClick={handleNuevoCheckout} disabled={emitting}
                className="w-full text-xs text-muted-foreground underline">Omitir y hacer otro check-out</button>
            </div>
          )}
        </div>
      ) : !selected ? (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por habitación o huésped..."
              className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-base min-h-[48px]" />
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {search ? 'Sin resultados' : 'No hay huéspedes alojados actualmente.'}
            </p>
          )}
          {filtered.map((c) => (
            <button key={c.id} onClick={() => selectCheckin(c)}
              className="w-full text-left bg-card rounded-xl shadow-sm border border-border p-4 hover:border-primary transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    {c.rooms?.number}
                  </p>
                  <p className="text-sm">{c.guests?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Entró: {fmtDateTime(c.check_in_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">S/. {c.price_per_night}/noche</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 space-y-4">
            <h2 className="font-semibold">Check-out — Hab. {selected.rooms?.number}</h2>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Huésped:</span> <strong>{selected.guests?.full_name}</strong></p>
              <p><span className="text-muted-foreground">Entrada:</span> {fmtDateTime(selected.check_in_at)}</p>
              <p><span className="text-muted-foreground">Pagado en check-in:</span> <strong>S/. {Number(selected.total_price).toFixed(2)}</strong></p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium min-h-[48px] hover:bg-gray-200">
                <ArrowLeft size={18} /> Cancelar
              </button>
              <button onClick={handleConfirm}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-semibold min-h-[48px] hover:bg-green-700">
                CONFIRMAR CHECK-OUT
              </button>
            </div>
          </div>
      )}
    </div>
  )
}
