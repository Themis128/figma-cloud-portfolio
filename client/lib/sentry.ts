let SentryLib: typeof import('@sentry/react') | null = null
let initialized = false

// Sentry sampling rates
const SENTRY_TRACES_SAMPLE_RATE_PROD = 0.1
const SENTRY_TRACES_SAMPLE_RATE_DEV = 1.0
const SENTRY_REPLAYS_SESSION_SAMPLE_RATE_PROD = 0.1
const SENTRY_REPLAYS_SESSION_SAMPLE_RATE_DEV = 1.0
const SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE = 1.0

export async function initSentry() {
  if (initialized) return
  if (!import.meta.env.VITE_SENTRY_DSN) return
  const Sentry = await import('@sentry/react')

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD
      ? SENTRY_TRACES_SAMPLE_RATE_PROD
      : SENTRY_TRACES_SAMPLE_RATE_DEV,
    replaysSessionSampleRate: import.meta.env.PROD
      ? SENTRY_REPLAYS_SESSION_SAMPLE_RATE_PROD
      : SENTRY_REPLAYS_SESSION_SAMPLE_RATE_DEV,
    replaysOnErrorSampleRate: SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    beforeSend(event, hint) {
      const error = hint && (hint as unknown as { originalException?: unknown }).originalException
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase()
        if (
          message.includes('network error') ||
          message.includes('failed to fetch') ||
          message.includes('load chunk') ||
          message.includes('loading chunk') ||
          message.includes('script error')
        ) {
          return null
        }
      }
      return event
    },
  })

  SentryLib = Sentry
  initialized = true
}

// Helper wrappers: no-op until `initSentry()` is called.
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  if (!SentryLib) return fn()
  return SentryLib.startSpan({ name, op: 'function' }, () => fn())
}

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (!SentryLib) return
  SentryLib.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

export const setTag = (key: string, value: string) => {
  if (!SentryLib) return
  SentryLib.setTag(key, value)
}

export const setContext = (key: string, context: Record<string, unknown>) => {
  if (!SentryLib) return
  SentryLib.setContext(key, context)
}

export const reportError = (error: Error, context?: Record<string, unknown>) => {
  if (!SentryLib) {
    // Fallback to console in dev to aid debugging
    return
  }
  const sentry = SentryLib
  if (context) {
    sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value))
      })
      sentry.captureException(error)
    })
  } else {
    sentry.captureException(error)
  }
}

export const trackPageView = (page: string) => {
  if (!SentryLib) return
  SentryLib.addBreadcrumb({
    category: 'navigation',
    message: `Page view: ${page}`,
    level: 'info',
  })
}

export const trackInteraction = (action: string, details?: Record<string, unknown>) => {
  if (!SentryLib) return
  SentryLib.addBreadcrumb({
    category: 'user',
    message: `User action: ${action}`,
    data: details,
    level: 'info',
  })
}

export { initSentry as init, SentryLib as Sentry }
