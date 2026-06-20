'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Ingresa tu correo electrónico'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (resetError) {
      setError(resetError.message || 'Error al enviar el correo. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <h1 className="text-xl font-bold text-slate-900">Correo enviado</h1>
          <p className="text-sm text-slate-600">
            Si existe una cuenta con el correo <strong>{email}</strong>, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link href="/login"
            className="inline-block mt-4 text-sm text-cyan-600 hover:text-cyan-700 font-medium hover:underline">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link href="/login"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft size={16} /> Volver
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Recuperar contraseña</h1>
        <p className="text-sm text-slate-600 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-medium text-sm text-slate-700 mb-1.5">Correo electrónico</label>
            <div className="flex items-center border rounded-xl px-4 py-3.5 border-slate-200 bg-slate-50 focus-within:border-cyan-500 focus-within:bg-white transition-all">
              <Mail size={18} className="text-slate-400 mr-3 shrink-0" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@hotel.com"
                className="w-full outline-none bg-transparent text-sm text-slate-900 placeholder-slate-400"
                autoFocus autoComplete="email" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500
              hover:from-blue-700 hover:to-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed
              transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  )
}
