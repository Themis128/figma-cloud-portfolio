import * as Sentry from "@sentry/nextjs";
import type { ConsentState } from "@/hooks/useConsent";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "consent-updated";

/**
 * Sentry is initialized automatically by sentry.client.config.ts at page load.
 * This module provides:
 *  - Consent-aware enabling/disabling of Sentry (GDPR compliance)
 *  - Helper functions for custom error reporting, user tracking, etc.
 *
 * When analytics consent is revoked, we disable the Sentry client.
 * When granted, the client was already initialized — we just enable it.
 */

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

/** Enable or disable the Sentry client based on consent */
function applySentryConsent(): void {
  if (typeof window === "undefined") return;

  const client = Sentry.getClient();
  if (!client) return;

  if (hasAnalyticsConsent()) {
    // Client was already initialized by sentry.client.config.ts — just ensure enabled
    client.getOptions().enabled = true;
  } else {
    // Disable sending events when consent is not granted
    client.getOptions().enabled = false;
  }
}

/**
 * Set up a listener for consent changes and enable/disable Sentry accordingly.
 * Call this once from a client component (e.g., SentryInit in layout).
 * Returns a cleanup function to remove the event listener.
 */
export function setupSentryConsentListener(): () => void {
  // Apply current consent state
  applySentryConsent();

  const handleConsentUpdate = (e: Event) => {
    const detail = (e as CustomEvent<ConsentState>).detail;
    const client = Sentry.getClient();
    if (client) {
      client.getOptions().enabled = detail.analytics === true;
    }
  };

  window.addEventListener(CONSENT_EVENT, handleConsentUpdate);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handleConsentUpdate);
  };
}

/** Whether Sentry has been initialized (client config loaded) */
export function isSentryInitialized(): boolean {
  return Sentry.getClient() !== undefined;
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
