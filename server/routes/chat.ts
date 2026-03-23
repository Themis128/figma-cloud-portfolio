// Chat API endpoint — uses AWS Bedrock (Claude 3.5 Haiku) with full knowledge base
import { Router, Request, Response } from "express";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ── Simple in-memory rate limiter ────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
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

// ── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const knowledge = getKnowledgeBase();

  return `You are an AI assistant on Themistoklis Baltzakis's portfolio website (baltzakisthemis.com).
Your job is to answer visitor questions about Themis using ONLY the knowledge base provided below.

<knowledge_base>
${knowledge}
</knowledge_base>

<instructions>
- Answer ONLY from the knowledge base above. Never invent facts, certifications, job titles, dates, or skills not listed.
- If the knowledge base does not contain enough information to answer, say: "I don't have that information, but you can ask Themis directly at baltzakis.themis@gmail.com or through the contact form."
- Keep answers concise: 2-4 sentences for simple questions, up to a short paragraph for detailed ones.
- Use a professional, friendly tone. Refer to him as "Themis".
- When listing skills, certifications, or projects, use the exact names from the knowledge base.
- If asked about topics unrelated to Themis or his portfolio, politely say you can only help with questions about Themis's background, skills, and services.
- If the user wants to book, schedule, or arrange a meeting or call, respond ONLY with the exact token: [BOOK_CALL] — no other text.
</instructions>`;
}

// ── Bedrock client (reused across requests) ─────────────────────────────────

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });

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

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array with recent history (Converse API format)
    const messages: Array<{
      role: string;
      content: Array<{ text: string }>;
    }> = [];

    const recentHistory = history.slice(-MAX_HISTORY_TURNS);
    for (const entry of recentHistory) {
      if (entry.role === "user" || entry.role === "assistant") {
        messages.push({
          role: entry.role,
          content: [{ text: entry.content }],
        });
      }
    }
    messages.push({ role: "user", content: [{ text: trimmedMessage }] });

    const command = new ConverseStreamCommand({
      modelId: BEDROCK_MODEL_ID,
      system: [{ text: buildSystemPrompt() }],
      messages,
      inferenceConfig: {
        maxTokens: 512,
        temperature: 0.3,
        topP: 0.9,
      },
    });

    const response = await bedrockClient.send(command);

    // Stream SSE events to the frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let accumulated = "";
    let sentBooking = false;

    if (response.stream) {
      for await (const event of response.stream) {
        if (event.contentBlockDelta?.delta?.text) {
          const chunk = event.contentBlockDelta.delta.text;
          accumulated += chunk;

          // Check for booking action token mid-stream
          if (!sentBooking && accumulated.includes("[BOOK_CALL]")) {
            sentBooking = true;
            res.write(`data: ${JSON.stringify({ action: "start_booking" })}\n\n`);
          } else if (!sentBooking) {
            res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
          }
        }
      }
    }

    if (!accumulated && !sentBooking) {
      res.write(
        `data: ${JSON.stringify({ error: "No response generated" })}\n\n`,
      );
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({ error: `Chat request failed: ${msg}` });
    }
  }
});

export default router;
