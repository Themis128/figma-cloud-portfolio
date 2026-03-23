"use client";

import { useCallback } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_TIMEOUT_MS = 3000;

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

function getGrecaptcha(): Grecaptcha | undefined {
  return (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
}

/**
 * Hook for reCAPTCHA v3 token generation.
 *
 * Returns `getToken(action)` which races the reCAPTCHA call against a timeout
 * so the form never hangs. Returns `undefined` if the script hasn't loaded or
 * the call times out.
 *
 * Also exposes `siteKey` for conditionally rendering the `<Script>` tag.
 */
export function useRecaptcha() {
  const getToken = useCallback(async (action: string): Promise<string | undefined> => {
    const grecaptcha = getGrecaptcha();
    if (!RECAPTCHA_SITE_KEY || !grecaptcha) return undefined;

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

  return { getToken, siteKey: RECAPTCHA_SITE_KEY };
}
