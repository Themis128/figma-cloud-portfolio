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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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
