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

// ── Content group mapping ──────────────────────────────────────────────
// Maps pathname prefixes to content groups visible in GA4 mobile app reports
const CONTENT_GROUP_MAP: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/contact": "Contact",
  "/resume": "Resume",
  "/projects": "Projects",
  "/performance": "Performance",
  "/agents": "Agents",
  "/blog": "Blog",
  "/builder": "Builder",
  "/product": "Product",
  "/settings": "Settings",
  "/privacy": "Legal",
  "/terms": "Legal",
  "/cookies": "Legal",
  "/admin": "Admin",
};

function getContentGroup(pathname: string): string {
  // Exact match first
  const exact = CONTENT_GROUP_MAP[pathname] ?? CONTENT_GROUP_MAP[pathname.replace(/\/$/, "")];
  if (exact) return exact;
  // Prefix match (e.g., /admin/settings → Admin)
  const prefix = Object.keys(CONTENT_GROUP_MAP).find(
    (key) => key !== "/" && pathname.startsWith(key),
  );
  return prefix ? CONTENT_GROUP_MAP[prefix]! : "Other";
}

function getPageTitle(pathname: string): string {
  const group = getContentGroup(pathname);
  if (group === "Home") return "Themis Baltzakis | Portfolio";
  return `${group} | Themis Baltzakis`;
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
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args as unknown as Record<string, unknown>);
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

/** Set user properties for audience segmentation in GA4 mobile app */
function setUserProperties(): void {
  if (!GA_TRACKING_ID || typeof window === "undefined") return;

  const isReturning = localStorage.getItem("ga_visited") === "true";
  localStorage.setItem("ga_visited", "true");

  const isPWA = window.matchMedia("(display-mode: standalone)").matches;

  window.gtag?.("set", "user_properties", {
    visitor_type: isReturning ? "returning" : "new",
    platform_type: isPWA ? "pwa" : "web",
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    color_scheme: document.documentElement.classList.contains("dark") ? "dark" : "light",
  });
}

/** Track SPA page view with content_group and page_title for GA4 mobile app.
 *  Defers firing until document.title is stable to avoid "(not set)" in reports. */
function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    if (!hasAnalyticsConsent()) return;

    // Skip first render — initial page_view is sent by handleScriptLoad
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Defer to allow Next.js to update document.title after navigation
    const timeoutId = setTimeout(() => {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");

      const pageTitle = document.title || getPageTitle(pathname);
      const contentGroup = getContentGroup(pathname);

      window.gtag?.("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: pageTitle,
        content_group: contentGroup,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
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

    const currentPath = window.location.pathname;
    const contentGroup = getContentGroup(currentPath);

    // Configure with send_page_view: false — we send manual page_view events
    // with content_group and page_title to avoid "(not set)" in GA4 reports
    window.gtag?.("config", GA_TRACKING_ID!, {
      send_page_view: false,
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
      content_group: contentGroup,
    });

    // Set user properties for audience segmentation in GA4 mobile app
    setUserProperties();

    // Defer initial page_view to ensure document.title is set by Next.js
    setTimeout(() => {
      window.gtag?.("event", "page_view", {
        page_path: currentPath,
        page_location: window.location.href,
        page_title: document.title || getPageTitle(currentPath),
        content_group: contentGroup,
      });
    }, 50);
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

// GA4 recommended event: file_download (resume PDF, JSON exports)
export function trackFileDownload(
  fileName: string,
  fileExtension: string,
  method: string,
) {
  trackGA4("file_download", {
    file_name: fileName,
    file_extension: fileExtension,
    link_text: method,
  });
}

// GA4 recommended event: view_search_results (project filtering/search)
export function trackSearch(searchTerm: string, resultsCount: number) {
  trackGA4("view_search_results", {
    search_term: searchTerm,
    results_count: resultsCount,
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
