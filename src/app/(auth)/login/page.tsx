'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BedDouble, Users, Wallet, BarChart3, ShieldCheck, HeadphonesIcon, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { LoginCard } from '@/components/auth/LoginCard'

const benefits = [
  { icon: BedDouble, title: 'Gestión de habitaciones', desc: 'Controla disponibilidad, tipos y precios en tiempo real desde un solo panel.' },
  { icon: Users, title: 'Control de huéspedes', desc: 'Administra el padrón de clientes con historial completo de estadías.' },
  { icon: Wallet, title: 'Caja y cierres', desc: 'Registra ingresos/egresos con hasta 3 cierres diarios y reportes detallados.' },
  { icon: BarChart3, title: 'Métricas en vivo', desc: 'MRR, tasas de ocupación y revenue mensual desde el dashboard.' },
  { icon: ShieldCheck, title: 'Multi-hotel seguro', desc: 'Datos aislados por hotel con autenticación por roles y RLS.' },
  { icon: HeadphonesIcon, title: 'Soporte prioritario', desc: 'Asistencia técnica directa para resolver incidencias en minutos.' },
]

const testimonials = [
  { name: 'Carlos Mendoza', role: 'Gerente, Hotel Paraíso', text: 'Pasamos de Excel y papel a un sistema centralizado en 2 días. El check-in desde la tablet nos ahorra 15 minutos por huésped.', rating: 5 },
  { name: 'María Gutiérrez', role: 'Administradora, Casa Andina', text: 'El módulo de caja con cierres parciales nos ayudó a cuadrar turnos sin confusiones. Ya no peleamos con el arqueo al cierre del mes.', rating: 5 },
  { name: 'Raúl Quispe', role: 'Dueño, Hostal Los Andes', text: 'Tener métricas en tiempo real de ocupación y revenue me permite tomar decisiones sin esperar reportes semanales.', rating: 5 },
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [showMore, setShowMore] = useState(false)
  const t = testimonials[testimonialIdx]

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    if (!email.trim() || !password) { setError('Ingresa tu correo y contraseña'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) setError('Correo o contraseña incorrectos')
      else if (authError.message.includes('Email not confirmed')) setError('Correo no confirmado. Revisa tu bandeja de entrada.')
      else if (authError.message.includes('rate limit')) setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.')
      else setError('Error al iniciar sesión. Intenta de nuevo.')
      setLoading(false); return
    }

    // Recordarme: persistir sesión por 30 días
    if (remember) {
      document.cookie = `_remember_me=true; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    } else {
      document.cookie = '_remember_me=; path=/; max-age=0'
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role, is_active, hotel_id').eq('id', user!.id).maybeSingle()
    if (!profile?.is_active) { await supabase.auth.signOut(); setError('Tu cuenta ha sido suspendida. Contacta al administrador.'); setLoading(false); return }
    if (profile?.hotel_id) {
      const { data: hotel } = await supabase.from('hotels').select('status').eq('id', profile.hotel_id).maybeSingle()
      if (hotel?.status === 'suspended' || hotel?.status === 'deleted') { await supabase.auth.signOut(); setError('El hotel al que perteneces está suspendido. Contacta al administrador.'); setLoading(false); return }
    }
    if (profile?.role === 'super_admin') router.push('/admin/dashboard')
    else if (profile?.role === 'hotel_admin') router.push('/hotel/dashboard')
    else router.push('/recepcion/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-50 flex flex-col overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
          <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0ea5e9" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-20 left-10 flex gap-2">{[8,12,6].map((s,i) => <div key={i} className="rounded-full bg-cyan-300/40" style={{width:s,height:s}} />)}</div>
        <div className="absolute top-32 right-16 flex gap-2">{[6,10,8].map((s,i) => <div key={i} className="rounded-full bg-blue-300/40" style={{width:s,height:s}} />)}</div>
        <div className="absolute bottom-48 left-20 flex gap-1.5">{[10,6,8,12].map((s,i) => <div key={i} className="rounded-full bg-sky-300/40" style={{width:s,height:s}} />)}</div>
        <div className="absolute top-1/2 right-12 flex-col gap-2 hidden lg:flex">{[7,11,5,9].map((s,i) => <div key={i} className="rounded-full bg-cyan-300/40" style={{width:s,height:s}} />)}</div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[100dvh] md:min-h-0">
        <div className="relative pt-4 md:pt-16 pb-2 md:pb-10 px-4 text-center">
          <div className="mb-2 md:mb-5 animate-[fadeIn_0.6s_ease-out]">
            <img src="/hcontrol.png" alt="HControl" className="w-32 h-32 md:w-56 md:h-56 mx-auto object-contain drop-shadow-xl" />
          </div>
          <p className="text-slate-500 text-xs md:text-lg max-w-md mx-auto animate-[fadeIn_0.6s_ease-out_0.2s_both]">
            Gestiona tu hotel de forma fácil y centralizada
          </p>
        </div>

        <div className="max-w-md mx-auto px-4 pb-2 md:pb-12 animate-[fadeIn_0.6s_ease-out_0.3s_both]">
          <LoginCard onLogin={handleLogin} loading={loading} error={error} />
        </div>
      </div>

      {/* Toggle beneficios / testimonios (visible en móvil, siempre en desktop) */}
      <div className="md:hidden text-center pb-4">
        <button onClick={() => setShowMore(!showMore)}
          className="inline-flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-medium cursor-pointer">
          {showMore ? 'Ocultar' : 'Ver más información'} <ChevronDown size={14} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={`${showMore ? 'block' : 'hidden'} md:block`}>
      <div className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="text-slate-800 text-2xl font-bold text-center mb-8">Todo lo que necesitas para gestionar tu hotel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b) => {
            const Icon = b.icon
            return (
              <div key={b.title} className="bg-white shadow-sm border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center mb-3"><Icon className="text-cyan-600" size={20} /></div>
                <h3 className="text-slate-800 font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-14">
        <h2 className="text-slate-800 text-2xl font-bold text-center mb-8">Lo que dicen nuestros clientes</h2>
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={16} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />))}</div>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed italic mb-6 max-w-lg">&ldquo;{t.text}&rdquo;</p>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm mb-2">{t.name.split(' ').map(n => n[0]).join('')}</div>
              <p className="text-slate-800 font-semibold text-sm">{t.name}</p>
              <p className="text-slate-500 text-xs">{t.role}</p>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-1.5">{testimonials.map((_, i) => (<button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === testimonialIdx ? 'bg-cyan-500 w-4' : 'bg-slate-300 hover:bg-slate-400'}`} />))}</div>
            <button onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} HControl. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Soporte</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Términos</a>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
