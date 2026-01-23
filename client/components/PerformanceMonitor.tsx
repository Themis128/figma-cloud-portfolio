import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
}

export function PerformanceMonitor() {
  const location = useLocation()

  useEffect(() => {
    // Only track in production

    if (typeof window === 'undefined' || window.location.hostname === 'localhost') {
      return
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      /* eslint-disable no-console */
      onCLS((metric: WebVitalsMetric) => {
        console.log('CLS:', metric.value)
      })

      onINP((metric: WebVitalsMetric) => {
        console.log('INP:', metric.value)
      })

      onFCP((metric: WebVitalsMetric) => {
        console.log('FCP:', metric.value)
      })

      onLCP((metric: WebVitalsMetric) => {
        console.log('LCP:', metric.value)
      })

      onTTFB((metric: WebVitalsMetric) => {
        console.log('TTFB:', metric.value)
      })
      /* eslint-enable no-console */
    }

    trackWebVitals()

    // Track navigation performance
    const trackNavigation = () => {
      if ('performance' in window && 'getEntriesByType' in window.performance) {
        const navigation = window.performance.getEntriesByType(
          'navigation',
        )[0] as PerformanceEntry & {
          domContentLoadedEventEnd: number
          domContentLoadedEventStart: number
          loadEventEnd: number
          loadEventStart: number
          fetchStart: number
        }

        if (navigation) {
          /* eslint-disable no-console */
          console.log('Navigation timing:', {
            domContentLoaded:
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          })
          /* eslint-enable no-console */
        }
      }
    }

    trackNavigation()

    // Track route changes
    /* eslint-disable no-console */
    console.log('Route changed to:', location.pathname)
    /* eslint-enable no-console */
  }, [location.pathname])

  // Track memory usage (if available)
  useEffect(() => {
    const trackMemory = () => {
      const perfWithMemory = performance as typeof performance & {
        memory?: {
          usedJSHeapSize: number
          totalJSHeapSize: number
          jsHeapSizeLimit: number
        }
      }

      if (perfWithMemory.memory) {
        const memory = perfWithMemory.memory
        /* eslint-disable no-console */
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        })
        /* eslint-enable no-console */
      }
    }

    const interval = setInterval(trackMemory, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return null // This component doesn't render anything
}
