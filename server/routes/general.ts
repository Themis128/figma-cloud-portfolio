// General utility API routes — ping, health, search, webhook, monitor, docs, upload
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { Router, Request, Response, NextFunction } from "express";
import searchIndex from "../data/search-index.json" with { type: "json" };

const router = Router();

const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;

const awsRegion = process.env.AWS_REGION ?? "us-east-1";
const uptimeLambdaFunctionName =
  process.env.UPTIME_LAMBDA_FUNCTION_NAME ?? process.env.AWS_LAMBDA_FUNCTION_NAME ?? "";

const cloudWatchClient = uptimeLambdaFunctionName
  ? new CloudWatchClient({ region: awsRegion })
  : null;

interface AwsUptimeSummary {
  source: "aws-cloudwatch";
  functionName: string;
  region: string;
  windowHours: number;
  availabilityPercent: number;
  invocations: number;
  errors: number;
}

function sumMetricValues(values: number[] | undefined): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0);
}

async function getAwsUptimeSummary(): Promise<AwsUptimeSummary | null> {
  if (!cloudWatchClient || !uptimeLambdaFunctionName) {
    return null;
  }

  const endTime = new Date();
  const start = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  try {
    const command = new GetMetricDataCommand({
      StartTime: start,
      EndTime: endTime,
      MetricDataQueries: [
        {
          Id: "invocations",
          MetricStat: {
            Metric: {
              Namespace: "AWS/Lambda",
              MetricName: "Invocations",
              Dimensions: [{ Name: "FunctionName", Value: uptimeLambdaFunctionName }],
            },
            Period: 3600,
            Stat: "Sum",
          },
          ReturnData: true,
        },
        {
          Id: "errors",
          MetricStat: {
            Metric: {
              Namespace: "AWS/Lambda",
              MetricName: "Errors",
              Dimensions: [{ Name: "FunctionName", Value: uptimeLambdaFunctionName }],
            },
            Period: 3600,
            Stat: "Sum",
          },
          ReturnData: true,
        },
      ],
      ScanBy: "TimestampAscending",
    });

    const data = await cloudWatchClient.send(command);
    const invocationsResult = data.MetricDataResults?.find((entry) => entry.Id === "invocations");
    const errorsResult = data.MetricDataResults?.find((entry) => entry.Id === "errors");

    const invocations = Math.max(0, Math.round(sumMetricValues(invocationsResult?.Values)));
    const errors = Math.max(0, Math.round(sumMetricValues(errorsResult?.Values)));

    if (invocations === 0) {
      return {
        source: "aws-cloudwatch",
        functionName: uptimeLambdaFunctionName,
        region: awsRegion,
        windowHours: 24,
        availabilityPercent: 100,
        invocations,
        errors,
      };
    }

    const availabilityPercent = Math.max(0, Math.min(100, ((invocations - errors) / invocations) * 100));

    return {
      source: "aws-cloudwatch",
      functionName: uptimeLambdaFunctionName,
      region: awsRegion,
      windowHours: 24,
      availabilityPercent: Math.round(availabilityPercent * 100) / 100,
      invocations,
      errors,
    };
  } catch (error) {
    console.warn("CloudWatch uptime summary unavailable:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

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

// GET /api/uptime/summary — 24h uptime summary from CloudWatch when available
router.get("/uptime/summary", async (_req: Request, res: Response) => {
  const aws = await getAwsUptimeSummary();

  return res.json({
    source: aws ? "aws-cloudwatch" : "local",
    aws,
    local: {
      processUptimeSeconds: Math.round(process.uptime()),
      note: aws
        ? "CloudWatch availability is active."
        : "CloudWatch not configured; showing process uptime only.",
    },
  });
});

// GET /api/search — search portfolio content
router.get("/search", (req: Request, res: Response) => {
  const rawQ = req.query.q;
  const query = typeof rawQ === "string" ? rawQ.toLowerCase() : "";

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required", results: [] });
  }

  const content = searchIndex;

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

  // Sanitize event name for logging (prevent log injection via newlines/control chars)
  const safeEvent = event.replace(/[\n\r\t]/g, "").slice(0, 100);
  console.log("Webhook received:", safeEvent);

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
      { method: "GET", path: "/api/uptime/summary", description: "24h uptime summary via AWS CloudWatch" },
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
