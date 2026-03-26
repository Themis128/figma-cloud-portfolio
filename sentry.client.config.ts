// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    environment: process.env.NODE_ENV,

    release:
      process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

    // Performance — 100% sampling for low-traffic site (~127 txns/week)
    tracesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate:
      process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration({
        // Instrument page load and navigation spans automatically
        enableInp: true,
      }),
      // Replay deferred: loaded lazily after page is interactive (~94KB saved from initial bundle)
    ],

    // Filter noisy errors that aren't actionable
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

    // Only send errors from our domain
    allowUrls: [/^https:\/\/(?:www\.)?baltzakisthemis\.com\//, /^https?:\/\/localhost\//],
  });

  // Lazy-load replay integration after page is interactive
  if (typeof window !== "undefined") {
    const loadReplay = () => {
      void Sentry.lazyLoadIntegration("replayIntegration").then((replay) => {
        Sentry.addIntegration(replay({ maskAllText: true, blockAllMedia: true }));
      });
    };

    if (document.readyState === "complete") {
      setTimeout(loadReplay, 2000);
    } else {
      window.addEventListener("load", () => setTimeout(loadReplay, 2000));
    }
  }
}
