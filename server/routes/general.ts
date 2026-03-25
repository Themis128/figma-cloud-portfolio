// General utility API routes — ping, health, search, webhook, monitor, docs, upload
import { Router, Request, Response, NextFunction } from "express";

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

// GET /api/docs — API documentation (JSON)
router.get("/docs", (_req: Request, res: Response) => {
  res.json({
    name: "Portfolio API",
    version: "1.0.0",
    endpoints: [
      { method: "GET", path: "/api/ping", description: "Health check ping" },
      { method: "GET", path: "/api/health", description: "Detailed health status" },
      { method: "GET", path: "/api/search?q=", description: "Search portfolio content" },
      { method: "GET", path: "/api/monitor", description: "Server monitoring data" },
      { method: "POST", path: "/api/webhook", description: "Webhook receiver" },
      { method: "GET", path: "/api/docs", description: "This documentation" },
      { method: "GET", path: "/api/github/stats", description: "GitHub profile statistics" },
      { method: "GET", path: "/api/github/repos", description: "Public repositories" },
      { method: "POST", path: "/api/contact", description: "Submit contact form" },
      { method: "POST", path: "/api/chat", description: "AI chat (SSE streaming)" },
      { method: "GET", path: "/api/booking/slots", description: "Available booking slots" },
      { method: "POST", path: "/api/booking/create", description: "Create a booking" },
      { method: "GET", path: "/api/resume/download", description: "Download resume PDF" },
      { method: "GET", path: "/api/resume/generate", description: "Generate resume data" },
      { method: "GET/PUT/POST/DELETE", path: "/api/push-notifications", description: "Push notification management" },
      { method: "GET/POST/DELETE", path: "/api/organizations/api_keys", description: "API key management (auth required)" },
    ],
  });
});

// Error counter middleware
router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  errorCount++;
  next(err);
});

export default router;
