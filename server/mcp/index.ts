#!/usr/bin/env node
/**
 * Portfolio MCP Server — exposes portfolio data as resources and tools
 * for AI coding agents (Claude Code, Cursor, etc.)
 *
 * Run: npx tsx server/mcp/index.ts
 * Or:  pnpm mcp:start
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..", "..");

// ── Helpers ─────────────────────────────────────────────────────────────────

function readFile(relativePath: string): string {
  const fullPath = join(PROJECT_ROOT, relativePath);
  if (!existsSync(fullPath)) return `File not found: ${relativePath}`;
  return readFileSync(fullPath, "utf-8");
}

function listFiles(dir: string, ext?: string): string[] {
  const fullPath = join(PROJECT_ROOT, dir);
  if (!existsSync(fullPath)) return [];
  const files = readdirSync(fullPath);
  return ext ? files.filter((f) => f.endsWith(ext)) : files;
}

// ── Server Setup ────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "portfolio-mcp",
  version: "1.0.0",
});

// ── Resources ───────────────────────────────────────────────────────────────

// Knowledge base files
server.resource(
  "knowledge-base",
  "knowledge://all",
  async () => {
    const knowledgeDir = "server/bot/knowledge";
    const files = listFiles(knowledgeDir, ".md");
    const content = files
      .sort()
      .map((f) => readFile(join(knowledgeDir, f)))
      .join("\n\n---\n\n");
    return { contents: [{ uri: "knowledge://all", mimeType: "text/markdown", text: content }] };
  },
);

// Blog posts
server.resource(
  "blog-posts",
  "blog://all",
  async () => {
    const files = listFiles("content/blog", ".mdx");
    const posts = files.map((f) => {
      const raw = readFile(join("content/blog", f));
      return `## ${f}\n\n${raw}`;
    });
    return { contents: [{ uri: "blog://all", mimeType: "text/markdown", text: posts.join("\n\n---\n\n") }] };
  },
);

// Project architecture
server.resource(
  "architecture",
  "docs://architecture",
  async () => {
    const content = readFile("docs/ARCHITECTURE.md");
    return { contents: [{ uri: "docs://architecture", mimeType: "text/markdown", text: content }] };
  },
);

// Package.json
server.resource(
  "package-info",
  "project://package.json",
  async () => {
    const content = readFile("package.json");
    return { contents: [{ uri: "project://package.json", mimeType: "application/json", text: content }] };
  },
);

// ── Tools ───────────────────────────────────────────────────────────────────

// Search knowledge base
server.tool(
  "search_knowledge",
  "Search the chatbot knowledge base for information about Themis",
  { query: z.string().describe("Search query") },
  async ({ query }) => {
    const knowledgeDir = "server/bot/knowledge";
    const files = listFiles(knowledgeDir, ".md");
    const terms = query.toLowerCase().split(/\s+/);
    const results: Array<{ file: string; excerpt: string }> = [];

    for (const f of files) {
      const content = readFile(join(knowledgeDir, f));
      const lower = content.toLowerCase();
      const matches = terms.filter((t) => lower.includes(t));
      if (matches.length > 0) {
        const idx = lower.indexOf(matches[0] ?? "");
        const start = Math.max(0, idx - 100);
        const excerpt = content.slice(start, start + 300).trim();
        results.push({ file: f, excerpt });
      }
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
    };
  },
);

// Search blog posts
server.tool(
  "search_blog",
  "Search blog articles by topic or keyword",
  { query: z.string().describe("Search query for blog content") },
  async ({ query }) => {
    const files = listFiles("content/blog", ".mdx");
    const terms = query.toLowerCase().split(/\s+/);
    const results: Array<{ file: string; title: string; excerpt: string }> = [];

    for (const f of files) {
      const raw = readFile(join("content/blog", f));
      const lower = raw.toLowerCase();
      const matches = terms.filter((t) => lower.includes(t));
      if (matches.length > 0) {
        const titleMatch = raw.match(/title:\s*"(.+?)"/);
        const title = titleMatch?.[1] ?? f;
        const idx = lower.indexOf(matches[0] ?? "");
        const start = Math.max(0, idx - 100);
        const excerpt = raw.slice(start, start + 300).trim();
        results.push({ file: f, title, excerpt });
      }
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
    };
  },
);

// Get GitHub stats
server.tool(
  "github_stats",
  "Fetch Themis's GitHub profile statistics",
  {},
  async () => {
    try {
      const res = await fetch("https://api.github.com/users/Themis128", {
        headers: { "User-Agent": "portfolio-mcp", Accept: "application/vnd.github.v3+json" },
      });
      if (!res.ok) return { content: [{ type: "text" as const, text: `GitHub API error: ${res.status}` }] };
      const data = await res.json() as Record<string, unknown>;
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            name: data.name,
            bio: data.bio,
            publicRepos: data.public_repos,
            followers: data.followers,
            following: data.following,
            profileUrl: data.html_url,
          }, null, 2),
        }],
      };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Error: ${err instanceof Error ? err.message : "Unknown"}` }] };
    }
  },
);

// List project structure
server.tool(
  "project_structure",
  "List files in a project directory",
  { path: z.string().describe("Relative path from project root (e.g., 'src/components')") },
  async ({ path }) => {
    const files = listFiles(path);
    return {
      content: [{ type: "text" as const, text: files.length > 0 ? files.join("\n") : `No files found at ${path}` }],
    };
  },
);

// Read a project file
server.tool(
  "read_file",
  "Read the contents of a project file",
  { path: z.string().describe("Relative path from project root (e.g., 'src/app/page.tsx')") },
  async ({ path }) => {
    // Security: prevent directory traversal
    if (path.includes("..") || path.startsWith("/")) {
      return { content: [{ type: "text" as const, text: "Error: Invalid path — no directory traversal allowed" }] };
    }
    const content = readFile(path);
    return { content: [{ type: "text" as const, text: content }] };
  },
);

// Get deployment info
server.tool(
  "deployment_info",
  "Get deployment configuration and status",
  {},
  async () => {
    const info = {
      frontend: "S3 + CloudFront (static export)",
      backend: "AWS Lambda + Amplify Gen 2",
      s3Bucket: "figma-portfolio-static",
      cloudFrontId: "E134SCTR0QGQKJ",
      region: "us-east-1",
      siteUrl: "https://www.baltzakisthemis.com",
      framework: "Next.js 16 (App Router, static export)",
      packageManager: "pnpm",
    };
    return { content: [{ type: "text" as const, text: JSON.stringify(info, null, 2) }] };
  },
);

// ── Start Server ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

void main();
