/// <reference types="vite/client" />

// Test global declarations for Playwright E2E tests
declare global {
  interface Window {
    gaEvents?: Array<{
      command: string;
      eventName: string;
      params?: Record<string, unknown>;
    }>;
    webVitals?: {
      getCLS: (callback: (metric: WebVitalsMetric) => void) => void;
      getFCP: (callback: (metric: WebVitalsMetric) => void) => void;
      getINP: (callback: (metric: WebVitalsMetric) => void) => void;
      getLCP: (callback: (metric: WebVitalsMetric) => void) => void;
      getTTFB: (callback: (metric: WebVitalsMetric) => void) => void;
    };
    onCLS?: (callback: (metric: WebVitalsMetric) => void) => void;
    onFCP?: (callback: (metric: WebVitalsMetric) => void) => void;
    onINP?: (callback: (metric: WebVitalsMetric) => void) => void;
    onLCP?: (callback: (metric: WebVitalsMetric) => void) => void;
    onTTFB?: (callback: (metric: WebVitalsMetric) => void) => void;
    simulateError?: () => void;
    __REDUX_DEVTOOLS_EXTENSION__?: unknown;
    __ZUSTAND_DEVTOOLS__?: unknown;
    __APOLLO_STATE__?: unknown;
    i18n?: unknown;
    translations?: unknown;
    __NEXT_TRANSLATE__?: unknown;
    testingUtils?: unknown;
    testUtils?: unknown;
    cypress?: unknown;
    playwright?: unknown;
    webVitalsMetrics?: WebVitalsMetric[];
    routeChanges?: string[];
    beaconCalls?: unknown[];
    vapidPublicKey?: string;
    subscriptionStorage?: Record<string, unknown>;
    executeRecaptcha?: (action: string) => Promise<string>;
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }

  interface WebVitalsMetric {
    name: string;
    value: number;
    delta: number;
    id: string;
    entries: PerformanceEntry[];
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  interface PerformanceEntry {
    transferSize?: number;
  }
}

export {};
