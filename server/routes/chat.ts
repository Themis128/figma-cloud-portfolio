// Chat API endpoint — proxies to HuggingFace Inference API
import { Router, Request, Response } from "express";

const router = Router();

const HF_TOKEN = process.env.HF_TOKEN ?? "";
// Qwen2.5-7B-Instruct is available on the free tier of HF router (no gated license).
const HF_MODEL = "Qwen/Qwen2.5-7B-Instruct";
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

const PORTFOLIO_CONTEXT = `You are an AI assistant for Themistoklis Baltzakis's portfolio website.
Answer questions about Themis professionally and helpfully. Be concise and friendly.

About Themis:
- Name: Themistoklis Baltzakis
- Title: Cloud Architect & Cybersecurity Specialist
- Location: Athens, Greece
- Email: baltzakis.themis@gmail.com
- LinkedIn: https://www.linkedin.com/in/baltzakis-themis
- Website: https://www.baltzakisthemis.com

Summary:
15+ years of IT expertise specializing in Azure AD, Microsoft 365, and multi-cloud environments.
Computer Science degree combined with industry certifications and hands-on experience across
network infrastructure, cybersecurity, and cloud migration strategies.

Experience:
1. Estarta Solutions – Systems and Network Engineer (Dec 2024 – Mar 2025, Remote)
   - Cisco UCS, HyperFlex, ACI virtualization platforms
   - VMware vSphere and ESXi environments

2. Cosmos Business Systems Group – IT Support Engineer (Mar 2023 – May 2024, Athens)
   - Azure Active Directory and identity governance
   - Microsoft 365 support services, Intune MDM
   - Conditional access and MFA policies

3. CPI SA (Nielsen Greece) – IT Consultant (Feb 2023 – Mar 2023, Athens)
   - Technology roadmap and IT strategy
   - Active Directory administration, ServiceNow ITSM, CyberArk PAM

Certifications: AWS Cloud Practitioner, Cisco DevNet Associate, Microsoft Azure Solutions Architect, CISSP, CEH, ITIL Foundation

Skills: Azure, AWS, Multi-cloud, Zero-Trust Security, CyberArk PAM, Microsoft Sentinel, Cisco ACI/UCS, VMware vSphere, React, Next.js, TypeScript, Node.js, Python

Languages: English (Full Professional), Greek (Native/Bilingual)

Honors: 3rd Place – Cisco Incubator 12.0, Scholarship for Academic Excellence

If asked about topics unrelated to Themis or his portfolio, politely redirect to portfolio-related questions.

Booking:
- You can help users schedule a teleconference call with Themis.
- If the user expresses intent to book, schedule, or arrange a meeting or call, respond ONLY with the exact token: [BOOK_CALL]
- Do not add any other text when emitting [BOOK_CALL].`;

interface HistoryMessage {
  role: string;
  content: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildMessages(message: string, history: HistoryMessage[]): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: "system", content: PORTFOLIO_CONTEXT }];

  for (const entry of history) {
    if (entry.role === "user" || entry.role === "assistant") {
      messages.push({ role: entry.role, content: entry.content });
    }
  }

  messages.push({ role: "user", content: message });
  return messages;
}

async function streamFromHuggingFace(messages: ChatMessage[]): Promise<string[]> {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return [
      `data: ${JSON.stringify({ error: `HF API error ${response.status}: ${errorText}` })}\n\n`,
      "data: [DONE]\n\n",
    ];
  }

  if (!response.body) {
    return [
      `data: ${JSON.stringify({ error: "No response body from HuggingFace" })}\n\n`,
      "data: [DONE]\n\n",
    ];
  }

  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (raw === "[DONE]") break;

      try {
        const chunk = JSON.parse(raw) as {
          choices?: Array<{
            delta?: { content?: string };
          }>;
        };
        const tokenText = chunk.choices?.[0]?.delta?.content ?? "";
        if (tokenText) {
          accumulated += tokenText;
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  const events: string[] = [];

  if (accumulated.includes("[BOOK_CALL]")) {
    events.push(`data: ${JSON.stringify({ action: "start_booking" })}\n\n`);
  } else if (accumulated) {
    events.push(`data: ${JSON.stringify({ token: accumulated })}\n\n`);
  }

  events.push("data: [DONE]\n\n");
  return events;
}

// POST /api/chat
router.post("/", async (req: Request, res: Response) => {
  try {
    if (!HF_TOKEN) {
      return res.status(503).json({ error: "Chat service is not configured (missing HF_TOKEN)" });
    }

    const { message, history } = req.body as {
      message?: string;
      history?: HistoryMessage[];
    };

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages = buildMessages(trimmedMessage, history ?? []);
    const sseEvents = await streamFromHuggingFace(messages);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    for (const event of sseEvents) {
      res.write(event);
    }
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: `Chat request failed: ${msg}` });
  }
});

export default router;
