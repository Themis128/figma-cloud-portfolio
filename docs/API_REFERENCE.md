# API Reference (developer-focused)

This document is the source-of-truth for the server API and the shared TypeScript interfaces used by client and server (`/shared/api.ts`). Use these endpoints for integration tests, local development and for building clients.

---

## Quick facts

- Base path: `/api`
- Dev servers (default): **Frontend** http://localhost:8082, **Backend** http://localhost:3002
- Auth: public endpoints; some routes may forward to third-party services (GitHub, SES, GA4)
- Request/response types live in `shared/api.ts`

---

## Endpoints

### Health

- GET /api/health
  - Response: { status, timestamp, uptime, version, environment, responseTime }
  - Use: readiness / health checks

- GET /api/health/detailed
  - Response: same plus memory usage


### General / Demo

- GET /api/ping
  - Response: { message: string }
  - Example: `{ "message": "pong" }`

- GET /api/demo
  - Response: `DemoResponse` — { message: string }


### Contact form

- POST /api/contact
  - Request: `ContactFormRequest` (name, email, subject, message, recaptchaToken)
  - Response: `ContactFormResponse` ({ success: boolean, message: string })
  - Notes:
    - Server verifies reCAPTCHA v3 (uses test key in dev)
    - Inputs sanitized & validated (length limits)
    - Optional: send confirmation via AWS SES if configured
    - Optional: post Slack notification if `SLACK_WEBHOOK_URL` present


### Analytics

- POST /api/analytics
- POST /api/analytics/performance
  - Request: `AnalyticsEvent` (event, data?, timestamp, url, userAgent, clientId?)
  - Response: `AnalyticsResponse` ({ success: boolean, message?: string })
  - Notes: can forward to **GA4 Measurement Protocol** when `GOOGLE_ANALYTICS_MEASUREMENT_ID` and `GA4_API_SECRET` are configured


### Resume (PDF generation)

- GET /api/resume/download
- POST /api/resume/download
  - Request/Response: HTML / PDF stream generated from `ResumeData` structure
  - See `shared/api.ts` -> `ResumeData` for the schema used by the resume generator


### GitHub proxy (used by projects page & deployment monitor)

- GET /api/github/workflows
- GET /api/github/metrics
- GET /api/github/workflows/:workflowIdentifier/runs
- GET /api/github/runs/:runId/jobs
  - Purpose: proxy and cache GitHub REST API requests to avoid exposing the token directly to the client
  - Requires `GITHUB_TOKEN` for authenticated calls


### Push notifications

- GET  /api/push-notifications?action=vapid-public-key
- POST /api/push-notifications
- PUT  /api/push-notifications
- DELETE /api/push-notifications
  - Purpose: store subscriptions, send push notifications, and remove subscriptions
  - Uses Web Push (VAPID) or configured provider


### AI / Agent endpoints

- POST /api/ai/claude
  - Request: `ClaudeRequest`
  - Response: `ClaudeResponse`
  - Notes: wraps Anthropic SDK (server-side API key required)

- POST /api/ai/agent
  - Request: `AgentExecutionRequest`
  - Response: `AgentExecutionResponse`
  - Notes: executes agent workflows (template-based executor)


### Security / Utility

- POST /api/github/validate — quick token validation


## Shared TypeScript types (high-level)

All types are defined in `shared/api.ts` — below are the most-used types and where they map to endpoints.

- `DemoResponse` — GET `/api/demo`
- `ContactFormRequest` — POST `/api/contact`
- `ContactFormResponse` — response for contact route
- `AnalyticsEvent` / `AnalyticsResponse` — POST `/api/analytics`
- `ResumeData` — resume generation endpoints
- `LinkPreviewData` / `OpenGraphData` — internal link preview helpers

AI / Agent types

- `ClaudeRequest` / `ClaudeResponse` — `/api/ai/claude`
- `AgentExecutionRequest` / `AgentExecutionResponse` — `/api/ai/agent`


## Examples

Contact form (client-side example)

POST /api/contact

Request body (JSON):

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "Hi — I like your work!",
  "recaptchaToken": "<token-from-client>"
}

Response (200):

{
  "success": true,
  "message": "Message sent successfully! I'll get back to you within 24 hours."
}


Agent execution (example)

POST /api/ai/agent

Request body:

{
  "templateId": "basic-chatbot",
  "inputs": { "userInput": "Hello" },
  "model": "claude-3-haiku-20240307",
  "provider": "anthropic"
}

Response (200):

{
  "success": true,
  "output": "Hello! How can I help you today?",
  "usage": { "inputTokens": 12, "outputTokens": 18, "totalTokens": 30 }
}


## Notes for integrators

- Use the `shared/api.ts` interfaces as the single source of truth when building clients or tests.
- Contact route enforces reCAPTCHA; in development the test secret key is accepted.
- For server-side forwarding to GA4 (Measurement Protocol), set `GOOGLE_ANALYTICS_MEASUREMENT_ID` and `GA4_API_SECRET`.
- Health endpoints (`/api/health`) are suitable for readiness checks in container/orchestration platforms.

---

If you want, I can also generate a machine-readable OpenAPI (Swagger) spec from these types — tell me whether you prefer YAML or JSON and I’ll scaffold it next.