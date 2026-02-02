// @ts-check
/// <reference types="node" />

import path from "node:path";
import * as express from "express";
import { createServer, initializeSocketIO } from "./index";

const DEFAULT_PORT = 3002; // Using 3002 to match CI configuration
const HTTP_STATUS_NOT_FOUND = 404;

const app = createServer();
const port = process.env.PORT || DEFAULT_PORT;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../dist/spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("/{*splat}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(HTTP_STATUS_NOT_FOUND).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
  return undefined;
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Initialize Socket.IO
const _io = initializeSocketIO(server);
void _io; // Mark as intentionally unused

// Graceful shutdown
process.on("SIGTERM", () => {
  process.exit(0);
});

process.on("SIGINT", () => {
  process.exit(0);
});
