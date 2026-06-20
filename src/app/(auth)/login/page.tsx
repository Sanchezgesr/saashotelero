'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff, Loader2, Calendar, Bed, LogIn, BarChart3, Users, Clock, MessageCircle, ArrowRight } from 'lucide-react'

const benefits = [
  { icon: Calendar, label: 'Gestión de reservas' },
  { icon: Bed, label: 'Control de habitaciones' },
  { icon: LogIn, label: 'Check-in y Check-out' },
  { icon: BarChart3, label: 'Reportes financieros' },
  { icon: Users, label: 'Gestión de huéspedes' },
  { icon: Clock, label: 'Dashboard en tiempo real' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleLogin()
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Ingresa tu correo y contraseña'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) setError('Correo o contraseña incorrectos')
      else if (authError.message.includes('Email not confirmed')) setError('Correo no confirmado. Revisa tu bandeja de entrada.')
      else if (authError.message.includes('rate limit')) setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.')
      else setError('Error al iniciar sesión. Intenta de nuevo.')
      setLoading(false); return
    }

    const user = authData?.user
    if (!user) { setError('Error al iniciar sesión. Intenta de nuevo.'); setLoading(false); return }

    if (remember) {
      document.cookie = `_remember_me=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    } else {
      document.cookie = '_remember_me=; path=/; max-age=0'
    }

    const { data: profile } = await supabase.from('profiles').select('role, is_active, hotel_id').eq('id', user.id).maybeSingle()
    if (!profile?.is_active) { await supabase.auth.signOut(); setError('Tu cuenta ha sido suspendida. Contacta al administrador.'); setLoading(false); return }
    if (profile?.hotel_id) {
      const { data: hotel } = await supabase.from('hotels').select('status').eq('id', profile.hotel_id).maybeSingle()
      if (hotel?.status === 'suspended' || hotel?.status === 'deleted') { await supabase.auth.signOut(); setError('El hotel al que perteneces está suspendido. Contacta al administrador.'); setLoading(false); return }
    }
    const target = profile?.role === 'super_admin' ? '/admin/dashboard' : profile?.role === 'hotel_admin' ? '/hotel/dashboard' : '/recepcion/dashboard'
    window.location.href = target
  }

  const inputBorder = (field: string) =>
    `flex items-center border rounded-xl px-4 py-3.5 transition-all duration-200 ${
      (field === 'email' ? email : password) ? 'border-cyan-500 bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
    }`

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Branding centered above both columns */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800">HControl</h1>
          <p className="text-base sm:text-lg text-slate-500 mt-2">Bienvenido a la plataforma de gestión hotelera</p>
        </div>

        {/* Logo (mobile only) */}
        <div className="lg:hidden text-center mb-8">
          <img src="/hcontrol.png" alt="HControl" className="w-20 mx-auto mb-3" />
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
          {/* Left: Login Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-10 border border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 text-center">Iniciar sesión</h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block font-medium text-sm sm:text-base text-slate-700 mb-1.5 sm:mb-2">Correo electrónico</label>
                <div className={inputBorder('email')}>
                  <Mail size={18} className="text-slate-400 mr-3 shrink-0" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="correo@hotel.com"
                    className="w-full outline-none bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400"
                    autoComplete="email" autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm sm:text-base text-slate-700 mb-1.5 sm:mb-2">Contraseña</label>
                <div className={inputBorder('password')}>
                  <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="********"
                    className="w-full outline-none bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0 ml-2" tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-300 cursor-pointer" />
                  <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Recordarme</label>
                </div>
                <a href="/forgot-password" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button onClick={handleLogin} disabled={loading}
                className="w-full py-3.5 sm:py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500
                  hover:from-blue-700 hover:to-cyan-600 hover:scale-[1.01] active:scale-[0.99]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-200 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm sm:text-base">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Ingresando...</> : 'Iniciar sesión'}
              </button>
            </div>
          </div>

          {/* Right: Logo */}
          <div className="hidden lg:flex items-center justify-center">
            <img src="/hcontrol.png" alt="HControl" className="w-64 h-64 object-contain drop-shadow-xl" />
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
          <h3 className="text-center text-lg sm:text-2xl font-bold text-slate-800 mb-5 sm:mb-8">Beneficios del Sistema</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.label}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-slate-100 hover:shadow-lg hover:border-sky-100 transition-all duration-200">
                  <div className="flex justify-center text-blue-600 mb-2 sm:mb-4">
                    <Icon size={22} className="sm:w-7 sm:h-7" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-700">{b.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* WhatsApp */}
        <div className="mt-6 sm:mt-10 bg-gradient-to-r from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <MessageCircle size={32} className="sm:w-10 sm:h-10 text-green-600 shrink-0" />
            <div>
              <h4 className="font-bold text-green-700 text-sm sm:text-base">WhatsApp de soporte</h4>
              <p className="text-xs sm:text-sm text-green-600">Disponible en horario de oficina</p>
            </div>
          </div>
          <a href="https://wa.me/51956261852" target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto text-center px-6 sm:px-8 py-2.5 sm:py-3 border border-green-500 rounded-xl text-green-600 font-semibold hover:bg-green-100 transition-all duration-200 text-sm">
            Contactar ahora
          </a>
        </div>

        <footer className="text-center mt-8 sm:mt-10 text-xs sm:text-sm text-slate-400">
          &copy; {new Date().getFullYear()} HControl
        </footer>
      </div>
    </div>
  )
}
