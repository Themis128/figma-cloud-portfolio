# Portfolio Chatbot

An AI-powered chat assistant embedded in the portfolio site. It answers visitor questions about Themistoklis Baltzakis's background, skills, experience, and certifications using `Qwen/Qwen2.5-7B-Instruct` via the HuggingFace Inference API.

## Architecture

```
Browser (ChatbotWidget.tsx)
  └─ POST /api/chat  ←── Express server (server/routes/chat.ts)
       └─ POST https://router.huggingface.co/v1/chat/completions
            └─ Qwen/Qwen2.5-7B-Instruct (HuggingFace Router — free tier)
```

Responses are **buffered** server-side and delivered to the browser as a single Server-Sent Events batch once the model completes. The client reads the SSE stream and renders the full reply in one shot.

## Features

- **Streaming-compatible SSE** — token-by-token delivery ready; currently full-response buffering for reliability
- **Conversation history** — multi-turn context preserved per session
- **Portfolio RAG** — full resume context injected as system prompt (no external vector DB)
- **Cyberpunk UI** — dark glass-morphism panel, cyan accent, `font-mono`
- **Suggested questions** — clickable prompts shown on first open
- **Booking flow** — `[BOOK_CALL]` token triggers the booking card
- **Graceful errors** — API failures displayed inline without crashing

## Files

| File                               | Purpose                                                        |
| ---------------------------------- | -------------------------------------------------------------- |
| `src/components/ChatbotWidget.tsx` | React UI component (floating button + chat panel)              |
| `server/routes/chat.ts`            | Express route — calls HuggingFace router, returns SSE stream   |

## Local Development

### 1. Set `HF_TOKEN` in `.env`

```
HF_TOKEN=hf_your_token_here
```

### 2. Start the Express dev server

```bash
pnpm dev:server
```

### 3. Start the Next.js app

```bash
pnpm dev
```

Open the portfolio in your browser and click **Chat with AI** in the bottom-left corner.

## Environment Variables

| Variable   | Required | Default | Description                                   |
| ---------- | -------- | ------- | --------------------------------------------- |
| `HF_TOKEN` | **Yes**  | —       | HuggingFace API token with Inference API access |

## Model

| Property   | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Model ID   | `Qwen/Qwen2.5-7B-Instruct`                                |
| Provider   | HuggingFace Router (`router.huggingface.co`)              |
| Tier       | Free (no gated license, no paid provider routing required) |
| Max tokens | 512                                                       |
| Temp       | 0.7                                                       |

The model is selected because it is freely available on the HuggingFace router without requiring a gated license agreement or a paid subscription. The chat completions endpoint (`/v1/chat/completions`) follows the OpenAI-compatible format — no model-specific prompt template required.

## Prompt Engineering

The system prompt is hardcoded in `server/routes/chat.ts` (`PORTFOLIO_CONTEXT`). It includes:

- Name, title, location, contact
- Work experience (3 roles)
- Certifications (AWS, Cisco, Azure, CISSP, CEH, ITIL)
- Skill categories (Cloud, Security, Networking, Development, Tools)
- Languages and honors
- Booking instructions (emit `[BOOK_CALL]` token)

To update the portfolio context, edit `PORTFOLIO_CONTEXT` in `server/routes/chat.ts` and redeploy the Express server.

## SSE Protocol

The Express route yields events in this format:

```
data: {"token": "Full assistant reply here"}\n\n
data: [DONE]\n\n
```

On booking intent:

```
data: {"action": "start_booking"}\n\n
data: [DONE]\n\n
```

On error:

```
data: {"error": "HF API error 429: ..."}\n\n
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

| Symptom                             | Likely cause                  | Fix                                                              |
| ----------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| "Chat service is not configured"    | `HF_TOKEN` not set            | Add `HF_TOKEN` to `.env`                                         |
| "HF API error 401"                  | Invalid `HF_TOKEN`            | Regenerate token at huggingface.co/settings/tokens               |
| "HF API error 429"                  | Free-tier rate limit hit      | Wait and retry; free tier allows ~1000 req/day                   |
| "model_not_supported" error         | Model not available on router | Change `HF_MODEL` in `server/routes/chat.ts` to a supported one  |
| Tokens appear then stop mid-reply   | `max_tokens` limit hit        | Increase `max_tokens` in `server/routes/chat.ts` (currently 512) |
| No reply, no error                  | Express server not running    | Start with `pnpm dev:server`                                     |
