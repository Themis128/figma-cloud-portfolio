"use client";

import { useEffect } from "react";
import { setupSentryConsentListener } from "@/lib/sentry";

/**
 * Client component that initializes Sentry in a consent-aware manner.
 * Checks localStorage for analytics consent and listens for consent changes.
 * Renders nothing — this is a side-effect-only component.
 */
export default function SentryInit() {
  useEffect(() => {
    const cleanup = setupSentryConsentListener();
    return cleanup;
  }, []);

  return null;
}
