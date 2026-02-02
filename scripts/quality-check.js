#!/usr/bin/env node

/* eslint-env node */

/**
 * Comprehensive Code Quality Check Script
 * Runs all quality checks locally before CI/CD
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const QUALITY_CHECK_CONSTANTS = {
  SUMMARY_LINE_LENGTH: 50,
};

console.log("🔍 Running Comprehensive Code Quality Checks...\n");

// Colors for output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(colors.blue, `📋 ${description}...`);
    const result = execSync(command, { encoding: "utf8", stdio: "pipe" });
    log(colors.green, `✅ ${description} passed`);
    return { success: true, output: result };
  } catch (error) {
    log(colors.red, `❌ ${description} failed`);
    console.log(error.stdout || error.stderr);
    return { success: false, error };
  }
}

let allPassed = true;
const results = [];

// 1. Check if we're in the right directory
try {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  if (packageJson.name !== "baltzakis-portfolio") {
    throw new Error("Not in portfolio project directory");
  }
} catch {
  log(colors.red, "❌ Not in portfolio project directory");
  process.exit(1);
}

// 2. Lint check
const lintResult = runCommand("pnpm lint", "ESLint/Biome linting");
results.push({ name: "Linting", ...lintResult });
if (!lintResult.success) allPassed = false;

// 3. Type check
const typeResult = runCommand("pnpm typecheck", "TypeScript type checking");
results.push({ name: "TypeScript", ...typeResult });
if (!typeResult.success) allPassed = false;

// 4. Format check
const formatResult = runCommand("pnpm format:check", "Code formatting check");
results.push({ name: "Formatting", ...formatResult });
if (!formatResult.success) allPassed = false;

// 5. Unit tests
const testResult = runCommand("pnpm test:unit --run", "Unit tests");
results.push({ name: "Unit Tests", ...testResult });
if (!testResult.success) allPassed = false;

// 6. Build check
const buildResult = runCommand("pnpm build", "Production build");
results.push({ name: "Build", ...buildResult });
if (!buildResult.success) allPassed = false;

// 7. Security audit
const auditResult = runCommand("pnpm audit", "Security vulnerability check");
results.push({ name: "Security Audit", ...auditResult });
if (!auditResult.success) allPassed = false;

// Summary
console.log(`\n${"=".repeat(QUALITY_CHECK_CONSTANTS.SUMMARY_LINE_LENGTH)}`);
log(colors.bold, "📊 CODE QUALITY SUMMARY");

results.forEach((result) => {
  const status = result.success ? "✅ PASS" : "❌ FAIL";
  const color = result.success ? colors.green : colors.red;
  log(color, `${result.name}: ${status}`);
});

console.log(`\n${"=".repeat(QUALITY_CHECK_CONSTANTS.SUMMARY_LINE_LENGTH)}`);

if (allPassed) {
  log(colors.green, "🎉 All quality checks passed! Ready to commit.");
  process.exit(0);
} else {
  log(colors.red, "💥 Some quality checks failed. Please fix issues before committing.");
  log(colors.yellow, "💡 Run the following to fix common issues:");
  console.log("   pnpm lint --fix    # Fix linting issues");
  console.log("   pnpm format:fix    # Fix formatting issues");
  console.log("   pnpm typecheck     # Check for type errors");
  process.exit(1);
}
