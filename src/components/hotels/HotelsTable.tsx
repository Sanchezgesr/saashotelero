'use client'

import { Building2, MapPin, Edit2, ShieldAlert, ShieldCheck, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { Hotel } from '@/types'
import { fmtDate } from '@/lib/utils/dates'
import type { PlanConfig } from '@/lib/utils/plans'
import { Pagination } from '@/components/Pagination'

interface HotelsTableProps {
  hotels: Hotel[]
  plans: PlanConfig[]
  loading: boolean
  page: number
  totalPages: number
  showDeleted: boolean
  onPageChange: (p: number) => void
  onEdit: (hotel: Hotel) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}

export function HotelsTable({
  hotels, plans, loading, page, totalPages, showDeleted,
  onPageChange, onEdit, onStatusChange, onDelete, onRestore,
}: HotelsTableProps) {
  if (loading) {
    return <div className="p-12 text-center text-gray-500">Cargando hoteles...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hotel</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {hotels.map((hotel) => (
            <tr key={hotel.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{hotel.name}</div>
                    <div className="text-xs text-gray-500">RUC: {hotel.ruc || 'N/A'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {hotel.city}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-primary/20 text-primary">
                  {plans.find(p => p.name === hotel.plan)?.label ?? hotel.plan}
                </span>
                {hotel.plan_expires_at && (
                  <div className="text-[10px] text-gray-400 mt-0.5">Vence: {fmtDate(hotel.plan_expires_at)}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  hotel.status === 'active' ? 'bg-green-100 text-green-700' :
                  hotel.status === 'deleted' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    hotel.status === 'active' ? 'bg-green-600' :
                    hotel.status === 'deleted' ? 'bg-gray-400' : 'bg-red-600'
                  }`}></span>
                  {hotel.status === 'active' ? 'Activo' : hotel.status === 'deleted' ? 'Eliminado' : 'Suspendido'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  {hotel.status !== 'deleted' ? (
                    <>
                      <button onClick={() => onEdit(hotel)} title="Editar"
                        className="p-1.5 text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onStatusChange(hotel.id, hotel.status)}
                        title={hotel.status === 'active' ? 'Suspender' : 'Activar'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          hotel.status === 'active'
                            ? 'text-orange-600 border-orange-100 hover:bg-orange-50'
                            : 'text-green-600 border-green-100 hover:bg-green-50'
                        }`}>
                        {hotel.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => onDelete(hotel.id)} title="Eliminar"
                        className="p-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => onRestore(hotel.id)} title="Restaurar"
                      className="p-1.5 text-green-600 border border-green-100 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {hotels.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                {showDeleted ? 'No hay hoteles eliminados.' : 'No se encontraron hoteles registrados.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
