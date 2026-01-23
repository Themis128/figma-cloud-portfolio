import * as Sentry from '@sentry/node'

// Initialize Sentry for the server
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    // HTTP integration for tracking HTTP requests
    Sentry.httpIntegration(),
    // Database integration (if using a database)
    // Sentry.mongoIntegration(),
    // Sentry.postgresIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Release tracking
  release: process.env.npm_package_version || '1.0.0',
  // Error filtering
  beforeSend(event, hint) {
    const error = hint.originalException
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase()

      // Filter out common non-actionable server errors
      if (
        message.includes('client disconnected') ||
        message.includes('connection reset') ||
        message.includes('timeout') ||
        message.includes('econnreset') ||
        (message.includes('enotfound') && message.includes('localhost'))
      ) {
        return null
      }
    }

    return event
  },
})

// Request handler for Express
export const sentryRequestHandler = Sentry.expressIntegration()

// Error handler for Express (must be last)
export const sentryErrorHandler = Sentry.expressErrorHandler()

// Performance monitoring helper
export const measurePerformance = (
  name: string,
  fn: () => void | Promise<void>,
) => {
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

// User tracking
export const setUser = (user: {
  id: string
  email?: string
  username?: string
}) => {
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
export const reportError = (
  error: Error,
  context?: Record<string, unknown>,
) => {
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

// API request tracking
export const trackApiRequest = (
  method: string,
  path: string,
  statusCode: number,
  duration: number,
) => {
  Sentry.addBreadcrumb({
    category: 'api',
    message: `${method} ${path} - ${statusCode} (${duration}ms)`,
    level: statusCode >= 400 ? 'warning' : 'info',
    data: {
      method,
      path,
      statusCode,
      duration,
    },
  })
}

// Database operation tracking
export const trackDatabaseOperation = (
  operation: string,
  collection: string,
  duration: number,
  success: boolean,
) => {
  Sentry.addBreadcrumb({
    category: 'database',
    message: `${operation} on ${collection} (${duration}ms)`,
    level: success ? 'info' : 'warning',
    data: {
      operation,
      collection,
      duration,
      success,
    },
  })
}

export { Sentry }

