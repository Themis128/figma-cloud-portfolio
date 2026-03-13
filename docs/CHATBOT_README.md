# Portfolio Chatbot

An AI-powered chat assistant embedded in the portfolio site. It answers visitor questions about Themistoklis Baltzakis's background, skills, experience, and certifications using a **fully offline RAG pipeline** with a local LLM — no internet or API keys required after initial setup.

## Architecture

```
Browser (ChatbotWidget.tsx)
  └─ POST /api/chat  ←── Express server (server/routes/chat.ts, port 3001)
       └─ POST http://localhost:8001/api/chat/stream
            └─ FastAPI (server/bot/main.py)
                 ├─ RAG: ChromaDB + sentence-transformers (all-MiniLM-L6-v2)
                 └─ LLM: llama-cpp-python (Llama 3.2 3B Instruct Q4_K_M GGUF)
```

The Express server acts as a **proxy** — it forwards requests to the FastAPI bot and streams SSE responses back to the browser unchanged. All AI logic (retrieval, generation) runs in the FastAPI process.

## Features

- **Fully offline** — no internet, API keys, or external services needed after setup
- **RAG (Retrieval-Augmented Generation)** — 10 knowledge files indexed into ChromaDB vector store
- **Local LLM** — Llama 3.2 3B Instruct (Q4_K_M quantization, ~1.9 GB) via llama-cpp-python
- **GPU acceleration** — automatic GPU offloading when CUDA is available (`N_GPU_LAYERS=-1`)
- **Conversation history** — multi-turn context preserved per session
- **SSE streaming** — Server-Sent Events delivery to the browser
- **Cyberpunk UI** — dark glass-morphism panel, cyan accent, `font-mono`
- **Suggested questions** — clickable prompts shown on first open
- **Booking flow** — `[BOOK_CALL]` token triggers the BookingCard component (Cal.com integration)
- **Graceful errors** — failures displayed inline without crashing

## Files

| File | Purpose |
| --- | --- |
| `src/components/ChatbotWidget.tsx` | React UI component (floating button + chat panel) |
| `src/components/BookingCard.tsx` | Booking UI triggered by `[BOOK_CALL]` action |
| `server/routes/chat.ts` | Express proxy — forwards to FastAPI bot, streams SSE back |
| `server/bot/main.py` | FastAPI app — RAG retrieval + local LLM generation |
| `server/bot/indexer.py` | Builds ChromaDB vector index from knowledge markdown files |
| `server/bot/download_model.py` | One-time download of GGUF model from HuggingFace Hub |
| `server/bot/setup.sh` | Automated setup script (venv, dependencies, model, index) |
| `server/bot/requirements.txt` | Python dependencies |
| `server/bot/knowledge/*.md` | 10 knowledge base files (identity, experience, skills, etc.) |

## Knowledge Base

The RAG knowledge base consists of 10 markdown files in `server/bot/knowledge/`:

| File | Content |
| --- | --- |
| `01_identity.md` | Name, title, location, contact info |
| `02_professional_summary.md` | Career overview, key strengths |
| `03_work_experience.md` | 8 roles: Printec, Germanos (14yr), INFORM, Vodafone, airport, etc. |
| `04_education.md` | 6 entries: University of Greater Manchester, Hellenic Open University, Cisco Academy, etc. |
| `05_certifications_skills.md` | 11 certifications (AWS, CISSP, CEH, Okta, CCNA) + skill categories |
| `06_projects.md` | 6 portfolio projects |
| `07_website_tech.md` | Portfolio tech stack details (Next.js, Tailwind, Three.js, etc.) |
| `08_ai_agents.md` | AI agent implementations |
| `09_services.md` | Professional services and offerings |
| `10_booking_faq.md` | Booking instructions, FAQ |

The indexer chunks these files (500 chars, 100 char overlap) and embeds them using `all-MiniLM-L6-v2` into ChromaDB. At query time, the top 5 most relevant chunks are retrieved and injected into the system prompt.

## Local Development

### 1. Run the setup script (one-time)

```bash
cd server/bot && bash setup.sh
```

This creates a Python venv, installs dependencies, downloads the LLM model (~1.9 GB), and builds the ChromaDB index (~70 chunks).

### 2. Start all services

```bash
pnpm dev:all
```

This starts:
- Next.js dev server (port 3000)
- Express dev server (port 3001)
- FastAPI bot server (port 8001)

Or start services individually:

```bash
pnpm dev          # Next.js
pnpm dev:server   # Express
pnpm dev:bot      # FastAPI bot
```

Open the portfolio in your browser and click **Chat with AI** in the bottom-left corner.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `BOT_URL` | No | `http://localhost:8001` | FastAPI bot URL (Express proxy target) |
| `N_GPU_LAYERS` | No | `-1` | GPU layers to offload (-1 = all, 0 = CPU only) |
| `PORT` | No | `8001` | FastAPI server port |
| `PORTFOLIO_ORIGIN` | No | `*` | CORS allowed origin |

No API keys required — the chatbot runs fully offline.

## Model

| Property | Value |
| --- | --- |
| Model | Llama 3.2 3B Instruct |
| Quantization | Q4_K_M (~1.9 GB) |
| Source | `bartowski/Llama-3.2-3B-Instruct-GGUF` (HuggingFace Hub) |
| Runtime | llama-cpp-python (CPU + optional GPU) |
| Context window | 4096 tokens |
| Max output tokens | 512 |
| Temperature | 0.7 |
| Top-p | 0.9 |
| Stop token | `<\|eot_id\|>` |

The model runs locally via llama-cpp-python. On systems with CUDA-capable GPUs, layers are automatically offloaded for faster inference. CPU-only inference works but is slower (~5-15s per response vs ~1-3s with GPU).

## RAG Pipeline

1. **Indexing** (`indexer.py`): Knowledge markdown files → chunked (500 chars, 100 overlap) → embedded with `all-MiniLM-L6-v2` → stored in ChromaDB (cosine similarity)
2. **Retrieval** (`main.py`): User query → embedded → top 5 chunks retrieved from ChromaDB
3. **Generation** (`main.py`): System prompt + retrieved context + conversation history → local LLM → streamed response

To rebuild the knowledge base after editing knowledge files:

```bash
cd server/bot && ./venv/bin/python indexer.py
```

## SSE Protocol

The FastAPI bot yields events in this format:

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
data: {"error": "LLM error: ..."}\n\n
data: [DONE]\n\n
```

The frontend `ChatbotWidget.tsx` reads `response.body` with `getReader()`, splits on `\n`, and appends each `token` to the last assistant message in state.

## Health Check

```bash
curl http://localhost:8001/api/health
```

Returns:

```json
{
  "status": "ok",
  "model": {
    "name": "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    "loaded": true,
    "local": true,
    "gpu_layers": -1
  },
  "rag": {
    "indexed": true,
    "chunks": 70
  }
}
```

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
| "Chat request failed" | FastAPI bot not running | Start with `pnpm dev:bot` |
| "Model not found" error in bot logs | GGUF model not downloaded | Run `cd server/bot && ./venv/bin/python download_model.py` |
| "Collection not found" warning | ChromaDB index not built | Run `cd server/bot && ./venv/bin/python indexer.py` |
| `ModuleNotFoundError` | Wrong Python (system vs venv) | Use `./venv/bin/python` or `./venv/bin/uvicorn` directly |
| Slow responses (>10s) | CPU-only inference | Set `N_GPU_LAYERS=-1` if GPU available, or accept slower CPU speed |
| Port 8001 already in use | Old bot process still running | `kill $(lsof -t -i :8001)` then restart |
| No response, no error | Express server not running | Start with `pnpm dev:server` |
