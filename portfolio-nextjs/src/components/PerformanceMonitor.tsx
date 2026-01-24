import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

// Type for Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        custom_map?: Record<string, string>;
        [key: string]: unknown;
      },
    ) => void;
  }
}

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
}

// Analytics service integration function - REMOVED
// Custom analytics endpoint removed - using Google Analytics 4 only

export function PerformanceMonitor() {
  const location = useLocation();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") {
      return;
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      onCLS((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "CLS",
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          });
        } else {
          console.log("CLS:", metric.value);
        }
      });

      onINP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "INP",
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          });
        } else {
          console.log("INP:", metric.value);
        }
      });

      onFCP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "FCP",
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          });
        } else {
          console.log("FCP:", metric.value);
        }
      });

      onLCP((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "LCP",
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          });
        } else {
          console.log("LCP:", metric.value);
        }
      });

      onTTFB((metric: WebVitalsMetric) => {
        // Send to Google Analytics 4 only (removed custom analytics endpoint)
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "web_vitals", {
            event_category: "Performance",
            event_label: "TTFB",
            value: Math.round(metric.value),
            custom_parameter_metric_id: metric.id,
          });
        } else {
          console.log("TTFB:", metric.value);
        }
      });
    };

    trackWebVitals();

    // Track navigation performance
    const trackNavigation = () => {
      // Use a timeout to wait for page load to complete
      const checkNavigationTiming = () => {
        if ("performance" in window && "getEntriesByType" in window.performance) {
          const navigation = window.performance.getEntriesByType(
            "navigation",
          )[0] as PerformanceEntry & {
            domContentLoadedEventEnd: number;
            domContentLoadedEventStart: number;
            loadEventEnd: number;
            loadEventStart: number;
            fetchStart: number;
          };

          if (navigation) {
            const domContentLoaded =
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
            const totalTime = navigation.loadEventEnd - navigation.fetchStart;

            if (process.env.NODE_ENV === "production") {
              // Send to analytics service
              // analytics.track('navigation_timing', {
              //   domContentLoaded,
              //   loadComplete,
              //   totalTime,
              // })
            } else {
              console.log("Navigation timing:", {
                domContentLoaded: domContentLoaded > 0 ? domContentLoaded : 0,
                loadComplete: loadComplete > 0 ? loadComplete : 0,
                totalTime: totalTime > 0 ? totalTime : 0,
              });
            }
          }
        }
      };

      // Check immediately and also after a short delay to catch load completion
      checkNavigationTiming();
      setTimeout(checkNavigationTiming, 100);
    };

    trackNavigation();

    // Track route changes
    if (process.env.NODE_ENV === "production") {
      // Send to analytics service
      // analytics.track('route_change', { path: location.pathname })
    } else {
      console.log("Route changed to:", location.pathname);
    }
  }, [location.pathname]);

  // Track memory usage (if available)
  useEffect(() => {
    const trackMemory = () => {
      const perfWithMemory = performance as typeof performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };

      if (perfWithMemory.memory) {
        const memory = perfWithMemory.memory;
        /* eslint-disable no-console */
        console.log("Memory usage:", {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        });
        /* eslint-enable no-console */
      }
    };

    const interval = setInterval(trackMemory, 30000); // Every 30 seconds
    return () => {
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
}
