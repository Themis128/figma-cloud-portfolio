import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { handleDemo } from './routes/demo'
import {
  handlePushNotificationsDelete,
  handlePushNotificationsGet,
  handlePushNotificationsPost,
  handlePushNotificationsPut,
} from './routes/push-notifications'

export function createServer() {
  const app = express()

  // Middleware
  app.use(cors())

  // JSON parsing middleware with silent error handling for development
  app.use(express.json())

  // Override console.error to suppress JSON parsing errors in development
  if (process.env.NODE_ENV !== 'production') {
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      // Suppress JSON parsing errors from body-parser during testing
      if (args.some(arg => typeof arg === 'string' && arg.includes('JSON'))) {
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

  // Push notifications routes
  app.get('/api/push-notifications', handlePushNotificationsGet)
  app.post('/api/push-notifications', handlePushNotificationsPost)
  app.put('/api/push-notifications', handlePushNotificationsPut)
  app.delete('/api/push-notifications', handlePushNotificationsDelete)

  return app
}