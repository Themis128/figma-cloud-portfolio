"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function GoogleAnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;

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
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsInner />
      </Suspense>
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
