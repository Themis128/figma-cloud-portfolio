import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Performance monitoring constants
const NAVIGATION_CHECK_DELAY_MS = 100 // Delay to check navigation timing after initial check
const MEMORY_CHECK_INTERVAL_MS = 30000 // Check memory usage every 30 seconds

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: {
        event_category?: string
        event_label?: string
        value?: number
        custom_map?: Record<string, string>
        [key: string]: unknown
      },
    ) => void
  }
}

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
}

// Analytics service integration function - REMOVED
// Custom analytics endpoint removed - using Google Analytics 4 only

export function PerformanceMonitor() {
  const _location = useLocation()

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      onCLS((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'CLS',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
        }
      })

      onINP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'INP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
        }
      })

      onFCP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'FCP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
        }
      })

      onLCP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'LCP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
        }
      })

      onTTFB((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'TTFB',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
        }
      })
    }

    trackWebVitals()

    // Track navigation performance
    const trackNavigation = () => {
      // Use a timeout to wait for page load to complete
      const checkNavigationTiming = () => {
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
            const _domContentLoaded =
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
            const _loadComplete = navigation.loadEventEnd - navigation.loadEventStart
            const _totalTime = navigation.loadEventEnd - navigation.fetchStart

            if (process.env['NODE_ENV'] === 'production') {
              // Send to analytics service
              // analytics.track('navigation_timing', {
              //   domContentLoaded,
              //   loadComplete,
              //   totalTime,
              // })
            } else {
            }
          }
        }
      }

      // Check immediately and also after a short delay to catch load completion
      checkNavigationTiming()
      setTimeout(checkNavigationTiming, NAVIGATION_CHECK_DELAY_MS)
    }

    trackNavigation()

    // Track route changes
    if (process.env['NODE_ENV'] === 'production') {
      // Send to analytics service
      // analytics.track('route_change', { path: location.pathname })
    } else {
    }
  }, [])

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
        const _memory = perfWithMemory.memory
        /* eslint-enable no-console */
      }
    }

    const interval = setInterval(trackMemory, MEMORY_CHECK_INTERVAL_MS) // Every 30 seconds
    return () => {
      clearInterval(interval)
    }
  }, [])

  return null // This component doesn't render anything
}
