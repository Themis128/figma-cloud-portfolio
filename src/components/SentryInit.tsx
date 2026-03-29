"use client";

import { useEffect } from "react";

/**
 * Lazy-initializes Sentry after the page is interactive.
 * sentry.client.config.ts was removed to prevent auto-loading ~500KB
 * at page load. Instead, Sentry SDK is dynamically imported here.
 */
export default function SentryInit() {
  useEffect(() => {
    const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!SENTRY_DSN) return;

    let cleanup: (() => void) | undefined;

    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV,
        release: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        tracesSampleRate: 0,
        replaysSessionSampleRate:
          process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
        integrations: [],
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
        allowUrls: [
          /^https:\/\/(?:www\.)?baltzakisthemis\.com\//,
          /^https?:\/\/localhost\//,
        ],
      });

      // Lazy-load replay after 2s
      const loadReplay = () => {
        void Sentry.lazyLoadIntegration("replayIntegration").then(
          (replay) => {
            Sentry.addIntegration(
              replay({ maskAllText: true, blockAllMedia: true }),
            );
          },
        );
      };
      setTimeout(loadReplay, 2000);

      // Set up consent listener
      void import("@/lib/sentry").then(({ setupSentryConsentListener }) => {
        cleanup = setupSentryConsentListener();
      });
    });

    return () => cleanup?.();
  }, []);

  return null;
}
