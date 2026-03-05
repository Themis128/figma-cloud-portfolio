# API Reference (developer-focused)

This document is the source-of-truth for the server API and the shared TypeScript interfaces used by client and server (`src/types/api.ts`). Use these endpoints for integration tests, local development and for building clients.

---

## Quick facts

- Base path: `/api`
- Dev servers (default): **Frontend** http://localhost:8082, **Backend** http://localhost:3001
- **Production**: Frontend on S3 + CloudFront, backend on Lambda via CloudFront `/api/*`
- Auth: public endpoints; some routes may forward to third-party services (GitHub, SES, GA4)
- Request/response types live in `src/types/api.ts`
- Content-Type: `application/json` for all POST/PUT requests unless otherwise noted

---

## Table of Contents

1. [Health Endpoints](#health-endpoints)
2. [General / Demo Endpoints](#general--demo-endpoints)
3. [Contact Form](#contact-form)
4. [Analytics](#analytics)
5. [Resume](#resume)
6. [GitHub Proxy](#github-proxy)
7. [Push Notifications](#push-notifications)
8. [API Keys Management](#api-keys-management)
9. [Portfolio Chatbot](#portfolio-chatbot)
9. [AI / Agent Endpoints](#ai--agent-endpoints)
10. [Agents Management](#agents-management)
11. [AWS Amplify GraphQL API](#aws-amplify-graphql-api)
12. [AWS Lambda Functions](#aws-lambda-functions)
13. [Performance & Version](#performance--version)
14. [Playwright AI Autofix](#playwright-ai-autofix)
15. [TypeScript Types](#typescript-types)
16. [Examples](#examples)
17. [Error Handling](#error-handling)
18. [Notes for Integrators](#notes-for-integrators)

---

## Endpoints

### Health Endpoints

#### GET /api/health

Basic health check for readiness probes.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-02-22T17:45:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "responseTime": "2ms"
}
```

**Use case:** Kubernetes readiness/liveness probes, load balancer health checks.

---

#### GET /api/health/detailed

Extended health check with memory metrics.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-02-22T17:45:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "responseTime": "3ms",
  "memory": {
    "heapUsed": 45,
    "heapTotal": 128,
    "rss": 156,
    "external": 12
  }
}
```

---

### General / Demo Endpoints

#### GET /api/ping

Simple ping endpoint for connectivity testing.

**Response (200):**

```json
{
  "message": "pong"
}
```

---

#### GET /api/demo

Demo endpoint returning a sample response.

**Response (200):**

```json
{
  "message": "Hello from the demo endpoint!"
}
```

**Type:** `DemoResponse`

---

### Contact Form

#### POST /api/contact

Submit a contact form message.

**Request Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "Hi — I like your work!",
  "recaptchaToken": "<token-from-client>"
}
```

**Request Type:** `ContactFormRequest`

| Field          | Type   | Required | Max Length | Description             |
| -------------- | ------ | -------- | ---------- | ----------------------- |
| name           | string | ✓        | 100        | Contact's full name     |
| email          | string | ✓        | -          | Contact's email address |
| subject        | string | ✓        | 200        | Message subject         |
| message        | string | ✓        | 10000      | Message body            |
| recaptchaToken | string | ✓        | -          | reCAPTCHA v3 token      |

**Response (200):**

```json
{
  "success": true,
  "message": "Message sent successfully! I'll get back to you within 24 hours."
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "All fields are required"
}
```

**Response (500):**

```json
{
  "success": false,
  "message": "Failed to send message. Please try again or contact me directly via email."
}
```

**Response Type:** `ContactFormResponse`

**Security Features:**

- reCAPTCHA v3 verification (score threshold: 0.5)
- XSS/injection pattern detection
- Input sanitization
- Length validation
- Optional AWS SES confirmation email
- Optional Slack webhook notification

**Environment Variables:**

- `RECAPTCHA_SECRET_KEY` - reCAPTCHA secret (uses test key in development)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_VERIFIED_EMAIL` - for SES emails
- `SLACK_WEBHOOK_URL` - for Slack notifications

---

### Analytics

#### POST /api/analytics

Track analytics events.

**Request Body:**

```json
{
  "event": "page_view",
  "data": { "page": "/home" },
  "timestamp": "2026-02-22T17:45:00.000Z",
  "url": "https://example.com/home",
  "userAgent": "Mozilla/5.0...",
  "clientId": "GA_CLIENT_ID",
  "eventId": "unique_event_id",
  "userId": "user123"
}
```

**Request Type:** `AnalyticsEvent`

| Field     | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| event     | string | ✓        | Event name                      |
| data      | object | -        | Additional event data           |
| timestamp | string | ✓        | ISO 8601 timestamp              |
| url       | string | ✓        | Page URL                        |
| userAgent | string | ✓        | Browser user agent              |
| clientId  | string | -        | GA4 client ID for MP forwarding |
| eventId   | string | -        | Unique event identifier         |
| metrics   | array  | -        | Web vitals/performance metrics  |

**Response (200) - Event:**

```json
{
  "success": true,
  "type": "event",
  "forwarded": true
}
```

**Response (200) - Metrics:**

```json
{
  "success": true,
  "type": "metrics"
}
```

**Response Type:** `AnalyticsResponse`

**GA4 Measurement Protocol Forwarding:**

- Requires `GOOGLE_ANALYTICS_MEASUREMENT_ID` and `GA4_API_SECRET`
- Uses debug endpoint in development mode

---

#### POST /api/analytics/performance

Submit web vitals and performance metrics.

**Request Body:**

```json
{
  "event": "web_vitals",
  "metrics": [
    { "name": "LCP", "value": 2500 },
    { "name": "FID", "value": 100 },
    { "name": "CLS", "value": 0.1 }
  ],
  "timestamp": "2026-02-22T17:45:00.000Z",
  "url": "https://example.com/home",
  "userAgent": "Mozilla/5.0..."
}
```

**Response (200):**

```json
{
  "success": true,
  "type": "metrics"
}
```

---

### Resume

#### GET /api/resume

Redirects to the static resume PDF.

**Response (302):**

- `Location: /resume.pdf`

**Notes:**

- Production Lambda returns a 302 redirect to the static PDF hosted on S3/CloudFront
- Local Express dev server on port 3001 handles resume generation

---

### GitHub Proxy

Proxy endpoints for GitHub REST API with caching and rate limiting.

#### GET /api/github/workflows

List repository workflows.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| owner | string | Themis128 | Repository owner |
| repo | string | figma-cloud-portfolio | Repository name |

**Response (200):**

```json
{
  "total_count": 5,
  "workflows": [
    {
      "id": 12345,
      "name": "CI",
      "path": ".github/workflows/ci.yml",
      "state": "active",
      "badge_url": "https://github.com/..."
    }
  ]
}
```

**Response Headers:**

- `X-GitHub-Proxy-Cache-Hits`: Number of cache hits
- `X-GitHub-Proxy-Cache-Misses`: Number of cache misses

---

#### GET /api/github/workflows/:workflowIdentifier/runs

Get workflow runs.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| workflowIdentifier | string | Workflow ID or filename |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| owner | string | Themis128 | Repository owner |
| repo | string | figma-cloud-portfolio | Repository name |
| per_page | number | 1 | Results per page |

**Response (200):**

```json
{
  "total_count": 100,
  "workflow_runs": [
    {
      "id": 123456,
      "name": "CI",
      "status": "completed",
      "conclusion": "success",
      "created_at": "2026-02-22T17:00:00Z",
      "head_branch": "main"
    }
  ]
}
```

---

#### GET /api/github/runs/:runId/jobs

Get jobs for a workflow run.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| runId | string | Workflow run ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| owner | string | Themis128 | Repository owner |
| repo | string | figma-cloud-portfolio | Repository name |

**Response (200):**

```json
{
  "total_count": 3,
  "jobs": [
    {
      "id": 789,
      "name": "test",
      "status": "completed",
      "conclusion": "success",
      "steps": [...]
    }
  ]
}
```

---

#### GET /api/github/metrics

Get proxy cache metrics.

**Response (200):**

```json
{
  "requests": 1500,
  "cacheHits": 1200,
  "cacheMisses": 300,
  "cacheSets": 300,
  "cacheEvictions": 50,
  "rateLimited": 5
}
```

---

#### POST /api/github/validate

Validate a GitHub token.

**Request Body:**

```json
{
  "token": "ghp_xxxx"
}
```

**Response (200):**

```json
{
  "login": "username",
  "id": 12345,
  "name": "User Name"
}
```

**Response (401):**

```json
{
  "message": "Bad credentials"
}
```

**Configuration:**

- Cache TTL: `GITHUB_CACHE_TTL_SECONDS` (default: 15s)
- Max cache entries: `GITHUB_CACHE_MAX_ENTRIES` (default: 200)
- Rate limit: `GITHUB_RATE_LIMIT_MAX` (default: 120 per hour per IP)
- Requires `GITHUB_TOKEN` for authenticated requests

---

### Push Notifications

Web Push API endpoints for subscription management and notification sending.

#### GET /api/push-notifications?action=vapid-public-key

Get the VAPID public key for client subscription.

**Response (200):**

```json
{
  "publicKey": "BM9x9x..."
}
```

---

#### GET /api/push-notifications?action=subscriptions

List current subscription count.

**Response (200):**

```json
{
  "subscriptions": 5,
  "list": [{ "endpoint": "https://fcm.googleapis.com/..." }]
}
```

---

#### GET /api/push-notifications (no action)

Send test notification to all stored subscriptions.

**Response (200):**

```json
{
  "success": true,
  "message": "Test notifications sent",
  "results": [
    { "endpoint": "https://...", "success": true, "statusCode": 201 }
  ],
  "totalSubscriptions": 5
}
```

**Response (400):**

```json
{
  "error": "No subscriptions found. Subscribe first using the client."
}
```

---

#### POST /api/push-notifications

Send push notification to specified subscriptions or all stored subscriptions.

**Request Body:**

```json
{
  "subscriptions": [
    {
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": {
        "p256dh": "key...",
        "auth": "auth..."
      }
    }
  ],
  "message": {
    "title": "New Update",
    "body": "Check out the latest features!",
    "icon": "/logo.jpg",
    "badge": "/logo.jpg",
    "image": "/og-image.png",
    "url": "/updates",
    "data": { "type": "update" }
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "results": [
    { "endpoint": "https://...", "success": true, "statusCode": 201 }
  ],
  "totalSent": 5,
  "totalFailed": 0
}
```

---

#### PUT /api/push-notifications

Store/subscribe a new push subscription.

**Request Body:**

```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "public_key...",
    "auth": "auth_secret..."
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Subscription stored",
  "totalSubscriptions": 6
}
```

---

#### DELETE /api/push-notifications?endpoint=...

Remove a subscription.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| endpoint | string | Subscription endpoint URL (URL-encoded) |

**Response (200):**

```json
{
  "success": true,
  "message": "Removed 1 subscription(s)",
  "totalSubscriptions": 5
}
```

**Configuration:**

- `VAPID_PUBLIC_KEY` - VAPID public key (permanent, set in Lambda env vars)
- `VAPID_PRIVATE_KEY` - VAPID private key (permanent, set in Lambda env vars)
- `VAPID_EMAIL` - Contact email for VAPID (mailto:noreply@cloudless.gr)

---

### API Keys Management

CRUD operations for organization API keys. All mutating operations send Slack notifications via `SLACK_WEBHOOK_URL`.

#### GET /api/organizations/api_keys

List all API keys.

**Response (200):**

```json
[
  {
    "id": "ak_1234567890",
    "created_at": "2024-01-15T10:30:00Z",
    "created_by": { "id": "user_123", "type": "user" },
    "name": "Development API Key",
    "partial_key_hint": "ak_1234",
    "status": "active",
    "type": "api_key",
    "workspace_id": "ws_123"
  }
]
```

#### GET /api/organizations/api_keys/:api_key_id

Get API key details by ID.

**Response (404):**

```json
{
  "error": { "code": "NOT_FOUND", "message": "API key with ID ak_xxx not found" }
}
```

#### POST /api/organizations/api_keys

Create a new API key.

**Request Body:**

```json
{
  "name": "My New Key",
  "workspace_id": "ws_123"
}
```

**Response (201):** Returns the created `APIKey` object.

#### POST /api/organizations/api_keys/:api_key_id

Update an API key's name or status.

**Request Body:**

```json
{
  "name": "Updated Name",
  "status": "inactive"
}
```

**Response (200):** Returns the updated `APIKey` object.

**Valid statuses:** `active`, `inactive`, `archived`

#### DELETE /api/organizations/api_keys/:api_key_id

Delete an API key.

**Response (200):**

```json
{
  "id": "ak_1234567890",
  "deleted": true
}
```

**TypeScript Types:** `APIKey`, `CreateAPIKeyRequest`, `UpdateAPIKeyRequest` (defined in `src/types/api.ts`)

**Environment Variables:**

- `SLACK_WEBHOOK_URL` - Slack incoming webhook for notifications
- `SLACK_CHANNEL` - Target Slack channel (default: #personal-website)

---

### Portfolio Chatbot

#### POST /api/chat

Stream a chat response from the portfolio AI assistant. This is a Next.js route that proxies to the Python FastAPI backend and returns a Server-Sent Events (SSE) stream.

**Request Body:**

```json
{
  "message": "What are your cloud certifications?",
  "history": [
    { "role": "user", "content": "Tell me about yourself." },
    { "role": "assistant", "content": "Hi! I'm Themis's AI assistant..." }
  ]
}
```

| Field   | Type   | Required | Description                                                                     |
| ------- | ------ | -------- | ------------------------------------------------------------------------------- |
| message | string | ✓        | The user's message                                                              |
| history | array  | -        | Prior conversation turns (`{ role: "user" \| "assistant", content: string }[]`) |

**Response (200) — SSE stream:**

```
Content-Type: text/event-stream

data: {"token": "Hello"}

data: {"token": "! I"}

data: {"token": " can"}

data: [DONE]
```

Each `data:` line carries either a `{"token": "..."}` object (a text chunk) or the sentinel `[DONE]`.

**Response (502/503) — Backend unavailable:**

```json
{
  "error": "Failed to connect to chat backend: Connection refused"
}
```

**Notes:**

- Model: `mistralai/Mistral-7B-Instruct-v0.3` via HuggingFace Inference API
- System prompt: hardcoded portfolio context (experience, skills, certifications)
- Conversation history is forwarded to maintain multi-turn context
- The Next.js route reads `PYTHON_BOT_URL` env var (default `http://localhost:8001`)

**Environment Variables:**

- `PYTHON_BOT_URL` — URL of the Python FastAPI backend (default: `http://localhost:8001`)

---

### Python Chatbot Backend (port 8001)

The Python FastAPI service (`server/bot/main.py`) provides the underlying LLM interface. It is **not** called directly from the browser — all traffic goes through the Next.js `/api/chat` proxy.

#### POST /api/chat/stream

Stream a chat completion from Mistral-7B via HuggingFace Inference API.

**Request Body:** Same schema as `/api/chat` above.

**Response:** SSE stream with `data: {"token": "..."}` lines, terminated by `data: [DONE]`.

**Error chunk:**

```
data: {"error": "HF API error 503: ..."}
```

#### GET /api/health

Health check for the Python service.

**Response (200):**

```json
{
  "status": "ok",
  "model": "mistralai/Mistral-7B-Instruct-v0.3"
}
```

**Python service environment variables:**

| Variable           | Required | Description                                                           |
| ------------------ | -------- | --------------------------------------------------------------------- |
| `HF_TOKEN`         | ✓        | HuggingFace API token                                                 |
| `PORTFOLIO_ORIGIN` | -        | Allowed CORS origin (default: `*`). Set to your domain in production. |
| `PORT`             | -        | Port to listen on (default: `8001`)                                   |

**Running the Python backend:**

```bash
cd server/bot
cp .env.example .env   # fill in HF_TOKEN
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

### AI / Agent Endpoints

#### POST /api/ai/claude

Execute a Claude API call via Anthropic SDK.

**Request Body:**

```json
{
  "model": "claude-3-haiku-20240307",
  "max_tokens": 1000,
  "messages": [{ "role": "user", "content": "Hello, Claude!" }],
  "system": "You are a helpful assistant.",
  "temperature": 0.7,
  "top_p": 0.9,
  "top_k": 40,
  "stop_sequences": []
}
```

**Request Type:** `ClaudeRequest`

**Response (200):**

```json
{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "Hello! How can I help you today?" }],
  "model": "claude-3-haiku-20240307",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 15,
    "output_tokens": 25
  }
}
```

**Response Type:** `ClaudeResponse`

**Supported Models:**

- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`
- `claude-3-5-sonnet-20240620`

**Configuration:**

- `ANTHROPIC_API_KEY` - Required for Claude API access

---

#### POST /api/ai/agent

Execute an AI agent workflow.

**Request Body:**

```json
{
  "templateId": "basic-chatbot",
  "inputs": { "userInput": "Hello" },
  "model": "claude-3-haiku-20240307",
  "provider": "anthropic"
}
```

**Request Type:** `AgentExecutionRequest`

| Field      | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| templateId | string | ✓        | Agent template identifier              |
| inputs     | object | ✓        | Input parameters for the agent         |
| model      | string | -        | Model to use (default: claude-3-haiku) |
| provider   | string | -        | Provider: anthropic, openai, together  |

**Response (200):**

```json
{
  "success": true,
  "output": "Hello! How can I help you today?",
  "usage": {
    "inputTokens": 12,
    "outputTokens": 18,
    "totalTokens": 30
  }
}
```

**Response (500):**

```json
{
  "success": false,
  "output": "",
  "error": "Failed to execute agent"
}
```

**Response Type:** `AgentExecutionResponse`

---

### Agents Management

#### POST /api/agents

Save a new agent configuration.

**Request Body:**

```json
{
  "name": "Customer Support Bot",
  "description": "AI agent for handling customer inquiries"
}
```

**Response (200):**

```json
{
  "success": true,
  "agent": {
    "id": "agent-1739123456789",
    "name": "Customer Support Bot",
    "description": "AI agent for handling customer inquiries",
    "createdAt": "2026-02-22T17:45:00.000Z",
    "updatedAt": "2026-02-22T17:45:00.000Z"
  }
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Invalid agent data",
  "errors": [...]
}
```

**Notes:**

- Validates agent data using Zod schema
- Stores agent in Amplify database

---

#### GET /api/agents

List all saved agents.

**Response (200):**

```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-1739123456789",
      "name": "Customer Support Bot",
      "description": "AI agent for handling customer inquiries",
      "createdAt": "2026-02-22T17:45:00.000Z",
      "updatedAt": "2026-02-22T17:45:00.000Z"
    }
  ]
}
```

**Response (500):**

```json
{
  "success": false,
  "message": "Internal error"
}
```

---

### AWS Amplify GraphQL API

AWS Amplify Gen 2 backend with AppSync GraphQL API.

**Endpoint:** `https://zf34mu7es5cr5fkwhfz3knn6wm.appsync-api.us-east-1.amazonaws.com/graphql`

**Authentication:**

- API Key: `x-api-key` header (for public operations)
- Cognito User Pools: `Authorization` header with JWT token (for owner-restricted operations)

**Default Authorization:** `AMAZON_COGNITO_USER_POOLS`
**Additional Authorization:** `API_KEY`, `AWS_IAM`

---

#### Agent Model

**Authorization:** Owner-only (requires Cognito authentication)

```graphql
# List Agents
query ListAgents {
  listAgents(limit: 10) {
    items {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
}

# Create Agent
mutation CreateAgent($input: CreateAgentInput!) {
  createAgent(input: $input) {
    id
    name
    description
    createdAt
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ID | Auto | Auto-generated UUID |
| name | String | ✓ | Agent name |
| description | String | - | Agent description |
| createdAt | AWSDateTime | Auto | Creation timestamp |
| updatedAt | AWSDateTime | Auto | Update timestamp |

---

#### AgentVersion Model

**Authorization:** Owner-only (requires Cognito authentication)

```graphql
# List Agent Versions
query ListAgentVersions {
  listAgentVersions(limit: 10) {
    items {
      id
      agentId
      version
      config
      createdAt
    }
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ID | Auto | Auto-generated UUID |
| agentId | String | ✓ | Parent agent ID |
| version | Int | ✓ | Version number |
| config | AWSJSON | ✓ | Version configuration (JSON) |
| createdAt | AWSDateTime | Auto | Creation timestamp |

---

#### AgentExecution Model

**Authorization:** Owner-only (requires Cognito authentication)

```graphql
# List Agent Executions
query ListAgentExecutions {
  listAgentExecutions(limit: 10) {
    items {
      id
      agentId
      status
      startedAt
      endedAt
      error
      metrics
    }
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ID | Auto | Auto-generated UUID |
| agentId | String | ✓ | Agent ID |
| status | String | ✓ | Execution status |
| startedAt | AWSDateTime | - | Start timestamp |
| endedAt | AWSDateTime | - | End timestamp |
| error | String | - | Error message if failed |
| metrics | AWSJSON | - | Execution metrics (JSON) |

---

#### ContactMessage Model

**Authorization:**

- Owner: Full CRUD
- Public API Key: Create only

```graphql
# Create Contact Message (public, API key auth)
mutation CreateContactMessage($input: CreateContactMessageInput!) {
  createContactMessage(input: $input) {
    id
    name
    email
    subject
    message
    recaptchaScore
    status
  }
}

# Variables
{
  "input": {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Hello",
    "message": "Test message",
    "recaptchaScore": 0.9
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ID | Auto | Auto-generated UUID |
| name | String | ✓ | Contact name |
| email | AWSEmail | ✓ | Contact email |
| subject | String | ✓ | Message subject |
| message | String | ✓ | Message body |
| recaptchaScore | Float | - | reCAPTCHA score |
| status | String | - | Message status |

---

#### Resume Model

**Authorization:** Owner-only (requires Cognito authentication)

```graphql
# List Resumes
query ListResumes {
  listResumes(limit: 10) {
    items {
      id
      userId
      title
      personalInfo
      experience
      education
      certifications
      skills
    }
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | ID | Auto | Auto-generated UUID |
| userId | String | ✓ | User identifier |
| title | String | - | Resume title |
| personalInfo | AWSJSON | - | Personal information (JSON) |
| experience | AWSJSON | - | Work experience (JSON) |
| education | AWSJSON | - | Education history (JSON) |
| certifications | AWSJSON | - | Certifications (JSON) |
| skills | AWSJSON | - | Skills (JSON) |

---

### AWS Lambda Functions

Single Lambda function (`figma-portfolio-api`) handling all API routes, fronted by CloudFront at `/api/*`.

**Lambda Function URL:** `https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws`
**CloudFront**: Distribution `E134SCTR0QGQKJ` routes `/api/*` to Lambda

| Path                              | Method       | Description                      |
| --------------------------------- | ------------ | -------------------------------- |
| /api/ping                         | GET          | Health check                     |
| /api/demo                         | GET          | Demo endpoint                    |
| /api/contact                      | POST         | Contact form (reCAPTCHA + SES)   |
| /api/resume                       | GET          | 302 redirect to resume.pdf       |
| /api/push-notifications           | GET/PUT/POST/DELETE | Push notification management |
| /api/organizations/api_keys       | GET/POST     | List / create API keys           |
| /api/organizations/api_keys/:id   | GET/POST/DELETE | Get / update / delete API key |

---

#### Playwright Autofix Lambda (Direct URL)

**URL:** `https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws/`

##### GET /health

Health check endpoint.

**Response (200):**

```json
{
  "status": "healthy",
  "service": "playwright-autofix"
}
```

##### POST /analyze

Analyze test failure.

**Request Body:**

```json
{
  "testTitle": "should login",
  "error": { "message": "element not found" },
  "file": "tests/auth.spec.ts",
  "line": 25,
  "selector": "#login-button"
}
```

**Response (200):**

```json
{
  "success": true,
  "suggestions": [
    {
      "type": "selector",
      "confidence": 0.9,
      "suggestion": "Element not found. Add wait for element."
    }
  ],
  "autoFixable": true
}
```

---

### Performance & Version

#### GET /api/performance/bundle-size

Get current bundle size information.

**Response (200):**

```json
{
  "bundleSize": 2.4,
  "lighthouseScore": 92,
  "lastUpdated": "2026-02-22T17:45:00.000Z"
}
```

---

#### GET /api/version/latest

Get current application version.

**Response (200):**

```json
{
  "version": "1.0.0",
  "latest": "1.0.0",
  "lastChecked": "2026-02-22T17:45:00.000Z"
}
```

---

### Playwright AI Autofix

#### POST /api/playwright-autofix/analyze

Analyze a test failure and get AI-powered fix suggestions.

**Request Body:**

```json
{
  "testTitle": "should submit form successfully",
  "error": {
    "message": "element not found: button[type=\"submit\"]"
  },
  "file": "tests/form.spec.ts",
  "line": 42,
  "selector": "button[type=\"submit\"]",
  "timeout": 30000
}
```

**Response (200):**

```json
{
  "success": true,
  "testTitle": "should submit form successfully",
  "file": "tests/form.spec.ts",
  "line": 42,
  "suggestions": [
    {
      "type": "selector",
      "confidence": 0.9,
      "suggestion": "Element not found. Verify the selector or add wait for element to appear.",
      "code": "await page.locator('selector').waitFor({ state: 'attached' });",
      "documentation": "https://playwright.dev/docs/api/class-locator#locator-wait-for"
    }
  ],
  "autoFixable": true,
  "config": {
    "environment": "development",
    "autofixEnabled": true
  }
}
```

---

#### GET /api/playwright-autofix/config

Get current autofix configuration.

**Response (200):**

```json
{
  "success": true,
  "config": {
    "environment": "development",
    "timeouts": {
      "action": 10000,
      "navigation": 30000,
      "expect": 20000,
      "test": 90000
    },
    "retries": 2,
    "workers": 4,
    "autofixEnabled": true,
    "features": {
      "selectorHealing": true,
      "autoRetry": true,
      "smartWait": true,
      "performanceMonitoring": true
    },
    "suggestions": {
      "maxPerTest": 5,
      "minConfidence": 0.7,
      "autoApplyThreshold": 0.9
    },
    "lastUpdated": "2026-02-22T17:45:00.000Z",
    "version": "1.0.0"
  }
}
```

---

#### POST /api/playwright-autofix/config

Update autofix configuration.

**Request Body:**

```json
{
  "autofixEnabled": true,
  "timeouts": {
    "action": 15000
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "config": { "/* updated config */": "..." },
  "message": "Configuration updated successfully"
}
```

---

#### GET /api/playwright-autofix/health

Health check for the autofix service.

**Response (200):**

```json
{
  "status": "healthy",
  "service": "playwright-autofix",
  "version": "1.0.0",
  "autofixEnabled": true
}
```

---

#### GET /api/playwright-autofix/patterns

Get common error patterns and their categories.

**Response (200):**

```json
{
  "success": true,
  "patterns": {
    "selector": [
      { "pattern": "element not found", "type": "missing-element" },
      { "pattern": "element not visible", "type": "visibility" }
    ],
    "timeout": [{ "pattern": "timeout exceeded", "type": "general-timeout" }],
    "action": [{ "pattern": "click intercepted", "type": "overlay" }],
    "assertion": [{ "pattern": "snapshot mismatch", "type": "visual" }]
  }
}
```

---

## TypeScript Types

All types are defined in `shared/api.ts`. Below is the complete reference.

### Base Types

```typescript
// Demo response
interface DemoResponse {
  message: string;
}

// Contact form
interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  recaptchaToken: string;
}

interface ContactFormResponse {
  success: boolean;
  message: string;
}

// Analytics
interface AnalyticsEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
  url: string;
  userAgent: string;
  clientId?: string;
  userId?: string;
  eventId?: string;
  metrics?: Array<Record<string, unknown>>;
}

interface AnalyticsResponse {
  success: boolean;
  message?: string;
}

// Resume
interface ResumeData {
  name: string;
  title: string;
  contact: {
    email?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  competencies: Record<string, string[]>;
  experience: Array<{
    title: string;
    company: string;
    date: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    date: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}
```

### Link Preview Types

```typescript
interface OpenGraphData {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  url?: string | null;
  type?: string | null;
  siteName?: string | null;
}

interface TwitterCardData {
  card?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  site?: string | null;
  creator?: string | null;
}

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string;
  type: string;
  openGraph: OpenGraphData | null;
  twitter: TwitterCardData | null;
  lastFetched: string;
  error: string | null;
}
```

### AI / Agent Types

```typescript
interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeRequest {
  model:
    | "claude-3-opus-20240229"
    | "claude-3-sonnet-20240229"
    | "claude-3-haiku-20240307"
    | "claude-3-5-sonnet-20240620";
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: { input_tokens: number; output_tokens: number };
}

interface AgentExecutionRequest {
  templateId: string;
  inputs: Record<string, unknown>;
  model?:
    | "claude-3-opus-20240229"
    | "claude-3-sonnet-20240229"
    | "claude-3-haiku-20240307"
    | "claude-3-5-sonnet-20240620"
    | "gpt-4"
    | "gpt-3.5-turbo";
  provider?: "anthropic" | "openai" | "together";
}

interface AgentExecutionResponse {
  success: boolean;
  output: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}
```

### Agent Management Types

```typescript
interface Agent {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AgentVersion {
  id?: string;
  agentId: string;
  version: number;
  config: Record<string, unknown>;
  createdAt?: string;
}

interface AgentExecution {
  id?: string;
  agentId: string;
  startedAt?: string;
  endedAt?: string;
  status: string;
  error?: string;
  metrics?: Record<string, unknown>;
}

interface SaveAgentRequest {
  agent: Agent;
}

interface SaveAgentResponse {
  success: boolean;
  agent?: Agent;
  message?: string;
}

interface ListAgentsResponse {
  success: boolean;
  agents: Agent[];
  message?: string;
}
```

---

## Examples

### Portfolio Chatbot (SSE stream)

```bash
curl -N -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What cloud certifications do you hold?",
    "history": []
  }'
# streams: data: {"token":"I"}  data: {"token":" hold"}  ...  data: [DONE]
```

---

### Contact Form Submission

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Hello",
    "message": "Hi — I like your work!",
    "recaptchaToken": "test-token"
  }'
```

### Agent Execution

```bash
curl -X POST http://localhost:3001/api/ai/agent \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "basic-chatbot",
    "inputs": { "userInput": "Hello" },
    "model": "claude-3-haiku-20240307",
    "provider": "anthropic"
  }'
```

### GitHub Workflows

```bash
curl http://localhost:3001/api/github/workflows?owner=Themis128&repo=figma-cloud-portfolio
```

### Push Notification Subscription

```bash
# Get VAPID public key
curl http://localhost:3001/api/push-notifications?action=vapid-public-key

# Subscribe
curl -X PUT http://localhost:3001/api/push-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "public_key...",
      "auth": "auth_secret..."
    }
  }'

# Send notification
curl -X POST http://localhost:3001/api/push-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "title": "Update",
      "body": "New features available!"
    }
  }'
```

### Resume

```bash
# Resume endpoint (redirects to PDF)
curl -L http://localhost:3001/api/resume
```

### API Keys

```bash
# List all API keys
curl http://localhost:3001/api/organizations/api_keys

# Create a new key
curl -X POST http://localhost:3001/api/organizations/api_keys \
  -H "Content-Type: application/json" \
  -d '{ "name": "My Key", "workspace_id": "ws_123" }'

# Delete a key
curl -X DELETE http://localhost:3001/api/organizations/api_keys/ak_1234567890
```

### Playwright Autofix

```bash
# Analyze test failure
curl -X POST http://localhost:3001/api/playwright-autofix/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "testTitle": "should login",
    "error": { "message": "element not found: #login-button" },
    "file": "tests/auth.spec.ts",
    "line": 25,
    "selector": "#login-button"
  }'

# Get error patterns
curl http://localhost:3001/api/playwright-autofix/patterns
```

---

## Error Handling

All endpoints follow a consistent error response format:

### 400 Bad Request

```json
{
  "success": false,
  "message": "All fields are required",
  "error": "Detailed error message"
}
```

### 401 Unauthorized

```json
{
  "message": "Bad credentials"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too many requests"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Failed to process request",
  "error": "Internal error details (in development)"
}
```

---

## Notes for Integrators

### Security Considerations

- All POST/PUT endpoints require `Content-Type: application/json`
- Contact form inputs are sanitized against XSS, SQL injection, and command injection
- GitHub proxy implements rate limiting per IP (120 requests per hour by default)
- VAPID keys should be set in production (auto-generated in development)

### Caching

- GitHub proxy caches responses for 15 seconds by default
- Cache metrics available via `/api/github/metrics`
- Maximum cache entries: 200 (configurable)

### Rate Limiting

- GitHub proxy: 120 requests per hour per IP (configurable)
- Rate limit window: 60 minutes (configurable)

### Environment Variables

| Variable                          | Required            | Description                                                   |
| --------------------------------- | ------------------- | ------------------------------------------------------------- |
| `PYTHON_BOT_URL`                  | For chatbot         | Python FastAPI backend URL (default: `http://localhost:8001`) |
| `HF_TOKEN`                        | For chatbot backend | HuggingFace API token for Mistral inference                   |
| `ANTHROPIC_API_KEY`               | For AI endpoints    | Anthropic API key                                             |
| `GITHUB_TOKEN`                    | For GitHub proxy    | GitHub personal access token                                  |
| `RECAPTCHA_SECRET_KEY`            | For contact form    | reCAPTCHA v3 secret key                                       |
| `GOOGLE_ANALYTICS_MEASUREMENT_ID` | Optional            | GA4 Measurement ID                                            |
| `GA4_API_SECRET`                  | Optional            | GA4 API secret                                                |
| `AWS_ACCESS_KEY_ID`               | Optional            | AWS access key for SES                                        |
| `AWS_SECRET_ACCESS_KEY`           | Optional            | AWS secret key for SES                                        |
| `SES_VERIFIED_EMAIL`              | Optional            | SES verified sender email                                     |
| `SLACK_WEBHOOK_URL`               | Optional            | Slack webhook for notifications                               |
| `VAPID_PUBLIC_KEY`                | Optional            | VAPID public key for push                                     |
| `VAPID_PRIVATE_KEY`               | Optional            | VAPID private key for push                                    |
| `VAPID_EMAIL`                     | Optional            | Contact email for VAPID                                       |

### Development vs Production

- Test reCAPTCHA key used in development
- VAPID keys auto-generated if not configured
- Debug endpoints enabled in development
- More verbose error messages in development

---

## OpenAPI Specification

A machine-readable OpenAPI (Swagger) specification can be generated from these types. If needed, let me know whether you prefer YAML or JSON format and I'll scaffold it.
