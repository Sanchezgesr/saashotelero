'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { THEMES, type ThemeId } from '@/lib/themes'

type ThemeContextType = {
  themeId: ThemeId
  setTheme: (hotelId: string, themeId: ThemeId) => Promise<void>
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: 'default', setTheme: async () => {},
  darkMode: false, toggleDarkMode: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>('default')
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const stored = localStorage.getItem('hcontrol-dark')
    if (stored !== null) {
      setDarkMode(stored === 'true')
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('hcontrol-dark', String(darkMode))
  }, [darkMode, mounted])

  const applyTheme = useCallback((id: ThemeId) => {
    const theme = THEMES[id]
    if (!theme) return
    const root = document.documentElement
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--primary-foreground', theme['primary-foreground'])
    root.style.setProperty('--sidebar', theme.sidebar)
    root.style.setProperty('--sidebar-foreground', theme['sidebar-foreground'])
    root.style.setProperty('--sidebar-hover', theme['sidebar-hover'])
  }, [])

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId, applyTheme])

  useEffect(() => {
    const handler = () => {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase.from('profiles').select('hotel_id').eq('id', user.id).single().then(({ data: profile }) => {
          if (!profile?.hotel_id) return
          supabase.from('hotels').select('theme').eq('id', profile.hotel_id).single().then(({ data }) => {
            if (data?.theme) setThemeId(data.theme as ThemeId)
          })
        })
      })
    }
    window.addEventListener('theme-updated', handler)
    return () => window.removeEventListener('theme-updated', handler)
  }, [])

  const setTheme = async (hotelId: string, id: ThemeId) => {
    const supabase = createClient()
    const { error } = await supabase.from('hotels').update({ theme: id }).eq('id', hotelId)
    if (error) throw new Error(error.message)
    setThemeId(id)
    applyTheme(id)
    window.dispatchEvent(new CustomEvent('theme-updated'))
  }

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
