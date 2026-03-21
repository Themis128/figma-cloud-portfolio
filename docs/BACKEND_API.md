# Backend API Reference

> Last updated: 2026-03-06

## Architecture Overview

```
┌──────────────────┐     Amplify Rewrites     ┌──────────────────────────────────────────┐
│  Next.js Frontend │ ──────────────────────── │  AWS API Gateway + Lambda (Express.js)   │
│  (Amplify Hosting)│   /api/* → Lambda        │  wctxhmfzgk.execute-api.us-east-1        │
└──────────────────┘                           └──────────────┬───────────────────────────┘
                                                              │
                                               ┌──────────────┼───────────────────┐
                                               │              │                   │
                                          Cal.com v2    HuggingFace API     Slack Webhooks
                                          (Booking)     (AI Chat)           (Notifications)
```

**Stack**: Express.js running on AWS Lambda behind API Gateway
**Production URL**: `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com`
**Local Dev URL**: `http://localhost:3001`
**Build Compute**: LARGE_16GB (AWS Amplify)

### Request Flow

1. Browser sends request to `https://baltzakis.dev/api/*`
2. Amplify CloudFront matches rewrite rules
3. Request is proxied to API Gateway → Lambda
4. Lambda invokes the Express.js handler
5. Express routes the request and returns a response

### Legacy Servers (Development Only)

| Server | File | Port | Purpose |
|--------|------|------|---------|
| Express Bot | `server/bot.ts` | 3010 | Simple keyword-match chatbot (`POST /api/chatbot`) |
| FastAPI Bot | `server/bot/main.py` | 8001 | Mistral-7B streaming chat (`POST /api/chat/stream`) |

---

## Endpoints

### Health & Status

#### `GET /api/health`

Returns server health status with uptime and memory usage.

**Response** `200 OK`:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-06T17:37:31.226Z",
  "uptime": 2.88,
  "environment": "production",
  "memory": "22MB"
}
```

#### `GET /api/ping`

Basic ping/pong health check.

**Response** `200 OK`:
```json
{
  "message": "ping_pong"
}
```

#### `GET /api/demo`

Demo endpoint confirming Express server is running.

**Response** `200 OK`:
```json
{
  "message": "Hello from Express server"
}
```

---

### Agents API

#### `GET /api/agents`

List all registered agents.

**Response** `200 OK`:
```json
{
  "success": true,
  "agents": []
}
```

#### `POST /api/agents`

Create a new agent.

**Request Body**:
```json
{
  "name": "MyAgent"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "agent": {
    "name": "MyAgent",
    "id": "agent-1772819248423-kdpoim46elg",
    "createdAt": "2026-03-06T17:47:28.423Z",
    "updatedAt": "2026-03-06T17:47:28.423Z"
  }
}
```

**Errors**:
| Status | Condition |
|--------|-----------|
| `400` | Missing or invalid `name` field |

---

### Chat API

**Source**: [`server/routes/chat.ts`](../server/routes/chat.ts)
**External Service**: HuggingFace Inference API (Llama 3.1-8B-Instruct)
**Env Vars Required**: `HF_TOKEN`

#### `POST /api/chat`

AI-powered portfolio assistant with streaming SSE response.

**Request Body**:
```json
{
  "message": "Tell me about Themis",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | Yes | User message (trimmed, must be non-empty) |
| `history` | `Array<{role, content}>` | No | Previous conversation turns |

**Response** `200 OK` (SSE stream):
```
Content-Type: text/event-stream

data: {"token": "Themis is a Cloud Architect..."}

data: [DONE]
```

**Booking Detection**: If the AI detects booking intent, it emits:
```
data: {"action": "start_booking"}

data: [DONE]
```

**Errors**:
| Status | Condition |
|--------|-----------|
| `400` | Missing or empty `message` |
| `500` | Chat request failed (HF API error) |
| `503` | `HF_TOKEN` not configured |

**Configuration**:
- Model: `meta-llama/Llama-3.1-8B-Instruct`
- Max tokens: 512
- Temperature: 0.7
- Top-p: 0.9
- System prompt includes portfolio context (bio, experience, certifications)

---

### Booking API

**Source**: [`server/routes/booking.ts`](../server/routes/booking.ts)
**External Service**: Cal.com API v2
**Env Vars Required**: `CAL_API_KEY`, `CAL_EVENT_TYPE_ID`

#### `GET /api/booking/slots`

Fetch available booking slots for the next 7 days.

**Response** `200 OK`:
```json
{
  "slots": {
    "2026-03-06": ["2026-03-06T09:00:00Z", "2026-03-06T10:00:00Z"],
    "2026-03-07": ["2026-03-07T14:00:00Z", "2026-03-07T15:00:00Z"]
  }
}
```

**Errors**:
| Status | Condition |
|--------|-----------|
| `500` | Failed to fetch from Cal.com |
| `503` | `CAL_API_KEY` or `CAL_EVENT_TYPE_ID` not configured |

**Cal.com API Version**: `2024-09-04`

#### `POST /api/booking/create`

Create a booking on Cal.com with Google Meet link.

**Request Body**:
```json
{
  "start": "2026-03-10T09:00:00Z",
  "name": "John Doe",
  "email": "john@example.com",
  "timeZone": "Europe/Athens"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `start` | `string` | Yes | ISO 8601 datetime |
| `name` | `string` | Yes | Attendee name (trimmed) |
| `email` | `string` | Yes | Attendee email (trimmed) |
| `timeZone` | `string` | No | IANA timezone (default: `UTC`) |

**Response** `200 OK`:
```json
{
  "uid": "booking-uid-123",
  "meetingUrl": "https://meet.google.com/abc-defg-hij",
  "status": "accepted"
}
```

**Errors**:
| Status | Condition |
|--------|-----------|
| `400` | Missing `start`, `name`, or `email` |
| `500` | Booking failed |
| `503` | Cal.com not configured |

**Cal.com API Version**: `2024-08-13`

---

### API Keys Management

**Source**: [`server/routes/apiKeys.ts`](../server/routes/apiKeys.ts)
**Base Path**: `/api/organizations/api_keys`
**Side Effects**: Slack webhook notifications on create/update/delete

#### `GET /api/organizations/api_keys`

List all API keys.

**Response** `200 OK`:
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

#### `POST /api/organizations/api_keys`

Create a new API key.

**Request Body**:
```json
{
  "name": "My New Key",
  "workspace_id": "ws_456"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Non-empty string |
| `workspace_id` | `string \| null` | No | Workspace association |

**Response** `201 Created`:
```json
{
  "id": "ak_a1b2c3d4e5f6g7h8i9j0",
  "created_at": "2026-03-06T18:00:00.000Z",
  "created_by": { "id": "user_system", "type": "user" },
  "name": "My New Key",
  "partial_key_hint": "ak_a1b2",
  "status": "active",
  "type": "api_key",
  "workspace_id": "ws_456"
}
```

**Errors**:
| Status | Body |
|--------|------|
| `400` | `{ "error": { "code": "INVALID_PARAMETER", "message": "Name is required..." } }` |

#### `GET /api/organizations/api_keys/:api_key_id`

Get a single API key by ID.

**Response** `200 OK`: Single API key object (same schema as list item).

**Errors**:
| Status | Body |
|--------|------|
| `404` | `{ "error": { "code": "NOT_FOUND", "message": "API key with ID ... not found" } }` |

#### `POST /api/organizations/api_keys/:api_key_id`

Update an API key's name and/or status.

**Request Body**:
```json
{
  "name": "Updated Name",
  "status": "inactive"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | `string` | No | Non-empty if provided |
| `status` | `string` | No | One of: `active`, `inactive`, `archived` |

**Response** `200 OK`: Updated API key object.

**Errors**:
| Status | Condition |
|--------|-----------|
| `400` | Invalid name or status value |
| `404` | API key not found |

#### `DELETE /api/organizations/api_keys/:api_key_id`

Delete an API key.

**Response** `200 OK`:
```json
{
  "id": "ak_1234567890",
  "deleted": true
}
```

**Errors**:
| Status | Condition |
|--------|-----------|
| `404` | API key not found |

---

### Push Notifications API

**Source**: [`server/routes/pushNotifications.ts`](../server/routes/pushNotifications.ts)
**External Service**: Web Push protocol
**Env Vars**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (auto-generated if not set)

#### `GET /api/push-notifications?action=vapid-public-key`

Get the VAPID public key for client-side subscription.

**Response** `200 OK`:
```json
{
  "publicKey": "BNz..."
}
```

#### `GET /api/push-notifications?action=subscriptions`

Get subscription count and list.

**Response** `200 OK`:
```json
{
  "subscriptions": 3,
  "list": [{ "endpoint": "https://fcm.googleapis.com/..." }]
}
```

#### `GET /api/push-notifications` (no action)

Send test notification to all subscriptions.

**Response** `200 OK`:
```json
{
  "success": true,
  "message": "Notifications sent",
  "results": [{ "endpoint": "...", "success": true, "statusCode": 201 }],
  "totalSubscriptions": 3
}
```

**Error** `400`: No subscriptions found.

#### `POST /api/push-notifications`

Send custom notification.

**Request Body**:
```json
{
  "message": {
    "title": "Hello",
    "body": "World",
    "icon": "/icon.png",
    "url": "https://baltzakis.dev"
  }
}
```

#### `PUT /api/push-notifications`

Store a push subscription.

**Request Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

#### `DELETE /api/push-notifications?endpoint=<encoded_url>`

Remove a push subscription.

---

### Resume API

**Source**: [`server/routes/resume.ts`](../server/routes/resume.ts)

#### `GET /api/resume/download`

Download resume as PDF.

**Response** `200 OK`: PDF file generated via jsPDF with full resume content (name, title, experience, skills, certifications).

---

### Legacy Chatbot (Development Only)

#### `POST /api/chatbot` (port 3010)

**Source**: [`server/bot.ts`](../server/bot.ts)

Simple keyword-match chatbot (not deployed to Lambda).

**Request Body**: `{ "message": "What is this website about?" }`
**Response**: `{ "reply": "This is a modern portfolio built with Next.js..." }`

#### `POST /api/chat/stream` (port 8001)

**Source**: [`server/bot/main.py`](../server/bot/main.py)

FastAPI streaming chatbot using Mistral-7B (not deployed to Lambda).

---

## Amplify Rewrite Rules

These rules proxy frontend `/api/*` requests to the Lambda backend.

> **Recommended simplification**: Replace all individual rules below with a single catch-all:
> `/api/<*>` → `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/<*>`

| Source Pattern | Target |
|---------------|--------|
| `/api/chat` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/chat` |
| `/api/booking/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/booking/<*>` |
| `/api/contact` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/contact` |
| `/api/resume/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/resume/<*>` |
| `/api/organizations/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/organizations/<*>` |
| `/api/ai/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/ai/<*>` |
| `/api/agents` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/agents` |
| `/api/agents/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/agents/<*>` |
| `/api/push-notifications` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/push-notifications` |
| `/api/push-notifications/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/push-notifications/<*>` |
| `/api/analytics` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/analytics` |
| `/api/analytics/<*>` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/analytics/<*>` |
| `/api/ping` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/ping` |
| `/api/health` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/health` |
| `/api/demo` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/api/demo` |
| `/autofix` | `https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com/autofix` |

---

## Environment Variables

### Required for Backend

| Variable | Used By | Description |
|----------|---------|-------------|
| `HF_TOKEN` | Chat API | HuggingFace API token |
| `CAL_API_KEY` | Booking API | Cal.com API v2 key |
| `CAL_EVENT_TYPE_ID` | Booking API | Cal.com event type ID |
| `SLACK_WEBHOOK_URL` | API Keys | Slack incoming webhook URL |
| `SLACK_CHANNEL` | API Keys | Slack channel (default: `#personal-website`) |
| `VAPID_PUBLIC_KEY` | Push Notifications | VAPID public key (auto-generated if not set) |
| `VAPID_PRIVATE_KEY` | Push Notifications | VAPID private key (auto-generated if not set) |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | API base URL prefix |
| `NEXT_PUBLIC_LAMBDA_CONTACT_URL` | `/api/contact` | Contact form Lambda URL |
| `NEXT_PUBLIC_LAMBDA_RESUME_URL` | `/api/resume` | Resume Lambda URL |
| `NEXT_PUBLIC_LAMBDA_PUSH_NOTIFICATIONS_URL` | `/api/push-notifications` | Push notifications Lambda URL |
| `NEXT_PUBLIC_LAMBDA_PING_URL` | `/api/ping` | Ping Lambda URL |
| `NEXT_PUBLIC_LAMBDA_DEMO_URL` | `/api/demo` | Demo Lambda URL |
| `NEXT_PUBLIC_LAMBDA_CHAT_URL` | `/api/chat` | Chat SSE streaming Lambda URL |
| `NEXT_PUBLIC_LAMBDA_BOOKING_URL` | `/api/booking` | Cal.com booking Lambda URL (appends `/slots` or `/create`) |
| `NEXT_PUBLIC_LAMBDA_HEALTH_URL` | `/api/health` | Health endpoint Lambda URL |
| `NEXT_PUBLIC_LAMBDA_AGENTS_URL` | `/api/agents` | Agents endpoint Lambda URL |
| `NEXT_PUBLIC_LAMBDA_API_KEYS_URL` | `/api/organizations/api_keys` | API keys CRUD Lambda URL |

---

## Client-Side API Wrapper

**File**: [`src/lib/api.ts`](../src/lib/api.ts)

Centralized fetch wrapper with error handling. All functions throw on non-2xx responses.

```typescript
import {
  submitContactForm, generateResumePDF, pushNotificationsApi,
  ping, getDemo, getHealth,
  sendChatMessage, getBookingSlots, createBooking,
  listAPIKeys, getAPIKey, createAPIKey, updateAPIKey, deleteAPIKey,
  resolveApiUrl, apiStreamRequest,
} from "@/lib/api";
```

---

## Type Definitions

**File**: [`src/types/api.ts`](../src/types/api.ts)

Key interfaces:

```typescript
interface APIKey {
  id: string;
  created_at: string;
  created_by: { id: string; type: string };
  name: string;
  partial_key_hint: string;
  status: "active" | "inactive" | "archived";
  type: "api_key";
  workspace_id: string | null;
}

interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface CreateAPIKeyRequest {
  name: string;
  workspace_id?: string | null;
}

interface UpdateAPIKeyRequest {
  name?: string;
  status?: "active" | "inactive" | "archived";
}
```

---

## Error Handling

All endpoints follow consistent error patterns:

- **400 Bad Request**: Validation errors (missing/invalid fields)
- **404 Not Found**: Resource not found or endpoint doesn't exist
- **500 Internal Server Error**: Unexpected server errors (wrapped in try-catch)
- **503 Service Unavailable**: Required environment variable not configured

Error response format:
```json
{
  "error": "Human-readable error message"
}
```

Or for API Keys (structured errors):
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Name is required and must be a non-empty string"
  }
}
```
