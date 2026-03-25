"use client";

import { useCallback, useRef } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_TIMEOUT_MS = 3000;
const SCRIPT_LOAD_TIMEOUT_MS = 5000;

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

function getGrecaptcha(): Grecaptcha | undefined {
  return (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
}

/** Inject the reCAPTCHA script if not already present */
function ensureScriptLoaded(): Promise<void> {
  if (getGrecaptcha()) return Promise.resolve();

  const existing = document.querySelector(
    `script[src*="recaptcha/api.js"]`,
  );
  if (existing) {
    // Script tag exists but hasn't loaded yet; wait for it
    return new Promise<void>((resolve) => {
      const check = () => {
        if (getGrecaptcha()) resolve();
        else setTimeout(check, 100);
      };
      check();
      setTimeout(resolve, SCRIPT_LOAD_TIMEOUT_MS);
    });
  }

  return new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      // Wait for grecaptcha.ready
      const check = () => {
        if (getGrecaptcha()) resolve();
        else setTimeout(check, 100);
      };
      check();
    };
    script.onerror = () => resolve(); // Non-blocking fallback
    document.head.appendChild(script);
    setTimeout(resolve, SCRIPT_LOAD_TIMEOUT_MS);
  });
}

/**
 * Hook for reCAPTCHA v3 token generation.
 *
 * Loads the reCAPTCHA script on-demand (first call to `getToken` or `preload`).
 * Returns `getToken(action)` which races the reCAPTCHA call against a timeout
 * so the form never hangs. Returns `undefined` if the script hasn't loaded or
 * the call times out.
 */
export function useRecaptcha() {
  const loadingRef = useRef<Promise<void> | null>(null);

  /** Preload the script (call on form focus for faster token generation on submit) */
  const preload = useCallback(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (!loadingRef.current) {
      loadingRef.current = ensureScriptLoaded();
    }
  }, []);

  const getToken = useCallback(async (action: string): Promise<string | undefined> => {
    if (!RECAPTCHA_SITE_KEY) return undefined;

    // Ensure script is loaded
    if (!loadingRef.current) {
      loadingRef.current = ensureScriptLoaded();
    }
    await loadingRef.current;

    const grecaptcha = getGrecaptcha();
    if (!grecaptcha) return undefined;

    const tokenPromise = new Promise<string | undefined>((resolve) => {
      grecaptcha.ready(async () => {
        try {
          const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
          resolve(token);
        } catch {
          resolve(undefined);
        }
      });
    });

    const timeoutPromise = new Promise<undefined>((resolve) => {
      setTimeout(() => resolve(undefined), RECAPTCHA_TIMEOUT_MS);
    });

    return Promise.race([tokenPromise, timeoutPromise]);
  }, []);

  return { getToken, preload, siteKey: RECAPTCHA_SITE_KEY };
}
