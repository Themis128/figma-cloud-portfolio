import cors from "cors";
import "dotenv/config";
import type { Server as HttpServer } from "node:http";
import path from "node:path";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Server as SocketIOServer } from "socket.io";
import { executeAgent, executeClaude } from "./routes/ai";
import { handleAnalytics } from "./routes/analytics";
import { handleContactForm } from "./routes/contact";
import { handleDemo } from "./routes/demo";
import {
  handleGetMetrics,
  handleGetRunJobs,
  handleGetWorkflowRuns,
  handleGetWorkflows,
  handleValidateToken,
} from "./routes/github";
import {
  handlePushNotificationsDelete,
  handlePushNotificationsGet,
  handlePushNotificationsPost,
  handlePushNotificationsPut,
} from "./routes/push-notifications";
import { handleResumeDownload } from "./routes/resume";
import { sentryErrorHandler } from "./sentry";

// Local logger to avoid magic numbers and direct console usage
const logger = {
  info: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
};

export function createServer() {
  const app = express();

  // Local constants to avoid magic numbers and direct console usage
  const HTTP_BAD_REQUEST = 400;
  const HTTP_NOT_FOUND = 404;
  const BYTES_PER_KB = 1024;
  const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

  // Middleware
  app.use(cors());

  // Sentry request handler (handled automatically by integration in v10)
  // app.use(sentryRequestHandler)

  // Security headers
  app.use((_req, res, next) => {
    // Basic security headers
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.recaptcha.net https://www.gstatic.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://p.typekit.net; " +
        "font-src 'self' https://fonts.gstatic.com https://use.typekit.net; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://api.github.com https://www.google-analytics.com https://www.recaptcha.net https://www.gstatic.com wss://localhost:* ws://localhost:*; " +
        "frame-src 'self' https://www.recaptcha.net; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';",
    );

    // HTTPS Strict Transport Security (only in production)
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Prevent MIME type sniffing
    res.setHeader("X-DNS-Prefetch-Control", "off");

    next();
  });

  // JSON parsing middleware
  app.use(express.json());

  // Serve static files from root directory (for deployment-monitor.html)
  app.use(express.static("."));

  // Middleware to handle JSON parsing errors
  app.use(((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && err.message.includes("JSON")) {
      return res.status(HTTP_BAD_REQUEST).json({ error: "Invalid JSON in request body" });
    }
    next(err);
    return undefined;
  }) as ErrorRequestHandler);

  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping pong";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Contact form route
  app.post("/api/contact", handleContactForm);

  // Analytics route
  app.post("/api/analytics", handleAnalytics);

  // Resume download route
  app.get("/api/resume/download", handleResumeDownload);
  app.post("/api/resume/download", handleResumeDownload);

  // GitHub proxy routes for deployment monitor
  app.get("/api/github/workflows", handleGetWorkflows);
  app.get("/api/github/metrics", handleGetMetrics);
  app.get("/api/github/workflows/:workflowIdentifier/runs", handleGetWorkflowRuns);
  app.get("/api/github/runs/:runId/jobs", handleGetRunJobs);

  // Push notifications routes
  app.post("/api/github/validate", handleValidateToken);
  app.get("/api/push-notifications", handlePushNotificationsGet);
  app.post("/api/push-notifications", handlePushNotificationsPost);
  app.put("/api/push-notifications", handlePushNotificationsPut);
  app.delete("/api/push-notifications", handlePushNotificationsDelete);

  // AI routes
  app.post("/api/ai/claude", executeClaude);
  app.post("/api/ai/agent", executeAgent);

  // Health check endpoints
  app.get("/api/health", (_req, res) => {
    const startTime = Date.now();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      responseTime: Date.now() - startTime,
    });
  });

  app.get("/api/health/detailed", (_req, res) => {
    const startTime = Date.now();
    const memUsage = process.memoryUsage();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV,
      memory: {
        rss: `${Math.round(memUsage.rss / BYTES_PER_MB)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / BYTES_PER_MB)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / BYTES_PER_MB)} MB`,
        external: `${Math.round(memUsage.external / BYTES_PER_MB)} MB`,
      },
      responseTime: Date.now() - startTime,
    });
  });

  // API 404 handler - must be after all API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return res.status(HTTP_NOT_FOUND).json({ error: "API endpoint not found" });
    }
    next();
    return undefined;
  });

  // Manifest alias: some tests expect /manifest.json while the project uses manifest.webmanifest
  app.get("/manifest.json", (_req, res) => {
    const manifestPath = path.resolve(process.cwd(), "public", "manifest.webmanifest");
    return res.sendFile(manifestPath, (err) => {
      if (err) {
        logger.error("Failed to serve manifest.json alias:", err);
        res.status(HTTP_NOT_FOUND).send("Not found");
      }
    });
  });

  // Sentry error handler (must be last)
  app.use(sentryErrorHandler);

  return app;
}

export function initializeSocketIO(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? (process.env.FRONTEND_URL ?? false)
          : ["http://localhost:8081", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store connected users for presence
  const connectedUsers = new Map<string, { id: string; name?: string; lastSeen: Date }>();

  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on("user:join", (userData: { id: string; name?: string }) => {
      connectedUsers.set(socket.id, {
        id: userData.id,
        name: userData.name,
        lastSeen: new Date(),
      });

      // Broadcast presence update
      io.emit("presence:update", Array.from(connectedUsers.values()));

      // Join user-specific room for direct messages
      socket.join(`user:${userData.id}`);
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { roomId?: string; userId: string; userName?: string }) => {
      if (data.roomId) {
        socket.to(data.roomId).emit("typing:start", {
          userId: data.userId,
          userName: data.userName,
        });
      }
    });

    socket.on("typing:stop", (data: { roomId?: string; userId: string }) => {
      if (data.roomId) {
        socket.to(data.roomId).emit("typing:stop", {
          userId: data.userId,
        });
      }
    });

    // Handle agent collaboration
    socket.on("agent:join-room", (roomId: string) => {
      socket.join(`agent:${roomId}`);
      socket.emit("agent:room-joined", roomId);
    });

    socket.on("agent:leave-room", (roomId: string) => {
      socket.leave(`agent:${roomId}`);
    });

    socket.on("agent:update", (data: { roomId: string; updates: Record<string, unknown> }) => {
      socket.to(`agent:${data.roomId}`).emit("agent:update", {
        ...data.updates,
        from: socket.id,
      });
    });

    // Handle agent status updates
    socket.on(
      "agent:status-update",
      (data: { agentId: string; status: string; details?: Record<string, unknown> }) => {
        io.emit("agent:status-changed", {
          agentId: data.agentId,
          status: data.status,
          details: data.details,
          timestamp: new Date(),
        });
      },
    );

    // Handle disconnection
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);

      // Broadcast updated presence
      io.emit("presence:update", Array.from(connectedUsers.values()));
    });

    // Handle ping for connection health
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  return io;
}
