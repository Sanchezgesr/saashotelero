export type ThemeId = 'default' | 'ocean' | 'emerald' | 'sunset' | 'midnight' | 'rose' | 'amber' | 'violet'

export type Theme = {
  name: string
  primary: string
  'primary-foreground': string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-hover': string
}

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    name: 'Default',
    primary: '#2563eb',
    'primary-foreground': '#ffffff',
    sidebar: '#1e293b',
    'sidebar-foreground': '#cbd5e1',
    'sidebar-hover': '#334155',
  },
  ocean: {
    name: 'Océano',
    primary: '#0891b2',
    'primary-foreground': '#ffffff',
    sidebar: '#0f172a',
    'sidebar-foreground': '#cbd5e1',
    'sidebar-hover': '#1e293b',
  },
  emerald: {
    name: 'Esmeralda',
    primary: '#059669',
    'primary-foreground': '#ffffff',
    sidebar: '#064e3b',
    'sidebar-foreground': '#a7f3d0',
    'sidebar-hover': '#065f46',
  },
  sunset: {
    name: 'Atardecer',
    primary: '#d97706',
    'primary-foreground': '#ffffff',
    sidebar: '#1c1917',
    'sidebar-foreground': '#fcd34d',
    'sidebar-hover': '#292524',
  },
  midnight: {
    name: 'Medianoche',
    primary: '#6366f1',
    'primary-foreground': '#ffffff',
    sidebar: '#0f0f1a',
    'sidebar-foreground': '#c7d2fe',
    'sidebar-hover': '#1e1b4b',
  },
  rose: {
    name: 'Rosa',
    primary: '#e11d48',
    'primary-foreground': '#ffffff',
    sidebar: '#1f0f14',
    'sidebar-foreground': '#fecdd3',
    'sidebar-hover': '#2d1b20',
  },
  amber: {
    name: 'Ámbar',
    primary: '#f59e0b',
    'primary-foreground': '#0f172a',
    sidebar: '#1a1508',
    'sidebar-foreground': '#fde68a',
    'sidebar-hover': '#292015',
  },
  violet: {
    name: 'Violeta',
    primary: '#7c3aed',
    'primary-foreground': '#ffffff',
    sidebar: '#1a0e2e',
    'sidebar-foreground': '#ddd6fe',
    'sidebar-hover': '#2e1a4a',
  },
}
