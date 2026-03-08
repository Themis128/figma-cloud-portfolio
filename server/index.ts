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
import { requireAuth } from "./middleware/requireAuth";

const app = express();

app.use(express.json());
app.use(cors());

// Public routes
app.use("/api", general);
app.use("/api/playwright-autofix", playwrightAutofix);
app.use("/api/resume", resume);
app.use("/api/chat", chat);
app.use("/api/booking", booking);
app.use("/api/contact", contact);
app.use("/api/github", github);

// Protected routes (require Firebase Auth)
app.use("/api/organizations/api_keys", requireAuth, apiKeys);
app.use("/api/admin", requireAuth, admin);

app.get("/", (_req, res) => res.send("API Root"));

const server = app.listen(3001, () => console.log("Server running on port 3001"));

// Keep the process alive
server.on("close", () => process.exit(0));
