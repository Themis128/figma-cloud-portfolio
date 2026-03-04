"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

// Performance monitoring constants
const NAVIGATION_CHECK_DELAY_MS = 100;
const MEMORY_CHECK_INTERVAL_MS = 30_000;

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
}

function sendToGA(metric: WebVitalsMetric) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "web_vitals", {
      event_category: "Performance",
      event_label: metric.name,
      value: Math.round(metric.value),
      custom_parameter_metric_id: metric.id,
    });
  } else if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[PerformanceMonitor] ${metric.name}: ${metric.value.toFixed(2)}`);
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    onCLS(sendToGA);
    onINP(sendToGA);
    onFCP(sendToGA);
    onLCP(sendToGA);
    onTTFB(sendToGA);

    // Track navigation timing
    const reportNavigation = () => {
      if (!("performance" in window) || !("getEntriesByType" in window.performance))
        return;

      const nav = window.performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;

      if (!nav) return;

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug("[PerformanceMonitor] Navigation timing", {
          ttfb: Math.round(nav.responseStart - nav.fetchStart),
          domInteractive: Math.round(nav.domInteractive - nav.fetchStart),
          domContentLoaded: Math.round(
            nav.domContentLoadedEventEnd - nav.fetchStart,
          ),
          loadComplete: Math.round(nav.loadEventEnd - nav.fetchStart),
        });
      }
    };

    reportNavigation();
    setTimeout(reportNavigation, NAVIGATION_CHECK_DELAY_MS);
  }, []);

  // Track memory usage (Chrome only)
  useEffect(() => {
    const trackMemory = () => {
      const perfWithMemory = performance as typeof performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };

      if (!perfWithMemory.memory) return;

      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
        perfWithMemory.memory;

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(
          `[PerformanceMonitor] Heap: ${(usedJSHeapSize / 1_048_576).toFixed(1)}MB used / ${(totalJSHeapSize / 1_048_576).toFixed(1)}MB allocated / ${(jsHeapSizeLimit / 1_048_576).toFixed(0)}MB limit`,
        );
      }

      // Warn if heap usage exceeds 80% of limit
      if (usedJSHeapSize > jsHeapSizeLimit * 0.8) {
        // eslint-disable-next-line no-console
        console.warn(
          `[PerformanceMonitor] High heap usage: ${(usedJSHeapSize / 1_048_576).toFixed(1)}MB (${Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100)}% of limit)`,
        );
      }
    };

    const interval = setInterval(trackMemory, MEMORY_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return null;
}
