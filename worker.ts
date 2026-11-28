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

const MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_TURNS = 12;

interface ChatMessage {
  role: string;
  content: string;
}

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  AI: {
    run(
      model: string,
      inputs: Record<string, unknown>,
    ): Promise<unknown>;
  };
  TURNSTILE_SECRET_KEY?: string;
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

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (m as ChatMessage).role !== undefined &&
        typeof (m as ChatMessage).content === "string",
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, MAX_MESSAGE_CHARS),
    }));
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  let body: { message?: unknown; history?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return jsonError("message is required", 400);
  if (message.length > MAX_MESSAGE_CHARS) {
    return jsonError("message too long", 413);
  }

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...sanitizeHistory(body.history),
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );

      try {
        const result = await env.AI.run(MODEL, {
          messages,
          stream: true,
          max_tokens: 1024,
        });

        if (result instanceof ReadableStream) {
          const reader = result.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const chunk = JSON.parse(trimmed) as { response?: string };
                if (chunk.response) send({ token: chunk.response });
              } catch {
                // non-JSON keep-alive lines from the model stream
              }
            }
          }
          // flush any trailing buffered line
          if (buffer.trim()) {
            try {
              const chunk = JSON.parse(buffer.trim()) as { response?: string };
              if (chunk.response) send({ token: chunk.response });
            } catch {
              // ignore
            }
          }
        } else {
          const text =
            typeof result === "object" && result !== null && "response" in result
              ? String((result as { response: unknown }).response)
              : "";
          // Non-streaming fallback: emit the reply in word-ish chunks.
          const words = text.split(/(\s+)/);
          for (const part of words) {
            if (part) send({ token: part });
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        send({ error: err instanceof Error ? err.message : "chat failed" });
      } finally {
        controller.close();
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

async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string,
): Promise<boolean> {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip: ip }),
      },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const recaptchaToken =
    typeof body.recaptchaToken === "string" ? body.recaptchaToken : "";

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

  if (env.TURNSTILE_SECRET_KEY) {
    if (!recaptchaToken) return jsonError("captcha required", 400);
    const ip = request.headers.get("CF-Connecting-IP") ?? "";
    const ok = await verifyTurnstile(
      recaptchaToken,
      env.TURNSTILE_SECRET_KEY,
      ip,
    );
    if (!ok) return jsonError("captcha verification failed", 403);
  }

  const payload = {
    name,
    email,
    subject: subject || "Portfolio contact form",
    message,
    submitted_at: new Date().toISOString(),
  };

  if (env.CONTACT_WEBHOOK_URL) {
    try {
      const res = await fetch(env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("contact webhook failed", res.status);
        return jsonError("Failed to deliver message", 502);
      }
      return Response.json({ success: true, message: "Message sent" });
    } catch (err) {
      console.error("contact webhook error", err);
      return jsonError("Failed to deliver message", 502);
    }
  }

  if (env.RESEND_API_KEY) {
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
          reply_to: email,
          subject: `[portfolio] ${subject || name}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Subject: ${subject || "(none)"}`,
            "",
            message,
          ].join("\n"),
        }),
      });
      if (!res.ok) {
        console.error("resend failed", res.status, await res.text());
        return jsonError("Failed to send message", 502);
      }
      return Response.json({ success: true, message: "Message sent" });
    } catch (err) {
      console.error("resend error", err);
      return jsonError("Failed to send message", 502);
    }
  }

  console.error("contact form hit but no delivery configured");
  return jsonError("Contact form is not configured yet", 503);
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
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
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
      if (request.method !== "POST") {
        return jsonError("Method not allowed", 405);
      }
      return handleChat(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
