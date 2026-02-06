import { useCallback, useEffect, useState } from 'react'

interface FontLoaderProps {
  children: React.ReactNode
  fonts?: Array<{
    family: string
    weights?: number[]
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
    subsets?: string[]
  }>
}

interface FontState {
  loaded: boolean
  error: boolean
  loading: boolean
}

// Constants for font weights
const DEFAULT_FONT_WEIGHT = 400
const INTER_REGULAR_WEIGHT = 400
const INTER_MEDIUM_WEIGHT = 600
const FIRA_CODE_WEIGHT = 400

// Font loading utility with performance optimizations
const loadedFonts = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()

/**
 * Generate proper Google Fonts URL for preloading
 */
function getGoogleFontsPreloadURL(
  family: string,
  weights: number[],
  subsets: string[] = ['latin'],
): string {
  const familyParam = encodeURIComponent(family)
  const weightsParam = weights.join(',')
  const subsetsParam = subsets.join(',')

  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&subset=${subsetsParam}&display=swap`
}

/**
 * Generate Google Fonts CSS URL for loading
 */
function getGoogleFontsCSSURL(
  family: string,
  weights: number[],
  subsets: string[] = ['latin'],
  display: string = 'swap',
): string {
  const familyParam = encodeURIComponent(family)
  const weightsParam = weights.join(',')
  const subsetsParam = subsets.join(',')

  return `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&subset=${subsetsParam}&display=${display}`
}

/**
 * Load font via CSS with proper error handling
 */
function loadViaCSS(
  family: string,
  weights: number[],
  display: string,
  subsets: string[] = ['latin'],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = getGoogleFontsCSSURL(family, weights, subsets, display)
    link.id = `font-${family.toLowerCase().replace(/\s+/g, '-')}-${weights.join('-')}`

    const cleanup = () => {
      link.removeEventListener('load', onLoad)
      link.removeEventListener('error', onError)
    }

    const onLoad = () => {
      cleanup()
      resolve()
    }

    const onError = () => {
      cleanup()
      reject(new Error(`Failed to load font: ${family}`))
    }

    link.addEventListener('load', onLoad)
    link.addEventListener('error', onError)

    // Add to head
    document.head.appendChild(link)
  })
}

/**
 * Load font with FontFace API for better detection
 */
type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

function loadFontWithFontFace(
  family: string,
  weights: number[],
  display: FontDisplay = 'swap',
  subsets: string[] = ['latin'],
): Promise<void> {
  if (!('FontFace' in window)) {
    // Fallback to CSS loading if FontFace is not supported
    return loadViaCSS(family, weights, display, subsets)
  }

  return Promise.all(
    weights.map((weight): Promise<void> => {
      // Use Google Fonts CSS URL for FontFace API
      const cssUrl = getGoogleFontsCSSURL(family, [weight], subsets, display)
      const fontFace = new FontFace(family, `url(${cssUrl})`, {
        weight: weight.toString(),
        style: 'normal',
        display: display as FontDisplay,
      })

      return fontFace
        .load()
        .then(() => {
          document.fonts.add(fontFace)
        })
        .catch(() => {
          // Fallback to CSS loading if FontFace fails
          return loadViaCSS(family, [weight], display, subsets)
        })
    }),
  ).then(() => {})
}

/**
 * Load font with comprehensive error handling
 */
function loadFont(
  family: string,
  weights: number[] = [DEFAULT_FONT_WEIGHT],
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap',
  subsets: string[] = ['latin'],
): Promise<void> {
  const fontKey = `${family}-${weights.join(',')}-${display}`

  // Return if already loaded
  if (loadedFonts.has(fontKey)) {
    return Promise.resolve()
  }

  // Return existing promise if loading
  if (loadingPromises.has(fontKey)) {
    return loadingPromises.get(fontKey) || Promise.resolve()
  }

  const loadPromise = loadFontWithFontFace(family, weights, display, subsets)
    .then(() => {
      loadedFonts.add(fontKey)
    })
    .catch(() => {
      // Don't throw error - fonts are not critical for functionality
      loadedFonts.add(fontKey)
    })

  loadingPromises.set(fontKey, loadPromise)
  return loadPromise
}

/**
 * Preload font with proper URL generation
 */
function preloadFont(
  family: string,
  weights: number[] = [DEFAULT_FONT_WEIGHT],
  subsets: string[] = ['latin'],
): void {
  try {
    const cssURL = getGoogleFontsPreloadURL(family, weights, subsets)

    // Create link element for preloading
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = cssURL
    link.as = 'style'
    link.id = `preload-${family.toLowerCase().replace(/\s+/g, '-')}-${weights.join('-')}`

    // Check if already preloaded
    const existing = document.querySelector(`link[id="${link.id}"]`)
    if (!existing) {
      document.head.appendChild(link)
    }
  } catch {
    // Silently handle preload errors
  }
}

export function FontLoaderComponent({ children, fonts = [] }: FontLoaderProps) {
  const [fontState, setFontState] = useState<FontState>({
    loaded: false,
    error: false,
    loading: true,
  })

  const cleanupAll = useCallback(() => {
    // Remove font loading classes
    document.body.classList.remove('fonts-loading', 'fonts-loaded')
  }, [])

  useEffect(() => {
    // Add initial loading class
    document.body.classList.add('fonts-loading')

    // Preload critical fonts immediately
    preloadFont('Inter', [INTER_REGULAR_WEIGHT, INTER_MEDIUM_WEIGHT])
    preloadFont('Fira Code', [FIRA_CODE_WEIGHT])

    // Load all specified fonts
    const loadFonts = async () => {
      setFontState((prev) => ({ ...prev, loading: true }))

      try {
        const fontPromises = fonts.map((font) =>
          loadFont(
            font.family,
            font.weights || [DEFAULT_FONT_WEIGHT],
            font.display || 'swap',
            font.subsets || ['latin'],
          ),
        )

        await Promise.all(fontPromises)
        setFontState({ loaded: true, error: false, loading: false })
      } catch {
        // Handle font loading errors silently
        setFontState({ loaded: false, error: true, loading: false })
      }
    }

    loadFonts()

    // Cleanup on unmount
    return cleanupAll
  }, [fonts, cleanupAll])

  // Add font-loading class to body for CSS fallbacks
  useEffect(() => {
    if (fontState.loaded) {
      document.body.classList.remove('fonts-loading')
      document.body.classList.add('fonts-loaded')
    } else if (fontState.error) {
      document.body.classList.remove('fonts-loading', 'fonts-loaded')
    }

    return () => {
      document.body.classList.remove('fonts-loading', 'fonts-loaded')
    }
  }, [fontState.loaded, fontState.error])

  return <>{children}</>
}

// Hook for component-level font loading
export function useFontLoader() {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  const loadFontHook = async (
    family: string,
    weights: number[] = [DEFAULT_FONT_WEIGHT],
    display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' = 'swap',
  ) => {
    try {
      await loadFont(family, weights, display)
      setLoadedFonts((prev) => new Set([...prev, family]))
    } catch (_error) {
      // Silently handle font loading errors
    }
  }

  const preloadFontHook = (family: string, weights: number[] = [DEFAULT_FONT_WEIGHT]) => {
    preloadFont(family, weights)
  }

  return {
    loadFont: loadFontHook,
    preloadFont: preloadFontHook,
    loadedFonts: Array.from(loadedFonts),
    isFontLoaded: (family: string) => loadedFonts.has(family),
  }
}

export default FontLoaderComponent
