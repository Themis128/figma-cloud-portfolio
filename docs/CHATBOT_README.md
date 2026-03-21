# Portfolio Chatbot

An AI-powered chat assistant embedded in the portfolio site. It answers visitor questions about Themistoklis Baltzakis's background, skills, experience, and certifications using **AWS Bedrock** (Claude 3.5 Haiku) with the full knowledge base loaded into the system prompt — fast, accurate, and cost-effective.

## Architecture

```
Browser (ChatbotWidget.tsx)
  └─ POST /api/chat  ←── Express server (server/routes/chat.ts, port 3001)
       └─ ConverseStream API
            └─ AWS Bedrock (Claude 3.5 Haiku)
                 └─ System prompt includes full knowledge base (~25 KB, 10 markdown files)
```

The Express server calls AWS Bedrock directly using the `@aws-sdk/client-bedrock-runtime` SDK. All 10 knowledge files are loaded into the system prompt at startup — no separate vector database or RAG pipeline needed.

## Features

- **Fast responses** — ~1-3 seconds per query via AWS Bedrock
- **Grounded answers** — full knowledge base in the system prompt prevents hallucination
- **Low cost** — Claude 3.5 Haiku: ~$0.005 per query (~$5/month for 1,000 queries)
- **Conversation history** — multi-turn context preserved per session (last 6 messages)
- **SSE streaming** — incremental token-by-token Server-Sent Events delivery to the browser
- **Cyberpunk UI** — dark glass-morphism panel, cyan accent, `font-mono`
- **Suggested questions** — 3 randomly selected prompts from a pool of ~40, plus a pinned booking prompt, shown on first open
- **Booking flow** — `[BOOK_CALL]` token triggers the BookingCard component (Cal.com integration)
- **Graceful errors** — failures displayed inline without crashing

## Files

| File | Purpose |
| --- | --- |
| `src/components/ChatbotWidget.tsx` | React UI component (floating button + chat panel) |
| `src/components/BookingCard.tsx` | Booking UI triggered by `[BOOK_CALL]` action |
| `server/routes/chat.ts` | Express route — calls AWS Bedrock, streams SSE back |
| `server/bot/knowledge/*.md` | 10 knowledge base files (identity, experience, skills, etc.) |

## Knowledge Base

The knowledge base consists of 10 markdown files in `server/bot/knowledge/`:

| File | Content |
| --- | --- |
| `01_identity.md` | Name, title, location, contact info |
| `02_professional_summary.md` | Career overview, key strengths |
| `03_work_experience.md` | 8 roles across 15+ years |
| `04_education.md` | Degrees, certifications, academy programs |
| `05_certifications_skills.md` | 11 certifications + technical skill categories |
| `06_projects.md` | 6 portfolio projects |
| `07_portfolio_website.md` | Portfolio tech stack details |
| `08_ai_agents.md` | AI agent templates |
| `09_services_offerings.md` | Professional services and offerings |
| `10_booking_faq.md` | Booking instructions, FAQ |

All files are loaded into the system prompt at startup (~25 KB, ~6,300 tokens). To update the chatbot's knowledge, edit the markdown files and restart the Express server.

## Local Development

### Start development servers

```bash
pnpm dev:all
```

This starts:
- Next.js dev server (port 3000)
- Express dev server (port 3001) — handles `/api/chat` via Bedrock

Open the portfolio in your browser and click **Chat with AI** in the bottom-left corner.

### Prerequisites

- AWS credentials configured (`~/.aws/credentials` or environment variables)
- Bedrock model access enabled for Claude 3.5 Haiku in `us-east-1`

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `BEDROCK_REGION` | No | `us-east-1` | AWS region for Bedrock API calls |
| `BEDROCK_MODEL_ID` | No | `us.anthropic.claude-3-5-haiku-20241022-v1:0` | Bedrock inference profile ID |
| `AWS_ACCESS_KEY_ID` | Yes | (from AWS config) | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | Yes | (from AWS config) | AWS credentials |

## Model

| Property | Value |
| --- | --- |
| Model | Claude 3.5 Haiku |
| Provider | AWS Bedrock (inference profile) |
| Model ID | `us.anthropic.claude-3-5-haiku-20241022-v1:0` |
| Max output tokens | 512 |
| Temperature | 0.3 |
| Top-p | 0.9 |
| Cost (input) | $0.80 / 1M tokens |
| Cost (output) | $4.00 / 1M tokens |
| Typical response time | 1-3 seconds |

## SSE Protocol

The Express route streams incremental tokens as they arrive from Bedrock:

```
data: {"token": "Hello"}\n\n
data: {"token": " there"}\n\n
data: {"token": "!"}\n\n
data: [DONE]\n\n
```

Each `token` event contains a small chunk of text (typically a word or partial word). The frontend appends each chunk to the assistant message in real time, producing a typewriter effect.

On booking intent:

```
data: {"action": "start_booking"}\n\n
data: [DONE]\n\n
```

On error:

```
data: {"error": "Chat request failed: ..."}\n\n
data: [DONE]\n\n
```

The frontend `ChatbotWidget.tsx` reads `response.body` with `getReader()`, splits on `\n`, and appends each `token` to the last assistant message in state.

## Accessibility

The chatbot widget follows WCAG 2.2 guidelines:

- **ARIA labels**: Toggle button has dynamic `aria-label` ("Open chat" when closed, "Chat is open" when open)
- **`inert` attribute**: When the chat panel is open, the floating toggle button is marked `inert` to remove it from the accessibility tree
- **`tabIndex`**: Toggle button gets `tabIndex={-1}` when the panel is open to prevent keyboard focus
- **Keyboard navigation**: Chat input is focusable, Enter sends messages
- **Focus management**: When chat opens, the input is auto-focused

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Chat request failed" | Express server not running | Start with `pnpm dev:all` |
| "Access denied" from Bedrock | Missing model access | Enable Claude 3.5 Haiku in AWS Bedrock console |
| "Invalid payment instrument" | AWS billing not set up | Add payment method in AWS Billing console |
| "Credentials not found" | AWS not configured | Run `aws configure` or set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Empty responses | Knowledge base not found | Verify `server/bot/knowledge/*.md` files exist |
