#!/usr/bin/env tsx
/**
 * Post-Task Complete Hook
 * Executes after any Cline task completes
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/post-task-complete.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface TaskResult {
  taskDescription: string;
  success: boolean;
  duration: number;
  timestamp: string;
  filesChanged: string[];
}

function getChangedFiles(): string[] {
  try {
    const status = execSync("git diff --name-only HEAD", { encoding: "utf-8" });
    return status
      .trim()
      .split("\n")
      .filter((f) => f);
  } catch {
    return [];
  }
}

function logTaskComplete(result: TaskResult): void {
  const logDir = path.join(process.cwd(), ".cline", "logs");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "task-log.json");
  const logs = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  logs.push({
    type: "task_complete",
    ...result,
    gitStatus:
      execSync("git status --porcelain", { encoding: "utf-8" }).trim() ||
      "Clean",
  });

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

async function main() {
  const result: TaskResult = {
    taskDescription: process.argv[2] || "Unknown task",
    success: process.argv[3] !== "false",
    duration: parseInt(process.argv[4] || "0", 10),
    timestamp: new Date().toISOString(),
    filesChanged: getChangedFiles(),
  };

  console.log("✅ Cline Post-Task Complete Hook");
  console.log("================================");
  console.log(`📝 Task: ${result.taskDescription}`);
  console.log(`⏱️  Duration: ${result.duration}ms`);
  console.log(`📊 Success: ${result.success}`);
  console.log(`📄 Files changed: ${result.filesChanged.length}`);

  if (result.filesChanged.length > 0) {
    console.log("\nChanged files:");
    result.filesChanged.forEach((f) => console.log(`  - ${f}`));
  }

  // Log completion
  logTaskComplete(result);

  // Auto-run tests if enabled
  if (process.env.CLINE_AUTO_TEST === "true" && result.success) {
    console.log("\n🧪 Running tests...");
    try {
      execSync("pnpm test", { stdio: "inherit" });
    } catch {
      console.log("⚠️  Tests failed");
    }
  }

  console.log("\n✅ Post-task actions complete");
}

main().catch(console.error);
