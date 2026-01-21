import cors from 'cors'
import 'dotenv/config'
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { handleContactForm } from './routes/contact'
import { handleDemo } from './routes/demo'
import {
  handlePushNotificationsDelete,
  handlePushNotificationsGet,
  handlePushNotificationsPost,
  handlePushNotificationsPut,
} from './routes/push-notifications'
import { handleResumeDownload } from './routes/resume'

export function createServer() {
  const app = express()

  // Middleware
  app.use(cors())

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  // JSON parsing middleware
  app.use(express.json())

  // Middleware to handle JSON parsing errors
  app.use(((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
      return res.status(400).json({ error: 'Invalid JSON in request body' })
    }
    next(err)
  }) as ErrorRequestHandler)

  // Override console.error to suppress JSON parsing errors in development
  if (process.env.NODE_ENV !== 'production') {
    const originalConsoleError = console.error
    console.error = (...args: unknown[]) => {
      // Suppress JSON parsing errors from body-parser during testing
      if (args.some((arg) => typeof arg === 'string' && arg.includes('JSON'))) {
        return // Silently ignore JSON parsing errors in development
      }
      originalConsoleError.apply(console, args)
    }
  }

  app.use(express.urlencoded({ extended: true }))

  // Example API routes
  app.get('/api/ping', (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? 'ping'
    res.json({ message: ping })
  })

  app.get('/api/demo', handleDemo)

  // Contact form route
  app.post('/api/contact', handleContactForm)

  // Resume download route
  app.get('/api/resume/download', handleResumeDownload)
  app.post('/api/resume/download', handleResumeDownload)

  // Push notifications routes
  app.get('/api/push-notifications', handlePushNotificationsGet)
  app.post('/api/push-notifications', handlePushNotificationsPost)
  app.put('/api/push-notifications', handlePushNotificationsPut)
  app.delete('/api/push-notifications', handlePushNotificationsDelete)

  // API 404 handler - must be after all API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' })
    }
    next()
  })

  return app
}
