import { useEffect, useState } from "react";
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

interface PerformanceMetrics {
  cls?: number;
  fcp?: number;
  inp?: number;
  lcp?: number;
  ttfb?: number;
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// Performance thresholds (Core Web Vitals)
const LCP_GOOD_THRESHOLD_MS = 2500; // 2.5 seconds
const CLS_GOOD_THRESHOLD = 0.1; // 0.1 cumulative layout shift
const PERFECT_SCORE_COUNT = 2; // All metrics good
const MINIMUM_GOOD_COUNT = 1; // At least one metric good
const CLS_DECIMAL_PLACES = 4; // Decimal places for CLS display

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const { enabled = true, onMetricsUpdate } = options;
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Check if performance API is supported
    setIsSupported("performance" in window && "PerformanceObserver" in window);

    if (!isSupported) return;

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      setMetrics((prev) => {
        const updated = { ...prev, ...newMetrics };
        onMetricsUpdate?.(updated);

        // Populate window.webVitalsMetrics for testing
        if (typeof window !== "undefined") {
          window.webVitalsMetrics = window.webVitalsMetrics || [];
          const metricName = Object.keys(newMetrics)[0];
          const metricValue = Object.values(newMetrics)[0];
          window.webVitalsMetrics.push({
            name: metricName.toUpperCase(),
            value: metricValue,
            id: `test-${metricName}-id`,
            delta: metricValue,
            entries: [],
          });
        }

        return updated;
      });
    };

    // Track Core Web Vitals
    onCLS((metric: Metric) => {
      updateMetrics({ cls: metric.value });
    });

    onFCP((metric: Metric) => {
      updateMetrics({ fcp: metric.value });
    });

    onINP((metric: Metric) => {
      updateMetrics({ inp: metric.value });
    });

    onLCP((metric: Metric) => {
      updateMetrics({ lcp: metric.value });
    });

    onTTFB((metric: Metric) => {
      updateMetrics({ ttfb: metric.value });
    });
  }, [enabled, isSupported, onMetricsUpdate]);

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = (): "good" | "needs-improvement" | "poor" => {
    const { cls, lcp } = metrics;

    if (!cls || !lcp) return "needs-improvement";

    // Core Web Vitals thresholds (excluding FID for now)
    const lcpGood = lcp <= LCP_GOOD_THRESHOLD_MS; // 2.5s
    const clsGood = cls <= CLS_GOOD_THRESHOLD; // 0.1

    const goodCount = [lcpGood, clsGood].filter(Boolean).length;

    if (goodCount === PERFECT_SCORE_COUNT) return "good";
    if (goodCount >= MINIMUM_GOOD_COUNT) return "needs-improvement";
    return "poor";
  };

  // Get formatted metrics for display
  const getFormattedMetrics = () => {
    return {
      "Largest Contentful Paint (LCP)": metrics.lcp
        ? `${metrics.lcp.toFixed(0)}ms`
        : "Not measured",
      "Cumulative Layout Shift (CLS)": metrics.cls
        ? metrics.cls.toFixed(CLS_DECIMAL_PLACES)
        : "Not measured",
      "First Contentful Paint (FCP)": metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : "Not measured",
      "Interaction to Next Paint (INP)": metrics.inp ? `${metrics.inp.toFixed(0)}ms` : "Not measured",
      "Time to First Byte (TTFB)": metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : "Not measured",
    };
  };

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    formattedMetrics: getFormattedMetrics(),
  };
}
