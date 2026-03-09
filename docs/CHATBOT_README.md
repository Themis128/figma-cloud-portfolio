# Portfolio Chatbot

An AI-powered chat assistant embedded in the portfolio site. It answers visitor questions about Themistoklis Baltzakis's background, skills, experience, and certifications using `mistralai/Mistral-7B-Instruct-v0.3` via the HuggingFace Inference API.

## Architecture

```
Browser (ChatbotWidget.tsx)
  └─ POST /api/chat  ←── Next.js Route (src/app/api/chat/route.ts)
       └─ POST http://<PYTHON_BOT_URL>/api/chat/stream  ←── Python FastAPI (server/bot/main.py)
            └─ HuggingFace Inference API  (Mistral-7B-Instruct-v0.3)
```

Responses stream token-by-token using **Server-Sent Events (SSE)**. The Next.js proxy pipes the stream through so the browser reads tokens as they arrive.

## Features

- **Streaming responses** — tokens appear in real time
- **Conversation history** — multi-turn context preserved per session
- **Portfolio RAG** — full resume context injected as system prompt (no external vector DB)
- **Cyberpunk UI** — dark glass-morphism panel, cyan accent, `font-mono`
- **Suggested questions** — clickable prompts shown on first open
- **Graceful errors** — connection failures displayed inline without crashing

## Files

| File                               | Purpose                                                |
| ---------------------------------- | ------------------------------------------------------ |
| `src/components/ChatbotWidget.tsx` | React UI component (floating button + chat panel)      |
| `src/app/api/chat/route.ts`        | Next.js API route — proxies to Python backend          |
| `server/bot/main.py`               | Python FastAPI — calls HuggingFace, returns SSE stream |
| `server/bot/requirements.txt`      | Python dependencies                                    |
| `server/bot/.env.example`          | Environment variable template for the Python service   |

## Local Development

### 1. Python backend

```bash
cd server/bot
cp .env.example .env
# Edit .env — set HF_TOKEN to your HuggingFace token
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

Verify it's up:

```bash
curl http://localhost:8001/api/health
# {"status":"ok","model":"mistralai/Mistral-7B-Instruct-v0.3"}
```

### 2. Next.js app

Add to `.env.local`:

```
PYTHON_BOT_URL=http://localhost:8001
```

Start the dev server:

```bash
pnpm dev
```

Open the portfolio in your browser and click **Chat with AI** in the bottom-right corner.

## Environment Variables

### Next.js app (`.env.local`)

| Variable         | Required | Default                 | Description                       |
| ---------------- | -------- | ----------------------- | --------------------------------- |
| `PYTHON_BOT_URL` | No       | `http://localhost:8001` | URL of the Python FastAPI backend |

### Python backend (`server/bot/.env`)

| Variable           | Required | Default | Description                                            |
| ------------------ | -------- | ------- | ------------------------------------------------------ |
| `HF_TOKEN`         | **Yes**  | —       | HuggingFace API token with Inference API access        |
| `PORTFOLIO_ORIGIN` | No       | `*`     | CORS allowed origin — set to your domain in production |
| `PORT`             | No       | `8001`  | Port to listen on                                      |

## Deployment

The Next.js app is deployed on **AWS Amplify** (or S3 + CloudFront). The Python service needs separate hosting since it is a long-running process. Recommended options:

| Option                        | Notes                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| **AWS App Runner**            | Easy container deployment, scales to zero                            |
| **AWS ECS Fargate**           | Full container control, suits production workloads                   |
| **AWS EC2**                   | Direct VM hosting, most control                                      |
| **AWS Lambda + Function URL** | Works for short requests; streaming requires response streaming mode |

Set `PYTHON_BOT_URL` in Amplify's environment variable settings to the deployed Python service URL.

## Prompt Engineering

The system prompt is hardcoded in `server/bot/main.py` (`PORTFOLIO_CONTEXT`). It includes:

- Name, title, location, contact
- Work experience (3 roles)
- Education (Bachelor's + Master's)
- Certifications (AWS, Cisco, Azure, CISSP, CEH, ITIL)
- Skill categories (Cloud, Security, Networking, Development, Tools)
- Languages and honors

To update the portfolio context, edit `PORTFOLIO_CONTEXT` in `server/bot/main.py` and redeploy the Python service.

## Chat Template

Mistral-7B-Instruct uses a specific prompt format. The `build_mistral_prompt()` function in `main.py` constructs:

```
<s>[INST] {system_context}\n\n{first_user_message} [/INST] {assistant_response} </s>
[INST] {next_user_message} [/INST] ...
```

The system context is injected into the first user turn (Mistral-7B-Instruct-v0.3 does not have a native `<system>` token).

## SSE Protocol

The Python backend yields lines in this format:

```
data: {"token": "Hello"}\n\n
data: {"token": " there"}\n\n
data: [DONE]\n\n
```

On error:

```
data: {"error": "HF API error 503: ..."}\n\n
```

The frontend `ChatbotWidget.tsx` reads `response.body` with `getReader()`, splits on `\n`, and appends each `token` to the last assistant message in state.

## Accessibility

The chatbot widget follows WCAG 2.2 guidelines:

- **ARIA labels**: Toggle button has dynamic `aria-label` ("Open chat" when closed, "Chat is open" when open)
- **`inert` attribute**: When the chat panel is open, the floating toggle button is marked `inert` to remove it from the accessibility tree and prevent focus conflicts (replaces the previous `aria-hidden` approach which caused warnings when focus was retained on a hidden element)
- **`tabIndex`**: Toggle button gets `tabIndex={-1}` when the panel is open to prevent keyboard focus
- **Keyboard navigation**: Chat input is focusable, Enter sends messages, Escape does not close (preserves conversation)
- **Focus management**: When chat opens, the panel receives visual focus; when closed, the toggle button becomes interactive again

## Troubleshooting

| Symptom                              | Likely cause                  | Fix                                                             |
| ------------------------------------ | ----------------------------- | --------------------------------------------------------------- |
| "Failed to connect to chat backend"  | Python service not running    | Start `uvicorn main:app --port 8001`                            |
| "HF API error 401"                   | Invalid or missing `HF_TOKEN` | Check `.env` in `server/bot/`                                   |
| "HF API error 503"                   | Model loading (cold start)    | Wait ~30 seconds and retry; HF free tier loads models on demand |
| Tokens appear then stop mid-sentence | `max_new_tokens` limit hit    | Increase `max_new_tokens` in `main.py` (currently 512)          |
| CORS error in browser                | `PORTFOLIO_ORIGIN` mismatch   | Set `PORTFOLIO_ORIGIN` to your frontend URL in Python `.env`    |
