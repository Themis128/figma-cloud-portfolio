#!/usr/bin/env node

import { spawn } from "node:child_process";
import { platform } from "node:os";

const isWindows = platform() === "win32";
const scriptPath = isWindows ? "./scripts/setup-tools.ps1" : "./scripts/setup-tools.sh";

const command = isWindows ? "powershell" : "bash";
const args = isWindows ? ["-ExecutionPolicy", "Bypass", "-File", scriptPath] : [scriptPath];

console.log(`[*] Setting up external tools on ${isWindows ? "Windows" : "Unix/Linux"}...`);

const child = spawn(command, args, {
  cwd: process.cwd(),
  stdio: "inherit",
});

child.on("exit", (code) => {
  if (code === 0) {
    console.log("[+] Tool setup complete!");
  } else {
    console.error(`[!] Tool setup failed with exit code ${code}`);
  }
  process.exit(code);
});

child.on("error", (error) => {
  console.error("[!] Failed to run tool setup:", error.message);
  process.exit(1);
});
