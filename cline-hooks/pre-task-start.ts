#!/usr/bin/env tsx
/**
 * Pre-Task Start Hook
 * Executes before any Cline task begins
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/pre-task-start.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface TaskContext {
  taskDescription: string;
  workspacePath: string;
  timestamp: string;
}

function getGitStatus(): string {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf-8" });
    return status.trim() || "Clean";
  } catch {
    return "Not a git repository";
  }
}

function checkEnvironment(): void {
  const requiredEnvVars = ["NODE_ENV"];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.log(`⚠️  Missing env vars: ${missing.join(", ")}`);
  }
}

function logTaskStart(context: TaskContext): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "task-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push({
    type: "task_start",
    ...context,
    gitStatus: getGitStatus(),
  });

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
  const context: TaskContext = {
    taskDescription: process.argv[2] || "Unknown task",
    workspacePath: process.cwd(),
    timestamp: new Date().toISOString(),
  };

  console.log("🔧 Cline Pre-Task Start Hook");
  console.log("============================");
  console.log(`📁 Workspace: ${context.workspacePath}`);
  console.log(`📝 Task: ${context.taskDescription}`);
  console.log(`🕐 Time: ${context.timestamp}`);

  // Check environment
  checkEnvironment();

  // Log task start
  logTaskStart(context);

  // Pre-flight checks
  console.log("\n✅ Pre-task checks complete");
}

main().catch(console.error);
