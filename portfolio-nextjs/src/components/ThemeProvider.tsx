/// <reference types="vite/client" />

declare const window: Window & typeof globalThis

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark' // The resolved theme (light/dark)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored as Theme)
      }
    } catch (_error) {}
  }, [storageKey])

  // Update actual theme and apply to document
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateTheme = () => {
      let resolvedTheme: 'light' | 'dark'

      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      } else {
        resolvedTheme = theme
      }

      setActualTheme(resolvedTheme)

      // Apply theme to document
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)

      // Update meta theme-color for mobile browsers
      const metaThemeColor = window.document.querySelector(
        'meta[name="theme-color"]',
      ) as HTMLMetaElement | null
      if (metaThemeColor) {
        const color = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff'
        metaThemeColor.setAttribute('content', color)
      }
    }

    updateTheme()

    // Listen for system theme changes when theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => updateTheme()

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    return undefined
  }, [theme])

  // Save theme to localStorage
  const handleSetTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(storageKey, newTheme)
    } catch (_error) {}
    setTheme(newTheme)
  }

  const value = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
