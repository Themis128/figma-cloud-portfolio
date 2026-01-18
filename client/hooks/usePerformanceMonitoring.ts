import { useEffect, useState } from 'react'
import { type Metric, onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

interface PerformanceMetrics {
  cls?: number
  fcp?: number
  lcp?: number
  ttfb?: number
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void
}

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const { enabled = true, onMetricsUpdate } = options
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Check if performance API is supported
    setIsSupported('performance' in window && 'PerformanceObserver' in window)

    if (!isSupported) return

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      setMetrics((prev) => {
        const updated = { ...prev, ...newMetrics }
        onMetricsUpdate?.(updated)
        return updated
      })
    }

    // Track Core Web Vitals
    onCLS((metric: Metric) => {
      updateMetrics({ cls: metric.value })
    })

    onFCP((metric: Metric) => {
      updateMetrics({ fcp: metric.value })
    })

    onLCP((metric: Metric) => {
      updateMetrics({ lcp: metric.value })
    })

    onTTFB((metric: Metric) => {
      updateMetrics({ ttfb: metric.value })
    })
  }, [enabled, isSupported, onMetricsUpdate])

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = (): 'good' | 'needs-improvement' | 'poor' => {
    const { cls, lcp } = metrics

    if (!cls || !lcp) return 'needs-improvement'

    // Core Web Vitals thresholds (excluding FID for now)
    const lcpGood = lcp <= 2500 // 2.5s
    const clsGood = cls <= 0.1 // 0.1

    const goodCount = [lcpGood, clsGood].filter(Boolean).length

    if (goodCount === 2) return 'good'
    if (goodCount >= 1) return 'needs-improvement'
    return 'poor'
  }

  // Get formatted metrics for display
  const getFormattedMetrics = () => {
    return {
      'Largest Contentful Paint (LCP)': metrics.lcp
        ? `${metrics.lcp.toFixed(0)}ms`
        : 'Not measured',
      'Cumulative Layout Shift (CLS)': metrics.cls ? metrics.cls.toFixed(4) : 'Not measured',
      'First Contentful Paint (FCP)': metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'Not measured',
      'Time to First Byte (TTFB)': metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'Not measured',
    }
  }

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    formattedMetrics: getFormattedMetrics(),
  }
}
