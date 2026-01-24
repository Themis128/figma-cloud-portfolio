#!/usr/bin/env node

/**
 * pnpm Performance Analyzer and Optimizer
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 pnpm Performance Analyzer & Optimizer");
console.log("=====================================\n");

// Check pnpm version
try {
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
  console.log(`📦 pnpm version: ${pnpmVersion}`);
} catch (error) {
  console.log(
    "⚠️  pnpm not found. Skipping pnpm-specific checks. Install pnpm if you want full analysis.",
  );
}

// Check current configuration
console.log("\n🔧 Current Configuration:");
const pnpmrcPath = path.join(__dirname, "..", ".pnpmrc");
if (fs.existsSync(pnpmrcPath)) {
  const config = fs.readFileSync(pnpmrcPath, "utf8");
  console.log("✅ .pnpmrc found");
  console.log("Key settings:");
  config.split("\n").forEach((line) => {
    if (line.includes("=") && !line.startsWith("#")) {
      console.log(`  ${line}`);
    }
  });
} else {
  console.log("⚠️  .pnpmrc not found");
}

// Check lockfile
const lockfilePath = path.join(__dirname, "..", "pnpm-lock.yaml");
if (fs.existsSync(lockfilePath)) {
  const stats = fs.statSync(lockfilePath);
  const KB_SIZE = 1024;
  console.log(`✅ Lockfile found (${(stats.size / KB_SIZE).toFixed(2)} KB)`);
} else {
  console.log("⚠️  Lockfile not found");
}

// Check store location
try {
  const storePath = execSync("pnpm store path", { encoding: "utf8" }).trim();
  console.log(`🏪 Store location: ${storePath}`);

  if (fs.existsSync(storePath)) {
    console.log("✅ Store directory exists");
  } else {
    console.log("⚠️  Store directory missing");
  }
} catch {
  console.log("❌ Could not determine store path");
}

// Performance recommendations
console.log("\n💡 Performance Recommendations:");
console.log("1. Use `pnpm install --frozen-lockfile` in CI for faster installs");
console.log("2. Enable `prefer-frozen-lockfile=true` for reproducible builds");
console.log("3. Use `pnpm install --ignore-scripts` if scripts are not needed");
console.log("4. Consider using `pnpm install --shamefully-hoist` for compatibility");
console.log("5. Use `pnpm dlx` instead of `npx` for better caching");

console.log("\n✅ Analysis complete!");
