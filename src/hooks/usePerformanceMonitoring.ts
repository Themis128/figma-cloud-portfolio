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

// Constants for Core Web Vitals thresholds
const CORE_WEB_VITALS_THRESHOLDS = {
  LCP_GOOD: 2500, // 2.5 seconds in milliseconds
  CLS_GOOD: 0.1, // 0.1 cumulative layout shift
} as const;

const FORMATTING_PRECISION = {
  CLS_DECIMALS: 4,
} as const;

export function usePerformanceMonitoring(
  options: UsePerformanceMonitoringOptions = {},
) {
  const { enabled = true, onMetricsUpdate } = options;
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Check if performance API is supported (sync local var avoids stale state)
    const supported = "performance" in window && "PerformanceObserver" in window;
    setIsSupported(supported);

    if (!supported) return;

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      setMetrics((prev) => {
        const updated = { ...prev, ...newMetrics };
        onMetricsUpdate?.(updated);
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

    onLCP((metric: Metric) => {
      updateMetrics({ lcp: metric.value });
    });

    onTTFB((metric: Metric) => {
      updateMetrics({ ttfb: metric.value });
    });

    onINP((metric: Metric) => {
      updateMetrics({ inp: metric.value });
    });
  }, [enabled, onMetricsUpdate]);

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = (): "good" | "needs-improvement" | "poor" => {
    const { cls, lcp } = metrics;

    if (!(cls && lcp)) return "needs-improvement";

    // Core Web Vitals thresholds (excluding FID for now)
    const lcpGood = lcp <= CORE_WEB_VITALS_THRESHOLDS.LCP_GOOD; // 2.5s
    const clsGood = cls <= CORE_WEB_VITALS_THRESHOLDS.CLS_GOOD; // 0.1

    const goodCount = [lcpGood, clsGood].filter(Boolean).length;

    if (goodCount === 2) return "good";
    if (goodCount >= 1) return "needs-improvement";
    return "poor";
  };

  // Get formatted metrics for display
  const getFormattedMetrics = () => {
    return {
      "Largest Contentful Paint (LCP)": metrics.lcp
        ? `${metrics.lcp.toFixed(0)}ms`
        : "Not measured",
      "Cumulative Layout Shift (CLS)": metrics.cls
        ? metrics.cls.toFixed(FORMATTING_PRECISION.CLS_DECIMALS)
        : "Not measured",
      "First Contentful Paint (FCP)": metrics.fcp
        ? `${metrics.fcp.toFixed(0)}ms`
        : "Not measured",
      "Time to First Byte (TTFB)": metrics.ttfb
        ? `${metrics.ttfb.toFixed(0)}ms`
        : "Not measured",
      "Interaction to Next Paint (INP)": metrics.inp
        ? `${metrics.inp.toFixed(0)}ms`
        : "Not measured",
    };
  };

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    formattedMetrics: getFormattedMetrics(),
  };
}
