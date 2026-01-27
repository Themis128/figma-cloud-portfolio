import { createServer, initializeSocketIO } from "./index";

const DEFAULT_PORT = 3000;
const app = createServer();
const port = process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT;

const logger = {
  info: (...args: unknown[]) => console.log(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};

logger.info("Starting server...");
logger.info(`Attempting to listen on port ${port}...`);

const server = app.listen(port, () => {
  logger.info(`🚀 Baltzakis Themistoklis API server running on port ${port}`);
  logger.info(`🔧 API: http://localhost:${port}/api`);
  const addr = server.address();
  logger.info(`Server address details:`, JSON.stringify(addr, null, 2));
});

// Initialize Socket.IO
// @ts-expect-error _io is intentionally unused but needed for initialization
const _io = initializeSocketIO(server);
logger.info("🔌 WebSocket server initialized");

server.on("error", (err) => {
  logger.error("Server error:", err);
});

server.on("listening", () => {
  logger.info("Server is now listening!");
});

logger.info("Server setup complete, waiting for connections...");
