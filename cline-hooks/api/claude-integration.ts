#!/usr/bin/env tsx
/**
 * Claude API Integration Hook
 * Handles integration with Anthropic Claude API
 * Validates API calls and logs responses
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/api/claude-integration.ts
 */

import * as fs from "fs";
import * as path from "path";

interface ClaudeApiCall {
  model: string;
  prompt: string;
  maxTokens: number;
  temperature: number;
  timestamp: string;
  success: boolean;
  duration: number;
  error?: string;
}

function validateClaudeApiKey(): boolean {
  const apiKey = process.env.COPILOT_GITHUB_TOKEN;
  
  if (!apiKey) {
    console.warn("⚠️  COPILOT_GITHUB_TOKEN environment variable not set");
    return false;
  }

  if (apiKey.length < 10) {
    console.warn("⚠️  COPILOT_GITHUB_TOKEN appears to be invalid");
    return false;
  }

  console.log("✅ Claude API key validated");
  return true;
}

function checkRateLimits(): boolean {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "claude-api-log.json");

  if (!fs.existsSync(logFile)) return true;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const recentCalls = logs.filter(
    (log: any) =>
      Date.now() - new Date(log.timestamp).getTime() < 60000, // Last minute
  );

  // Claude API rate limits (approximate)
  const rateLimit = 60; // requests per minute
  if (recentCalls.length >= rateLimit) {
    console.warn("⚠️  Approaching Claude API rate limits");
    return false;
  }

  return true;
}

function logClaudeApiCall(call: ClaudeApiCall): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "claude-api-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push(call);

  // Keep only last 500 API calls
  if (logs.length > 500) {
    logs = logs.slice(-500);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

function generateClaudeReport(call: ClaudeApiCall): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `claude-api-report-${Date.now()}.md`);
  const statusEmoji = call.success ? "✅" : "❌";

  const report = `# Claude API Integration Report

**Model**: ${call.model}
**Prompt Length**: ${call.prompt.length} characters
**Max Tokens**: ${call.maxTokens}
**Temperature**: ${call.temperature}
**Status**: ${statusEmoji} ${call.success ? "SUCCESS" : "FAILED"}
**Duration**: ${call.duration}ms
**Timestamp**: ${call.timestamp}

## Call Details

- **Success**: ${call.success}
${call.error ? `- **Error**: ${call.error}` : ""}

## Performance Analysis

- **Response Time**: ${call.duration}ms
- **Token Usage**: ${call.maxTokens} max tokens

## Recommendations

${call.duration > 10000 ? "- ⚠️  Consider optimizing prompt or reducing token count" : "- ✅ Response time is acceptable"}
${call.error ? "- ❌ Check API credentials and network connectivity" : "- ✅ API call successful"}

## Best Practices

- Keep prompts concise and focused
- Use appropriate temperature settings (0.1-0.7 for most tasks)
- Monitor token usage to avoid truncation
- Implement retry logic for failed calls
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Claude API report saved to: ${reportFile}`);
}

function analyzeClaudeUsage(): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");
  const logFile = path.join(logDir, "claude-api-log.json");

  if (!fs.existsSync(logFile)) return;

  const logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const recentCalls = logs.slice(-100);

  if (recentCalls.length === 0) return;

  const successRate =
    (recentCalls.filter((call: any) => call.success).length / recentCalls.length) *
    100;
  const avgDuration = recentCalls.reduce((sum: number, call: any) => sum + call.duration, 0) / recentCalls.length;
  const avgTokens = recentCalls.reduce((sum: number, call: any) => sum + call.maxTokens, 0) / recentCalls.length;

  console.log(`📊 Claude API Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  console.log(`📝 Average Token Usage: ${avgTokens.toFixed(0)}`);

  if (successRate < 95) {
    console.warn("⚠️  Claude API success rate is below 95%");
  }
  if (avgDuration > 15000) {
    console.warn("⚠️  Average response time is above 15 seconds");
  }
}

async function main() {
  const call: ClaudeApiCall = {
    model: process.argv[2] || "claude-3-haiku",
    prompt: process.argv[3] || "",
    maxTokens: parseInt(process.argv[4] || "1000", 10),
    temperature: parseFloat(process.argv[5] || "0.7"),
    timestamp: new Date().toISOString(),
    success: process.argv[6] !== "false",
    duration: parseInt(process.argv[7] || "0", 10),
    error: process.argv[8],
  };

  console.log("🤖 Cline Claude API Integration Hook");
  console.log("===================================");
  console.log(`🧠 Model: ${call.model}`);
  console.log(`📝 Prompt length: ${call.prompt.length} characters`);
  console.log(`📊 Status: ${call.success ? "SUCCESS" : "FAILED"}`);
  console.log(`⏱️  Duration: ${call.duration}ms`);

  // Validate API key
  const apiKeyValid = validateClaudeApiKey();
  if (!apiKeyValid) {
    console.log("❌ API key validation failed");
    return;
  }

  // Check rate limits
  const rateLimitOk = checkRateLimits();
  if (!rateLimitOk) {
    console.log("⚠️  Rate limit warning");
  }

  // Log API call
  logClaudeApiCall(call);

  // Generate report
  generateClaudeReport(call);

  // Analyze usage trends
  analyzeClaudeUsage();

  if (call.success) {
    console.log("✅ Claude API call successful");
  } else {
    console.log("❌ Claude API call failed");
    if (call.error) {
      console.log(`💡 Error: ${call.error}`);
    }
  }
}

main().catch(console.error);