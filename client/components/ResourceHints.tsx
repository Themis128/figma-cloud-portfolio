import { useEffect, useMemo, useRef } from 'react'

interface ResourceHint {
  rel: 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch' | 'prerender'
  href: string
  as?: 'font' | 'script' | 'style' | 'image' | 'fetch' | 'document'
  type?: string
  crossorigin?: boolean | 'anonymous' | 'use-credentials'
  media?: string
}

interface ResourceHintsProps {
  hints?: ResourceHint[]
  criticalImages?: string[]
  criticalRoutes?: string[]
  enableIntersectionObserver?: boolean
  enableDataSaverMode?: boolean
}

// Type definition for navigator.connection
interface NavigatorConnection {
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
}

// Utility functions for URL and MIME type validation
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url, window.location.origin)
    return true
  } catch {
    return false
  }
}

const getImageMimeType = (url: string): string | undefined => {
  const extension = url.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    webp: 'image/webp',
    avif: 'image/avif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    bmp: 'image/bmp',
    ico: 'image/x-icon',
  }
  return mimeTypes[extension || ''] || undefined
}

const isDataSaverEnabled = (): boolean => {
  // Check for Save-Data header preference
  if ('connection' in navigator) {
    const connection = (navigator as { connection?: NavigatorConnection }).connection
    return Boolean(connection?.saveData)
  }
  return false
}

// Generate a unique key for resource hints to prevent duplicates
const getResourceKey = (hint: ResourceHint): string => {
  const parts = [hint.rel, hint.href]
  if (hint.as) parts.push(`as:${hint.as}`)
  if (hint.type) parts.push(`type:${hint.type}`)
  if (hint.crossorigin) parts.push(`crossorigin:${hint.crossorigin}`)
  if (hint.media) parts.push(`media:${hint.media}`)
  return parts.join('|')
}

export function ResourceHints({
  hints = [],
  criticalImages = [],
  criticalRoutes = [],
  enableIntersectionObserver = true,
  enableDataSaverMode = true,
}: ResourceHintsProps) {
  // Memoize default hints to prevent unnecessary recalculations
  const defaultHints = useMemo<ResourceHint[]>(
    () => [
      // Critical third-party domains
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://www.google-analytics.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://region1.google-analytics.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://www.recaptcha.net', crossorigin: true },

      // DNS prefetch for additional domains
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//region1.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'dns-prefetch', href: '//www.recaptcha.net' },
      { rel: 'dns-prefetch', href: '//www.gstatic.com' },
    ],
    [],
  )

  // Memoize combined and deduplicated hints
  const processedHints = useMemo(() => {
    // Check if data saver mode should be enabled
    const shouldEnableDataSaver = enableDataSaverMode && isDataSaverEnabled()

    // Filter out heavy resources when data saver is enabled
    const filteredDefaultHints = shouldEnableDataSaver
      ? defaultHints.filter((hint) => hint.rel !== 'preload' && hint.rel !== 'prefetch')
      : defaultHints

    // Combine default and custom hints
    const allHints = [...filteredDefaultHints, ...hints]

    // Remove duplicates by considering all attributes
    const seen = new Set<string>()
    const uniqueHints: ResourceHint[] = []

    allHints.forEach((hint) => {
      const key = getResourceKey(hint)
      if (!seen.has(key)) {
        seen.add(key)
        uniqueHints.push(hint)
      }
    })

    return uniqueHints
  }, [defaultHints, hints, enableDataSaverMode])

  // Ref to store added links for cleanup
  const addedLinksRef = useRef<HTMLLinkElement[]>([])

  useEffect(() => {
    const addedLinks: HTMLLinkElement[] = []

    // Helper function to create a link element
    const createLink = (hint: ResourceHint): HTMLLinkElement => {
      const link = document.createElement('link')
      link.rel = hint.rel
      link.href = hint.href

      // Set optional attributes
      Object.assign(link, {
        ...(hint.as && { as: hint.as }),
        ...(hint.type && { type: hint.type }),
        ...(hint.media && { media: hint.media }),
      })

      if (hint.crossorigin) {
        link.crossOrigin = hint.crossorigin === true ? 'anonymous' : hint.crossorigin
      }

      return link
    }

    // Helper function to check if link already exists
    const linkExists = (hint: ResourceHint): boolean => {
      const selector = `link[href="${hint.href}"][rel="${hint.rel}"]${
        hint.as ? `[as="${hint.as}"]` : ''
      }${hint.type ? `[type="${hint.type}"]` : ''}`
      return document.querySelector(selector) !== null
    }

    // Helper function to add a single hint
    const addSingleHint = (hint: ResourceHint): void => {
      try {
        if (!isValidUrl(hint.href) || linkExists(hint)) return

        const link = createLink(hint)
        document.head.appendChild(link)
        addedLinks.push(link)
      } catch (_error) {}
    }

    // Helper function to preload an image
    const preloadImage = (imageSrc: string): void => {
      try {
        if (!isValidUrl(imageSrc)) return

        const existing = document.querySelector(
          `link[href="${imageSrc}"][rel="preload"][as="image"]`,
        )
        if (existing) return

        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = imageSrc
        link.as = 'image'

        const mimeType = getImageMimeType(imageSrc)
        if (mimeType) link.type = mimeType

        document.head.appendChild(link)
        addedLinks.push(link)
      } catch (_error) {}
    }

    // Helper function to prefetch a route
    const prefetchRoute = (route: string): void => {
      try {
        if (!isValidUrl(route)) return

        const existing = document.querySelector(`link[href="${route}"][rel="prefetch"]`)
        if (existing) return

        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route

        document.head.appendChild(link)
        addedLinks.push(link)
      } catch (_error) {}
    }

    // Add hints to document head
    processedHints.forEach(addSingleHint)

    // Preload critical images
    criticalImages.forEach(preloadImage)

    // Prefetch critical routes
    criticalRoutes.forEach(prefetchRoute)

    // Store added links for cleanup
    addedLinksRef.current = addedLinks

    // Intersection Observer for lazy loading non-critical resources
    let observer: IntersectionObserver | null = null

    if (enableIntersectionObserver && 'IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }

      const handleIntersection = (entries: IntersectionObserverEntry[]): void => {
        entries.forEach(handleSingleIntersection)
      }

      const handleSingleIntersection = (entry: IntersectionObserverEntry): void => {
        if (!entry.isIntersecting) return

        const target = entry.target as HTMLElement
        const resourceUrl = target.dataset['prefetch'] || target.dataset['preload']

        if (!resourceUrl) return

        try {
          const link = createIntersectionLink(target, resourceUrl)
          document.head.appendChild(link)
          addedLinks.push(link)
          observer?.unobserve(target)
        } catch (_error) {}
      }

      const createIntersectionLink = (target: HTMLElement, resourceUrl: string): HTMLLinkElement => {
        const link = document.createElement('link')
        link.rel = target.dataset['preload'] ? 'preload' : 'prefetch'
        link.href = resourceUrl

        // Set as attribute if valid
        const asValue = target.dataset['as']
        const validAs = new Set<ResourceHint['as']>(['font', 'script', 'style', 'image', 'fetch', 'document'])
        if (asValue && validAs.has(asValue as ResourceHint['as'])) {
          link.as = asValue
        }

        if (target.dataset['type']) link.type = target.dataset['type']

        return link
      }

      observer = new IntersectionObserver(handleIntersection, observerOptions)

      // Observe elements with data-prefetch or data-preload attributes
      document.querySelectorAll('[data-prefetch], [data-preload]').forEach((el) => {
        observer?.observe(el)
      })
    }

    // Cleanup function - always executed
    return () => {
      // Disconnect observer if it exists
      if (observer) {
        observer.disconnect()
      }

      // Remove all added links
      addedLinksRef.current.forEach((link) => {
        try {
          if (link.parentNode) {
            link.parentNode.removeChild(link)
          }
        } catch (_error) {}
      })

      // Clear the ref
      addedLinksRef.current = []
    }
  }, [processedHints, criticalImages, criticalRoutes, enableIntersectionObserver])

  return null // This component doesn't render anything
}

// Hook for dynamic resource hint management
export function useResourceHints() {
  // Helper function to check if a hint already exists
  const hasExistingHint = (hint: ResourceHint): boolean => {
    const selector = `link[href="${hint.href}"][rel="${hint.rel}"]${
      hint.as ? `[as="${hint.as}"]` : ''
    }${hint.type ? `[type="${hint.type}"]` : ''}`
    return document.querySelector(selector) !== null
  }

  // Helper function to create and append a link element
  const createLinkElement = (hint: ResourceHint): HTMLLinkElement | null => {
    try {
      const link = document.createElement('link')
      link.rel = hint.rel
      link.href = hint.href

      if (hint.as) link.as = hint.as
      if (hint.type) link.type = hint.type
      if (hint.crossorigin) {
        link.crossOrigin = hint.crossorigin === true ? 'anonymous' : hint.crossorigin
      }
      if (hint.media) link.media = hint.media

      document.head.appendChild(link)
      return link
    } catch (_error) {
      return null
    }
  }

  const addHint = (hint: ResourceHint): HTMLLinkElement | null => {
    try {
      if (!isValidUrl(hint.href) || hasExistingHint(hint)) {
        return null
      }

      return createLinkElement(hint)
    } catch (_error) {
      return null
    }
  }

  const removeHint = (href: string, rel: string): boolean => {
    try {
      const link = document.querySelector(`link[href="${href}"][rel="${rel}"]`)
      if (link?.parentNode) {
        link.parentNode.removeChild(link)
        return true
      }
      return false
    } catch (_error) {
      return false
    }
  }

  const preloadResource = (
    url: string,
    as: ResourceHint['as'],
    type?: string,
  ): HTMLLinkElement | null => {
    const hint: ResourceHint = {
      rel: 'preload',
      href: url,
      ...(as && { as }),
      ...(type && { type }),
    }
    return addHint(hint)
  }

  const prefetchResource = (url: string): HTMLLinkElement | null => {
    return addHint({
      rel: 'prefetch',
      href: url,
    })
  }

  const preconnectResource = (
    url: string,
    crossorigin?: boolean | 'anonymous' | 'use-credentials',
  ): HTMLLinkElement | null => {
    const hint: ResourceHint = {
      rel: 'preconnect',
      href: url,
      ...(crossorigin !== undefined && { crossorigin }),
    }
    return addHint(hint)
  }

  return {
    addHint,
    removeHint,
    preloadResource,
    prefetchResource,
    preconnectResource,
  }
}

export default ResourceHints
