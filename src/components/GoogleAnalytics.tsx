"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import type { ConsentState } from "@/hooks/useConsent";

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = "cookie-consent";
const CONSENT_EVENT = "consent-updated";

// Initialize gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Read analytics consent from localStorage */
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

/** Bootstrap the dataLayer + gtag function + consent-mode defaults */
function bootstrapGtag(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // dataLayer.push expects the arguments object, not an array
    window.dataLayer!.push(arguments as unknown as Record<string, unknown>);
  };
  window.gtag("js", new Date());
  // Consent Mode v2: default to denied
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
  });
}

/** Grant analytics consent via Consent Mode v2 */
function grantAnalyticsConsent(): void {
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
  });
}

/** Deny analytics consent via Consent Mode v2 */
function denyAnalyticsConsent(): void {
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
  });
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    if (!hasAnalyticsConsent()) return;

    const url =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // Track page view
    window.gtag?.("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <ConsentAwareGA />
      <Suspense fallback={null}>
        <GoogleAnalyticsInner />
      </Suspense>
    </>
  );
}

/** Manages GA script loading based on consent */
function ConsentAwareGA() {
  const [consentGranted, setConsentGranted] = useState(false);
  const scriptLoadedRef = useRef(false);

  // Bootstrap gtag with denied defaults on first render
  useEffect(() => {
    bootstrapGtag();

    // Check initial consent
    if (hasAnalyticsConsent()) {
      setConsentGranted(true);
    }

    // Listen for consent changes
    const handleConsentUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (detail.analytics) {
        setConsentGranted(true);
        grantAnalyticsConsent();
      } else {
        setConsentGranted(false);
        denyAnalyticsConsent();
      }
    };

    window.addEventListener(CONSENT_EVENT, handleConsentUpdate);
    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentUpdate);
    };
  }, []);

  // When consent is granted and scripts haven't loaded, configure GA
  const handleScriptLoad = useCallback(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;
    grantAnalyticsConsent();
    window.gtag?.("config", GA_TRACKING_ID!, {
      page_path: window.location.pathname,
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
  }, []);

  if (!consentGranted) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        onLoad={handleScriptLoad}
      />
    </>
  );
}

// Legacy event tracking helper (kept for backward compat)
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
) {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;

  window.gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// GA4-native event helper — sends custom parameters that surface in the mobile app
export function trackGA4(
  eventName: string,
  params?: Record<string, string | number | boolean>,
) {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;

  window.gtag?.("event", eventName, params);
}

// GA4 recommended event: generate_lead (contact form submissions)
export function trackLead(method: string, source: string) {
  trackGA4("generate_lead", { method, source });
}

// GA4 recommended event: select_content (project clicks, link clicks)
export function trackContentClick(contentType: string, contentId: string) {
  trackGA4("select_content", { content_type: contentType, item_id: contentId });
}

// GA4 recommended event: share (social/outbound links)
export function trackOutboundClick(linkUrl: string, linkText: string) {
  trackGA4("click", {
    link_url: linkUrl,
    link_text: linkText,
    outbound: true,
  });
}

// Conversion tracking helper
export function trackConversion(
  conversionId: string,
  conversionLabel?: string,
) {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;

  window.gtag?.("event", "conversion", {
    send_to: `${GA_TRACKING_ID}/${conversionLabel || conversionId}`,
  });
}

export default GoogleAnalytics;
