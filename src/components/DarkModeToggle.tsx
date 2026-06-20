'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function DarkModeToggle({ className }: { className?: string }) {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <button onClick={toggleDarkMode}
      className={`p-2 rounded-lg text-sm transition-colors ${className || ''}`}
      aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}>
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
