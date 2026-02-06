import * as Sentry from '@sentry/react'

// Constants for Sentry configuration
const SENTRY_CONFIG = {
  SAMPLING_RATES: {
    PRODUCTION_TRACE: 0.1,
    DEVELOPMENT_TRACE: 1.0,
    PRODUCTION_REPLAY: 0.1,
    ERROR_REPLAY: 1.0,
  },
  DEFAULT_VERSION: '1.0.0',
} as const

// Initialize Sentry for the client
Sentry.init({
  dsn: import.meta.env['VITE_SENTRY_DSN'],
  environment: import.meta.env['MODE'],
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: import.meta.env['PROD']
    ? SENTRY_CONFIG.SAMPLING_RATES.PRODUCTION_TRACE
    : SENTRY_CONFIG.SAMPLING_RATES.DEVELOPMENT_TRACE, // Capture 10% of transactions in production
  // Session Replay
  replaysSessionSampleRate: import.meta.env['PROD']
    ? SENTRY_CONFIG.SAMPLING_RATES.PRODUCTION_REPLAY
    : SENTRY_CONFIG.SAMPLING_RATES.DEVELOPMENT_TRACE, // Capture 10% of sessions
  replaysOnErrorSampleRate: SENTRY_CONFIG.SAMPLING_RATES.ERROR_REPLAY, // Capture 100% of sessions with errors
  // Release tracking
  release: import.meta.env['VITE_APP_VERSION'] || SENTRY_CONFIG.DEFAULT_VERSION,
  // Error filtering
  beforeSend(event, hint) {
    // Filter out common non-actionable errors
    const error = hint.originalException
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase()

      // Filter out network errors that are expected (like offline, CORS, etc.)
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

// Performance monitoring helper
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  return Sentry.startSpan(
    {
      name,
      op: 'function',
    },
    () => {
      try {
        const result = fn()
        if (result instanceof Promise) {
          return result
        }
        return result
      } catch (error) {
        Sentry.captureException(error)
        throw error
      }
    },
  )
}

// User analytics helpers
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value)
}

export const setContext = (key: string, context: Record<string, unknown>) => {
  Sentry.setContext(key, context)
}

// Custom error reporting
export const reportError = (error: Error, context?: Record<string, unknown>) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, String(value))
      })
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

// Page view tracking
export const trackPageView = (page: string) => {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Page view: ${page}`,
    level: 'info',
  })
}

// User interaction tracking
export const trackInteraction = (action: string, details?: Record<string, unknown>) => {
  Sentry.addBreadcrumb({
    category: 'user',
    message: `User action: ${action}`,
    data: details,
    level: 'info',
  })
}

export { Sentry }
