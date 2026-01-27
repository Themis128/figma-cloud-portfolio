import * as express from "express";
import path from "node:path";
import { createServer, initializeSocketIO } from "./index";

const app = createServer();
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../dist/spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("/{*splat}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
  return undefined;
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  if (process.env.NODE_ENV === "production") {
  }
});

// Initialize Socket.IO
// @ts-expect-error _io is intentionally unused but needed for initialization
const _io = initializeSocketIO(server);

// Graceful shutdown
process.on("SIGTERM", () => {
  process.exit(0);
});

process.on("SIGINT", () => {
  process.exit(0);
});
