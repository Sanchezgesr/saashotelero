'use client'

import { Mail, Shield, Ban, CheckCircle, Key, Building2, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/Pagination'

interface ProfileWithHotel {
  id: string; full_name: string; email: string; role: string; is_active: boolean
  hotels: { name: string; city: string } | null
}

interface UsersTableProps {
  users: ProfileWithHotel[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onResetPassword: (email: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  onDelete: (id: string, name: string) => void
}

export function UsersTable({ users, loading, page, totalPages, onPageChange, onResetPassword, onToggleStatus, onDelete }: UsersTableProps) {
  if (loading) return <div className="p-12 text-center text-gray-500">Cargando usuarios...</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hotel</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30 text-xs">
                    {user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{user.full_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />{user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'hotel_admin' ? 'Admin Hotel' : 'Recepcionista'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {user.hotels ? (
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" />{user.hotels.name}</div>
                ) : <span className="text-gray-400 italic text-xs">Sistema</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.is_active ? 'Activo' : 'Bloqueado'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button onClick={() => onResetPassword(user.email)} title="Resetear Contraseña"
                    className="p-1.5 text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <Key className="w-4 h-4" />
                  </button>
                  <button onClick={() => onToggleStatus(user.id, user.is_active)}
                    title={user.is_active ? 'Bloquear' : 'Desbloquear'}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${user.is_active ? 'text-red-600 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}>
                    {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onDelete(user.id, user.full_name)} title="Eliminar permanentemente"
                    className="p-1.5 text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No se encontraron usuarios.</td></tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
