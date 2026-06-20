'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { THEMES, type ThemeId } from '@/lib/themes'

export function HotelThemeLoader() {
  useEffect(() => {
    const stored = localStorage.getItem('hcontrol-dark')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored !== null ? stored === 'true' : prefersDark
    document.documentElement.classList.toggle('dark', isDark)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('hotel_id').eq('id', user.id).single().then(({ data: profile }) => {
        if (!profile?.hotel_id) return
        supabase.from('hotels').select('theme').eq('id', profile.hotel_id).single().then(({ data }) => {
          if (data?.theme) {
            const theme = THEMES[data.theme as ThemeId]
            if (!theme) return
            const root = document.documentElement
            root.style.setProperty('--primary', theme.primary)
            root.style.setProperty('--primary-foreground', theme['primary-foreground'])
            root.style.setProperty('--sidebar', theme.sidebar)
            root.style.setProperty('--sidebar-foreground', theme['sidebar-foreground'])
            root.style.setProperty('--sidebar-hover', theme['sidebar-hover'])
          }
        })
      })
    })
  }, [])

  return null
}
