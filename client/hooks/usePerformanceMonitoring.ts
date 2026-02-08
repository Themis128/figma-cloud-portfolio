/**
 * Performance Monitoring Hook
 *
 * Latest GA4 Implementation:
 * - Uses web-vitals library for accurate metric collection
 * - Local metrics storage for UI display
 * - Performance score calculation based on Core Web Vitals
 * - Integration with session tracking
 *
 * Note: Backend analytics are handled by PerformanceMonitor component
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Declare global gtag function
declare global {
  function gtag(...args: unknown[]): void
}

interface PerformanceMetrics {
  cls?: number
  fcp?: number
  inp?: number
  lcp?: number
  ttfb?: number
  renderTime?: number
  componentMounts?: number
  memoryUsage?: number
}

interface MemoryInfo {
  usedJSHeapSize: number
  jsHeapSizeLimit: number
  totalJSHeapSize: number
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean
  enableAdvancedMetrics?: boolean
  batchReporting?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

// Performance thresholds (Core Web Vitals - GA4 Recommended)
const LCP_GOOD_THRESHOLD_MS = 2500 // 2.5 seconds
const CLS_GOOD_THRESHOLD = 0.1 // 0.1 cumulative layout shift
const PERFECT_SCORE_COUNT = 2 // All metrics good
const MINIMUM_GOOD_COUNT = 1 // At least one metric good
const CLS_DECIMAL_PLACES = 4 // Decimal places for CLS display

// Magic numbers for calculations
const CLS_MULTIPLIER = 1000
const RANDOM_ID_BASE = 36
const RANDOM_ID_LENGTH = 9
const BATCH_SIZE = 3
const DEV_LONG_TASK_THRESHOLD = 100
const PROD_LONG_TASK_THRESHOLD = 50
const MEMORY_CHECK_INTERVAL = 30000
const MEMORY_PERCENTAGE_MULTIPLIER = 100
const SESSION_DURATION_MINUTES = 30
// Move MILLISECONDS_PER_SECOND before any usage to avoid TDZ
const MILLISECONDS_PER_SECOND = 1000
const SESSION_DURATION_MS = SESSION_DURATION_MINUTES * 60 * MILLISECONDS_PER_SECOND

// Get session info from window
const getSessionInfo = (): { sessionId: number; engagementTime: number } => {
  if (typeof window === 'undefined') return { sessionId: 0, engagementTime: 0 }

  const now = Date.now()
  const sessionDuration = SESSION_DURATION_MS

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

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    enabled = true,
    enableAdvancedMetrics = true,
    batchReporting = true,
    onMetricsUpdate,
  } = options
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isSupported, setIsSupported] = useState(false)
  const mountTimeRef = useRef<number>(Date.now())
  const reportQueueRef = useRef<Metric[]>([])

  // Flush reports - send to GA4 via gtag
  const flushReports = useCallback(() => {
    const reports = reportQueueRef.current.splice(0)
    if (reports.length === 0) return

    // Send to Google Analytics via gtag
    if (typeof gtag !== 'undefined') {
      reports.forEach((metric) => {
        gtag('event', 'web_vitals', {
          event_category: 'Performance',
          event_label: metric.name,
          value: Math.round(metric.name === 'CLS' ? metric.value * CLS_MULTIPLIER : metric.value),
          custom_parameter_metric_id: metric.id || 'web_vitals_metric',
          non_interaction: true,
          session_id: getSessionInfo().sessionId,
          engagement_time_msec: getEngagementTime(),
        })
      })
    }
  }, [])

  // Send metric immediately (for testing compatibility)
  const sendMetricImmediately = useCallback((metric: Metric) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * CLS_MULTIPLIER : metric.value),
        custom_parameter_metric_id: metric.id || 'web_vitals_metric',
        non_interaction: true,
        session_id: getSessionInfo().sessionId,
        engagement_time_msec: getEngagementTime(),
      })
    }
  }, [])

  // Helper functions for long task monitoring
  const getLongTaskThreshold = useCallback((): number => {
    return import.meta.env.DEV ? DEV_LONG_TASK_THRESHOLD : PROD_LONG_TASK_THRESHOLD
  }, [])

  const shouldReportLongTask = useCallback(
    (duration: number): boolean => {
      return duration > getLongTaskThreshold()
    },
    [getLongTaskThreshold],
  )

  const reportLongTaskToGA4 = useCallback((entry: PerformanceEntry): void => {
    if (import.meta.env.DEV || typeof gtag === 'undefined') return

    const { sessionId, engagementTime } = getSessionInfo()

    gtag('event', 'long_task', {
      event_category: 'Performance',
      value: Math.round(entry.duration),
      non_interaction: true,
      session_id: sessionId,
      engagement_time_msec: engagementTime,
    })
  }, [])

  const handleLongTask = useCallback(
    (entry: PerformanceEntry): void => {
      if (shouldReportLongTask(entry.duration)) {
        reportLongTaskToGA4(entry)
      }
    },
    [shouldReportLongTask, reportLongTaskToGA4],
  )

  // Update metrics function - defined outside useEffect for proper scoping
  const updateMetrics = useCallback(
    (newMetrics: Partial<PerformanceMetrics>) => {
      const updater = (prev: PerformanceMetrics) => {
        const updated = { ...prev, ...newMetrics }
        onMetricsUpdate?.(updated)
        return updated
      }
      setMetrics(updater)
    },
    [onMetricsUpdate],
  )

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Check if performance API is supported first
    const supported = 'performance' in window && 'PerformanceObserver' in window
    setIsSupported(supported)

    if (!supported) return

    // Track Core Web Vitals
    onCLS((metric: Metric) => {
      updateMetrics({ cls: metric.value })
      // Send immediately if gtag is available (for testing)
      if (typeof gtag !== 'undefined') {
        sendMetricImmediately(metric)
      }
    })

    onFCP((metric: Metric) => {
      updateMetrics({ fcp: metric.value })
      // Send immediately if gtag is available (for testing)
      if (typeof gtag !== 'undefined') {
        sendMetricImmediately(metric)
      }
    })

    onINP((metric: Metric) => {
      updateMetrics({ inp: metric.value })
      // Send immediately if gtag is available (for testing)
      if (typeof gtag !== 'undefined') {
        sendMetricImmediately(metric)
      }
    })

    onLCP((metric: Metric) => {
      updateMetrics({ lcp: metric.value })
      // Send immediately if gtag is available (for testing)
      if (typeof gtag !== 'undefined') {
        sendMetricImmediately(metric)
      }
    })

    onTTFB((metric: Metric) => {
      updateMetrics({ ttfb: metric.value })
      // Send immediately if gtag is available (for testing)
      if (typeof gtag !== 'undefined') {
        sendMetricImmediately(metric)
      }
    })

    // Track component mount time (React 19 optimization)
    const mountTime = Date.now() - mountTimeRef.current
    updateMetrics({
      renderTime: mountTime,
      componentMounts: 1,
    })

    // Advanced monitoring features
    if (enableAdvancedMetrics) {
      // Monitor memory usage
      const monitorMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as { memory: MemoryInfo }).memory
          if (memory) {
            const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
            updateMetrics({ memoryUsage: usage })
          }
        }
      }

      // Monitor long tasks (less aggressive in development)
      if ('PerformanceObserver' in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach(handleLongTask)
          })
          longTaskObserver.observe({ entryTypes: ['longtask'] })
        } catch (_error) {
          // PerformanceObserver not supported
        }
      }

      // Check memory every 30 seconds
      const memoryInterval = setInterval(monitorMemory, MEMORY_CHECK_INTERVAL)
      monitorMemory() // Initial check

      return () => clearInterval(memoryInterval)
    }

    // Return undefined for non-advanced monitoring case
    return undefined
  }, [enabled, enableAdvancedMetrics, updateMetrics, sendMetricImmediately, handleLongTask])

  // Component performance tracking functions
  const trackCustomMetric = useCallback(
    (name: string, value: number) => {
      updateMetrics({ [name]: value })
    },
    [updateMetrics],
  )

  const trackInteraction = useCallback(
    (interactionName: string) => {
      const startTime = Date.now()
      return () => {
        const duration = Date.now() - startTime
        trackCustomMetric(`interaction_${interactionName}`, duration)
      }
    },
    [trackCustomMetric],
  )

  // Get performance score based on Core Web Vitals
  const performanceScore = useMemo((): 'good' | 'needs-improvement' | 'poor' => {
    const { cls, lcp } = metrics

    if (!(cls && lcp)) return 'needs-improvement'

    // Core Web Vitals thresholds (GA4 recommended)
    const lcpGood = lcp <= LCP_GOOD_THRESHOLD_MS // 2.5s
    const clsGood = cls <= CLS_GOOD_THRESHOLD // 0.1

    const goodCount = [lcpGood, clsGood].filter(Boolean).length

    if (goodCount === PERFECT_SCORE_COUNT) return 'good'
    if (goodCount >= MINIMUM_GOOD_COUNT) return 'needs-improvement'
    return 'poor'
  }, [metrics.cls, metrics.lcp, metrics])

  // Get formatted metrics for display
  const formattedMetrics = useMemo(() => {
    const getBaseMetrics = () => ({
      'Largest Contentful Paint (LCP)': metrics.lcp
        ? `${metrics.lcp.toFixed(0)}ms`
        : 'Not measured',
      'Cumulative Layout Shift (CLS)': metrics.cls
        ? metrics.cls.toFixed(CLS_DECIMAL_PLACES)
        : 'Not measured',
      'First Contentful Paint (FCP)': metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'Not measured',
      'Interaction to Next Paint (INP)': metrics.inp
        ? `${metrics.inp.toFixed(0)}ms`
        : 'Not measured',
      'Time to First Byte (TTFB)': metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'Not measured',
    })

    const base = getBaseMetrics()

    if (enableAdvancedMetrics) {
      return {
        ...base,
        'Initial Render Time': metrics.renderTime
          ? `${metrics.renderTime.toFixed(0)}ms`
          : 'Not measured',
        'Component Mounts': metrics.componentMounts?.toString() || '0',
        'Memory Usage': metrics.memoryUsage
          ? `${(metrics.memoryUsage * MEMORY_PERCENTAGE_MULTIPLIER).toFixed(1)}%`
          : 'Not available',
      }
    }

    return base
  }, [metrics, enableAdvancedMetrics])

  return {
    metrics,
    isSupported,
    performanceScore,
    formattedMetrics,
    trackCustomMetric,
    trackInteraction,
    flushReports,
  }
}

// Component-level performance tracking hook
export function useComponentPerformance(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now())
  const { trackCustomMetric, trackInteraction } = usePerformanceMonitoring({
    enableAdvancedMetrics: true,
  })

  useEffect(() => {
    const renderTime = Date.now() - mountTimeRef.current
    trackCustomMetric(`${componentName}_render_time`, renderTime)
  }, [componentName, trackCustomMetric])

  const createInteractionTracker = useCallback(
    (interactionName: string) => {
      return trackInteraction(`${componentName}_${interactionName}`)
    },
    [componentName, trackInteraction],
  )

  return {
    createInteractionTracker,
    trackCustomMetric: (metricName: string, value: number) =>
      trackCustomMetric(`${componentName}_${metricName}`, value),
  }
}
