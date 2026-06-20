'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Enlace inválido o expirado. Solicita un nuevo restablecimiento de contraseña.')
      }
      setCheckingSession(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message || 'Error al actualizar la contraseña. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <h1 className="text-xl font-bold text-slate-900">Contraseña actualizada</h1>
          <p className="text-sm text-slate-600">
            Tu contraseña se ha restablecido exitosamente. Serás redirigido al inicio de sesión.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Nueva contraseña</h1>
        <p className="text-sm text-slate-600 mb-6">
          Ingresa tu nueva contraseña.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-sm text-slate-700 mb-1.5">Nueva contraseña</label>
            <div className="flex items-center border rounded-xl px-4 py-3.5 border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition-all">
              <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full outline-none bg-transparent text-sm text-slate-900 placeholder-slate-400"
                autoFocus autoComplete="new-password" minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-2" tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm text-slate-700 mb-1.5">Confirmar contraseña</label>
            <div className="flex items-center border rounded-xl px-4 py-3.5 border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition-all">
              <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full outline-none bg-transparent text-sm text-slate-900 placeholder-slate-400"
                autoComplete="new-password" minLength={6} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500
              hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Actualizando...</> : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
