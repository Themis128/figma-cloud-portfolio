"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "consent-updated";

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface UseConsentReturn {
  consent: ConsentState;
  hasConsented: boolean;
  updateConsent: (category: keyof Omit<ConsentState, "essential" | "timestamp">, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
}

function getDoNotTrackDefault(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1";
}

function getDefaultConsent(): ConsentState {
  const doNotTrack = getDoNotTrackDefault();
  return {
    essential: true,
    analytics: doNotTrack ? false : false,
    marketing: false,
    timestamp: "",
  };
}

function loadConsent(): { consent: ConsentState; hasConsented: boolean } {
  if (typeof window === "undefined") {
    return { consent: getDefaultConsent(), hasConsented: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentState;
      // Ensure essential is always true regardless of stored value
      return {
        consent: { ...parsed, essential: true },
        hasConsented: Boolean(parsed.timestamp),
      };
    }
  } catch {
    // Corrupted data — fall through to default
  }

  return { consent: getDefaultConsent(), hasConsented: false };
}

function persistConsent(consent: ConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

function dispatchConsentEvent(consent: ConsentState): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT, { detail: consent }),
    );
  }
}

export function useConsent(): UseConsentReturn {
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent);
  const [hasConsented, setHasConsented] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const { consent: loaded, hasConsented: consented } = loadConsent();
    setConsent(loaded);
    setHasConsented(consented);
  }, []);

  const saveAndDispatch = useCallback((next: ConsentState) => {
    const stamped: ConsentState = {
      ...next,
      essential: true,
      timestamp: new Date().toISOString(),
    };
    setConsent(stamped);
    setHasConsented(true);
    persistConsent(stamped);
    dispatchConsentEvent(stamped);
  }, []);

  const updateConsent = useCallback(
    (category: keyof Omit<ConsentState, "essential" | "timestamp">, value: boolean) => {
      setConsent((prev) => {
        const next: ConsentState = { ...prev, [category]: value };
        saveAndDispatch(next);
        return { ...next, essential: true, timestamp: new Date().toISOString() };
      });
    },
    [saveAndDispatch],
  );

  const acceptAll = useCallback(() => {
    saveAndDispatch({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: "",
    });
  }, [saveAndDispatch]);

  const rejectAll = useCallback(() => {
    saveAndDispatch({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: "",
    });
  }, [saveAndDispatch]);

  const resetConsent = useCallback(() => {
    const fresh = getDefaultConsent();
    setConsent(fresh);
    setHasConsented(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    dispatchConsentEvent(fresh);
  }, []);

  return {
    consent,
    hasConsented,
    updateConsent,
    acceptAll,
    rejectAll,
    resetConsent,
  };
}
