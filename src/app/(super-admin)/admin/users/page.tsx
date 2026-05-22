'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Plus } from 'lucide-react'
import { toggleUserStatus, resetUserPassword, deleteUser } from './actions'
import { toast } from 'sonner'
import { UserFormModal } from '@/components/admin/UserFormModal'
import { UsersTable } from '@/components/admin/UsersTable'

const ITEMS_PER_PAGE = 25

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await createClient()
      .from('profiles').select('*, hotels (name, city)').order('created_at', { ascending: false })
    if (error) toast.error('Error al cargar usuarios')
    else setUsers((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => {
    createClient().from('hotels').select('id, name').order('name').then(({ data, error }) => { if (!error) setHotels(data || []) })
  }, [])

  useEffect(() => { setPage(1) }, [search, roleFilter])

  const filteredUsers = useMemo(() =>
    users.filter((user: any) => {
      const ms = user.full_name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()) || (user.hotels && user.hotels.name.toLowerCase().includes(search.toLowerCase()))
      return ms && (roleFilter === '' || user.role === roleFilter)
    }), [users, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))
  const paginated = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Registrar Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre, email o hotel..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer">
            <option value="">Todos los roles</option><option value="hotel_admin">Admin Hotel</option><option value="receptionist">Recepcionista</option><option value="super_admin">Super Admin</option>
          </select>
        </div>

        <UsersTable
          users={paginated}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onResetPassword={async (email) => {
            if (!confirm(`¿Enviar correo de restablecimiento de contraseña a ${email}?`)) return
            const res = await resetUserPassword(email)
            if (res.error) toast.error('Error al enviar correo: ' + res.error)
            else toast.success('Correo de restablecimiento enviado')
          }}
          onToggleStatus={async (userId, isActive) => {
            const actionText = isActive ? 'bloquear' : 'desbloquear'
            if (!confirm(`¿Estás seguro de que deseas ${actionText} a este usuario?`)) return
            const res = await toggleUserStatus(userId, isActive)
            if (res.error) toast.error('Error al cambiar estado: ' + res.error)
            else { toast.success(isActive ? 'Usuario bloqueado' : 'Usuario desbloqueado'); fetchUsers() }
          }}
          onDelete={async (userId, userName) => {
            if (!confirm(`¿Estás seguro de eliminar permanentemente a "${userName}"? Esta acción no se puede deshacer.`)) return
            const res = await deleteUser(userId)
            if (res.error) toast.error('Error al eliminar: ' + res.error)
            else { toast.success('Usuario eliminado permanentemente'); fetchUsers() }
          }}
        />
      </div>

      <UserFormModal open={showModal} onClose={() => setShowModal(false)} onSaved={fetchUsers} hotels={hotels} />
    </div>
  )
}
