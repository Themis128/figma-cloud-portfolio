import cors from 'cors'
import 'dotenv/config'
import type { Server as HttpServer } from 'node:http'
import path from 'node:path'
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { executeAgent, executeClaude } from './routes/ai'
import { handleAnalytics } from './routes/analytics'
import { handleContactForm } from './routes/contact'
import { handleDemo } from './routes/demo'
import {
  handleGetMetrics,
  handleGetRunJobs,
  handleGetWorkflowRuns,
  handleGetWorkflows,
  handleValidateToken,
} from './routes/github'
import {
  handlePushNotificationsDelete,
  handlePushNotificationsGet,
  handlePushNotificationsPost,
  handlePushNotificationsPut,
} from './routes/push-notifications'
import { handleResumeDownload } from './routes/resume'
import { sentryErrorHandler } from './sentry'

// Local logger to avoid magic numbers and direct console usage
const logger = {
  info: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
}

export function createServer() {
  const app = express()

  // Local constants to avoid magic numbers and direct console usage
  const HTTP_BAD_REQUEST = 400
  const HTTP_NOT_FOUND = 404
  const BYTES_PER_KB = 1024
  const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB

  // Middleware
  app.use(cors())

  // Sentry request handler (handled automatically by integration in v10)
  // app.use(sentryRequestHandler)

  // Security headers
  app.use((_req, res, next) => {
    // Basic security headers
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
<<<<<<< HEAD
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://www.recaptcha.net https://www.gstatic.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; " +
        "font-src 'self' https://fonts.gstatic.com https://use.typekit.net; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.github.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.recaptcha.net https://www.gstatic.com wss://localhost:* ws://localhost:*; " +
=======
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://www.recaptcha.net https://www.gstatic.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; " +
        "font-src 'self' https://fonts.gstatic.com https://use.typekit.net; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.github.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.recaptcha.net https://www.gstatic.com wss://localhost:* ws://localhost:*; " +
>>>>>>> 9d02b63 (Fix loading component issues and implement performance optimizations)
        "frame-src 'self' https://www.recaptcha.net; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'; " +
        "worker-src 'self' blob: https://storage.googleapis.com; " +
        "child-src 'self'; " +
        "media-src 'self' blob: data:;",
    )

    // HTTPS Strict Transport Security (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // Prevent MIME type sniffing
    res.setHeader('X-DNS-Prefetch-Control', 'off')

    next()
  })

  // JSON parsing middleware
  app.use(express.json())

  // Serve static files from root directory (for deployment-monitor.html)
  app.use(express.static('.'))

  // Middleware to handle JSON parsing errors
  app.use(((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
      return res.status(HTTP_BAD_REQUEST).json({ error: 'Invalid JSON in request body' })
    }
    next(err)
    return undefined
  }) as ErrorRequestHandler)

  app.use(express.urlencoded({ extended: true }))

  // Example API routes
  app.get('/api/ping', (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? 'ping pong'
    res.json({ message: ping })
  })

  app.get('/api/demo', handleDemo)

  // Contact form route
  app.post('/api/contact', handleContactForm)

  // Analytics route
  app.post('/api/analytics', handleAnalytics)

  // Resume download route
  app.get('/api/resume/download', handleResumeDownload)
  app.post('/api/resume/download', handleResumeDownload)

  // GitHub proxy routes for deployment monitor
  app.get('/api/github/workflows', handleGetWorkflows)
  app.get('/api/github/metrics', handleGetMetrics)
  app.get('/api/github/workflows/:workflowIdentifier/runs', handleGetWorkflowRuns)
  app.get('/api/github/runs/:runId/jobs', handleGetRunJobs)

  // Push notifications routes
  app.post('/api/github/validate', handleValidateToken)
  app.get('/api/push-notifications', handlePushNotificationsGet)
  app.post('/api/push-notifications', handlePushNotificationsPost)
  app.put('/api/push-notifications', handlePushNotificationsPut)
  app.delete('/api/push-notifications', handlePushNotificationsDelete)

  // AI routes
  app.post('/api/ai/claude', executeClaude)
  app.post('/api/ai/agent', executeAgent)

  // Health check endpoints
  app.get('/api/health', (_req, res) => {
    const startTime = Date.now()
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      responseTime: Date.now() - startTime,
    })
  })

  app.get('/api/health/detailed', (_req, res) => {
    const startTime = Date.now()
    const memUsage = process.memoryUsage()

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      memory: {
        rss: `${Math.round(memUsage.rss / BYTES_PER_MB)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / BYTES_PER_MB)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / BYTES_PER_MB)} MB`,
        external: `${Math.round(memUsage.external / BYTES_PER_MB)} MB`,
      },
      responseTime: Date.now() - startTime,
    })
  })

  // API 404 handler - must be after all API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return res.status(HTTP_NOT_FOUND).json({ error: 'API endpoint not found' })
    }
    next()
    return undefined
  })

  // Manifest alias: some tests expect /manifest.json while the project uses manifest.webmanifest
  app.get('/manifest.json', (_req, res) => {
    const manifestPath = path.resolve(process.cwd(), 'public', 'manifest.webmanifest')
    return res.sendFile(manifestPath, (err) => {
      if (err) {
        logger.error('Failed to serve manifest.json alias:', err)
        res.status(HTTP_NOT_FOUND).send('Not found')
      }
    })
  })

  // Sentry error handler (must be last)
  app.use(sentryErrorHandler)

  return app
}

export function initializeSocketIO(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? (process.env.FRONTEND_URL ?? false)
          : ['http://localhost:8081', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
<<<<<<< HEAD
  })

  // Store connected users for presence
  const connectedUsers = new Map<string, { id: string; name?: string; lastSeen: Date }>()

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`)

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
=======
    // Enhanced configuration for React 19 integration
    transports: ["websocket", "polling"],
    upgrade: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB
    allowEIO3: true,
  });

  // Enhanced user presence management
  interface UserPresence {
    userId: string;
    socketId: string;
    username?: string;
    status: "online" | "away" | "busy" | "offline";
    activity?: "viewing" | "editing" | "idle" | "typing";
    currentSection?: string;
    isEditing?: boolean;
    rooms: Set<string>;
    joinedAt: number;
    lastSeen: number;
    metadata?: Record<string, any>;
  }

  interface Room {
    id: string;
    participants: Set<string>;
    createdAt: number;
    metadata?: Record<string, any>;
  }

  const connectedUsers = new Map<string, UserPresence>();
  const rooms = new Map<string, Room>();
  const typingUsers = new Map<
    string,
    { userId: string; roomId: string; timeout: NodeJS.Timeout }
  >();

  // Enhanced connection handling
  io.on("connection", (socket) => {
    logger.info(`Enhanced Socket.IO connection established: ${socket.id}`);

    // Enhanced authentication and presence setup
    socket.on(
      "authenticate",
      (authData: { userId?: string; username?: string; userAgent?: string }) => {
        const userId = authData.userId || `anonymous-${Date.now()}`;
        const userPresence: UserPresence = {
          userId,
          socketId: socket.id,
          username: authData.username,
          status: "online",
          activity: "viewing",
          rooms: new Set(),
          joinedAt: Date.now(),
          lastSeen: Date.now(),
          metadata: {
            userAgent: authData.userAgent,
            connectedAt: new Date().toISOString(),
          },
        };

        connectedUsers.set(socket.id, userPresence);

        // Join global presence room
        socket.join("global");
        userPresence.rooms.add("global");

        // Send initial presence data
        socket.emit("presence_initial", {
          userId: userPresence.userId,
          presence: Array.from(connectedUsers.values()).map(formatPresenceForClient),
        });

        // Broadcast user joined to all clients
        socket.to("global").emit("user_joined", formatPresenceForClient(userPresence));

        logger.info(`User authenticated: ${userId} (${socket.id})`);
      },
    );

    // Enhanced room management
    socket.on("join_room", (data: { roomId: string; data?: any }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const { roomId } = data;
      socket.join(roomId);
      user.rooms.add(roomId);

      // Create or update room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: new Set([socket.id]),
          createdAt: Date.now(),
          metadata: data.data,
        });
      } else {
        const room = rooms.get(roomId)!;
        room.participants.add(socket.id);
      }

      // Notify room participants
      socket.to(roomId).emit("user_joined_room", {
        roomId,
        user: formatPresenceForClient(user),
      });

      // Send room info to joining user
      socket.emit("room_joined", {
        roomId,
        participants: getRoomParticipants(roomId),
      });

      logger.info(`User ${user.userId} joined room: ${roomId}`);
    });

    socket.on("leave_room", (data: { roomId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const { roomId } = data;
      socket.leave(roomId);
      user.rooms.delete(roomId);

      // Update room
      const room = rooms.get(roomId);
      if (room) {
        room.participants.delete(socket.id);
        if (room.participants.size === 0) {
          rooms.delete(roomId);
        }
      }

      // Notify room participants
      socket.to(roomId).emit("user_left_room", {
        roomId,
        userId: user.userId,
      });

      logger.info(`User ${user.userId} left room: ${roomId}`);
    });

    // Enhanced presence updates with React 19 optimization
    socket.on(
      "presence_update",
      (
        updates: Partial<
          Pick<UserPresence, "status" | "activity" | "currentSection" | "isEditing" | "metadata">
        >,
      ) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        // Update user presence
        Object.assign(user, updates, { lastSeen: Date.now() });

        // Broadcast to all rooms user is in
        user.rooms.forEach((roomId) => {
          socket.to(roomId).emit("presence_update", formatPresenceForClient(user));
        });
>>>>>>> 9d02b63 (Fix loading component issues and implement performance optimizations)
      },
    )

<<<<<<< HEAD
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`)
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
=======
    // Enhanced typing indicators
    socket.on("typing_start", (data: { roomId: string; userId?: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const typingKey = `${socket.id}:${data.roomId}`;

      // Clear existing timeout
      if (typingUsers.has(typingKey)) {
        clearTimeout(typingUsers.get(typingKey)!.timeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        typingUsers.delete(typingKey);
        socket.to(data.roomId).emit("typing_stop", {
          userId: user.userId,
          roomId: data.roomId,
        });
      }, 5000); // 5 second timeout

      typingUsers.set(typingKey, {
        userId: user.userId,
        roomId: data.roomId,
        timeout,
      });

      // Broadcast typing start
      socket.to(data.roomId).emit("typing_start", {
        userId: user.userId,
        username: user.username,
        roomId: data.roomId,
        timestamp: Date.now(),
      });
    });

    socket.on("typing_stop", (data: { roomId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) return;

      const typingKey = `${socket.id}:${data.roomId}`;

      if (typingUsers.has(typingKey)) {
        clearTimeout(typingUsers.get(typingKey)!.timeout);
        typingUsers.delete(typingKey);
      }

      socket.to(data.roomId).emit("typing_stop", {
        userId: user.userId,
        roomId: data.roomId,
      });
    });

    // Enhanced agent collaboration
    socket.on(
      "agent_collaboration",
      (data: {
        agentId: string;
        userId?: string;
        changeType: "create" | "update" | "delete" | "move" | "rename";
        section: string;
        changes: Record<string, any>;
        version?: string;
      }) => {
        const user = connectedUsers.get(socket.id);
        const roomId = `agent:${data.agentId}`;

        const collaborationEvent = {
          ...data,
          userId: user?.userId || data.userId || "anonymous",
          timestamp: Date.now(),
          socketId: socket.id,
        };

        // Broadcast to agent room participants
        socket.to(roomId).emit("agent_collaboration", collaborationEvent);

        // Also broadcast to global activity feed
        io.to("global").emit("global_activity", {
          id: `agent-${Date.now()}-${Math.random()}`,
          type: "agent_collaboration",
          data: collaborationEvent,
          timestamp: Date.now(),
          metadata: { roomId },
        });

        logger.info(`Agent collaboration event: ${data.changeType} on ${data.agentId}`);
      },
    );

    // Real-time notifications
    socket.on(
      "send_notification",
      (notification: {
        title: string;
        options?: any;
        roomId?: string;
        userId?: string;
        category: string;
        priority: string;
      }) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        if (notification.roomId) {
          // Send to specific room
          socket.to(notification.roomId).emit("realtime_notification", {
            ...notification,
            from: user.userId,
            timestamp: Date.now(),
          });
        } else if (notification.userId) {
          // Send to specific user
          io.to(`user:${notification.userId}`).emit("realtime_notification", {
            ...notification,
            from: user.userId,
            timestamp: Date.now(),
          });
        } else {
          // Broadcast to all connected users
          socket.broadcast.emit("realtime_notification", {
            ...notification,
            from: user.userId,
            timestamp: Date.now(),
          });
        }
      },
    );

    // Connection health monitoring
    socket.on("ping", () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        user.lastSeen = Date.now();
      }
      socket.emit("pong", Date.now());
    });

    // Handle disconnect with enhanced cleanup
    socket.on("disconnect", (reason) => {
      logger.info(`Enhanced Socket.IO disconnection: ${socket.id} (${reason})`);

      const user = connectedUsers.get(socket.id);
      if (user) {
        // Clean up typing indicators
        typingUsers.forEach((typing, key) => {
          if (key.startsWith(socket.id)) {
            clearTimeout(typing.timeout);
            typingUsers.delete(key);
          }
        });

        // Update room memberships
        user.rooms.forEach((roomId) => {
          const room = rooms.get(roomId);
          if (room) {
            room.participants.delete(socket.id);
            if (room.participants.size === 0 && roomId !== "global") {
              rooms.delete(roomId);
            }
          }

          // Notify room participants of user leaving
          socket.to(roomId).emit("user_left", user.userId);
        });

        // Remove from connected users
        connectedUsers.delete(socket.id);

        // Broadcast presence update to global room
        io.to("global").emit("user_left", user.userId);

        logger.info(`User ${user.userId} cleanup completed`);
      }
    });

    // Emergency disconnect
    socket.on("force_disconnect", () => {
      logger.warn(`Force disconnect requested: ${socket.id}`);
      socket.disconnect(true);
    });
  });

  // Helper functions
  function formatPresenceForClient(user: UserPresence) {
    return {
      userId: user.userId,
      username: user.username,
      status: user.status,
      activity: user.activity,
      currentSection: user.currentSection,
      isEditing: user.isEditing,
      rooms: Array.from(user.rooms),
      joinedAt: user.joinedAt,
      lastSeen: user.lastSeen,
      metadata: user.metadata,
    };
  }

  function getRoomParticipants(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.participants)
      .map((socketId) => connectedUsers.get(socketId))
      .filter(Boolean)
      .map(formatPresenceForClient);
  }

  // Periodic cleanup of inactive users
  setInterval(() => {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    connectedUsers.forEach((user, socketId) => {
      if (now - user.lastSeen > timeout) {
        logger.warn(`Cleaning up inactive user: ${user.userId} (${socketId})`);
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        } else {
          connectedUsers.delete(socketId);
        }
      }
    });
  }, 60000); // Check every minute

  // Periodic room cleanup
  setInterval(() => {
    rooms.forEach((room, roomId) => {
      if (room.participants.size === 0 && roomId !== "global") {
        logger.info(`Cleaning up empty room: ${roomId}`);
        rooms.delete(roomId);
      }
    });
  }, 300000); // Check every 5 minutes

  logger.info("Enhanced Socket.IO server initialized with React 19 integration");

  return io;
>>>>>>> 9d02b63 (Fix loading component issues and implement performance optimizations)
}
