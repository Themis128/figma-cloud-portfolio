// Load environment variables BEFORE any other imports read process.env.
// This MUST be the first import — ESM evaluates imports in declaration order.
import "./env";

// Main server setup (express config + routes)
import express from "express";
import cors from "cors";
import playwrightAutofix from "./routes/playwrightAutofix";
import resume from "./routes/resume";
import apiKeys from "./routes/apiKeys";
import chat from "./routes/chat";
import booking from "./routes/booking";
import contact from "./routes/contact";
import github from "./routes/github";
import general from "./routes/general";
import admin from "./routes/admin";
import pushNotifications from "./routes/pushNotifications";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
app.disable("x-powered-by");

app.use(express.json());
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
app.use("/api/playwright-autofix", playwrightAutofix);
app.use("/api/resume", resume);
app.use("/api/chat", chat);
app.use("/api/booking", booking);
app.use("/api/contact", contact);
app.use("/api/push-notifications", pushNotifications);
app.use("/api/github", github);

// Protected routes (require Firebase Auth)
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

const server = app.listen(3001, () => console.log("Server running on port 3001"));

// Keep the process alive
server.on("close", () => process.exit(0));
