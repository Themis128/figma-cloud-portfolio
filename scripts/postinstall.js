#!/usr/bin/env node

/**
 * Postinstall script to optimize pnpm setup and performance
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Running postinstall optimizations...");

// Ensure pnpm cache directory exists
const cacheDir = path.join(__dirname, "..", "node_modules", ".pnpm-cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log("✅ Created pnpm cache directory");
}

// Ensure pnpm state directory exists
const stateDir = path.join(__dirname, "..", "node_modules", ".pnpm-state");
if (!fs.existsSync(stateDir)) {
  fs.mkdirSync(stateDir, { recursive: true });
  console.log("✅ Created pnpm state directory");
}

// Create .pnpm-debug.log if it doesn't exist (for debugging)
const debugLog = path.join(__dirname, "..", ".pnpm-debug.log");
if (!fs.existsSync(debugLog)) {
  fs.writeFileSync(debugLog, "# pnpm debug log\n", "utf8");
  console.log("✅ Created pnpm debug log file");
}

console.log("🎉 Postinstall optimizations complete!");
