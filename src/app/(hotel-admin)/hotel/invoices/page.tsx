'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, Receipt, FileText, ExternalLink, Printer, ArrowLeft, X } from 'lucide-react'
import { fmtDateTime } from '@/lib/utils/dates'
import { toast } from 'sonner'
import { printNotaVenta, getWhatsAppLink } from '@/components/print/NotaVentaPrint'
import { emitirComprobanteAction, getPendingCheckins, getFiscalConfig, getHotelName } from './actions'

type Tab = 'emitir' | 'historial'

export default function InvoicesPage() {
  const { profile } = useUser()
  const [tab, setTab] = useState<Tab>('emitir')
  const [pending, setPending] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [emittingId, setEmittingId] = useState<string | null>(null)
  const [invoiceModal, setInvoiceModal] = useState<{ checkin: any; tipo: 'boleta' | 'factura' } | null>(null)
  const [emitResult, setEmitResult] = useState<any>(null)
  const [fiscalReady, setFiscalReady] = useState(true)
  const [hotelName, setHotelName] = useState('')
  const [notaVentaPreview, setNotaVentaPreview] = useState<any>(null)

  useEffect(() => {
    if (!profile?.hotel_id) return
    getHotelName(profile.hotel_id).then(setHotelName)
    getFiscalConfig(profile.hotel_id).then((cfg) => {
      if (!cfg?.enabled || !cfg.lucode_token) setFiscalReady(false)
      else setFiscalReady(true)
    })
    const supabase = createClient()
    Promise.all([
      getPendingCheckins(profile.hotel_id),
      supabase.from('invoices')
        .select('*, checkins!left(guests(full_name, dni, phone), rooms(number))')
        .eq('hotel_id', profile.hotel_id)
        .order('created_at', { ascending: false })
        .then(({ data }) => data ?? []),
    ]).then(([p, inv]) => {
      setPending(p)
      setInvoices(inv)
      setLoading(false)
    })
  }, [profile?.hotel_id])

  const filtered = invoices.filter(i =>
    !search || i.serie?.toLowerCase().includes(search.toLowerCase()) ||
    i.cliente_denominacion?.toLowerCase().includes(search.toLowerCase())
  )

  const handleEmitir = async () => {
    if (!invoiceModal || !profile?.hotel_id) return
    const { checkin, tipo } = invoiceModal
    setEmittingId(checkin.id)
    try {
      const fb = new FormData()
      fb.append('hotel_id', profile.hotel_id)
      fb.append('checkin_id', checkin.id)
      fb.append('tipo', tipo)
      fb.append('cliente_tipo_documento', tipo === 'factura' ? '6' : '1')
      fb.append('cliente_numero_documento', (document.getElementById('fe-numero-doc') as HTMLInputElement)?.value ?? checkin.guests?.dni ?? '00000000')
      fb.append('cliente_denominacion', (document.getElementById('fe-denominacion') as HTMLInputElement)?.value ?? checkin.guests?.full_name)
      fb.append('cliente_direccion', (document.getElementById('fe-direccion') as HTMLInputElement)?.value ?? '')
      const res = await emitirComprobanteAction(fb)
      if (res.error) { toast.error(res.error); return }
      setEmitResult({ ...res, guest: checkin.guests })
      toast.success(`${tipo === 'boleta' ? 'Boleta' : 'Factura'} ${res.serie}-${res.numero} emitida`)
    } catch { toast.error('Error al emitir comprobante') }
    finally { setEmittingId(null) }
  }

  const getNotaVentaData = (c: any) => ({
    hotelName: hotelName,
    guestName: c.guests?.full_name,
    guestDoc: c.guests?.dni,
    roomNumber: c.rooms?.number,
    checkIn: fmtDateTime(c.check_in_at),
    checkOut: fmtDateTime(c.check_out_at || new Date()),
    total: Number(c.total_price),
    paymentMethod: c.payment_method,
    tipo: 'checkin' as const,
    checkinId: c.id,
  })

  const handleCloseEmit = () => {
    setInvoiceModal(null)
    setEmitResult(null)
    if (!profile?.hotel_id) return
    getPendingCheckins(profile.hotel_id).then(setPending)
    const supabase = createClient()
    supabase.from('invoices')
      .select('*, checkins!left(guests(full_name, dni, phone), rooms(number))')
      .eq('hotel_id', profile.hotel_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setInvoices(data) })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Facturación Electrónica</h1>

      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button onClick={() => setTab('emitir')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'emitir' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          Pendientes ({pending.length})
        </button>
        <button onClick={() => setTab('historial')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'historial' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          Emitidos ({invoices.length})
        </button>
      </div>

      {!fiscalReady && tab === 'emitir' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ⚠ Facturación electrónica no configurada. Ve a <strong>Configuración</strong> para activarla con tu token Lucode.
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground" role="status" aria-live="polite">Cargando...</p>
      ) : tab === 'emitir' ? (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-3 opacity-30" />
              <p>No hay check-ins pendientes por facturar.</p>
            </div>
          ) : (
            pending.map((c) => (
              <div key={c.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.guests?.full_name}</p>
                    <p className="text-sm text-muted-foreground">DNI: {c.guests?.dni} | Hab. {c.rooms?.number}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">S/. {Number(c.total_price).toFixed(2)}</p>
                </div>
                {c.guests?.phone && (
                  <p className="text-xs text-muted-foreground">📱 {c.guests.phone}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <button onClick={() => setNotaVentaPreview(c)}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 whitespace-nowrap">
                    <Printer size={16} /> Nota de Venta
                  </button>
                  <button onClick={() => { setInvoiceModal({ checkin: c, tipo: 'boleta' }); setEmitResult(null) }}
                    disabled={!fiscalReady}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
                    <Receipt size={16} /> Boleta
                  </button>
                  <button onClick={() => { setInvoiceModal({ checkin: c, tipo: 'factura' }); setEmitResult(null) }}
                    disabled={!fiscalReady}
                    className="flex items-center gap-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted disabled:opacity-50 whitespace-nowrap">
                    <FileText size={16} /> Factura
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por serie o cliente..."
              className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-sm" />
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No hay comprobantes emitidos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Comprobante</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Cliente</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Monto</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Estado</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">PDF</th>
                    <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <span className="flex items-center gap-1.5">
                          {inv.tipo === 'boleta' ? <Receipt size={14} /> : <FileText size={14} />}
                          <strong>{inv.serie}-{String(inv.numero).padStart(3, '0')}</strong>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{inv.cliente_denominacion || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium">S/. {Number(inv.monto).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                          inv.estado === 'ACEPTADO' ? 'bg-green-100 text-green-700' :
                          inv.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
                          inv.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{inv.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDateTime(inv.created_at)}</td>
                      <td className="px-4 py-3 text-sm">
                        {inv.pdf_url ? (
                          <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                            Ver <ExternalLink size={12} />
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {inv.checkins?.guests?.phone ? (
                          <a href={`https://wa.me/${String(inv.checkins.guests.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${inv.checkins.guests.full_name || ''}, tu comprobante ${inv.tipo === 'boleta' ? 'Boleta' : 'Factura'} ${inv.serie}-${String(inv.numero).padStart(3, '0')} fue emitido. ¡Gracias por su preferencia!`)}`} target="_blank" rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 inline-flex items-center gap-1 text-xs font-medium">
                            Enviar
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal: emitir comprobante */}
      {/* Modal: vista previa Nota de Venta */}
      {notaVentaPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-border w-full max-w-sm">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Nota de Venta</h2>
                <button onClick={() => setNotaVentaPreview(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-white border border-border rounded-lg p-4 text-sm font-mono space-y-2">
                <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-2">
                  <p className="font-bold text-base">{hotelName}</p>
                  <p className="font-bold text-xs bg-gray-900 text-white inline-block px-3 py-1 rounded mt-2">COMPROBANTE DE PAGO</p>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-2 space-y-1">
                  <p><span className="text-gray-500">Huésped:</span> <span className="font-semibold">{notaVentaPreview.guests?.full_name}</span></p>
                  {notaVentaPreview.guests?.dni && <p><span className="text-gray-500">Documento:</span> {notaVentaPreview.guests.dni}</p>}
                  <p><span className="text-gray-500">Habitación:</span> {notaVentaPreview.rooms?.number}</p>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-2">
                  <p><span className="text-gray-500">Método de pago:</span> <span className="font-semibold uppercase">{(notaVentaPreview.payment_method || 'cash')}</span></p>
                </div>
                <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-center">
                  <span className="font-bold text-base">TOTAL</span>
                  <span className="font-bold text-lg">S/. {Number(notaVentaPreview.total_price).toFixed(2)}</span>
                </div>
                <div className="text-center border-t border-dashed border-gray-300 pt-3 text-xs text-gray-500">
                  <p className="font-semibold text-gray-700 mb-1">¡Gracias por su preferencia!</p>
                  <p>{new Date().toLocaleString('es-PE')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { printNotaVenta(getNotaVentaData(notaVentaPreview)); setNotaVentaPreview(null) }}
                  className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg text-sm font-semibold hover:bg-gray-900">
                  <Printer size={18} /> Imprimir
                </button>
                {notaVentaPreview.guests?.phone && (
                  <a href={getWhatsAppLink(getNotaVentaData(notaVentaPreview), notaVentaPreview.guests.phone)}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Enviar por WhatsApp
                  </a>
                )}
                <button onClick={() => setNotaVentaPreview(null)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {invoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            {emitResult ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-green-700">✓ Comprobante emitido</h2>
                  <button onClick={handleCloseEmit}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-green-800">
                    {emitResult.tipo === 'boleta' ? 'Boleta' : 'Factura'} {emitResult.serie}-{String(emitResult.numero).padStart(3, '0')}
                  </p>
                  <p className="text-green-600">Estado: {emitResult.estado}</p>
                </div>
                {emitResult.guest?.phone && (
                  <a href={`https://wa.me/${String(emitResult.guest.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${emitResult.guest.full_name || ''}, tu comprobante electrónico ${emitResult.tipo === 'boleta' ? 'Boleta' : 'Factura'} ${emitResult.serie}-${String(emitResult.numero).padStart(3, '0')} ha sido emitido. ¡Gracias por su preferencia!`)}`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Enviar por WhatsApp
                  </a>
                )}
                <button onClick={handleCloseEmit}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Emitir {invoiceModal.tipo === 'boleta' ? 'Boleta' : 'Factura'}
                  </h2>
                  <button onClick={handleCloseEmit}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">
                    ✕
                  </button>
                </div>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p><span className="text-muted-foreground">Cliente:</span> <strong>{invoiceModal.checkin.guests?.full_name}</strong></p>
                  <p><span className="text-muted-foreground">DNI:</span> {invoiceModal.checkin.guests?.dni}</p>
                  <p><span className="text-muted-foreground">Teléfono:</span> {invoiceModal.checkin.guests?.phone || '—'}</p>
                  <p><span className="text-muted-foreground">Habitación:</span> {invoiceModal.checkin.rooms?.number}</p>
                  <p><span className="text-muted-foreground">Total:</span> <strong>S/. {Number(invoiceModal.checkin.total_price).toFixed(2)}</strong></p>
                </div>
                {invoiceModal.tipo === 'boleta' ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">N° Documento (DNI)</label>
                    <input id="fe-numero-doc" defaultValue={invoiceModal.checkin.guests?.dni || ''}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                    <label className="block text-sm font-medium mt-3 mb-1">Denominación</label>
                    <input id="fe-denominacion" defaultValue={invoiceModal.checkin.guests?.full_name || ''}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                    <label className="block text-sm font-medium mt-3 mb-1">Dirección (opcional)</label>
                    <input id="fe-direccion" placeholder="..."
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">RUC *</label>
                    <input id="fe-numero-doc" placeholder="20123456789"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                    <label className="block text-sm font-medium mt-3 mb-1">Razón Social *</label>
                    <input id="fe-denominacion" placeholder="..."
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                    <label className="block text-sm font-medium mt-3 mb-1">Dirección (opcional)</label>
                    <input id="fe-direccion" placeholder="..."
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleCloseEmit}
                    className="flex items-center gap-2 border border-border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted">
                    <ArrowLeft size={16} /> Cancelar
                  </button>
                  <button onClick={handleEmitir} disabled={emittingId !== null}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {emittingId ? 'EMITIENDO...' : `EMITIR ${invoiceModal.tipo === 'boleta' ? 'BOLETA' : 'FACTURA'}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
