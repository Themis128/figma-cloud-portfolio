import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

interface PerformanceMetrics {
  cls?: number;
  fcp?: number;
  inp?: number;
  lcp?: number;
  ttfb?: number;
  renderTime?: number;
  componentMounts?: number;
  memoryUsage?: number;
}

interface UsePerformanceMonitoringOptions {
  enabled?: boolean;
  enableAdvancedMetrics?: boolean;
  batchReporting?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

// Performance thresholds (Core Web Vitals)
const LCP_GOOD_THRESHOLD_MS = 2500; // 2.5 seconds
const CLS_GOOD_THRESHOLD = 0.1; // 0.1 cumulative layout shift
const PERFECT_SCORE_COUNT = 2; // All metrics good
const MINIMUM_GOOD_COUNT = 1; // At least one metric good
const CLS_DECIMAL_PLACES = 4; // Decimal places for CLS display

export function usePerformanceMonitoring(options: UsePerformanceMonitoringOptions = {}) {
  const {
    enabled = true,
    enableAdvancedMetrics = true,
    batchReporting = true,
    onMetricsUpdate,
  } = options;
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isSupported, setIsSupported] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());
  const reportQueueRef = useRef<Metric[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Check if performance API is supported first
    const supported = "performance" in window && "PerformanceObserver" in window;
    setIsSupported(supported);

    if (!supported) return;

    const updateMetrics = (newMetrics: Partial<PerformanceMetrics>) => {
      setMetrics((prev) => {
        const updated = { ...prev, ...newMetrics };

        // Update global metrics for testing
        if (typeof window !== "undefined") {
          window.webVitals = window.webVitals || true;
          window.webVitalsMetrics = window.webVitalsMetrics || [];
          window.webVitalsMetrics.push({
            name: Object.keys(newMetrics)[0].toUpperCase(),
            value: Object.values(newMetrics)[0] as number,
            delta: 0,
            id: "performance-monitoring",
            timestamp: Date.now(),
          });
        }

        onMetricsUpdate?.(updated);

        // Batch reporting for React 19 automatic batching
        if (batchReporting) {
          const metricEntry = {
            name: Object.keys(newMetrics)[0].toUpperCase() as any,
            value: Object.values(newMetrics)[0] as number,
            delta: 0,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          } as Metric;

          reportQueueRef.current.push(metricEntry);

          // Flush reports in batches (React 19 will automatically batch these updates)
          if (reportQueueRef.current.length >= 3) {
            flushReports();
          }
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

    // Track component mount time (React 19 optimization)
    const mountTime = Date.now() - mountTimeRef.current;
    updateMetrics({
      renderTime: mountTime,
      componentMounts: 1,
    });

    // Advanced monitoring features
    if (enableAdvancedMetrics) {
      // Monitor memory usage
      const monitorMemory = () => {
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          if (memory) {
            const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            updateMetrics({ memoryUsage: usage });
          }
        }
      };

      // Monitor long tasks
      if ("PerformanceObserver" in window) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.duration > 50) {
                console.warn(`Long task detected: ${entry.duration}ms`);
                // Report to analytics if available
                if (typeof gtag !== "undefined") {
                  gtag("event", "long_task", {
                    event_category: "Performance",
                    value: Math.round(entry.duration),
                    non_interaction: true,
                  });
                }
              }
            });
          });
          longTaskObserver.observe({ entryTypes: ["longtask"] });
        } catch (error) {
          console.warn("Long task monitoring setup failed:", error);
        }
      }

      // Check memory every 30 seconds
      const memoryInterval = setInterval(monitorMemory, 30000);
      monitorMemory(); // Initial check

      return () => clearInterval(memoryInterval);
    }
  }, [enabled, enableAdvancedMetrics, batchReporting, onMetricsUpdate]);

  // Batch report flushing function
  const flushReports = useCallback(() => {
    const reports = reportQueueRef.current.splice(0);
    if (reports.length === 0) return;

    // Send to Google Analytics in batches
    if (typeof gtag !== "undefined") {
      reports.forEach((metric) => {
        gtag("event", metric.name.toLowerCase(), {
          event_category: "Web Vitals",
          value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      });
    }

    // Custom analytics endpoint (if available)
    if (enabled && typeof fetch !== "undefined") {
      fetch("/api/analytics/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: reports,
          timestamp: Date.now(),
          url: window.location.pathname,
        }),
        keepalive: true,
      }).catch((error) => console.warn("Failed to report metrics:", error));
    }
  }, [enabled]);

  // Component performance tracking functions
  const trackCustomMetric = useCallback((name: string, value: number) => {
    updateMetrics({ [name]: value });
  }, []);

  const trackInteraction = useCallback(
    (interactionName: string) => {
      const startTime = Date.now();
      return () => {
        const duration = Date.now() - startTime;
        trackCustomMetric(`interaction_${interactionName}`, duration);
      };
    },
    [trackCustomMetric],
  );

  // Get performance score based on Core Web Vitals
  const getPerformanceScore = (): "good" | "needs-improvement" | "poor" => {
    const { cls, lcp } = metrics;

    if (!(cls && lcp)) return "needs-improvement";

    // Core Web Vitals thresholds (excluding FID for now)
    const lcpGood = lcp <= LCP_GOOD_THRESHOLD_MS; // 2.5s
    const clsGood = cls <= CLS_GOOD_THRESHOLD; // 0.1

    const goodCount = [lcpGood, clsGood].filter(Boolean).length;

    if (goodCount === PERFECT_SCORE_COUNT) return "good";
    if (goodCount >= MINIMUM_GOOD_COUNT) return "needs-improvement";
    return "poor";
  };

  // Get formatted metrics for display
  const formattedMetrics = useMemo(() => {
    const base = {
      "Largest Contentful Paint (LCP)": metrics.lcp
        ? `${metrics.lcp.toFixed(0)}ms`
        : "Not measured",
      "Cumulative Layout Shift (CLS)": metrics.cls
        ? metrics.cls.toFixed(CLS_DECIMAL_PLACES)
        : "Not measured",
      "First Contentful Paint (FCP)": metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : "Not measured",
      "Interaction to Next Paint (INP)": metrics.inp
        ? `${metrics.inp.toFixed(0)}ms`
        : "Not measured",
      "Time to First Byte (TTFB)": metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : "Not measured",
    };

    if (enableAdvancedMetrics) {
      return {
        ...base,
        "Initial Render Time": metrics.renderTime
          ? `${metrics.renderTime.toFixed(0)}ms`
          : "Not measured",
        "Component Mounts": metrics.componentMounts?.toString() || "0",
        "Memory Usage": metrics.memoryUsage
          ? `${(metrics.memoryUsage * 100).toFixed(1)}%`
          : "Not available",
      };
    }

    return base;
  }, [metrics, enableAdvancedMetrics]);

  return {
    metrics,
    isSupported,
    performanceScore: getPerformanceScore(),
    formattedMetrics,
    trackCustomMetric,
    trackInteraction,
    flushReports,
  };
}

// Component-level performance tracking hook
export function useComponentPerformance(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now());
  const { trackCustomMetric, trackInteraction } = usePerformanceMonitoring({
    enableAdvancedMetrics: true,
  });

  useEffect(() => {
    const renderTime = Date.now() - mountTimeRef.current;
    trackCustomMetric(`${componentName}_render_time`, renderTime);

    // Warn about slow renders in development
    if (process.env.NODE_ENV === "development" && renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  }, [componentName, trackCustomMetric]);

  const createInteractionTracker = useCallback(
    (interactionName: string) => {
      return trackInteraction(`${componentName}_${interactionName}`);
    },
    [componentName, trackInteraction],
  );

  return {
    createInteractionTracker,
    trackCustomMetric: (metricName: string, value: number) =>
      trackCustomMetric(`${componentName}_${metricName}`, value),
  };
}
