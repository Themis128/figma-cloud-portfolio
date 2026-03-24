/**
 * Lambda entry point — wraps the Express app with serverless-http.
 *
 * esbuild bundles this into a single index.js for Lambda deployment.
 * All env vars are read from the Lambda environment (no dotenv needed).
 */
import type { APIGatewayProxyEventV2, Context } from "aws-lambda";
import serverless from "serverless-http";
import express from "express";
import compression from "compression";
import cors from "cors";

// Routes
import general from "./routes/general";
import resume from "./routes/resume";
import apiKeys from "./routes/apiKeys";
import chat from "./routes/chat";
import booking from "./routes/booking";
import contact from "./routes/contact";
import pushNotifications from "./routes/pushNotifications";
import github from "./routes/github";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(
  cors({
    origin: [
      "https://www.baltzakisthemis.com",
      "https://baltzakisthemis.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  next();
});

// Public routes
app.use("/api", general);
app.use("/api/resume", resume);
app.use("/api/chat", chat);
app.use("/api/booking", booking);
app.use("/api/contact", contact);
app.use("/api/push-notifications", pushNotifications);
app.use("/api/github", github);

// Protected routes (require Cognito Auth)
app.use("/api/organizations/api_keys", requireAuth, apiKeys);

// 404 for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  next();
  return void 0;
});

// Global error handler — prevents unhandled errors from crashing Lambda
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled server error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Lambda handler
const serverlessApp = serverless(app);

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  // Strip API Gateway stage prefix if present
  if (
    event.rawPath &&
    event.requestContext?.stage &&
    event.requestContext.stage !== "$default"
  ) {
    const stagePrefix = `/${event.requestContext.stage}`;
    if (
      event.rawPath.startsWith(`${stagePrefix}/`) ||
      event.rawPath === stagePrefix
    ) {
      event.rawPath = event.rawPath.slice(stagePrefix.length) || "/";
    }
  }
  return serverlessApp(event, context);
};
