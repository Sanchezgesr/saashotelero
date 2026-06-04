'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

interface LoginCardProps {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>
  loading: boolean
  error: string
}

export function LoginCard({ onLogin, loading, error }: LoginCardProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleLogin()
  }

  const handleLogin = async () => {
    await onLogin(email, password, remember)
  }

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-70" />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/20 border border-slate-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>
          <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para acceder al panel</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
            <span className="mt-0.5 shrink-0">⚠</span><span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="admin@hotel.com" autoComplete="email" autoFocus />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="••••••••" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" tabIndex={-1}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-cyan-500 cursor-pointer" />
            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Recordarme</label>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Ingresando...</> : <><LogIn size={18} /> Iniciar sesión</>}
          </button>
        </div>
      </div>
    </div>
  )
}
