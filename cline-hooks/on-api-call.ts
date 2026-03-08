#!/usr/bin/env tsx
/**
 * On-API Call Hook
 * Executes during API integration events
 * Validates API calls and logs responses
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/on-api-call.ts
 */

import * as fs from "fs";
import * as path from "path";

interface ApiCallContext {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

function validateApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) {
    console.warn("⚠️  API key appears to be invalid or missing");
    return false;
  }
  return true;
}

function validateNextApiEndpoint(endpoint: string): boolean {
  // Check for Next.js API route patterns
  const nextApiPattern = /^\/api\//;
  if (!nextApiPattern.test(endpoint)) {
    console.warn("⚠️  Endpoint doesn't follow Next.js API route pattern (/api/...)");
    return false;
  }
  return true;
}

function checkNextApiRateLimit(endpoint: string): boolean {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "next-api-log.json");

  if (!fs.existsSync(logFile)) return true;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const recentCalls = logs.filter(
    (log: any) =>
      log.endpoint === endpoint &&
      Date.now() - new Date(log.timestamp).getTime() < 60000, // Last minute
  );

  // Next.js API routes typically have lower rate limits
  if (recentCalls.length > 5) {
    console.warn("⚠️  High Next.js API call frequency detected");
    return false;
  }

  return true;
}

function checkRateLimit(endpoint: string, method: string): boolean {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "api-log.json");

  if (!fs.existsSync(logFile)) return true;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const recentCalls = logs.filter(
    (log: any) =>
      log.endpoint === endpoint &&
      log.method === method &&
      Date.now() - new Date(log.timestamp).getTime() < 60000, // Last minute
  );

  if (recentCalls.length > 10) {
    console.warn("⚠️  High API call frequency detected");
    return false;
  }

  return true;
}

function logApiCall(context: ApiCallContext): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "api-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push(context);

  // Keep only last 1000 API calls
  if (logs.length > 1000) {
    logs = logs.slice(-1000);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

  // Also log Next.js API calls separately
  if (context.endpoint.startsWith("/api/")) {
    const nextApiLogFile = path.join(logDir, "next-api-log.json");
    const nextLogs = fs.existsSync(nextApiLogFile)
      ? JSON.parse(fs.readFileSync(nextApiLogFile, "utf-8"))
      : [];
    
    nextLogs.push(context);
    
    // Keep only last 500 Next.js API calls
    if (nextLogs.length > 500) {
      nextLogs = nextLogs.slice(-500);
    }
    
    fs.writeFileSync(nextApiLogFile, JSON.stringify(nextLogs, null, 2));
  }
}

function generateApiReport(context: ApiCallContext): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `api-report-${Date.now()}.md`);
  const statusEmoji = context.success ? "✅" : "❌";
  const isNextApi = context.endpoint.startsWith("/api/");

  const report = `# API Call Report

**Endpoint**: ${context.endpoint}
**Method**: ${context.method}
**Status**: ${statusEmoji} ${context.status}
**Duration**: ${context.duration}ms
**Timestamp**: ${context.timestamp}
**Type**: ${isNextApi ? "Next.js API Route" : "External API"}

## Call Details

- **Success**: ${context.success}
${context.error ? `- **Error**: ${context.error}` : ""}

## Performance Analysis

- **Response Time**: ${context.duration}ms
- **Status Code**: ${context.status}

## Recommendations

${context.duration > 5000 ? "- ⚠️  Consider optimizing slow API calls" : "- ✅ Response time is acceptable"}
${context.status >= 400 ? "- ❌ Check API endpoint and credentials" : "- ✅ API call successful"}

${isNextApi ? `
## Next.js API Route Specific

- ✅ Follows Next.js API route pattern
- ⚠️  Monitor for rate limiting (lower limits than external APIs)
- 💡 Consider implementing caching for expensive operations
- 💡 Use proper error handling with try-catch blocks
` : ""}
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 API report saved to: ${reportFile}`);
}

function analyzeApiTrends(): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "api-log.json");
  const nextApiLogFile = path.join(logDir, "next-api-log.json");

  if (!fs.existsSync(logFile)) return;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const nextLogs = fs.existsSync(nextApiLogFile) 
    ? JSON.parse(fs.readFileSync(nextApiLogFile, "utf-8"))
    : [];
  
  const recentCalls = logs.slice(-100);
  const recentNextCalls = nextLogs.slice(-50);

  if (recentCalls.length === 0) return;

  const successRate =
    (recentCalls.filter((call: any) => call.success).length / recentCalls.length) *
    100;
  const avgDuration = recentCalls.reduce((sum: number, call: any) => sum + call.duration, 0) / recentCalls.length;

  console.log(`📊 Overall API Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);

  if (recentNextCalls.length > 0) {
    const nextSuccessRate =
      (recentNextCalls.filter((call: any) => call.success).length / recentNextCalls.length) *
      100;
    const nextAvgDuration = recentNextCalls.reduce((sum: number, call: any) => sum + call.duration, 0) / recentNextCalls.length;
    
    console.log(`🌐 Next.js API Success Rate: ${nextSuccessRate.toFixed(1)}%`);
    console.log(`⏱️  Next.js API Average Response Time: ${nextAvgDuration.toFixed(0)}ms`);
  }

  if (successRate < 95) {
    console.warn("⚠️  API success rate is below 95%");
  }
  if (avgDuration > 3000) {
    console.warn("⚠️  Average response time is above 3 seconds");
  }
}

async function main() {
  const context: ApiCallContext = {
    endpoint: process.argv[2] || "unknown",
    method: process.argv[3] || "GET",
    status: parseInt(process.argv[4] || "0", 10),
    duration: parseInt(process.argv[5] || "0", 10),
    timestamp: new Date().toISOString(),
    success: process.argv[6] !== "false",
    error: process.argv[7],
  };

  console.log("🌐 Cline On-API Call Hook");
  console.log("========================");
  console.log(`📡 Endpoint: ${context.endpoint}`);
  console.log(`📡 Method: ${context.method}`);
  console.log(`📊 Status: ${context.status}`);
  console.log(`⏱️  Duration: ${context.duration}ms`);

  // Validate Next.js API endpoints
  if (context.endpoint.startsWith("/api/")) {
    const isValid = validateNextApiEndpoint(context.endpoint);
    const rateLimitOk = checkNextApiRateLimit(context.endpoint);
    
    if (!isValid || !rateLimitOk) {
      console.log("⚠️  Next.js API validation issues detected");
    }
  }

  // Log API call
  logApiCall(context);

  // Generate report
  generateApiReport(context);

  // Analyze trends
  analyzeApiTrends();

  if (context.success) {
    console.log("✅ API call successful");
  } else {
    console.log("❌ API call failed");
    if (context.error) {
      console.log(`💡 Error: ${context.error}`);
    }
  }
}

main().catch(console.error);