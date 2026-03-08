#!/usr/bin/env tsx
/**
 * On-Error Hook
 * Executes when an error occurs during Cline execution
 * Provides error analysis and recovery suggestions
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/on-error.ts
 */

import * as fs from "fs";
import * as path from "path";

interface ErrorContext {
  error: string;
  stack?: string;
  task?: string;
  timestamp: string;
  workspacePath: string;
}

function analyzeError(error: string): string[] {
  const suggestions: string[] = [];

  // Common error patterns and suggestions
  const patterns = [
    {
      pattern: /Module not found/,
      suggestion: "Check if the required package is installed: pnpm install",
    },
    {
      pattern: /Cannot find module/,
      suggestion: "Verify the import path is correct and module exists",
    },
    {
      pattern: /TypeScript error/,
      suggestion: "Run pnpm typecheck to identify TypeScript issues",
    },
    {
      pattern: /Permission denied/,
      suggestion: "Check file permissions and ensure write access",
    },
    {
      pattern: /Network error/,
      suggestion: "Check internet connection and API availability",
    },
    {
      pattern: /Syntax error/,
      suggestion: "Review the code for syntax issues and formatting",
    },
  ];

  for (const { pattern, suggestion } of patterns) {
    if (pattern.test(error)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions;
}

function logError(context: ErrorContext): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "error-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push(context);

  // Keep only last 100 errors
  if (logs.length > 100) {
    logs = logs.slice(-100);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

function generateErrorReport(context: ErrorContext): void {
  const reportDir = path.join(process.cwd(), ".cline", "reports");

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `error-report-${Date.now()}.md`);
  const suggestions = analyzeError(context.error);

  const report = `# Error Report

**Timestamp**: ${context.timestamp}
**Task**: ${context.task || "Unknown"}
**Error**: ${context.error}

## Suggestions

${suggestions.length > 0 ? suggestions.map(s => `- ${s}`).join('\n') : 'No specific suggestions available'}

## Stack Trace

\`\`\`
${context.stack || "No stack trace available"}
\`\`\`

## Next Steps

1. Review the error message above
2. Check the suggestions for potential fixes
3. Run \`pnpm lint\` and \`pnpm typecheck\` to identify issues
4. If the error persists, check the full logs in .cline/logs/
`;

  fs.writeFileSync(reportFile, report);
  console.log(`📄 Error report saved to: ${reportFile}`);
}

function checkEnvironment(): void {
  console.log("\n🔍 Environment Check:");

  // Check Node.js version
  console.log(`Node.js: ${process.version}`);

  // Check if pnpm is available
  try {
    const pnpmVersion = require("child_process")
      .execSync("pnpm --version", { encoding: "utf-8" })
      .trim();
    console.log(`pnpm: ${pnpmVersion}`);
  } catch {
    console.log("pnpm: Not available");
  }

  // Check workspace structure
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "pnpm-lock.yaml",
    "next.config.ts",
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`${file}: ${exists ? "✅" : "❌"}`);
  }
}

async function main() {
  const context: ErrorContext = {
    error: process.argv[2] || "Unknown error",
    stack: process.argv[3],
    task: process.argv[4],
    timestamp: new Date().toISOString(),
    workspacePath: process.cwd(),
  };

  console.log("🚨 Cline On-Error Hook");
  console.log("====================");
  console.log(`❌ Error: ${context.error}`);

  if (context.task) {
    console.log(`📝 Task: ${context.task}`);
  }

  // Log error
  logError(context);

  // Generate report
  generateErrorReport(context);

  // Analyze error and provide suggestions
  const suggestions = analyzeError(context.error);
  if (suggestions.length > 0) {
    console.log("\n💡 Suggestions:");
    suggestions.forEach((s) => console.log(`  - ${s}`));
  }

  // Check environment
  checkEnvironment();

  console.log("\n📋 Error handling complete");
  console.log("💡 You can find detailed reports in .cline/reports/");
}

main().catch(console.error);