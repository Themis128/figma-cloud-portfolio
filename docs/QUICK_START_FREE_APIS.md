# 🚀 Quick Start: Free API Testing

**Get started with real API testing in 5 minutes - zero cost!**

---

## ✅ What's Included (All Free!)

| API | Free Tier | Cost | Status |
|-----|-----------|------|--------|
| **GitHub** | 5,000 req/hour | $0 | ✅ Ready |
| **Firebase FCM** | Generous quota | $0 | ✅ Ready |
| **Socket.IO** | Local server | $0 | ✅ Ready |
| **Google Analytics** | Unlimited* | $0 | ✅ Ready |
| **reCAPTCHA v3** | 1M req/month | $0 | ✅ Ready |

*Creates test data in your analytics

---

## 🎯 5-Minute Setup

### Step 1: Copy Environment File

```bash
cp .env.test.example .env.test
```

### Step 2: Get GitHub Token (2 minutes)

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: ✅ `repo`, ✅ `workflow`, ✅ `read:user`
4. Click **"Generate token"**
5. Copy the token

### Step 3: Add to .env.test

Open `.env.test` and add:

```env
# GitHub (FREE - 5000 req/hr)
GITHUB_TOKEN=ghp_your_token_here
VITE_GITHUB_TOKEN=ghp_your_token_here
TEST_GITHUB_API=true

# Socket.IO (FREE - local server)
TEST_SOCKETIO=true
VITE_SOCKET_URL=http://localhost:3000

# Enable free APIs only
TEST_FIREBASE=false      # Enable after Firebase setup
TEST_ANALYTICS=false     # Enable after GA4 setup
TEST_ANTHROPIC=false     # Keep disabled (costs money)
TEST_OPENAI=false        # Keep disabled (costs money)
```

### Step 4: Start Servers

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: Backend
npx tsx server/node-build.ts
```

### Step 5: Run Tests!

```bash
pnpm test:e2e:real
```

---

## 📊 Expected Output

```
🚀 Running REAL GitHub API integration tests

📡 API Request: GET ...workflows/figma-cloud-portfolio
📥 API Response: 200 OK
✅ GitHub Workflows completed in 245ms

📋 Found 3 workflows:
  - CI/CD Pipeline (active)
  - Playwright Tests (active)
  - Deploy Production (active)

⏱️  Rate Limit Status:
  Limit: 5000
  Remaining: 4997
  Resets at: 2/1/2026, 5:00:00 PM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Real API Usage Report:
GitHub API:
  Calls: 6
  Avg Duration: 234ms
  Success Rate: 100.0%
  Est. Cost: $0.0000
Socket.IO:
  Calls: 5
  Avg Duration: 127ms
  Success Rate: 100.0%
  Est. Cost: $0.0000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎓 Specific Test Files

### Run Individual APIs

```bash
# GitHub API tests (2 min)
pnpm test:e2e:real playwright-tests/real-api/github-api.real.spec.ts

# Socket.IO tests (1 min)
pnpm test:e2e:real playwright-tests/real-api/socketio.real.spec.ts

# Firebase tests (2 min) - requires setup
pnpm test:e2e:real playwright-tests/real-api/firebase.real.spec.ts

# Google Analytics (2 min) - requires setup
pnpm test:e2e:real playwright-tests/real-api/analytics.real.spec.ts

# reCAPTCHA tests (2 min) - requires setup
pnpm test:e2e:real playwright-tests/real-api/recaptcha.real.spec.ts
```

---

## 🔧 Optional: Add More Free APIs

### Firebase (Free Tier)

1. Go to https://console.firebase.google.com/
2. Create/select project
3. Project Settings → General
4. Copy config to `.env.test`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
TEST_FIREBASE=true
```

### Google Analytics 4 (Free)

1. Create GA4 property: https://analytics.google.com/
2. Get Measurement ID
3. Add to `.env.test`:

```env
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
TEST_ANALYTICS=true
```

⚠️ **Note**: This will create test data in your analytics

### reCAPTCHA v3 (1M free/month)

1. Register site: https://www.google.com/recaptcha/admin
2. Choose reCAPTCHA v3
3. Add to `.env.test`:

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

---

## 🎮 Interactive Mode

For debugging, use UI mode:

```bash
pnpm test:e2e:real:ui
```

Or see the browser:

```bash
pnpm test:e2e:real:headed
```

---

## 🐛 Troubleshooting

### "Skipping tests (missing credentials)"

**Fix**: Check `.env.test` has the API key:
```bash
cat .env.test | grep GITHUB_TOKEN
```

### "Backend server not available"

**Fix**: Start backend in Terminal 2:
```bash
npx tsx server/node-build.ts
```

### "Rate limit exceeded"

**You're fine!** GitHub gives 5000 requests/hour. The tests use < 10.

Just wait a few minutes or increase delay:
```env
RATE_LIMIT_DELAY_MS=2000
```

---

## 💡 Tips

### Start Small
```env
# Week 1: Just GitHub
TEST_GITHUB_API=true
TEST_SOCKETIO=false
TEST_FIREBASE=false
```

### Add Gradually
```env
# Week 2: Add Socket.IO
TEST_GITHUB_API=true
TEST_SOCKETIO=true
TEST_FIREBASE=false
```

### Never Enable These (Without Budget!)
```env
# ⚠️ COSTS MONEY - Keep disabled
TEST_ANTHROPIC=false
TEST_OPENAI=false
```

---

## 📈 What's Being Tested

### GitHub API ✅
- ✅ Real workflow fetching
- ✅ Run status tracking
- ✅ Rate limit handling
- ✅ Cache effectiveness
- ✅ Authentication

### Socket.IO ✅
- ✅ WebSocket connections
- ✅ Message exchange
- ✅ Room management
- ✅ Reconnection logic
- ✅ Performance metrics

### Firebase ✅
- ✅ SDK initialization
- ✅ FCM availability
- ✅ Token generation
- ✅ Push subscriptions
- ✅ Performance impact

### Google Analytics ✅
- ✅ GA4 script loading
- ✅ Page view tracking
- ✅ Custom events
- ✅ Web Vitals
- ✅ Configuration

### reCAPTCHA ✅
- ✅ Script loading
- ✅ Token generation
- ✅ Server verification
- ✅ Form integration
- ✅ Performance

---

## 🎯 Next Steps

1. ✅ **You're done!** Tests are running
2. 📊 **View reports**: `npx playwright show-report playwright-report-real-api`
3. 🔄 **Run regularly**: Before each deployment
4. 📚 **Read full guide**: Check `REAL_API_TESTING_GUIDE.md`
5. 💰 **Save money**: Never enable `TEST_ANTHROPIC` or `TEST_OPENAI` without budget

---

## 🆘 Need Help?

**GitHub Token Issues**
- Make sure it starts with `ghp_`
- Check it has `repo`, `workflow`, `read:user` scopes
- Try regenerating if expired

**Backend Not Running**
- Terminal 2: `npx tsx server/node-build.ts`
- Check port 3000 is available
- Look for "Server running" message

**Tests Still Failing**
- Check `.env.test` is in project root
- Verify servers are running in both terminals
- Try running one test at a time

---

## ✨ Success!

You're now testing with **real APIs** at **zero cost**! 🎉

**Test early, test often, deploy confidently!**

---

**⏱️ Total Setup Time**: ~5 minutes
**💰 Total Cost**: $0.00
**✅ Test Coverage**: 5 free integrations

Last Updated: 2026-02-01
