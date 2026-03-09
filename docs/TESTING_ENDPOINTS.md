# Testing Endpoints & Forms Checklist

All endpoints and forms to verify after deployment.

**Production domain**: `https://www.baltzakisthemis.com`
**Lambda URL**: `https://oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws`
**Local dev**: `http://localhost:3001` (Express) / `http://localhost:3000` (Next.js)

---

## Frontend Pages

| URL | Page | Key Elements |
|-----|------|-------------|
| `/` | Home | Navigation, hero animations, AIBrain 3D |
| `/about/` | About | Bio, skills, career timeline |
| `/contact/` | Contact | **Contact form**, info cards, quick actions |
| `/resume/` | Resume | Interactive builder, PDF export |
| `/projects/` | Projects | Portfolio gallery |
| `/performance/` | Performance | Live web vitals, speed test, industry comparison |
| `/agents/` | AI Agents | Agent showcase |
| `/settings/` | Settings | Theme, notifications, privacy prefs |
| `/product/` | Work Experience | Timeline |

---

## Health & Status Endpoints

```bash
# Basic ping
curl https://www.baltzakisthemis.com/api/ping

# Detailed health (uptime, memory, environment)
curl https://www.baltzakisthemis.com/api/health

# Demo endpoint
curl https://www.baltzakisthemis.com/api/demo

# Server monitoring
curl https://www.baltzakisthemis.com/api/monitor
```

---

## Contact Form (`/contact/`)

### Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | text | yes | non-empty |
| `email` | email | yes | email format |
| `subject` | text | yes | non-empty |
| `message` | textarea | yes | non-empty |

### API Endpoint

```bash
# POST /api/contact
curl -X POST https://www.baltzakisthemis.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message from deployment verification"
  }'
```

**Expected**: `{ "success": true, "message": "..." }`
**Side effects**: Slack notification + SES email to `baltzakis.themis@gmail.com`
**Note**: Production requires valid reCAPTCHA v3 token. Browser submission includes token automatically.

---

## Chat API (AI Assistant)

```bash
# POST /api/chat (Server-Sent Events stream)
curl -X POST https://www.baltzakisthemis.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about Themis",
    "history": []
  }'
```

**Response**: SSE stream with `data: {"token": "..."}` lines, ending with `data: [DONE]`
**Booking detection**: Returns `{"action": "start_booking"}` if scheduling intent detected

---

## Booking API (Cal.com)

```bash
# GET available slots (next 7 days)
curl https://www.baltzakisthemis.com/api/booking/slots

# POST create booking
curl -X POST https://www.baltzakisthemis.com/api/booking/create \
  -H "Content-Type: application/json" \
  -d '{
    "start": "2026-03-15T09:00:00Z",
    "name": "Test User",
    "email": "test@example.com",
    "timeZone": "Europe/Athens"
  }'
```

---

## Resume API

```bash
# GET resume data as JSON
curl https://www.baltzakisthemis.com/api/resume/generate

# GET resume PDF download
curl -o resume.pdf https://www.baltzakisthemis.com/api/resume/download
```

---

## GitHub Proxy

```bash
# GET GitHub user stats
curl https://www.baltzakisthemis.com/api/github/stats

# GET public repos (paginated)
curl "https://www.baltzakisthemis.com/api/github/repos?page=1&limit=5"
```

---

## Search

```bash
# GET search portfolio content
curl "https://www.baltzakisthemis.com/api/search?q=cloud"
curl "https://www.baltzakisthemis.com/api/search?q=security"
```

---

## Push Notifications

```bash
# Subscription management (browser-initiated)
# GET /api/push-notifications — list subscriptions
# POST /api/push-notifications — subscribe
# PUT /api/push-notifications — update subscription
# DELETE /api/push-notifications — unsubscribe
```

---

## API Keys Management (Auth Required)

```bash
# Requires Firebase Auth token
AUTH="Authorization: Bearer <token>"

# List API keys
curl -H "$AUTH" https://www.baltzakisthemis.com/api/organizations/api_keys

# Create API key
curl -X POST -H "$AUTH" -H "Content-Type: application/json" \
  https://www.baltzakisthemis.com/api/organizations/api_keys \
  -d '{"name": "Test Key", "workspace_id": "ws_test"}'

# Get/Update/Delete by ID
curl -H "$AUTH" https://www.baltzakisthemis.com/api/organizations/api_keys/{id}
curl -X POST -H "$AUTH" -H "Content-Type: application/json" \
  https://www.baltzakisthemis.com/api/organizations/api_keys/{id} \
  -d '{"name": "Updated Name"}'
curl -X DELETE -H "$AUTH" https://www.baltzakisthemis.com/api/organizations/api_keys/{id}
```

---

## Playwright Autofix (Dev only)

```bash
curl http://localhost:3001/api/playwright-autofix/health
curl http://localhost:3001/api/playwright-autofix/config
curl http://localhost:3001/api/playwright-autofix/patterns
```

---

## Quick Verification Script

```bash
#!/usr/bin/env bash
# Run after deployment to verify all critical endpoints
set -euo pipefail
BASE="https://www.baltzakisthemis.com"

echo "=== Frontend Pages ==="
for path in "" about/ contact/ resume/ projects/ performance/ agents/ settings/ product/; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/${path}")
  echo "  /${path} → ${STATUS}"
done

echo ""
echo "=== API Endpoints ==="
for endpoint in api/ping api/health api/demo; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/${endpoint}")
  echo "  /${endpoint} → ${STATUS}"
done

echo ""
echo "=== Contact Form (dry run) ==="
CONTACT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Deploy Test","email":"test@test.com","subject":"Test","message":"Automated deployment verification"}')
echo "  POST /api/contact → ${CONTACT}"

echo ""
echo "=== Chat API ==="
CHAT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","history":[]}')
echo "  POST /api/chat → ${CHAT}"

echo ""
echo "=== Booking Slots ==="
SLOTS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/booking/slots")
echo "  GET /api/booking/slots → ${SLOTS}"

echo ""
echo "=== GitHub Stats ==="
GH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/github/stats")
echo "  GET /api/github/stats → ${GH}"
```

---

## CloudFront Routing

| Pattern | Origin | Purpose |
|---------|--------|---------|
| `/api/*` | Lambda Function URL | All API requests |
| `Default (*)` | S3 `figma-portfolio-static` | Static frontend assets |

---

_Last Updated: March 9, 2026_
