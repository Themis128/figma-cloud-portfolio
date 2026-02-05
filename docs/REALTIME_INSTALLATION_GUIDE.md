# Real-time Features Installation & Configuration Guide

## Phase 3 Real-time Enhancement - Complete Setup

This comprehensive guide covers the installation, configuration, and deployment of the enhanced real-time features using Socket.IO with React 19 integration.

## Table of Contents

1. [Dependencies Installation](#dependencies-installation)
2. [Environment Configuration](#environment-configuration)
3. [Development Setup](#development-setup)
4. [Production Configuration](#production-configuration)
5. [AWS Amplify Deployment](#aws-amplify-deployment)
6. [Monitoring & Analytics](#monitoring--analytics)
7. [Security Configuration](#security-configuration)
8. [Troubleshooting](#troubleshooting)

## Dependencies Installation

### Core Dependencies

```json
{
  "dependencies": {
    "socket.io": "^4.7.5",
    "socket.io-client": "^4.7.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/socket.io": "^3.0.2",
    "@types/socket.io-client": "^3.0.0"
  }
}
```

### Installation Commands

```bash
# Install Socket.IO dependencies
pnpm add socket.io socket.io-client

# Install type definitions
pnpm add -D @types/socket.io @types/socket.io-client

# Verify React 19 is installed
pnpm list react react-dom

# If React 19 not installed:
pnpm add react@^19.0.0 react-dom@^19.0.0
```

## Environment Configuration

### Development Environment

Create `.env.development`:

```env
# Real-time Configuration
VITE_REALTIME_ENABLED=true
VITE_SOCKET_URL=http://localhost:3000
VITE_SOCKET_RECONNECT_ATTEMPTS=5
VITE_SOCKET_RECONNECT_DELAY=1000

# Debug Settings
VITE_SOCKET_DEBUG=true
VITE_REALTIME_DEBUG=true

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:8081

# Performance Tuning
VITE_SOCKET_MAX_LISTENERS=50
SOCKET_PRESENCE_CLEANUP_INTERVAL=30000
SOCKET_MAX_CONNECTIONS=1000
```

### Production Environment

Create `.env.production`:

```env
# Real-time Configuration
VITE_REALTIME_ENABLED=true
VITE_SOCKET_URL=https://your-domain.com
VITE_SOCKET_RECONNECT_ATTEMPTS=3
VITE_SOCKET_RECONNECT_DELAY=2000

# Security
VITE_SOCKET_DEBUG=false
VITE_REALTIME_DEBUG=false

# Performance
VITE_SOCKET_MAX_LISTENERS=100
SOCKET_PRESENCE_CLEANUP_INTERVAL=60000
SOCKET_MAX_CONNECTIONS=10000

# AWS Lambda Configuration (if deploying to Amplify)
VITE_LAMBDA_REALTIME_URL=https://your-api-gateway-url/realtime
```

## Development Setup

### 1. Server Configuration

Update `server/index.ts`:

```typescript
import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
});

// Initialize real-time features
initializeSocketIO(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled`);
});
```

### 2. Client Configuration

Update `client/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './global.css';

// Enable React 19 concurrent features
const root = ReactDOM.createRoot(
  document.getElementById('root')!,
  {
    // React 19 concurrent features
    unstable_concurrentUpdatesByDefault: true
  }
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3. Vite Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Enable React 19 features
      include: "**/*.{jsx,tsx}",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    port: 8081,
    proxy: {
      // Proxy API requests to backend
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy Socket.IO requests
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "socket-io": ["socket.io-client"],
          realtime: [
            "./client/hooks/useEnhancedRealtime.ts",
            "./client/components/realtime/RealtimeIntegration.tsx",
          ],
        },
      },
    },
  },
});
```

## Production Configuration

### 1. Docker Configuration

Create `Dockerfile.realtime`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY server/ ./server/
COPY shared/ ./shared/

# Build server
RUN pnpm run build:server

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
```

### 2. Load Balancer Configuration

For horizontal scaling, configure sticky sessions:

```nginx
# nginx.conf
upstream realtime_backend {
    ip_hash;  # Sticky sessions for Socket.IO
    server realtime1:3000;
    server realtime2:3000;
    server realtime3:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location /socket.io/ {
        proxy_pass http://realtime_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Socket.IO timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

### 3. Redis Adapter (Optional)

For multi-server deployments:

```bash
pnpm add @socket.io/redis-adapter redis
```

```typescript
// server/index.ts
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "redis";

const pubClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## AWS Amplify Deployment

### 1. Lambda Function Setup

Create `amplify/functions/realtime/index.ts`:

```typescript
import { APIGatewayProxyHandler } from "aws-lambda";
import { Server } from "socket.io";
import { createServer } from "http";

// For serverless Socket.IO, consider Socket.IO with Redis
// or use AWS IoT Core for real-time features

export const handler: APIGatewayProxyHandler = async (event, context) => {
  // Handle real-time events via API Gateway WebSocket
  const { requestContext } = event;

  switch (requestContext.eventType) {
    case "CONNECT":
      return handleConnect(event);
    case "DISCONNECT":
      return handleDisconnect(event);
    case "MESSAGE":
      return handleMessage(event);
    default:
      return { statusCode: 400, body: "Invalid event type" };
  }
};

async function handleConnect(event: any) {
  // Store connection in DynamoDB
  console.log("WebSocket connected:", event.requestContext.connectionId);
  return { statusCode: 200, body: "Connected" };
}

async function handleDisconnect(event: any) {
  // Clean up connection
  console.log("WebSocket disconnected:", event.requestContext.connectionId);
  return { statusCode: 200, body: "Disconnected" };
}

async function handleMessage(event: any) {
  // Process real-time messages
  const { body } = event;
  const message = JSON.parse(body);

  // Broadcast to other connections
  // Implementation depends on AWS API Gateway management API

  return { statusCode: 200, body: "Message processed" };
}
```

### 2. Amplify Configuration

Update `amplify.yml`:

```yaml
version: 1
applications:
  - appRoot: .
    frontend:
      phases:
        preBuild:
          commands:
            - npm install -g pnpm
            - pnpm install
            # Build real-time features
            - pnpm run build:resume
        build:
          commands:
            - pnpm run build:client
        postBuild:
          commands:
            # Copy real-time assets
            - cp -r dist/spa/* $AWS_DEFAULT_REGION
      artifacts:
        baseDirectory: dist/spa
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - client/node_modules/**/*
    backend:
      phases:
        build:
          commands:
            - echo "Building Lambda functions for real-time features"
            - cd amplify/functions/realtime && npm install
      cache:
        paths:
          - amplify/functions/**/node_modules/**/*
```

### 3. Alternative: AWS IoT Core Integration

For true serverless real-time:

```typescript
// client/lib/aws-realtime.ts
import { IoT } from "aws-sdk";
import { CognitoIdentityCredentials } from "aws-sdk";

export class AWSRealtimeClient {
  private iot: IoT;
  private mqttClient: any;

  constructor() {
    // Configure AWS credentials
    this.iot = new IoT({
      region: process.env.VITE_AWS_REGION,
      credentials: new CognitoIdentityCredentials({
        IdentityPoolId: process.env.VITE_AWS_IDENTITY_POOL_ID!,
      }),
    });
  }

  async connect() {
    // Connect to AWS IoT Core MQTT
    const endpoint = await this.iot
      .describeEndpoint({ endpointType: "iot:Data-ATS" })
      .promise();

    // Initialize MQTT connection
    // Implementation with AWS IoT Device SDK
  }

  subscribe(topic: string, callback: (message: any) => void) {
    // Subscribe to real-time topics
  }

  publish(topic: string, message: any) {
    // Publish real-time messages
  }
}
```

## Monitoring & Analytics

### 1. Socket.IO Metrics

```typescript
// server/middleware/metrics.ts
import { Server } from "socket.io";

export function setupMetrics(io: Server) {
  const metrics = {
    connections: 0,
    messagesPerMinute: 0,
    roomCounts: new Map(),
    errors: 0,
  };

  io.on("connection", (socket) => {
    metrics.connections++;

    socket.on("disconnect", () => {
      metrics.connections--;
    });

    socket.onAny((eventName, ...args) => {
      metrics.messagesPerMinute++;
    });

    socket.on("error", (error) => {
      metrics.errors++;
      console.error("Socket error:", error);
    });
  });

  // Expose metrics endpoint
  setInterval(() => {
    console.log("Real-time Metrics:", {
      activeConnections: metrics.connections,
      rooms: io.sockets.adapter.rooms.size,
      messagesPerMinute: metrics.messagesPerMinute,
    });

    // Reset minute counter
    metrics.messagesPerMinute = 0;
  }, 60000);

  return metrics;
}
```

### 2. Client-side Analytics

```typescript
// client/hooks/useRealtimeAnalytics.ts
import { useEffect, useState } from "react";
import { useEnhancedSocket } from "./useEnhancedRealtime";

export function useRealtimeAnalytics() {
  const { socket, connectionState } = useEnhancedSocket();
  const [metrics, setMetrics] = useState({
    connectionTime: 0,
    messagesReceived: 0,
    latency: 0,
    reconnections: 0,
  });

  useEffect(() => {
    if (!socket) return;

    const startTime = Date.now();
    let messageCount = 0;

    // Track messages
    socket.onAny(() => {
      messageCount++;
      setMetrics((prev) => ({ ...prev, messagesReceived: messageCount }));
    });

    // Measure latency
    const pingInterval = setInterval(() => {
      const pingStart = Date.now();
      socket.emit("ping", pingStart);

      socket.once("pong", (timestamp: number) => {
        const latency = Date.now() - timestamp;
        setMetrics((prev) => ({ ...prev, latency }));
      });
    }, 10000);

    // Track connection time
    if (connectionState === "connected") {
      setMetrics((prev) => ({
        ...prev,
        connectionTime: Date.now() - startTime,
      }));
    }

    return () => {
      clearInterval(pingInterval);
    };
  }, [socket, connectionState]);

  return metrics;
}
```

### 3. Performance Monitoring

```typescript
// client/lib/performance-monitor.ts
export class RealtimePerformanceMonitor {
  private observer: PerformanceObserver;

  constructor() {
    if ("PerformanceObserver" in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes("socket.io")) {
            console.log("Socket.IO Performance:", entry);
          }
        }
      });

      this.observer.observe({ entryTypes: ["measure", "navigation"] });
    }
  }

  markSocketEvent(eventName: string) {
    performance.mark(`socket-${eventName}-start`);
  }

  measureSocketEvent(eventName: string) {
    performance.mark(`socket-${eventName}-end`);
    performance.measure(
      `socket-${eventName}`,
      `socket-${eventName}-start`,
      `socket-${eventName}-end`,
    );
  }
}
```

## Security Configuration

### 1. Authentication Middleware

```typescript
// server/middleware/auth.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export function setupAuth(io: Server) {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.user = decoded;

      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });
}
```

### 2. Rate Limiting

```typescript
// server/middleware/rate-limit.ts
const rateLimits = new Map();

export function rateLimitMiddleware(socket: Socket, next: Function) {
  const clientId = socket.id;
  const now = Date.now();
  const limit = rateLimits.get(clientId) || { count: 0, reset: now + 60000 };

  if (now > limit.reset) {
    limit.count = 0;
    limit.reset = now + 60000;
  }

  if (limit.count >= 100) {
    // 100 events per minute
    return next(new Error("Rate limit exceeded"));
  }

  limit.count++;
  rateLimits.set(clientId, limit);
  next();
}
```

### 3. CORS Configuration

```typescript
// server/index.ts
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-domain.com", "https://www.your-domain.com"]
    : ["http://localhost:8081", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**

   ```bash
   # Check if backend server is running
   curl http://localhost:3000/health

   # Check Socket.IO endpoint
   curl http://localhost:3000/socket.io/
   ```

2. **CORS Errors**

   ```typescript
   // Verify CORS configuration in server/index.ts
   // Check allowed origins match client URL
   ```

3. **Memory Leaks**

   ```typescript
   // Ensure proper cleanup in useEffect
   useEffect(() => {
     return () => {
       socket?.off(); // Remove all listeners
     };
   }, []);
   ```

4. **React 19 Issues**

   ```bash
   # Verify React 19 installation
   pnpm list react react-dom

   # Check for concurrent features
   # Ensure useSyncExternalStore is used for external state
   ```

### Debug Mode

Enable comprehensive debugging:

```bash
# Client-side
localStorage.debug = 'socket.io-client:*';

# Server-side
DEBUG=socket.io:* node server/index.js
```

### Health Check Endpoints

```typescript
// server/routes/health.ts
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    socketConnections: io.sockets.sockets.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get("/health/realtime", (req, res) => {
  res.json({
    status: "healthy",
    activeConnections: io.sockets.sockets.size,
    rooms: io.sockets.adapter.rooms.size,
    timestamp: new Date().toISOString(),
  });
});
```

## Next Steps After Installation

1. **Run Test Suite**: Execute comprehensive testing guide
2. **Configure Monitoring**: Set up metrics collection
3. **Deploy to Staging**: Test in production-like environment
4. **Performance Optimization**: Monitor and optimize real-time features
5. **Scale Horizontally**: Configure Redis adapter for multiple servers
6. **Security Audit**: Review authentication and rate limiting
7. **Documentation**: Update API documentation with real-time endpoints

## Success Checklist

✅ **Dependencies installed** and versions verified  
✅ **Environment variables** configured for dev/prod  
✅ **Development servers** running on correct ports  
✅ **Socket.IO connection** established successfully  
✅ **React 19 hooks** integrated with useSyncExternalStore  
✅ **TypeScript types** properly defined and imported  
✅ **CORS configuration** allowing client connections  
✅ **Authentication** middleware configured  
✅ **Rate limiting** implemented  
✅ **Monitoring** and metrics collection set up  
✅ **Error handling** and reconnection logic working  
✅ **Performance** optimized for production loads

**Phase 3 Real-time Enhancement is now complete and ready for production deployment! 🚀**
