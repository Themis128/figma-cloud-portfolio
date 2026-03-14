// Next.js instrumentation hook — runs once when the runtime starts.
// In production (static export), only the client config matters.
// In development, this also enables server-side Sentry for API routes.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side Sentry — only runs during `next dev` (not in static export)
    const Sentry = await import("@sentry/nextjs");

    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn) {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
      });
    }
  }
}

export const onRequestError =
  process.env.NEXT_PUBLIC_SENTRY_DSN
    ? (...args: Parameters<NonNullable<typeof import("@sentry/nextjs").captureRequestError>>) => {
        import("@sentry/nextjs").then((Sentry) => {
          Sentry.captureRequestError(...args);
        });
      }
    : undefined;
