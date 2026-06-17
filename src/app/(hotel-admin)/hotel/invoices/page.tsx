'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Search, Receipt, FileText, ExternalLink } from 'lucide-react'
import { fmtDateTime } from '@/lib/utils/dates'

export default function InvoicesPage() {
  const { profile } = useUser()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile?.hotel_id) return
    const supabase = createClient()
    supabase.from('invoices')
      .select('*, checkins!left(guests(full_name), rooms(number))')
      .eq('hotel_id', profile.hotel_id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setInvoices(data ?? []); setLoading(false) })
  }, [profile?.hotel_id])

  const filtered = invoices.filter(i =>
    !search || i.serie?.toLowerCase().includes(search.toLowerCase()) ||
    i.cliente_denominacion?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comprobantes Electrónicos</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por serie o cliente..."
          className="w-full border border-border rounded-lg pl-10 pr-4 py-3 text-sm" />
      </div>

      {loading ? <p className="text-muted-foreground">Cargando...</p> : filtered.length === 0 ? (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
