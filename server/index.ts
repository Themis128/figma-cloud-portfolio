import cors from 'cors'
import 'dotenv/config'
import type { Server as HttpServer } from 'node:http'
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { Server as SocketIOServer } from 'socket.io'
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

export function initializeSocketIO(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL || false
          : ['http://localhost:8081', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // Store connected users for presence
  const connectedUsers = new Map<string, { id: string; name?: string; lastSeen: Date }>()

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Handle user joining
    socket.on('user:join', (userData: { id: string; name?: string }) => {
      connectedUsers.set(socket.id, {
        id: userData.id,
        name: userData.name,
        lastSeen: new Date(),
      })

      // Broadcast presence update
      io.emit('presence:update', Array.from(connectedUsers.values()))

      // Join user-specific room for direct messages
      socket.join(`user:${userData.id}`)
    })

    // Handle typing indicators
    socket.on('typing:start', (data: { roomId?: string; userId: string; userName?: string }) => {
      if (data.roomId) {
        socket.to(data.roomId).emit('typing:start', {
          userId: data.userId,
          userName: data.userName,
        })
      }
    })

    socket.on('typing:stop', (data: { roomId?: string; userId: string }) => {
      if (data.roomId) {
        socket.to(data.roomId).emit('typing:stop', {
          userId: data.userId,
        })
      }
    })

    // Handle agent collaboration
    socket.on('agent:join-room', (roomId: string) => {
      socket.join(`agent:${roomId}`)
      socket.emit('agent:room-joined', roomId)
    })

    socket.on('agent:leave-room', (roomId: string) => {
      socket.leave(`agent:${roomId}`)
    })

    socket.on('agent:update', (data: { roomId: string; updates: Record<string, unknown> }) => {
      socket.to(`agent:${data.roomId}`).emit('agent:update', {
        ...data.updates,
        from: socket.id,
      })
    })

    // Handle agent status updates
    socket.on(
      'agent:status-update',
      (data: { agentId: string; status: string; details?: Record<string, unknown> }) => {
        io.emit('agent:status-changed', {
          agentId: data.agentId,
          status: data.status,
          details: data.details,
          timestamp: new Date(),
        })
      },
    )

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      connectedUsers.delete(socket.id)

      // Broadcast updated presence
      io.emit('presence:update', Array.from(connectedUsers.values()))
    })

    // Handle ping for connection health
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })

  return io
}
