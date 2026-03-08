// Admin API routes — protected with Firebase Auth
import { Router, Request, Response } from "express";

const router = Router();

const startTime = Date.now();

// GET /api/admin/stats — admin dashboard statistics
router.get("/stats", (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;

  res.json({
    uptime: Math.round(uptimeMs / 1000),
    environment: process.env.NODE_ENV ?? "development",
    nodeVersion: process.version,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)),
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
