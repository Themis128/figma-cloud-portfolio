#!/usr/bin/env node
/**
 * Keystatic CMS dev launcher.
 *
 * Creates temporary Next.js route files for Keystatic, starts `next dev`,
 * and cleans up when the process exits. This keeps Keystatic routes out of
 * the production build (which uses output: "export").
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const KEYSTATIC_PAGE_DIR = join(ROOT, "src/app/keystatic/[[...params]]");
const KEYSTATIC_API_DIR = join(ROOT, "src/app/api/keystatic/[...params]");
const KEYSTATIC_LAYOUT = join(ROOT, "src/app/keystatic/layout.tsx");
const KEYSTATIC_CLIENT = join(ROOT, "src/app/keystatic/keystatic.tsx");

const PAGE_FILE = join(KEYSTATIC_PAGE_DIR, "page.tsx");
const API_FILE = join(KEYSTATIC_API_DIR, "route.ts");

const files = [
  {
    dir: join(ROOT, "src/app/keystatic"),
    path: KEYSTATIC_CLIENT,
    content: `"use client";
import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";
export default makePage(config);
`,
  },
  {
    dir: join(ROOT, "src/app/keystatic"),
    path: KEYSTATIC_LAYOUT,
    content: `import KeystaticApp from "./keystatic";
export const metadata = { title: "CMS", robots: { index: false, follow: false } };
export default function KeystaticLayout() { return <KeystaticApp />; }
`,
  },
  {
    dir: KEYSTATIC_PAGE_DIR,
    path: PAGE_FILE,
    content: `export { default } from "../layout";
`,
  },
  {
    dir: KEYSTATIC_API_DIR,
    path: API_FILE,
    content: `import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";
export const { POST, GET } = makeRouteHandler({ config });
`,
  },
];

function setup() {
  for (const f of files) {
    mkdirSync(f.dir, { recursive: true });
    writeFileSync(f.path, f.content);
  }
  console.log("[CMS] Keystatic routes created");
}

function cleanup() {
  // Remove keystatic directories
  const keystDir = join(ROOT, "src/app/keystatic");
  const apiDir = join(ROOT, "src/app/api/keystatic");
  if (existsSync(keystDir)) rmSync(keystDir, { recursive: true });
  if (existsSync(apiDir)) rmSync(apiDir, { recursive: true });
  console.log("[CMS] Keystatic routes cleaned up");
}

// Create routes
setup();

// Start Next.js dev server
const child = spawn("pnpm", ["next", "dev"], {
  stdio: "inherit",
  cwd: ROOT,
  env: { ...process.env },
});

// Cleanup on exit
function handleExit() {
  cleanup();
  process.exit();
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
child.on("exit", handleExit);
