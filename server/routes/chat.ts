// Chat API endpoint — uses AWS Bedrock (Claude 3.5 Haiku) with tool use,
// knowledge base, blog RAG, and action tokens for booking/contact/navigation.
import { Router, Request, Response } from "express";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  type ConverseStreamCommandInput,
  type ContentBlock,
  type Message as BedrockMessage,
  type ToolConfiguration,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ── Simple in-memory rate limiter ────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window per IP
const RATE_LIMIT_MAP_MAX_SIZE = 10_000; // prevent memory exhaustion
const MAX_MESSAGE_LENGTH = 2_000; // max characters per message
const MAX_HISTORY_CONTENT_LENGTH = 1_000; // max characters per history entry
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size >= RATE_LIMIT_MAP_MAX_SIZE) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest !== undefined) rateLimitMap.delete(oldest);
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

const BEDROCK_REGION = process.env.BEDROCK_REGION ?? "us-east-1";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-3-5-haiku-20241022-v1:0";
const MAX_HISTORY_TURNS = 6;
const MAX_TOOL_ROUNDS = 2; // prevent infinite tool-use loops

interface HistoryMessage {
  role: string;
  content: string;
}

// ── Knowledge base (loaded once at startup) ─────────────────────────────────

let _knowledgeBase: string | null = null;

function getKnowledgeBase(): string {
  if (_knowledgeBase !== null) return _knowledgeBase;

  const knowledgeDir = join(__dirname, "..", "bot", "knowledge");
  try {
    const files = readdirSync(knowledgeDir)
      .filter((f) => f.endsWith(".md"))
      .sort();

    _knowledgeBase = files
      .map((f) => readFileSync(join(knowledgeDir, f), "utf-8"))
      .join("\n\n---\n\n");

    console.log(
      `Loaded knowledge base: ${files.length} files, ${_knowledgeBase.length} chars`,
    );
  } catch {
    _knowledgeBase = "";
    console.warn(
      `WARNING: Knowledge base not found at ${knowledgeDir}. Chatbot will have no context.`,
    );
  }

  return _knowledgeBase;
}

// ── Blog index for RAG (loaded once at startup) ────────────────────────────

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  plainText: string;
}

let _blogIndex: BlogPost[] | null = null;

function getBlogIndex(): BlogPost[] {
  if (_blogIndex !== null) return _blogIndex;

  // Blog MDX files live at project root /content/blog/
  const blogDir = join(__dirname, "..", "..", "content", "blog");
  _blogIndex = [];

  if (!existsSync(blogDir)) {
    console.warn(`Blog directory not found at ${blogDir}. Blog search disabled.`);
    return _blogIndex;
  }

  try {
    const files = readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const raw = readFileSync(join(blogDir, file), "utf-8");

      // Parse frontmatter
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;

      const fm = fmMatch[1];
      const title = fm.match(/title:\s*"(.+?)"/)?.[1] ?? file;
      const slug = fm.match(/slug:\s*(.+)/)?.[1]?.trim()?.replace(/^"/, "").replace(/"$/, "") ?? file.replace(".mdx", "");
      const description = fm.match(/description:\s*"(.+?)"/)?.[1] ?? "";
      const date = fm.match(/date:\s*"(.+?)"/)?.[1] ?? "";
      const tagsMatch = fm.match(/tags:\s*\[(.+?)]/);
      const tags = tagsMatch
        ? tagsMatch[1].split(",").map((t) => t.trim().replace(/"/g, ""))
        : [];

      // Strip MDX/JSX to plain text for search
      const body = raw.slice(fmMatch[0].length);
      const plainText = body
        .replace(/```[\s\S]*?```/g, "") // code blocks
        .replace(/<[^>]+>/g, "") // JSX/HTML tags
        .replace(/!\[.*?]\(.*?\)/g, "") // images
        .replace(/\[(.+?)]\(.*?\)/g, "$1") // links → text
        .replace(/#{1,6}\s+/g, "") // headings
        .replace(/[*_~`]/g, "") // emphasis
        .replace(/\n{2,}/g, "\n")
        .trim();

      _blogIndex.push({ slug, title, description, tags, date, plainText });
    }

    console.log(`Loaded blog index: ${_blogIndex.length} posts`);
  } catch {
    console.warn("Failed to load blog index.");
  }

  return _blogIndex;
}

function searchBlog(query: string): Array<{ title: string; description: string; url: string; excerpt: string }> {
  const posts = getBlogIndex();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored = posts.map((post) => {
    const haystack = `${post.title} ${post.description} ${post.tags.join(" ")} ${post.plainText}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (post.title.toLowerCase().includes(term)) score += 10;
      if (post.tags.some((t) => t.toLowerCase().includes(term))) score += 5;
      if (post.description.toLowerCase().includes(term)) score += 3;
      if (haystack.includes(term)) score += 1;
    }
    return { post, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => {
      // Extract a relevant excerpt around the first matching term
      const lower = post.plainText.toLowerCase();
      const firstTerm = terms.find((t) => lower.includes(t));
      let excerpt = post.plainText.slice(0, 300);
      if (firstTerm) {
        const idx = lower.indexOf(firstTerm);
        const start = Math.max(0, idx - 100);
        excerpt = (start > 0 ? "…" : "") + post.plainText.slice(start, start + 300) + "…";
      }
      return {
        title: post.title,
        description: post.description,
        url: `/${post.slug}/`,
        excerpt,
      };
    });
}

// ── Portfolio search (mirrors server/routes/general.ts) ─────────────────────

function searchPortfolio(query: string): Array<{ title: string; type: string; description: string }> {
  const q = query.toLowerCase();
  const content = [
    { title: "Cloud Architecture", type: "skill", description: "AWS, Azure, multi-cloud environments and migration strategies" },
    { title: "Cybersecurity", type: "skill", description: "Zero-trust security, CyberArk PAM, Microsoft Sentinel, CISSP" },
    { title: "Full-Stack Development", type: "skill", description: "React, Next.js, TypeScript, Node.js, Python" },
    { title: "DevOps & Infrastructure", type: "skill", description: "Cisco ACI/UCS, VMware vSphere, CI/CD pipelines" },
    { title: "About Themistoklis", type: "page", description: "Cloud Architect & Cybersecurity Specialist with 15+ years IT expertise" },
    { title: "Contact", type: "page", description: "Get in touch for consulting, collaboration, or career opportunities" },
    { title: "Performance", type: "page", description: "Live web performance metrics and optimization showcase" },
    { title: "AI Agents", type: "page", description: "AI agent templates and workflow builder" },
    { title: "Estarta Solutions", type: "experience", description: "Systems and Network Engineer — Cisco UCS, HyperFlex, ACI" },
    { title: "Cosmos Business Systems", type: "experience", description: "IT Support Engineer — Azure AD, Microsoft 365, Intune" },
  ];
  return content.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );
}

// ── Tool definitions for Bedrock ────────────────────────────────────────────

const toolConfig: ToolConfiguration = {
  tools: [
    {
      toolSpec: {
        name: "search_portfolio",
        description: "Search portfolio content including skills, pages, and work experience. Use when a visitor asks about specific topics, skills, or sections of the portfolio.",
        inputSchema: {
          json: {
            type: "object",
            properties: { query: { type: "string", description: "Search query" } },
            required: ["query"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "search_blog",
        description: "Search Themis's blog articles by topic, keyword, or tag. Use when a visitor asks about blog posts, articles, or written content.",
        inputSchema: {
          json: {
            type: "object",
            properties: { query: { type: "string", description: "Search query for blog articles" } },
            required: ["query"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "get_github_stats",
        description: "Fetch Themis's GitHub profile statistics including repos, stars, and followers. Use when asked about open source work or GitHub activity.",
        inputSchema: {
          json: { type: "object", properties: {} },
        },
      },
    },
    {
      toolSpec: {
        name: "check_booking_availability",
        description: "Check available booking slots for scheduling a call with Themis. Use when asked about availability or scheduling.",
        inputSchema: {
          json: { type: "object", properties: {} },
        },
      },
    },
  ],
};

// ── Tool execution ──────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_portfolio": {
      const query = typeof input.query === "string" ? input.query : "";
      const results = searchPortfolio(query);
      return JSON.stringify({ results, total: results.length });
    }
    case "search_blog": {
      const query = typeof input.query === "string" ? input.query : "";
      const results = searchBlog(query);
      return JSON.stringify({ results, total: results.length });
    }
    case "get_github_stats": {
      try {
        const username = process.env.GITHUB_USERNAME ?? "Themis128";
        const headers: Record<string, string> = {
          "User-Agent": "portfolio-chatbot",
          Accept: "application/vnd.github.v3+json",
        };
        if (process.env.GITHUB_TOKEN) {
          headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }
        const res = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!res.ok) return JSON.stringify({ error: `GitHub API returned ${res.status}` });
        const data = await res.json() as Record<string, unknown>;
        return JSON.stringify({
          name: data.name,
          publicRepos: data.public_repos,
          followers: data.followers,
          following: data.following,
          bio: data.bio,
          profileUrl: data.html_url,
        });
      } catch {
        return JSON.stringify({ error: "Failed to fetch GitHub stats" });
      }
    }
    case "check_booking_availability": {
      try {
        const calApiKey = process.env.CAL_API_KEY ?? "";
        const calEventTypeId = process.env.CAL_EVENT_TYPE_ID ?? "";
        if (!calApiKey || !calEventTypeId) {
          return JSON.stringify({ error: "Booking service not configured" });
        }
        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
          start: now.toISOString(),
          end: end.toISOString(),
          eventTypeId: calEventTypeId,
        });
        const res = await fetch(`https://api.cal.com/v2/slots?${params}`, {
          headers: {
            Authorization: `Bearer ${calApiKey}`,
            "cal-api-version": "2024-09-04",
          },
        });
        if (!res.ok) return JSON.stringify({ error: `Cal.com API returned ${res.status}` });
        const data = await res.json() as { data?: Record<string, unknown[]> };
        const slotDays = Object.keys(data.data ?? {}).length;
        const totalSlots = Object.values(data.data ?? {}).reduce((sum: number, arr) => sum + (arr as unknown[]).length, 0);
        return JSON.stringify({ available: totalSlots > 0, daysWithSlots: slotDays, totalSlots });
      } catch {
        return JSON.stringify({ error: "Failed to check booking availability" });
      }
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

// ── System prompt ───────────────────────────────────────────────────────────

const VALID_PAGES = [
  { path: "/about/", label: "About — skills, certifications, background" },
  { path: "/product/", label: "Work experience timeline" },
  { path: "/projects/", label: "Project portfolio" },
  { path: "/blog/", label: "Blog articles" },
  { path: "/performance/", label: "Site performance metrics" },
  { path: "/agents/", label: "AI agents guide" },
  { path: "/contact/", label: "Contact form" },
  { path: "/resume/", label: "Resume builder" },
  { path: "/admin/", label: "Admin dashboard" },
];

function buildSystemPrompt(): string {
  const knowledge = getKnowledgeBase();
  const blogPosts = getBlogIndex();
  const blogSummary = blogPosts.length > 0
    ? `\n\nThemis has a blog at /blog/ with ${blogPosts.length} articles:\n${blogPosts.map((p) => `- "${p.title}" (${p.date}) — ${p.description} [${p.tags.join(", ")}]`).join("\n")}`
    : "";

  const pageList = VALID_PAGES.map((p) => `  ${p.path} — ${p.label}`).join("\n");

  return `You are an AI assistant on Themistoklis Baltzakis's portfolio website (baltzakisthemis.com).
Your job is to answer visitor questions about Themis using the knowledge base and tools provided.

<knowledge_base>
${knowledge}${blogSummary}
</knowledge_base>

<tools_guidance>
You have access to tools that let you search the portfolio, search blog articles, check GitHub stats, and check booking availability.
Use tools when the visitor's question would benefit from live or detailed data. For basic questions already covered in the knowledge base, answer directly.
</tools_guidance>

<action_tokens>
Special action tokens trigger UI interactions. Include them in your response when appropriate:

- [BOOK_CALL] — Opens the booking form. Use when the user wants to book, schedule, or arrange a meeting or call. Respond with ONLY this token, no other text.
- [CONTACT] — Opens the contact form. Use when the user wants to send a message, get in touch, or contact Themis directly. Respond with ONLY this token, no other text.
- [GOTO:/path/] — Navigates to a page. Include at the END of your text response (after your answer) when you're referencing a specific page. Valid pages:
${pageList}
  Blog post URLs follow the pattern: /blog/<slug>/
  Only include ONE [GOTO:] token per response. Only use it when navigation would genuinely help the visitor.
</action_tokens>

<instructions>
- Answer from the knowledge base and tool results. Never invent facts, certifications, job titles, dates, or skills.
- If you don't have enough information, say: "I don't have that information, but you can ask Themis directly through the contact form."
- Keep answers concise: 2-4 sentences for simple questions, up to a short paragraph for detailed ones.
- Use a professional, friendly tone. Refer to him as "Themis".
- When listing skills, certifications, or projects, use the exact names from the knowledge base.
- If asked about topics unrelated to Themis or his portfolio, politely say you can only help with questions about Themis's background, skills, and services.
</instructions>`;
}

// ── Bedrock client (reused across requests) ─────────────────────────────────

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });

// ── Stream processing helpers ───────────────────────────────────────────────

interface StreamResult {
  text: string;
  toolUseBlocks: Array<{ toolUseId: string; name: string; input: Record<string, unknown> }>;
  stopReason: string;
}

async function processStream(
  stream: AsyncIterable<Record<string, unknown>>,
  res: Response,
  shouldStreamTokens: boolean,
): Promise<StreamResult> {
  let text = "";
  let stopReason = "end_turn";

  // Tool use accumulation
  const toolUseBlocks: Array<{ toolUseId: string; name: string; input: Record<string, unknown> }> = [];
  let currentToolId = "";
  let currentToolName = "";
  let currentToolInput = "";
  let sentAction = false;

  for await (const event of stream as AsyncIterable<Record<string, Record<string, unknown>>>) {
    // Text content
    const textDelta = event.contentBlockDelta?.delta as Record<string, string> | undefined;
    if (textDelta?.text) {
      const chunk = textDelta.text;
      text += chunk;

      // Check for action tokens before streaming
      if (shouldStreamTokens && !sentAction) {
        if (text.includes("[BOOK_CALL]")) {
          sentAction = true;
          res.write(`data: ${JSON.stringify({ action: "start_booking" })}\n\n`);
        } else if (text.includes("[CONTACT]")) {
          sentAction = true;
          res.write(`data: ${JSON.stringify({ action: "open_contact" })}\n\n`);
        } else {
          // Check for [GOTO:] — only emit text before the token
          const gotoMatch = text.match(/\[GOTO:(\/[a-z0-9\-/]+)]/i);
          if (gotoMatch) {
            // Emit any text before the GOTO token that hasn't been sent yet
            const beforeGoto = text.slice(0, text.indexOf(gotoMatch[0]));
            const alreadySent = text.length - chunk.length;
            if (beforeGoto.length > alreadySent) {
              res.write(`data: ${JSON.stringify({ token: beforeGoto.slice(alreadySent) })}\n\n`);
            }
            sentAction = true;
            res.write(`data: ${JSON.stringify({ action: "navigate", path: gotoMatch[1] })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
          }
        }
      }
    }

    // Tool use start
    const blockStart = event.contentBlockStart?.start as Record<string, Record<string, string>> | undefined;
    if (blockStart?.toolUse) {
      currentToolId = blockStart.toolUse.toolUseId ?? "";
      currentToolName = blockStart.toolUse.name ?? "";
      currentToolInput = "";
    }

    // Tool use input delta
    const toolDelta = event.contentBlockDelta?.delta as Record<string, string> | undefined;
    if (toolDelta?.toolUse) {
      currentToolInput += (toolDelta.toolUse as unknown as { input?: string }).input ?? "";
    }

    // Content block stop — finalize tool use block
    if (event.contentBlockStop !== undefined && currentToolId) {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(currentToolInput || "{}") as Record<string, unknown>;
      } catch {
        // malformed tool input
      }
      toolUseBlocks.push({ toolUseId: currentToolId, name: currentToolName, input: parsedInput });
      currentToolId = "";
      currentToolName = "";
      currentToolInput = "";
    }

    // Message stop
    const messageStop = event.messageStop as Record<string, string> | undefined;
    if (messageStop?.stopReason) {
      stopReason = messageStop.stopReason;
    }
  }

  return { text, toolUseBlocks, stopReason };
}

// ── Route ───────────────────────────────────────────────────────────────────

// POST /api/chat
router.post("/", async (req: Request, res: Response) => {
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "unknown";
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  try {
    const body = req.body as Record<string, unknown>;
    const message = typeof body.message === "string" ? body.message : "";
    const history = Array.isArray(body.history) ? (body.history as HistoryMessage[]) : [];

    const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array with recent history (Converse API format)
    const messages: BedrockMessage[] = [];

    const recentHistory = history.slice(-MAX_HISTORY_TURNS);
    for (const entry of recentHistory) {
      if (
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.length > 0
      ) {
        messages.push({
          role: entry.role,
          content: [{ text: entry.content.slice(0, MAX_HISTORY_CONTENT_LENGTH) }],
        });
      }
    }
    messages.push({ role: "user", content: [{ text: trimmedMessage }] });

    // Stream SSE events to the frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Tool-use loop: model may request tools, we execute them and re-invoke
    let toolRounds = 0;

    while (toolRounds <= MAX_TOOL_ROUNDS) {
      const isLastRound = toolRounds === MAX_TOOL_ROUNDS;
      const commandInput: ConverseStreamCommandInput = {
        modelId: BEDROCK_MODEL_ID,
        system: [{ text: buildSystemPrompt() }],
        messages,
        inferenceConfig: {
          maxTokens: toolRounds > 0 ? 768 : 512, // more tokens when incorporating tool results
          temperature: 0.3,
          topP: 0.9,
        },
        ...(!isLastRound ? { toolConfig } : {}),
      };

      const response = await bedrockClient.send(new ConverseStreamCommand(commandInput));

      if (!response.stream) {
        res.write(`data: ${JSON.stringify({ error: "No response generated" })}\n\n`);
        break;
      }

      // Only stream tokens to client on the final round (when model produces text, not tool calls)
      const isStreamingRound = toolRounds === MAX_TOOL_ROUNDS;
      const result = await processStream(response.stream, res, true);

      // If model used tools, execute them and loop
      if (result.stopReason === "tool_use" && result.toolUseBlocks.length > 0 && !isLastRound) {
        // Send status to client so they see a "thinking" indicator
        res.write(`data: ${JSON.stringify({ status: "thinking" })}\n\n`);

        // Add the assistant's response (with tool use blocks) to messages
        const assistantContent: ContentBlock[] = [];
        if (result.text) {
          assistantContent.push({ text: result.text });
        }
        for (const tool of result.toolUseBlocks) {
          assistantContent.push({
            toolUse: {
              toolUseId: tool.toolUseId,
              name: tool.name,
              input: tool.input as Record<string, unknown>,
            },
          });
        }
        messages.push({ role: "assistant", content: assistantContent });

        // Execute tools and add results
        const toolResults: ContentBlock[] = [];
        for (const tool of result.toolUseBlocks) {
          const toolOutput = await executeTool(tool.name, tool.input);
          toolResults.push({
            toolResult: {
              toolUseId: tool.toolUseId,
              content: [{ text: toolOutput }] as ToolResultContentBlock[],
            },
          });
        }
        messages.push({ role: "user", content: toolResults });

        toolRounds++;
        continue;
      }

      // Final response — text was already streamed by processStream
      if (!result.text && result.toolUseBlocks.length === 0) {
        res.write(`data: ${JSON.stringify({ error: "No response generated" })}\n\n`);
      }
      break;
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({ error: `Chat request failed: ${msg}` });
    } else {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

export default router;
