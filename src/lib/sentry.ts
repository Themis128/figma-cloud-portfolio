import * as Sentry from "@sentry/nextjs";

import type { ConsentState } from "@/hooks/useConsent";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "consent-updated";

// Constants for Sentry configuration
const SENTRY_CONFIG = {
  SAMPLING_RATES: {
    PRODUCTION_TRACE: 0.1,
    DEVELOPMENT_TRACE: 1.0,
    PRODUCTION_REPLAY: 0.1,
    ERROR_REPLAY: 1.0,
  },
  DEFAULT_VERSION: "1.0.0",
} as const;

let sentryInitialized = false;

/** Check localStorage for analytics consent */
function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored) as ConsentState;
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

/** Initialize Sentry (only runs once, only if consent is granted) */
export function initSentry(): void {
  if (sentryInitialized) return;
  if (typeof window === "undefined") return;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate:
      process.env.NODE_ENV === "production"
        ? SENTRY_CONFIG.SAMPLING_RATES.PRODUCTION_TRACE
        : SENTRY_CONFIG.SAMPLING_RATES.DEVELOPMENT_TRACE,
    // Session Replay
    replaysSessionSampleRate:
      process.env.NODE_ENV === "production"
        ? SENTRY_CONFIG.SAMPLING_RATES.PRODUCTION_REPLAY
        : SENTRY_CONFIG.SAMPLING_RATES.DEVELOPMENT_TRACE,
    replaysOnErrorSampleRate: SENTRY_CONFIG.SAMPLING_RATES.ERROR_REPLAY,
    // Release tracking
    release:
      process.env.NEXT_PUBLIC_APP_VERSION || SENTRY_CONFIG.DEFAULT_VERSION,
    // Error filtering
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error && typeof error === "object" && "message" in error) {
        const message = String(error.message).toLowerCase();

        if (
          message.includes("network error") ||
          message.includes("failed to fetch") ||
          message.includes("load chunk") ||
          message.includes("loading chunk") ||
          message.includes("script error")
        ) {
          return null;
        }
      }

      return event;
    },
  });

  sentryInitialized = true;
}

/**
 * Check consent and initialize Sentry if analytics consent is granted.
 * Safe to call multiple times — Sentry.init only runs once.
 */
export function checkAndInitSentry(): void {
  if (sentryInitialized) return;
  if (hasAnalyticsConsent()) {
    initSentry();
  }
}

/**
 * Set up a listener for consent changes and initialize Sentry when appropriate.
 * Call this once from a client component (e.g., layout).
 * Returns a cleanup function to remove the event listener.
 */
export function setupSentryConsentListener(): () => void {
  // Check current consent on setup
  checkAndInitSentry();

  const handleConsentUpdate = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail;
    if (detail.analytics && !sentryInitialized) {
      initSentry();
    }
  };

  window.addEventListener(CONSENT_EVENT, handleConsentUpdate);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handleConsentUpdate);
  };
}

/** Whether Sentry has been initialized */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}

// Performance monitoring helper
export const measurePerformance = (
  name: string,
  fn: () => void | Promise<void>,
) => {
  return Sentry.startSpan(
    {
      name,
      op: "function",
    },
    () => {
      try {
        const result = fn();
        if (result instanceof Promise) {
          return result;
        }
        return result;
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    },
  );
};

// User analytics helpers
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser({
    id: user.id,
    ...(user.email !== undefined && { email: user.email }),
    ...(user.username !== undefined && { username: user.username }),
  });
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const setContext = (key: string, context: Record<string, unknown>) => {
  Sentry.setContext(key, context);
};

// Custom error reporting
export const reportError = (
  error: Error,
  context?: Record<string, unknown>,
) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

// Page view tracking
export const trackPageView = (page: string) => {
  Sentry.addBreadcrumb({
    category: "navigation",
    message: `Page view: ${page}`,
    level: "info",
  });
};

// User interaction tracking
export const trackInteraction = (
  action: string,
  details?: Record<string, unknown>,
) => {
  Sentry.addBreadcrumb({
    category: "user",
    message: `User action: ${action}`,
    ...(details !== undefined && { data: details }),
    level: "info",
  });
};

export { Sentry };
