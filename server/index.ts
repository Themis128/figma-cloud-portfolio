// Load environment variables BEFORE any other imports read process.env.
// This MUST be the first import — ESM evaluates imports in declaration order.
import "./env";

// Main server setup (express config + routes)
import express from "express";
import cors from "cors";
import resume from "./routes/resume";
import apiKeys from "./routes/apiKeys";
import chat from "./routes/chat";
import booking from "./routes/booking";
import contact from "./routes/contact";
import github from "./routes/github";
import general from "./routes/general";
import admin from "./routes/admin";
import crux from "./routes/crux";
import pushNotifications from "./routes/pushNotifications";
import rateLimit from "express-rate-limit";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
app.disable("x-powered-by");

// Global rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use(limiter);

app.use(express.json({ limit: "50kb" }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://www.baltzakisthemis.com",
            "https://baltzakisthemis.com",
          ]
        : true, // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Public routes
app.use("/api", general);
app.use("/api/resume", resume);
app.use("/api/chat", chat);
app.use("/api/booking", booking);
app.use("/api/contact", contact);
app.use("/api/push-notifications", pushNotifications);
app.use("/api/github", github);
app.use("/api/crux", crux);

// Protected routes (require Cognito Auth)
app.use("/api/organizations/api_keys", requireAuth, apiKeys);
app.use("/api/admin", requireAuth, admin);

app.get("/", (_req, res) => res.send("API Root"));

// Global error handler — prevents unhandled errors from crashing the server
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

const PORT = Number(process.env.PORT) || 3001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep the process alive
server.on("close", () => process.exit(0));
