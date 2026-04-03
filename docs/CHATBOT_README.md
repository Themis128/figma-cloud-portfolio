# Portfolio Chatbot

An AI-powered chat assistant embedded in the portfolio site. It answers visitor questions about Themistoklis Baltzakis's background, skills, experience, and certifications using **AWS Bedrock** (Claude 3.5 Haiku) with the full knowledge base loaded into the system prompt, **Bedrock tool use** for live data, and **blog RAG** for article search. Fast, accurate, and cost-effective.

## Architecture

```
Browser (ChatbotWidget.tsx)
  └─ POST /api/chat  ←── Express server (server/routes/chat.ts, port 3001)
       └─ ConverseStream API (with toolConfig)
            └─ AWS Bedrock (Claude 3.5 Haiku)
                 ├─ System prompt includes full knowledge base (~33 KB, 10 markdown files)
                 ├─ Blog index (MDX posts loaded at startup for RAG search)
                 └─ Tool use loop (up to 2 rounds):
                      ├─ search_portfolio — keyword search across skills, pages, experience
                      ├─ search_blog — full-text search of blog MDX posts with excerpts
                      ├─ get_github_stats — live GitHub profile via API
                      ├─ check_booking_availability — Cal.com slot availability
                      ├─ get_resume_link — resume download/view URLs
                      ├─ get_site_performance — CrUX field data (Core Web Vitals)
                      ├─ search_projects — keyword search across portfolio projects
                      ├─ send_message_to_themis — send contact form message via /api/contact
                      └─ get_system_health — system health status from /api/health
```

The Express server calls AWS Bedrock directly using the `@aws-sdk/client-bedrock-runtime` SDK. All 10 knowledge files are loaded into the system prompt at startup, no separate vector database needed. Blog posts are indexed from MDX source files for RAG search. When the model requests a tool, the server executes it and re-invokes Bedrock with the result.

## Features

- **Fast responses**: ~1-3 seconds per query via AWS Bedrock (longer when tools are used)
- **Grounded answers**: full knowledge base in the system prompt prevents hallucination
- **Tool use**: Bedrock native tool use for live data (10 tools: portfolio/blog/project search, GitHub stats, booking slots, resume links, site performance, contact form, system health)
- **Blog RAG**: MDX blog posts indexed at startup; keyword search returns titles, descriptions, and excerpts
- **Action tokens**: special tokens trigger UI interactions:
  - `[BOOK_CALL]`: opens the BookingCard component (Cal.com integration)
  - `[CONTACT]`: navigates to the contact page
  - `[GOTO:/path/]`: renders a clickable navigation link in the chat bubble
- **Low cost**: Claude 3.5 Haiku: ~$0.005 per query (~$5/month for 1,000 queries)
- **Conversation history**: multi-turn context preserved per session (last 6 messages)
- **SSE streaming**: incremental token-by-token Server-Sent Events delivery to the browser
- **Thinking indicator**: animated dots shown while tools execute server-side
- **Cyberpunk UI**: dark glass-morphism panel, cyan accent, `font-mono`
- **Suggested questions**: 3 randomly selected prompts from a pool of ~40, plus pinned contact and booking prompts
- **AI cover letter generator**: visitors can paste a job description and the chatbot generates a tailored 3-4 paragraph cover letter highlighting Themis's relevant experience
- **Graceful errors**: failures displayed inline without crashing

## Files

| File | Purpose |
| --- | --- |
| `src/components/ChatbotWidget.tsx` | React UI component (floating button + chat panel, handles all action types) |
| `src/components/BookingCard.tsx` | Booking UI triggered by `[BOOK_CALL]` action |
| `server/routes/chat.ts` | Express route: Bedrock with tool use, blog RAG, action tokens, SSE streaming |
| `server/bot/knowledge/*.md` | 10 knowledge base files (identity, experience, skills, etc.) |
| `content/blog/*.mdx` | Blog posts indexed for RAG search at startup |

## Knowledge Base

The knowledge base consists of 10 markdown files in `server/bot/knowledge/`:

| File | Content |
| --- | --- |
| `01_identity.md` | Name, title, location, contact info, GitHub profile stats (54 repos, language breakdown), Credly profile link |
| `02_professional_summary.md` | Career overview, key strengths |
| `03_work_experience.md` | 7 roles across 15+ years |
| `04_education.md` | Degrees, certifications, academy programs |
| `05_certifications_skills.md` | 4 professional certs + 16 Credly badges + 6 skill domains — structured metadata (`id`, `issuer`, `domain`, `issued`) for tool parsing |
| `06_projects.md` | 16 portfolio projects — structured metadata (`year`, `category`, `featured`, `domains`, `technologies`) for tool parsing |
| `07_portfolio_website.md` | Portfolio tech stack, 15 pages, features, deployment |
| `08_ai_agents.md` | AI agent concepts, patterns, templates, Blockly builder |
| `09_services_offerings.md` | Services with domain tags for cross-referencing, project types, contact methods |
| `10_booking_faq.md` | Booking instructions, FAQ |

All files are loaded into the system prompt at startup (~35 KB, ~8,500 tokens). Knowledge is wrapped in `<knowledge_base>` XML tags and instructions in `<instructions>` tags per Bedrock best practices. To update the chatbot's knowledge, edit the markdown files and restart the Express server.

### Knowledge Base Format

Knowledge files use structured metadata for reliable tool parsing:

- **Certifications** (`05_certifications_skills.md`): Each cert/badge has `id`, `name`, `issuer`, `domain`, `issued`, `description` fields. Skills are grouped under `### domain:` headers (networking, cybersecurity, cloud, data, development, infrastructure).
- **Projects** (`06_projects.md`): Each project has `year`, `category`, `featured`, `domains`, `technologies`, `github`/`live` URL, and `description` fields.
- **Services** (`09_services_offerings.md`): Each service has `### service:` header with `domains` field for cross-referencing with skills and certifications.

## NLP Pipeline

All search tools share a common NLP pipeline that processes queries before matching:

1. **Tokenization**: split query into words, strip punctuation
2. **Stop-word removal**: filters 100+ common English words ("what", "the", "is", "does", etc.)
3. **Synonym expansion**: maps domain-specific terms to knowledge base vocabulary:
   - `infosec` → cybersecurity, security
   - `k8s` → kubernetes
   - `certs` → certifications, certified
   - `IAM` → identity, access, management, cyberark
   - `datacenter` → cisco, ucs, hyperflex, aci
   - 30+ mappings covering cybersecurity, cloud, networking, and general terms
4. **Stemming**: reduces words to approximate roots (e.g., "certifications" → "certif", "networking" → "network")
5. **TF-IDF scoring**: term frequency weighted by inverse document frequency; rarer terms score higher

This means a query like "What infosec certs does he have?" becomes search terms `["infosec", "cybersecurity", "security", "cert", "certif", "certified"]`, matching across word forms and domain synonyms.

## Tool Use (Bedrock Native)

The chatbot uses Bedrock's native `toolConfig` parameter in `ConverseStreamCommand`. When the model determines it needs live data, it requests a tool call. The server executes the tool and re-invokes Bedrock with the result (up to 2 rounds).

| Tool | Trigger | Data Source |
| --- | --- | --- |
| `search_portfolio` | Questions about specific skills, pages, or experience | 24-entry index with keyword tags, TF-IDF scoring |
| `search_blog` | Questions about blog articles or written content | MDX files indexed at startup, dense excerpt extraction |
| `get_github_stats` | Questions about GitHub activity or open source work | GitHub REST API |
| `check_booking_availability` | Questions about scheduling or availability | Cal.com API |
| `get_resume_link` | Questions about resume, CV, or downloading credentials | Static resume URLs |
| `get_site_performance` | Questions about site speed or Core Web Vitals | CrUX API (Chrome User Experience Report) |
| `search_projects` | Questions about specific portfolio projects or tech used | Project index with title, description, tech stack |
| `send_message_to_themis` | Visitor wants to send a message or get in touch | POST to `/api/contact` endpoint |
| `get_system_health` | Questions about site status, uptime, or system health | GET from `/api/health` endpoint |

The system prompt includes an **intent classification framework** that guides the model on when to use tools vs answer directly from the knowledge base, reducing unnecessary tool calls and latency.

### Tool Reference

Detailed specification for each of the 10 tools:

| Tool | Parameters | Returns |
| --- | --- | --- |
| `search_portfolio` | `query` (string): search keywords | `{ results: [{ title, description, keywords, category, score }], total, query }` |
| `search_blog` | `query` (string): search keywords | `{ results: [{ title, description, url, excerpt }], total, query }` |
| `get_github_stats` | None | `{ username, public_repos, followers, following, recent_repos: [{ name, description, language, stars, url }] }` |
| `check_booking_availability` | `date` (string, optional): ISO date | `{ available_slots: [{ start, end }], date, timezone }` |
| `get_resume_link` | None | `{ downloadUrl, viewUrl, format, note }` |
| `get_site_performance` | None | `{ lcp, fcp, cls, inp, ttfb }` each with `p75` value and `distributions` array, or fallback message if CrUX data unavailable |
| `search_projects` | `query` (string): search keywords | `{ results: [{ title, description, tech, live, github }], total, query }` |
| `send_message_to_themis` | `name` (string), `email` (string), `message` (string) | `{ sent: boolean, message }` on success, `{ error }` on failure. Validates email format before sending. Calls `/api/contact` |
| `get_system_health` | None | `{ status, uptime, memory, environment }` from `/api/health` |

The tool-use loop sends a `{ status: "thinking" }` SSE event to the client while executing, which renders an animated "Looking up…" indicator.

## Blog RAG

Blog posts in `content/blog/*.mdx` are indexed at startup:

1. MDX files are read and frontmatter (title, slug, description, tags, date) is extracted
2. Body content is stripped of code blocks, JSX, HTML, and markdown syntax to produce plain text
3. The `search_blog` tool performs NLP-enhanced matching (stemming, synonyms, TF-IDF) across title, tags, description, and body
4. Top 3 results are returned with title, description, URL, and a dense excerpt (sliding window finds the passage with highest term density)

Blog post summaries are also injected into the system prompt so the model knows articles exist without needing a tool call for basic questions like "do you have a blog?".

## Portfolio Search

The portfolio search index contains 24 richly-tagged entries across 6 categories:

| Category | Entries | Examples |
| --- | --- | --- |
| Skills | 6 | Cloud Architecture, Cybersecurity, Network Engineering, Full-Stack Dev, DevOps, IAM |
| Experience | 5 | Skaramangas Shipyards, Estarta Solutions, Athens Airport, Cosmos, COVID-19 Response |
| Pages | 8 | About, Work Experience, Projects, Blog, Performance, AI Agents, Contact, Resume |
| Certifications | 3 | Cisco DevNet, Fortinet NSE, CISSP |
| Education | 2 | M.Sc. Data Analytics, B.Sc. Informatics |

Each entry has a `keywords[]` array for synonym-aware matching. Results include relevance scores so the model can judge result quality.

## Action Tokens

Action tokens are special strings in the model's response that trigger client-side UI interactions:

| Token | SSE Event | Client Behavior |
| --- | --- | --- |
| `[BOOK_CALL]` | `{ action: "start_booking" }` | Replaces message with BookingCard component |
| `[CONTACT]` | `{ action: "open_contact" }` | Navigates to `/contact/` via Next.js router |
| `[GOTO:/path/]` | `{ action: "navigate", path: "/path/" }` | Renders a clickable link below the message text |

- `[BOOK_CALL]` and `[CONTACT]` are emitted as the sole response (no surrounding text)
- `[GOTO:/path/]` is appended to the end of a text response; the token is stripped from the streamed text and the path is sent as a separate SSE event

## Local Development

### Start development servers

```bash
pnpm dev:all
```

This starts:
- Next.js dev server (port 3000)
- Express dev server (port 3001), handles `/api/chat` via Bedrock

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
| `GITHUB_USERNAME` | No | `Themis128` | GitHub username for `get_github_stats` tool |
| `GITHUB_TOKEN` | No | - | GitHub PAT for higher API rate limits |
| `CAL_API_KEY` | No | - | Cal.com API key for `check_booking_availability` tool |
| `CAL_EVENT_TYPE_ID` | No | - | Cal.com event type ID for booking slot queries |

## Model

| Property | Value |
| --- | --- |
| Model | Claude 3.5 Haiku |
| Provider | AWS Bedrock (inference profile) |
| Model ID | `us.anthropic.claude-3-5-haiku-20241022-v1:0` |
| Max output tokens | 512 (768 when incorporating tool results) |
| Temperature | 0.3 |
| Top-p | 0.9 |
| Max tool rounds | 2 |
| Cost (input) | $0.80 / 1M tokens |
| Cost (output) | $4.00 / 1M tokens |
| Typical response time | 1-3 seconds (3-6 seconds with tool use) |

## SSE Protocol

The Express route streams incremental tokens as they arrive from Bedrock:

```
data: {"token": "Hello"}\n\n
data: {"token": " there"}\n\n
data: {"token": "!"}\n\n
data: [DONE]\n\n
```

Each `token` event contains a small chunk of text (typically a word or partial word). The frontend appends each chunk to the assistant message in real time, producing a typewriter effect.

On tool use (thinking indicator):

```
data: {"token": "Let me look that up"}\n\n
data: {"status": "thinking"}\n\n
data: {"token": "Based on the"}\n\n
data: {"token": " latest data..."}\n\n
data: [DONE]\n\n
```

On booking intent:

```
data: {"action": "start_booking"}\n\n
data: [DONE]\n\n
```

On contact intent:

```
data: {"action": "open_contact"}\n\n
data: [DONE]\n\n
```

On navigation (appended after text tokens):

```
data: {"token": "You can read about it on the performance page."}\n\n
data: {"action": "navigate", "path": "/performance/"}\n\n
data: [DONE]\n\n
```

On error:

```
data: {"error": "Chat request failed: ..."}\n\n
data: [DONE]\n\n
```

The frontend `ChatbotWidget.tsx` reads `response.body` with `getReader()`, splits on `\n`, and handles each event type: `token` (append text), `action` (trigger UI), `status` (show indicator), `error` (display inline).

## Accessibility

The chatbot widget follows WCAG 2.2 guidelines:

- **ARIA labels**: Toggle button has dynamic `aria-label` ("Open chat" when closed, "Chat is open" when open)
- **`inert` attribute**: When the chat panel is open, the floating toggle button is marked `inert` to remove it from the accessibility tree
- **`tabIndex`**: Toggle button gets `tabIndex={-1}` when the panel is open to prevent keyboard focus
- **Keyboard navigation**: Chat input is focusable, Enter sends messages
- **Focus management**: When chat opens, the input is auto-focused
- **Navigation links**: `[GOTO:]` actions render as accessible `next/link` elements with arrow icons

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Chat request failed" | Express server not running | Start with `pnpm dev:all` |
| "Access denied" from Bedrock | Missing model access | Enable Claude 3.5 Haiku in AWS Bedrock console |
| "Invalid payment instrument" | AWS billing not set up | Add payment method in AWS Billing console |
| "Credentials not found" | AWS not configured | Run `aws configure` or set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Empty responses | Knowledge base not found | Verify `server/bot/knowledge/*.md` files exist |
| Tool use times out | External API unreachable | Check GitHub/Cal.com API connectivity |
| Blog search returns nothing | No MDX files found | Verify `content/blog/*.mdx` files exist |
| "Looking up…" stuck | Tool execution failed | Check server logs for API errors |
