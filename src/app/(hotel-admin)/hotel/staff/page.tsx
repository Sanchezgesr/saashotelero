'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@/hooks/useUser'
import { Plus, UserCog, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getStaff, toggleStaffStatus } from './actions'
import type { Profile } from '@/types'

export default function StaffPage() {
  const { profile } = useUser()
  const [staff, setStaff] = useState<Profile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!profile?.hotel_id) return
    const data = await getStaff(profile.hotel_id)
    setStaff(data)
  }, [profile?.hotel_id])

  useEffect(() => { fetch() }, [fetch])

  const handleToggle = async (s: Profile) => {
    const newStatus = !s.is_active
    const action = newStatus ? 'activar' : 'suspender'
    if (!confirm(`¿Estás seguro de ${action} a ${s.full_name}?`)) return

    setToggling(s.id)
    try {
      await toggleStaffStatus(s.id, newStatus)
      toast.success(`Usuario ${action}do exitosamente`)
      fetch()
    } catch (e: any) {
      toast.error(e.message ?? 'Error al cambiar estado')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Empleados</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:opacity-90 cursor-pointer">
          <Plus size={16} /> {showForm ? 'Cerrar' : 'Nuevo'}
        </button>
      </div>

      {showForm && <StaffForm hotelId={profile?.hotel_id!} onCreated={fetch} />}

      {staff.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay empleados registrados.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{s.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{s.role === 'receptionist' ? 'Recepcionista' : s.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(s)} disabled={toggling === s.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          s.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        } disabled:opacity-50 cursor-pointer`}>
                        {toggling === s.id ? '...' : s.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                        {s.is_active ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {staff.map((s) => (
              <div key={s.id} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{s.full_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{s.email}</p>
                <p className="text-xs text-muted-foreground capitalize">Rol: {s.role === 'receptionist' ? 'Recepcionista' : s.role}</p>
                <button onClick={() => handleToggle(s)} disabled={toggling === s.id}
                  className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    s.is_active
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-green-50 text-green-600 border border-green-200'
                  } disabled:opacity-50 cursor-pointer`}>
                  {toggling === s.id ? '...' : s.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                  {s.is_active ? 'Suspender' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StaffForm({ hotelId, onCreated }: { hotelId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'receptionist' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hotelId }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success('Empleado creado exitosamente')
        setForm({ full_name: '', email: '', password: '', role: 'receptionist' })
        onCreated()
      }
    } catch {
      toast.error('Error al crear empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre completo</label>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm">
            <option value="receptionist">Recepcionista</option>
            <option value="hotel_admin">Admin Hotel</option>
          </select>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={loading}
        className="mt-4 w-full md:w-auto bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 cursor-pointer">
        <UserCog size={16} className="inline mr-1" />
        {loading ? 'Creando...' : 'Crear empleado'}
      </button>
    </div>
  )
}
