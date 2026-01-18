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
  app.use(express.json())
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
