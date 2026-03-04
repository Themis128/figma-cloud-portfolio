# 🧪 Real API Testing Guide

**Complete guide for testing with real external APIs instead of mocks**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Setup Instructions](#setup-instructions)
4. [Running Real API Tests](#running-real-api-tests)
5. [API-Specific Guides](#api-specific-guides)
6. [Cost Management](#cost-management)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

### What Changed?

**Mock-based Tests (`playwright-tests/*.spec.ts`)**

- Fast execution (milliseconds)
- No API costs
- Always available
- Perfect for CI/CD
- ✅ Keep these for regular development

**Real API Tests (`playwright-tests/real-api/*.real.spec.ts`)**

- Slower execution (seconds/minutes)
- May incur API costs
- Network-dependent
- Tests actual integrations
- ✅ Use for pre-deployment validation

### Why Both Approaches?

| Aspect          | Mock Tests       | Real API Tests            |
| --------------- | ---------------- | ------------------------- |
| **Speed**       | ⚡ Fast (ms)     | 🐢 Slow (sec/min)         |
| **Cost**        | 💚 Free          | 💰 May cost $             |
| **Reliability** | ✅ Always pass   | ⚠️ Network-dependent      |
| **Coverage**    | 📦 Feature logic | 🌐 End-to-end integration |
| **When to use** | Every commit     | Before deployment         |

---

## 🚀 Quick Start

### 1. Copy Environment Template

```bash
cp .env.test.example .env.test
```

### 2. Add Your Real API Credentials

Edit `.env.test` and add your **test/staging** API keys:

```env
# Start with free APIs
TEST_GITHUB_API=true
TEST_FIREBASE=true
TEST_SOCKETIO=true

# Keep expensive APIs disabled initially
TEST_ANTHROPIC=false
TEST_OPENAI=false
```

### 3. Start Development Servers

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend
npx tsx server/node-build.ts
```

### 4. Run Real API Tests

```bash
# Run all real API tests
pnpm test:e2e:real

# Run specific integration
pnpm test:e2e:real playwright-tests/real-api/github-api.real.spec.ts
```

---

## 🛠️ Setup Instructions

### Step 1: Environment Variables

Create `.env.test` from template:

```bash
cp .env.test.example .env.test
```

### Step 2: Get API Credentials

#### GitHub API (Free - 5000 req/hr)

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `read:user`
4. Copy token and add to `.env.test`:

```env
GITHUB_TOKEN=ghp_your_token_here
VITE_GITHUB_TOKEN=ghp_your_token_here
TEST_GITHUB_API=true
```

#### Firebase (Free tier)

1. Go to https://console.firebase.google.com/
2. Create or select project
3. Project Settings → General
4. Copy config values to `.env.test`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
TEST_FIREBASE=true
```

#### Socket.IO (Local - Free)

```env
VITE_SOCKET_URL=http://localhost:3000
TEST_SOCKETIO=true
```

#### Anthropic Claude (⚠️ Costs Money)

**Pricing**: $0.25/MTok input, $1.25/MTok output

Only enable if you have budget:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your_key
TEST_ANTHROPIC=false  # Set to true only when ready
```

### Step 3: Configure .gitignore

**CRITICAL**: Never commit `.env.test`

Verify `.gitignore` includes:

```
.env.test
.env.local
.env*.local
```

### Step 4: Install Dependencies

```bash
pnpm install
```

---

## 🏃 Running Real API Tests

### Basic Commands

```bash
# Run all real API tests
pnpm test:e2e:real

# Run with UI mode (recommended for debugging)
pnpm test:e2e:real --ui

# Run specific test file
pnpm test:e2e:real playwright-tests/real-api/github-api.real.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e:real --headed

# Run single test by name
pnpm test:e2e:real -g "should fetch real GitHub workflows"
```

### Test Reports

After running, view detailed reports:

```bash
# Open HTML report
npx playwright show-report playwright-report-real-api

# View test results
cat test-results/real-api-results.json
```

### CI/CD Integration

**GitHub Actions** (example):

```yaml
- name: Run Real API Tests (Nightly)
  run: pnpm test:e2e:real
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    TEST_GITHUB_API: true
    TEST_FIREBASE: true
```

---

## 📚 API-Specific Guides

### GitHub API Tests

**What's tested:**

- Real workflow fetching
- Workflow run status
- Job details
- Rate limiting behavior
- LRU cache effectiveness

**Environment variables:**

```env
GITHUB_TOKEN=ghp_your_token
TEST_GITHUB_API=true
RATE_LIMIT_DELAY_MS=1000
```

**Run:**

```bash
pnpm test:e2e:real playwright-tests/real-api/github-api.real.spec.ts
```

**Expected output:**

```
📋 Found 3 workflows:
  - CI/CD Pipeline (active)
  - Playwright Tests (active)
  - Deploy Production (active)

📊 Latest run: #42 - completed (success)

⏱️  Rate Limit Status:
  Limit: 5000
  Remaining: 4997
  Resets at: 2/1/2026, 5:00:00 PM
```

### Firebase Tests

**What's tested:**

- Firebase SDK initialization
- FCM availability
- VAPID key retrieval
- Push subscription flow
- SDK load performance

**Environment variables:**

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
TEST_FIREBASE=true
```

**Run:**

```bash
pnpm test:e2e:real playwright-tests/real-api/firebase.real.spec.ts
```

**Expected output:**

```
📱 Firebase Status:
  SDK Loaded: ✅
  Project ID: your-project

🔔 FCM Capability:
  Messaging API: ✅
  Notification API: ✅
  Permission: granted

🔑 VAPID Key Status: ✅ Retrieved
  Key length: 88 characters
```

### Socket.IO Tests (Coming Soon)

**What's tested:**

- Real WebSocket connections
- Room joining/leaving
- Message broadcasting
- Connection resilience

### Anthropic Claude Tests (⚠️ Costs Money)

**What's tested:**

- Real Claude API calls
- Streaming responses
- Token usage tracking
- Cost calculation

**IMPORTANT**: Only enable when ready to incur costs

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your_key
TEST_ANTHROPIC=true  # WARNING: This will cost money
```

---

## 💰 Cost Management

### Free Tier APIs

These are safe to test extensively:

| API                  | Free Tier         | Notes                  |
| -------------------- | ----------------- | ---------------------- |
| **GitHub**           | 5000 req/hr       | Per authenticated user |
| **Firebase**         | Generous quota    | FCM, auth, database    |
| **Socket.IO**        | Local             | No external costs      |
| **Google Analytics** | Unlimited         | Creates test data      |
| **reCAPTCHA**        | 1M requests/month | Free                   |

### Paid APIs

These cost money per API call:

| API                  | Pricing               | Recommended Limit |
| -------------------- | --------------------- | ----------------- |
| **Anthropic Claude** | $0.25-$1.25/MTok      | Max 100 tests/day |
| **OpenAI GPT-4**     | $0.03-$0.12/1K tokens | Max 50 tests/day  |
| **Sentry**           | 5K events/month free  | Stay under quota  |

### Cost Tracking

The test suite automatically tracks API usage:

```
📊 Real API Usage Report:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GitHub API:
  Calls: 15
  Avg Duration: 245ms
  Success Rate: 100.0%
  Est. Cost: $0.0000

Anthropic Claude:
  Calls: 5
  Avg Duration: 1823ms
  Success Rate: 100.0%
  Est. Cost: $0.0234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Budget Protection

Set daily limits in `.env.test`:

```env
# Stop tests after reaching limits
MAX_DAILY_AI_CALLS=100
MAX_DAILY_COST_USD=5.00
```

---

## 🐛 Troubleshooting

### Tests are skipped

**Problem:**

```
⏭️  Skipping GitHub API tests (missing credentials)
```

**Solution:**

1. Check `.env.test` exists
2. Verify credentials are set
3. Confirm `TEST_<API>=true`

```bash
# Verify environment
cat .env.test | grep GITHUB_TOKEN
cat .env.test | grep TEST_GITHUB_API
```

### Rate limit exceeded

**Problem:**

```
❌ GitHub API: 403 - API rate limit exceeded
```

**Solution:**

1. Wait for rate limit reset
2. Increase `RATE_LIMIT_DELAY_MS`
3. Reduce `MAX_CONCURRENT_REQUESTS`

```env
RATE_LIMIT_DELAY_MS=2000  # 2 seconds between calls
MAX_CONCURRENT_REQUESTS=1  # One at a time
```

### Network timeouts

**Problem:**

```
❌ API Request timeout after 30000ms
```

**Solution:**

1. Check internet connection
2. Verify API service status
3. Increase timeout in config

```typescript
// playwright.config.real-api.ts
timeout: 90000, // 90 seconds
```

### API credentials invalid

**Problem:**

```
❌ Authentication error: 401 Unauthorized
```

**Solution:**

1. Regenerate API token
2. Check token scopes/permissions
3. Verify token hasn't expired

```bash
# Test GitHub token manually
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user
```

### Firebase not initializing

**Problem:**

```
📱 Firebase Status: SDK Loaded: ❌
```

**Solution:**

1. Verify all Firebase config variables
2. Check Firebase console for project status
3. Ensure project supports web applications

### High API costs

**Problem:**

```
⚠️  Daily cost limit reached: $5.23
```

**Solution:**

1. Disable expensive APIs: `TEST_ANTHROPIC=false`
2. Reduce test frequency
3. Use cheaper models (haiku instead of opus)
4. Review usage tracker logs

---

## ✅ Best Practices

### 1. Use Staging Credentials

```env
# ✅ Good: Separate test environment
GITHUB_TOKEN=ghp_test_staging_token

# ❌ Bad: Production credentials
GITHUB_TOKEN=ghp_production_token
```

### 2. Implement Rate Limiting

```typescript
// Always add delays between API calls
await rateLimitDelay(config.rateLimitDelay);
```

### 3. Handle Failures Gracefully

```typescript
// Use retry logic for network issues
const result = await retryWithBackoff(apiCall, 3);
```

### 4. Track Costs

```typescript
// Record every API call
usageTracker.recordCall("API Name", duration, cost);
```

### 5. Clean Up Test Data

```typescript
test.afterEach(async () => {
  await cleanupTestData("API Name", async () => {
    // Remove test artifacts
  });
});
```

### 6. Run Selectively

```bash
# ✅ Good: Run before deployment
pnpm test:e2e:real

# ❌ Bad: Run on every commit
# (Use mocks for frequent testing)
```

### 7. Monitor API Quotas

```typescript
// Check remaining quota
const rateRemaining = response.headers()["x-ratelimit-remaining"];
if (parseInt(rateRemaining) < 100) {
  console.warn("⚠️ Low on API quota!");
}
```

### 8. Document Expected Behavior

```typescript
test("should fetch workflows", async () => {
  // Document what a success looks like
  console.log(`📋 Found ${workflows.length} workflows`);
  // This helps debug when real API changes
});
```

---

## 📊 Comparison: Mock vs Real

### When to Use Mock Tests

✅ Fast feedback during development
✅ Testing error handling logic
✅ Testing UI interactions
✅ CI/CD pipeline
✅ Unit testing components
✅ Testing edge cases

### When to Use Real API Tests

✅ Pre-deployment validation
✅ Verifying API integration
✅ Testing rate limiting
✅ Checking authentication
✅ Performance testing
✅ Finding breaking API changes
✅ Staging environment validation

---

## 🎯 Next Steps

1. **Start with free APIs** (GitHub, Firebase, Socket.IO)
2. **Run tests manually** before enabling in CI/CD
3. **Monitor costs** if using paid APIs
4. **Gradually add** more integrations as needed
5. **Schedule nightly** runs for comprehensive testing

---

## 📞 Support

**Questions?**
Check `INTEGRATIONS.md` for API setup details

**Issues?**
https://github.com/Themis128/figma-cloud-portfolio/issues

**Cost concerns?**
Start with `TEST_<API>=false` for expensive APIs

---

**Last Updated**: 2026-02-01
**Version**: 1.0.0
**Status**: ✅ Production Ready
