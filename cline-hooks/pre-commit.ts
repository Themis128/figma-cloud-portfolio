#!/usr/bin/env tsx
/**
 * Pre-Commit Hook
 * Executes before code is committed to git
 * Runs linting, type checking, and basic tests
 *
 * Usage: Run automatically by Cline or manually via: npx tsx cline-hooks/pre-commit.ts
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface CommitContext {
  filesToCommit: string[];
  commitMessage: string;
  timestamp: string;
}

function runLinting(): boolean {
  try {
    console.log("🔍 Running ESLint...");
    execSync("pnpm lint", { stdio: "inherit" });
    console.log("✅ ESLint passed");
    return true;
  } catch (error) {
    console.error("❌ ESLint failed");
    return false;
  }
}

function runTypeCheck(): boolean {
  try {
    console.log("🔍 Running TypeScript type check...");
    execSync("pnpm typecheck", { stdio: "inherit" });
    console.log("✅ TypeScript check passed");
    return true;
  } catch (error) {
    console.error("❌ TypeScript check failed");
    return false;
  }
}

function runQuickTests(): boolean {
  try {
    console.log("🧪 Running quick tests...");
    execSync("pnpm test --run --reporter=verbose", { stdio: "inherit" });
    console.log("✅ Quick tests passed");
    return true;
  } catch (error) {
    console.error("❌ Quick tests failed");
    return false;
  }
}

function checkSecurity(): boolean {
  try {
    console.log("🔒 Running security audit...");
    execSync("pnpm audit", { stdio: "inherit" });
    console.log("✅ Security audit passed");
    return true;
  } catch (error) {
    console.error("❌ Security audit failed");
    return false;
  }
}

function validateCommitMessage(message: string): boolean {
  const prohibitedPatterns = [
    /^(fix|feat|chore|docs|style|refactor|test|build|ci|perf|revert):\s/i,
  ];

  if (!prohibitedPatterns.some((pattern) => pattern.test(message))) {
    console.warn("⚠️  Consider using conventional commit format: type(scope): description");
    return true; // Allow but warn
  }

  return true;
}

async function main() {
  const context: CommitContext = {
    filesToCommit: process.argv.slice(2),
    commitMessage: process.argv[2] || "",
    timestamp: new Date().toISOString(),
  };

  console.log("🔧 Cline Pre-Commit Hook");
  console.log("=======================");
  console.log(`📝 Commit message: ${context.commitMessage}`);
  console.log(`📄 Files to commit: ${context.filesToCommit.length}`);

  // Validate commit message
  if (!validateCommitMessage(context.commitMessage)) {
    process.exit(1);
  }

  // Run checks
  const checks = [
    { name: "Linting", fn: runLinting },
    { name: "Type Check", fn: runTypeCheck },
    { name: "Quick Tests", fn: runQuickTests },
    { name: "Security Audit", fn: checkSecurity },
  ];

  let allPassed = true;

  for (const check of checks) {
    console.log(`\n${check.name}...`);
    const passed = await check.fn();
    if (!passed) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    console.log("\n✅ All pre-commit checks passed!");
  } else {
    console.log("\n❌ Pre-commit checks failed. Commit aborted.");
    process.exit(1);
  }
}

main().catch(console.error);