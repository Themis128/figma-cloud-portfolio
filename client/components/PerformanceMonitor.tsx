/**
 * Performance Monitor - Core Web Vitals Tracking
 *
 * Latest GA4 Web Vitals Implementation:
 * - Uses web-vitals library for accurate metric collection
 * - Sends to GA4 with recommended parameters
 * - Core Web Vitals rating calculation (good/needs-improvement/poor)
 * - Debug mode support
 * - Session tracking integration
 *
 * Reference: https://developers.google.com/analytics/devguides/collection/ga4
 */

import { useEffect } from 'react'
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Performance monitoring constants
const NAVIGATION_CHECK_DELAY_MS = 100
const SECONDS_PER_INTERVAL = 30
const MILLISECONDS_PER_SECOND = 1000
const MEMORY_TRACKING_INTERVAL_MS = SECONDS_PER_INTERVAL * MILLISECONDS_PER_SECOND // 30 seconds
const SESSION_DURATION_MINUTES = 30
const SESSION_DURATION_MS = SESSION_DURATION_MINUTES * 60 * MILLISECONDS_PER_SECOND // 30 minutes
const BYTES_PER_KILOBYTE = 1024
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE
const PERCENTAGE_MULTIPLIER = 100

// Type definitions for performance monitoring window extensions
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set' | 'consent',
      targetId: string | Record<string, unknown>,
      config?: Record<string, unknown> | string,
    ) => void
    webVitalsMetrics?: WebVitalsMetric[]
    gtagSession?: {
      sessionId: number
      engagementTime: number
    }
  }
}

interface WebVitalsMetric {
  name: string
  value: number
  delta: number
  id: string
}

// Core Web Vitals Thresholds (GA4 Recommended)
const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
}

// Get session info
const getSessionInfo = (): { sessionId: number; engagementTime: number } => {
  if (typeof window === 'undefined') return { sessionId: 0, engagementTime: 0 }
  const now = Date.now()
  const sessionDuration = SESSION_DURATION_MS // 30 minutes

  const existing = window.gtagSession

  if (existing && now - existing.engagementTime < sessionDuration) {
    return existing
  }

  const newSession = {
    sessionId: Math.floor(now / MILLISECONDS_PER_SECOND),
    engagementTime: now,
  }
  window.gtagSession = newSession
  return newSession
}

// Get engagement time in milliseconds
const getEngagementTime = (): number => {
  if (typeof window === 'undefined') return 0
  const start = window.gtagSession?.engagementTime || Date.now()
  return Date.now() - start
}

// Calculate Core Web Vitals rating
const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS]
  if (!threshold) return 'needs-improvement'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Send web vital to GA4
const sendWebVitalToGA4 = (metric: Metric): void => {
  if (typeof window === 'undefined' || !window.gtag) return

  const { sessionId, engagementTime } = getSessionInfo()
  const rating = getMetricRating(metric.name, metric.value)

  // GA4 Web Vitals recommended parameters
  window.gtag('event', metric.name.toLowerCase(), {
    // Core parameters
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: Math.round(metric.value),
    metric_delta: Math.round(metric.delta),
    metric_rating: rating,

    // Session tracking
    session_id: sessionId,
    engagement_time_msec: engagementTime,

    // Debug mode in development
    debug_mode: import.meta.env.DEV,
  })
}

// Store metric globally for testing
const storeMetric = (metric: Metric): void => {
  if (typeof window === 'undefined') return

  if (!window.webVitalsMetrics) {
    window.webVitalsMetrics = []
  }

  // Add rating to the metric
  const metricWithRating = {
    ...metric,
    rating: getMetricRating(metric.name, metric.value),
    timestamp: Date.now(),
  }

  window.webVitalsMetrics.push(metricWithRating)
}

// Track a single web vital
const trackWebVital = (metric: Metric): void => {
  // Store metric globally
  storeMetric(metric)

  // Send to GA4
  sendWebVitalToGA4(metric)
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    // Initialize metrics array
    if (!window.webVitalsMetrics) {
      window.webVitalsMetrics = []
    }

    // Track Core Web Vitals with web-vitals library
    onCLS((metric) => {
      trackWebVital(metric)
    })

    onINP((metric) => {
      trackWebVital(metric)
    })

    onFCP((metric) => {
      trackWebVital(metric)
    })

    onLCP((metric) => {
      trackWebVital(metric)
    })

    onTTFB((metric) => {
      trackWebVital(metric)
    })

    // Navigation timing
    const trackNavigation = () => {
      const isPerformanceAvailable = (): boolean => {
        return 'performance' in window && 'getEntriesByType' in window.performance
      }

      const getNavigationEntry = (): PerformanceNavigationTiming | null => {
        const navigationEntries = window.performance.getEntriesByType('navigation')
        return navigationEntries.length > 0
          ? (navigationEntries[0] as PerformanceNavigationTiming)
          : null
      }

      const sendNavigationTimingEvent = (navigation: PerformanceNavigationTiming): void => {
        if (typeof window === 'undefined' || !window.gtag) return

        const { sessionId, engagementTime } = getSessionInfo()

        window.gtag('event', 'navigation_timing', {
          event_category: 'Performance',
          event_label: 'navigation',
          value: Math.round(navigation.duration),
          session_id: sessionId,
          engagement_time_msec: engagementTime,
          dom_content_loaded: Math.round(
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          ),
          dom_complete: Math.round(navigation.domComplete - navigation.domContentLoadedEventEnd),
          load_complete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          total_time: Math.round(navigation.duration),
        })
      }

      const checkNavigationTiming = (): void => {
        if (!isPerformanceAvailable()) return

        const navigation = getNavigationEntry()
        if (navigation) {
          sendNavigationTimingEvent(navigation)
        }
      }

      // Check immediately and after a short delay
      checkNavigationTiming()
      setTimeout(checkNavigationTiming, NAVIGATION_CHECK_DELAY_MS)
    }

    trackNavigation()

    // Cleanup function
    return () => {
      // Any cleanup if needed
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
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = perfWithMemory.memory
        const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * PERCENTAGE_MULTIPLIER

        // Track memory as custom metric in GA4
        if (typeof window !== 'undefined' && window.gtag) {
          const { sessionId, engagementTime } = getSessionInfo()

          window.gtag('event', 'memory_usage', {
            event_category: 'Performance',
            event_label: 'memory',
            value: Math.round(usagePercent),
            memory_used_mb: Math.round(usedJSHeapSize / BYTES_PER_MEGABYTE),
            memory_total_mb: Math.round(totalJSHeapSize / BYTES_PER_MEGABYTE),
            session_id: sessionId,
            engagement_time_msec: engagementTime,
          })
        }
      }
    }

    const interval = setInterval(trackMemory, MEMORY_TRACKING_INTERVAL_MS)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return null // This component doesn't render anything
}

// Export utility functions
export { getMetricRating, getSessionInfo, getEngagementTime }
export type { WebVitalsMetric }
