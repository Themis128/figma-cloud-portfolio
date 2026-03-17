// General utility API routes — ping, health, search, webhook, monitor, docs, upload
import { Router, Request, Response } from "express";

const router = Router();

const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;

// Middleware to count requests
router.use((_req, _res, next) => {
  requestCount++;
  next();
});

// GET /api/ping
router.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: process.env.PING_MESSAGE ?? "ping_pong" });
});

// GET /api/health
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? "development",
    memory: `${Math.round(process.memoryUsage().heapUsed / (1024 * 1024))}MB`,
  });
});

// GET /api/search — search portfolio content
router.get("/search", (req: Request, res: Response) => {
  const rawQ = req.query.q;
  const query = typeof rawQ === "string" ? rawQ.toLowerCase() : "";

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required", results: [] });
  }

  // Portfolio content searchable index
  const content = [
    { title: "Cloud Architecture", type: "skill", description: "AWS, Azure, multi-cloud environments and migration strategies" },
    { title: "Cybersecurity", type: "skill", description: "Zero-trust security, CyberArk PAM, Microsoft Sentinel, CISSP" },
    { title: "Full-Stack Development", type: "skill", description: "React, Next.js, TypeScript, Node.js, Python" },
    { title: "DevOps & Infrastructure", type: "skill", description: "Cisco ACI/UCS, VMware vSphere, CI/CD pipelines" },
    { title: "About Themistoklis", type: "page", description: "Cloud Architect & Cybersecurity Specialist with 15+ years IT expertise" },
    { title: "Contact", type: "page", description: "Get in touch for consulting, collaboration, or career opportunities" },
    { title: "Performance", type: "page", description: "Live web performance metrics and optimization showcase" },
    { title: "AI Agents", type: "page", description: "AI agent templates and workflow builder" },
    { title: "Estarta Solutions", type: "experience", description: "Systems and Network Engineer — Cisco UCS, HyperFlex, ACI" },
    { title: "Cosmos Business Systems", type: "experience", description: "IT Support Engineer — Azure AD, Microsoft 365, Intune" },
  ];

  const results = content.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query),
  );

  return res.json({ results, query, total: results.length });
});

// POST /api/webhook — generic webhook handler
router.post("/webhook", (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const event = typeof body.event === "string" ? body.event : "";

  if (!event) {
    return res.status(400).json({ error: "Event type is required" });
  }

  console.log("Webhook received: %s %o", event, body.data);

  return res.json({
    status: "received",
    event,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/monitor — server monitoring data
router.get("/monitor", (_req: Request, res: Response) => {
  const uptimeMs = Date.now() - startTime;

  res.json({
    requests: requestCount,
    errors: errorCount,
    uptime: Math.round(uptimeMs / 1000),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      heapTotal: Math.round(process.memoryUsage().heapTotal / (1024 * 1024)),
      rss: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/docs — API documentation
router.get("/docs", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html>
<head><title>API Documentation</title></head>
<body>
<h1>API Documentation</h1>
<h2>Endpoints</h2>
<ul>
  <li><strong>GET /api/ping</strong> — Health check ping</li>
  <li><strong>GET /api/health</strong> — Detailed health status</li>
  <li><strong>GET /api/github/stats</strong> — GitHub profile statistics</li>
  <li><strong>GET /api/github/repos</strong> — Public repositories (supports ?page=&limit=)</li>
  <li><strong>POST /api/contact</strong> — Submit contact form</li>
  <li><strong>POST /api/chat</strong> — AI chat (SSE streaming)</li>
  <li><strong>GET /api/booking/slots</strong> — Available booking slots</li>
  <li><strong>POST /api/booking/create</strong> — Create a booking</li>
  <li><strong>GET /api/resume/download</strong> — Download resume PDF</li>
  <li><strong>GET /api/resume/generate</strong> — Generate resume data</li>
  <li><strong>GET /api/search?q=</strong> — Search portfolio content</li>
  <li><strong>POST /api/webhook</strong> — Webhook receiver</li>
  <li><strong>GET /api/monitor</strong> — Server monitoring</li>
  <li><strong>GET /api/docs</strong> — This documentation</li>
  <li><strong>POST /api/upload</strong> — File upload</li>
  <li><strong>GET /api/push-notifications?action=subscriptions</strong> — Push notification subscriptions</li>
  <li><strong>GET /api/admin/stats</strong> — Admin statistics (requires auth)</li>
</ul>
</body>
</html>`);
});

// POST /api/upload — file upload handler
router.post("/upload", (req: Request, res: Response) => {
  const contentLength = parseInt(req.headers["content-length"] ?? "0", 10);
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (contentLength > MAX_SIZE) {
    return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
  }

  // Accept the upload
  return res.json({
    success: true,
    message: "File uploaded successfully",
    size: contentLength,
    timestamp: new Date().toISOString(),
  });
});

// Error counter middleware
router.use((err: Error, _req: Request, res: Response, next: Function) => {
  errorCount++;
  next(err);
});

export default router;
