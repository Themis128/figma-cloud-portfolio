import identity from "./server/bot/knowledge/01_identity.md";
import summary from "./server/bot/knowledge/02_professional_summary.md";
import experience from "./server/bot/knowledge/03_work_experience.md";
import education from "./server/bot/knowledge/04_education.md";
import certifications from "./server/bot/knowledge/05_certifications_skills.md";
import projects from "./server/bot/knowledge/06_projects.md";
import website from "./server/bot/knowledge/07_portfolio_website.md";
import agents from "./server/bot/knowledge/08_ai_agents.md";
import services from "./server/bot/knowledge/09_services_offerings.md";
import bookingFaq from "./server/bot/knowledge/10_booking_faq.md";

const KNOWLEDGE_BASE = [
  identity,
  summary,
  experience,
  education,
  certifications,
  projects,
  website,
  agents,
  services,
  bookingFaq,
].join("\n\n---\n\n");

const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_TURNS = 12;

interface ChatMessage {
  role: string;
  content: string;
}

interface Env {
  ASSETS: { fetch: typeof fetch };
  AI: {
    run: (
      _model: string,
      _inputs: Record<string, unknown>,
    ) => Promise<unknown>;
  };
  RECAPTCHA_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM?: string;
  CONTACT_TO?: string;
  CONTACT_WEBHOOK_URL?: string;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildSystemPrompt(): string {
  return [
    "You are the portfolio assistant for Themistoklis Baltzakis, a cloud architect and cybersecurity specialist.",
    "Answer questions about his experience, projects, skills, services, and how to book a consultation using ONLY the knowledge base below.",
    "If the answer is not in the knowledge base, say you don't have that information and suggest contacting him via the contact page (https://portfolio.cloudless.gr/contact/).",
    "Keep answers concise and professional. When relevant, mention that consultations can be booked at https://portfolio.cloudless.gr/consultation/ or via the contact page.",
    "Never invent facts, metrics, or credentials.",
    "",
    "KNOWLEDGE BASE:",
    KNOWLEDGE_BASE,
  ].join("\n");
}

function isChatMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const candidate = m as Partial<ChatMessage>;
  return (
    typeof candidate.role === "string" &&
    typeof candidate.content === "string"
  );
}

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(isChatMessage)
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));
}

function sseEncode(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function isModelTokenChunk(value: unknown): value is { response: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { response?: unknown }).response === "string"
  );
}

async function pumpModelStream(
  result: ReadableStream<Uint8Array>,
  send: (payload: unknown) => void,
): Promise<void> {
  const reader = result.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isModelTokenChunk(parsed)) send({ token: parsed.response });
      } catch {
        // non-JSON keep-alive lines from the model stream
      }
    }
  }

  const tail = buffer.trim();
  if (tail) {
    try {
      const parsed: unknown = JSON.parse(tail);
      if (isModelTokenChunk(parsed)) send({ token: parsed.response });
    } catch {
      // ignore trailing noise
    }
  }
}

async function emitModelReply(
  env: Env,
  messages: ChatMessage[],
  send: (payload: unknown) => void,
): Promise<void> {
  const result = await env.AI.run(MODEL, {
    messages,
    stream: true,
    max_tokens: 1024,
  });

  if (result instanceof ReadableStream) {
    await pumpModelStream(result, send);
    return;
  }

  const text = isModelTokenChunk(result) ? result.response : "";
  // Non-streaming fallback: emit the reply in word-ish chunks.
  for (const part of text.split(/(\s+)/)) {
    if (part) send({ token: part });
  }
}

function parseChatBody(
  body: unknown,
): { message: string; history: ChatMessage[] } | Response {
  if (typeof body !== "object" || body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const record = body as { message?: unknown; history?: unknown };
  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (!message) return jsonError("message is required", 400);
  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonError("message too long", 413);
  }
  return { message, history: sanitizeHistory(record.history) };
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseChatBody(raw);
  if (parsed instanceof Response) return parsed;

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...parsed.history,
    { role: "user", content: parsed.message },
  ];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) => {
        try {
          controller.enqueue(sseEncode(payload));
        } catch {
          // stream already closed/cancelled
        }
      };

      try {
        await emitModelReply(env, messages, send);
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      } catch (err) {
        send({ error: err instanceof Error ? err.message : "chat failed" });
      } finally {
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

const CONTACT_MAX_FIELD = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function parseContactBody(body: unknown): ContactPayload | Response {
  if (typeof body !== "object" || body === null) {
    return jsonError("Invalid JSON body", 400);
  }
  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const subject =
    typeof record.subject === "string" ? record.subject.trim() : "";
  const message =
    typeof record.message === "string" ? record.message.trim() : "";

  if (!name || !email || !message) {
    return jsonError("name, email and message are required", 400);
  }
  if (!EMAIL_RE.test(email)) return jsonError("invalid email", 400);
  if (
    name.length > CONTACT_MAX_FIELD ||
    email.length > 320 ||
    subject.length > CONTACT_MAX_FIELD ||
    message.length > CONTACT_MAX_FIELD
  ) {
    return jsonError("field too long", 413);
  }
  return {
    name,
    email,
    subject: subject || "Portfolio contact form",
    message,
  };
}

async function verifyRecaptcha(
  token: string,
  secret: string,
  ip: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip,
        }),
      },
    );
    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
    };
    return data.success === true && (data.score ?? 0) >= 0.5;
  } catch {
    return false;
  }
}

async function deliverViaWebhook(
  url: string,
  payload: ContactPayload,
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        submitted_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) console.error("contact webhook failed", res.status);
    return res.ok;
  } catch (err) {
    console.error("contact webhook error", err);
    return false;
  }
}

async function deliverViaResend(
  env: Env,
  payload: ContactPayload,
): Promise<boolean> {
  const from = env.CONTACT_FROM ?? "portfolio@cloudless.gr";
  const to = env.CONTACT_TO ?? "tbaltzakis@cloudless.gr";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email,
        subject: `[portfolio] ${payload.subject}`,
        text: [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Subject: ${payload.subject}`,
          "",
          payload.message,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("resend failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("resend error", err);
    return false;
  }
}

async function deliverContact(env: Env, payload: ContactPayload): Promise<Response> {
  const delivered = env.CONTACT_WEBHOOK_URL
    ? await deliverViaWebhook(env.CONTACT_WEBHOOK_URL, payload)
    : env.RESEND_API_KEY
      ? await deliverViaResend(env, payload)
      : false;

  if (!env.CONTACT_WEBHOOK_URL && !env.RESEND_API_KEY) {
    console.error("contact form hit but no delivery configured");
    return jsonError("Contact form is not configured yet", 503);
  }
  if (!delivered) return jsonError("Failed to deliver message", 502);
  return Response.json({ success: true, message: "Message sent" });
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const record =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  const payload = parseContactBody(raw);
  if (payload instanceof Response) return payload;

  if (env.RECAPTCHA_SECRET_KEY) {
    const token =
      typeof record.recaptchaToken === "string" ? record.recaptchaToken : "";
    if (!token) return jsonError("captcha required", 400);
    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const ok = await verifyRecaptcha(token, env.RECAPTCHA_SECRET_KEY, ip);
    if (!ok) return jsonError("captcha verification failed", 403);
  }

  return deliverContact(env, payload);
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }
      if (request.method !== "POST") {
        return jsonError("Method not allowed", 405);
      }
      return handleContact(request, env);
    }

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "baltzakisthemis-portfolio" });
    }

    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders() });
      }
      if (request.method !== "POST") {
        return jsonError("Method not allowed", 405);
      }
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
