"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { trackGA4 } from "@/components/GoogleAnalytics";

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
    trackGA4(metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.delta * 1000 : metric.delta),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
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

  // Track scroll depth milestones (25%, 50%, 75%, 100%)
  useEffect(() => {
    const milestones = new Set<number>();
    const thresholds = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of thresholds) {
        if (percent >= threshold && !milestones.has(threshold)) {
          milestones.add(threshold);
          trackGA4("scroll_depth", {
            percent_scrolled: threshold,
            page_path: window.location.pathname,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track engaged time (30s, 60s, 120s, 300s milestones)
  useEffect(() => {
    const startTime = Date.now();
    const engagementMilestones = [30, 60, 120, 300];
    let milestoneIndex = 0;

    const interval = setInterval(() => {
      if (milestoneIndex >= engagementMilestones.length) {
        clearInterval(interval);
        return;
      }
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const nextMilestone = engagementMilestones[milestoneIndex];
      if (nextMilestone !== undefined && elapsed >= nextMilestone) {
        trackGA4("engaged_time", {
          engagement_seconds: nextMilestone,
          page_path: window.location.pathname,
        });
        milestoneIndex++;
      }
    }, 5000);

    return () => clearInterval(interval);
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
