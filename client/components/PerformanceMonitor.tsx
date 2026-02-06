import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Performance monitoring constants
const NAVIGATION_CHECK_DELAY_MS = 100
const SECONDS_PER_INTERVAL = 30
const MILLISECONDS_PER_SECOND = 1000
const MEMORY_TRACKING_INTERVAL_MS = SECONDS_PER_INTERVAL * MILLISECONDS_PER_SECOND // 30 seconds

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
    webVitalsMetrics?: WebVitalsMetric[]
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
// const sendAnalytics = async (event: string, data: Record<string, unknown>) => {
//   try {
//     await fetch("/api/analytics", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         event,
//         data,
//         timestamp: new Date().toISOString(),
//         url: window.location.href,
//         userAgent: navigator.userAgent,
//       }),
//     });
//   } catch (_error) {
//     // Silently fail in production
//   }
// };

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      return
    }

    // Initialize metrics array
    if (!window.webVitalsMetrics) {
      window.webVitalsMetrics = []
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      onCLS((metric: WebVitalsMetric) => {
        // Store metric
        if (window.webVitalsMetrics) {
          window.webVitalsMetrics.push(metric)
        }

        // Analytics calls removed - using Google Analytics 4 only
        // sendAnalytics("web_vitals_cls", {
        //   value: metric.value,
        //   delta: metric.delta,
        //   id: metric.id,
        // });

        // Send to Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'CLS',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        }
      })

      onINP((metric: WebVitalsMetric) => {
        // Store metric
        if (window.webVitalsMetrics) {
          window.webVitalsMetrics.push(metric)
        }

        // Analytics calls removed - using Google Analytics 4 only
        // sendAnalytics("web_vitals_inp", {
        //   value: metric.value,
        //   delta: metric.delta,
        //   id: metric.id,
        // });

        // Send to Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'INP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        }
      })

      onFCP((metric: WebVitalsMetric) => {
        // Store metric
        if (window.webVitalsMetrics) {
          window.webVitalsMetrics.push(metric)
        }

        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        // sendAnalytics("web_vitals_fcp", {
        //   value: metric.value,
        //   delta: metric.delta,
        //   id: metric.id,
        // });

        // Send to Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'FCP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        }
      })

      onLCP((metric: WebVitalsMetric) => {
        // Store metric
        if (window.webVitalsMetrics) {
          window.webVitalsMetrics.push(metric)
        }

        // Analytics calls removed - using Google Analytics 4 only
        // sendAnalytics("web_vitals_lcp", {
        //   value: metric.value,
        //   delta: metric.delta,
        //   id: metric.id,
        // });

        // Send to Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'LCP',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        }
      })

      onTTFB((metric: WebVitalsMetric) => {
        // Store metric
        if (window.webVitalsMetrics) {
          window.webVitalsMetrics.push(metric)
        }

        // Analytics calls removed - using Google Analytics 4 only
        // sendAnalytics("web_vitals_ttfb", {
        //   value: metric.value,
        //   delta: metric.delta,
        //   id: metric.id,
        // });

        // Send to Google Analytics 4
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: 'TTFB',
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          })
        } else {
          // Debug logging removed - analytics handles production tracking
        }
      })
    }

    trackWebVitals()

    const trackNavigation = () => {
      const checkNavigationTiming = () => {
        if (isPerformanceSupported()) {
          const navigation = getNavigationEntry()
          if (navigation) {
            handleNavigationEntry(navigation)
          }
        }
      }

      // Check immediately and also after a short delay to catch load completion
      checkNavigationTiming()
      setTimeout(checkNavigationTiming, NAVIGATION_CHECK_DELAY_MS)
    }

    const isPerformanceSupported = () => {
      return 'performance' in window && 'getEntriesByType' in window.performance
    }

    const getNavigationEntry = () => {
      return window.performance.getEntriesByType('navigation')[0] as PerformanceEntry & {
        domContentLoadedEventEnd: number
        domContentLoadedEventStart: number
        loadEventEnd: number
        loadEventStart: number
        fetchStart: number
      }
    }

    const handleNavigationEntry = (
      _navigation: PerformanceEntry & {
        domContentLoadedEventEnd: number
        domContentLoadedEventStart: number
        loadEventEnd: number
        loadEventStart: number
        fetchStart: number
      },
    ) => {
      if (process.env['NODE_ENV'] === 'production') {
        // Send to analytics service
        // const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        // const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        // const totalTime = navigation.loadEventEnd - navigation.fetchStart;
        // analytics.track('navigation_timing', { domContentLoaded, loadComplete, totalTime })
      }
    }

    trackNavigation()

    // Track route changes
    if (process.env['NODE_ENV'] === 'production') {
      // Send to analytics service
      // analytics.track('route_change', { path: location.pathname })
    } else {
      // Debug logging removed - analytics handles production tracking
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
        // Memory usage tracking - debug logging removed for production
        // Previously logged: used/total/limit in MB
      }
    }

    const interval = setInterval(trackMemory, MEMORY_TRACKING_INTERVAL_MS) // Every 30 seconds
    return () => {
      clearInterval(interval)
    }
  }, [])

  return null // This component doesn't render anything
}
