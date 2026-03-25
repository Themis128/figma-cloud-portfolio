import { expect, test } from "@playwright/test";
import { spawn, type ChildProcess } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * MCP Server | stdio JSON-RPC Tests
 *
 * Tests the portfolio MCP server by spawning the process and communicating
 * via JSON-RPC over stdin/stdout. The server uses stdio transport, not HTTP.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");
const MCP_COMMAND = "npx";
const MCP_ARGS = ["tsx", "server/mcp/index.ts"];

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

function spawnMcpServer(): ChildProcess {
  return spawn(MCP_COMMAND, MCP_ARGS, {
    cwd: PROJECT_ROOT,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "test" },
  });
}

function sendJsonRpc(
  proc: ChildProcess,
  method: string,
  params: Record<string, unknown> = {},
  id = 1,
): void {
  const msg = JSON.stringify({ jsonrpc: "2.0", method, params, id });
  proc.stdin!.write(msg + "\n");
}

function readResponse(proc: ChildProcess, timeout = 15000): Promise<JsonRpcResponse> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for JSON-RPC response after ${timeout}ms`));
    }, timeout);

    let buffer = "";

    const onData = (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed) as JsonRpcResponse;
          if (parsed.jsonrpc === "2.0" && parsed.id !== undefined) {
            clearTimeout(timer);
            proc.stdout!.off("data", onData);
            resolve(parsed);
            return;
          }
        } catch {
          // Not a complete JSON line yet, continue buffering
        }
      }
    };

    proc.stdout!.on("data", onData);

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`MCP server exited with code ${code} before responding`));
    });
  });
}

async function initializeServer(proc: ChildProcess): Promise<JsonRpcResponse> {
  sendJsonRpc(proc, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "playwright-test", version: "1.0.0" },
  }, 0);
  const initResponse = await readResponse(proc);

  // Send initialized notification (no id, no response expected)
  proc.stdin!.write(
    JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n",
  );

  return initResponse;
}

test.describe("MCP Server — Initialization", () => {
  let proc: ChildProcess;

  test.afterEach(() => {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  });

  test("should start and respond to initialize request", async () => {
    proc = spawnMcpServer();
    const response = await initializeServer(proc);

    expect(response.jsonrpc).toBe("2.0");
    expect(response.result).toBeDefined();
    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const serverInfo = result.serverInfo as Record<string, string> | undefined;
    expect(serverInfo?.name).toBe("portfolio-mcp");
    expect(serverInfo?.version).toBe("1.0.0");
  });
});

test.describe("MCP Server — Resources", () => {
  let proc: ChildProcess;

  test.beforeEach(async () => {
    proc = spawnMcpServer();
    await initializeServer(proc);
  });

  test.afterEach(() => {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  });

  test("should list 4 resources", async () => {
    sendJsonRpc(proc, "resources/list", {}, 1);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();
    expect(response.result).toBeDefined();

    const resources = (response.result as Record<string, unknown>).resources as Array<Record<string, string>>;
    expect(resources).toHaveLength(4);

    const uris = resources.map((r) => r.uri);
    expect(uris).toContain("knowledge://all");
    expect(uris).toContain("blog://all");
    expect(uris).toContain("docs://architecture");
    expect(uris).toContain("project://package.json");
  });

  test("should read knowledge base resource and return markdown content", async () => {
    sendJsonRpc(proc, "resources/read", { uri: "knowledge://all" }, 2);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();
    expect(response.result).toBeDefined();

    const result = response.result as Record<string, unknown>;
    const contents = result.contents as Array<Record<string, string>>;
    expect(contents).toHaveLength(1);
    expect(contents[0].uri).toBe("knowledge://all");
    expect(contents[0].mimeType).toBe("text/markdown");
    expect(contents[0].text.length).toBeGreaterThan(0);
  });

  test("should read package.json resource and return valid JSON", async () => {
    sendJsonRpc(proc, "resources/read", { uri: "project://package.json" }, 3);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const contents = result.contents as Array<Record<string, string>>;
    expect(contents[0].mimeType).toBe("application/json");

    // Should be valid JSON
    const parsed = JSON.parse(contents[0].text) as Record<string, unknown>;
    expect(parsed.name).toBeDefined();
    expect(parsed.dependencies).toBeDefined();
  });
});

test.describe("MCP Server — Tools", () => {
  let proc: ChildProcess;

  test.beforeEach(async () => {
    proc = spawnMcpServer();
    await initializeServer(proc);
  });

  test.afterEach(() => {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  });

  test("should list 6 tools", async () => {
    sendJsonRpc(proc, "tools/list", {}, 1);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();
    expect(response.result).toBeDefined();

    const tools = (response.result as Record<string, unknown>).tools as Array<Record<string, string>>;
    expect(tools).toHaveLength(6);

    const names = tools.map((t) => t.name);
    expect(names).toContain("search_knowledge");
    expect(names).toContain("search_blog");
    expect(names).toContain("github_stats");
    expect(names).toContain("project_structure");
    expect(names).toContain("read_file");
    expect(names).toContain("deployment_info");
  });

  test("should return deployment info with expected fields", async () => {
    sendJsonRpc(proc, "tools/call", { name: "deployment_info", arguments: {} }, 2);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content).toHaveLength(1);
    expect(content[0].type).toBe("text");

    const info = JSON.parse(content[0].text) as Record<string, string>;
    expect(info.s3Bucket).toBe("figma-portfolio-static");
    expect(info.cloudFrontId).toBe("E134SCTR0QGQKJ");
    expect(info.region).toBe("us-east-1");
    expect(info.siteUrl).toBe("https://www.baltzakisthemis.com");
    expect(info.framework).toContain("Next.js");
    expect(info.packageManager).toBe("pnpm");
  });

  test("should list files in src/app with project_structure tool", async () => {
    sendJsonRpc(proc, "tools/call", { name: "project_structure", arguments: { path: "src/app" } }, 3);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const content = result.content as Array<{ type: string; text: string }>;
    const files = content[0].text;

    // src/app should contain key Next.js files
    expect(files).toContain("layout.tsx");
    expect(files).toContain("page.tsx");
  });

  test("should reject path traversal in read_file tool", async () => {
    sendJsonRpc(proc, "tools/call", { name: "read_file", arguments: { path: "../../../etc/passwd" } }, 4);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Invalid path");
    expect(content[0].text).toContain("no directory traversal");
  });

  test("should reject absolute paths in read_file tool", async () => {
    sendJsonRpc(proc, "tools/call", { name: "read_file", arguments: { path: "/etc/passwd" } }, 5);
    const response = await readResponse(proc);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const content = result.content as Array<{ type: string; text: string }>;
    expect(content[0].text).toContain("Invalid path");
  });

  test("should search knowledge base and return results", async () => {
    sendJsonRpc(proc, "tools/call", { name: "search_knowledge", arguments: { query: "cloud architect" } }, 6);
    const response = await readResponse(proc, 20000);

    expect(response.error).toBeUndefined();

    const result = response.result as Record<string, unknown>;
    const content = result.content as Array<{ type: string; text: string }>;
    const results = JSON.parse(content[0].text) as Array<{ file: string; excerpt: string }>;

    // Should find at least one matching knowledge file
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].file).toBeDefined();
    expect(results[0].excerpt).toBeDefined();
    expect(results[0].excerpt.length).toBeGreaterThan(0);
  });
});
