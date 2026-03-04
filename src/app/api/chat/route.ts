import { type NextRequest, NextResponse } from "next/server";

const HF_TOKEN = process.env.HF_TOKEN ?? "";
const HF_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
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
   - Network virtualization with Cisco ACI and Nexus

2. Cosmos Business Systems Group – IT Support Engineer (Mar 2023 – May 2024, Athens)
   - Azure Active Directory and identity governance
   - Microsoft 365 support services
   - Microsoft Intune for mobile device management
   - Conditional access and MFA policies

3. CPI SA (Nielsen Greece) – IT Consultant (Feb 2023 – Mar 2023, Athens)
   - Technology roadmap and IT strategy
   - Active Directory administration
   - ServiceNow ITSM, CyberArk PAM

Education:
- Master's in Informatics and Telematics (Data-driven Agricultural Innovations) – Harokopio University (2023–Present)
- BSc Computer Science – University of Piraeus (2006–2013)

Certifications:
- AWS Cloud Practitioner
- Cisco DevNet Associate
- Microsoft Azure Solutions Architect
- CISSP (Certified Information Systems Security Professional)
- CEH (Certified Ethical Hacker)
- ITIL Foundation

Skills:
- Cloud: Microsoft Azure, AWS, Multi-cloud Migration, Infrastructure as Code
- Security: Zero-Trust Security, Azure AD, CyberArk PAM, Microsoft Sentinel
- Networking: Cisco ACI, Cisco UCS, VMware vSphere, Nexus Switching
- Development: React, Next.js, TypeScript, Node.js, Python
- Tools: Microsoft 365, ServiceNow, Microsoft Intune, GitHub Actions

Languages: English (Full Professional), Greek (Native/Bilingual)

Honors:
- 3rd Place – Cisco Incubator 12.0 (Customer Experience Track)
- Scholarship Recipient (Academic Excellence)

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

/**
 * Build an OpenAI-compatible messages array with system context and history.
 */
function buildMessages(
  message: string,
  history: HistoryMessage[],
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: "system", content: PORTFOLIO_CONTEXT },
  ];

  for (const entry of history) {
    if (entry.role === "user" || entry.role === "assistant") {
      messages.push({ role: entry.role, content: entry.content });
    }
  }

  messages.push({ role: "user", content: message });
  return messages;
}

/**
 * Call HuggingFace Inference API (OpenAI-compatible chat completions),
 * accumulate tokens, detect booking intent, and return SSE events.
 */
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
    return [`data: ${JSON.stringify({ error: `HF API error ${response.status}: ${errorText}` })}\n\n`, "data: [DONE]\n\n"];
  }

  if (!response.body) {
    return [`data: ${JSON.stringify({ error: "No response body from HuggingFace" })}\n\n`, "data: [DONE]\n\n"];
  }

  const reader = response.body.getReader();
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
            finish_reason?: string | null;
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

  // Build SSE events
  const events: string[] = [];

  if (accumulated.includes("[BOOK_CALL]")) {
    events.push(`data: ${JSON.stringify({ action: "start_booking" })}\n\n`);
  } else if (accumulated) {
    events.push(`data: ${JSON.stringify({ token: accumulated })}\n\n`);
  }

  events.push("data: [DONE]\n\n");
  return events;
}

export async function POST(request: NextRequest) {
  try {
    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: "Chat service is not configured (missing HF_TOKEN)" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      message?: string;
      history?: HistoryMessage[];
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const history = body.history ?? [];
    const messages = buildMessages(message, history);
    const sseEvents = await streamFromHuggingFace(messages);

    // Return as SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        for (const event of sseEvents) {
          controller.enqueue(encoder.encode(event));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Chat request failed: ${msg}` },
      { status: 500 },
    );
  }
}
