/**
 * Shared constants for the admin dashboard components.
 *
 * Centralises values that are referenced by more than one admin component
 * so they stay in sync and are easy to tune from a single location.
 */

/* ------------------------------------------------------------------ */
/*  Polling / timing                                                  */
/* ------------------------------------------------------------------ */

/** Interval (ms) between automatic health-check refreshes. */
export const AUTO_REFRESH_INTERVAL_MS = 30_000;

/** Maximum number of response-time data-points kept per endpoint. */
export const MAX_HISTORY_POINTS = 20;

/** Default request timeout (ms) used for API calls in the admin panel. */
export const API_TIMEOUT_MS = 10_000;

/**
 * API origin for admin dashboard requests.
 * In production (static export on S3), relative /api/ paths hit CloudFront (404).
 * We need the Lambda function URL. In dev, relative paths work via Express proxy.
 */
export const LAMBDA_API_URL = "https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws";

/** Returns the API origin — must be a function (not a const) because static export
 *  evaluates module-level code at build time when `window` is undefined. */
export function getApiOrigin(): string {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return LAMBDA_API_URL;
  }
  return "";
}

/* ------------------------------------------------------------------ */
/*  HTTP status colour mapping                                        */
/* ------------------------------------------------------------------ */

/**
 * Map the first digit of an HTTP status code to Tailwind colour classes.
 * Used by ApiConsole and any component that needs to colour-code a status.
 */
export const HTTP_STATUS_COLOR: Record<string, string> = {
  "2": "text-green-400 border-green-500/40",
  "3": "text-blue-400 border-blue-500/40",
  "4": "text-yellow-400 border-yellow-500/40",
  "5": "text-red-400 border-red-500/40",
};

/** Return Tailwind colour classes for a given HTTP status code. */
export function getHttpStatusColor(status: number): string {
  return (
    HTTP_STATUS_COLOR[String(Math.floor(status / 100))] ??
    "text-foreground/60 border-border/40"
  );
}
