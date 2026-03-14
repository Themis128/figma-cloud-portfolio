# Application Architecture

## Overview

This is a **Next.js 16 application** with the App Router, deployed as a **static export** on **S3 + CloudFront** (frontend) with an **AWS Lambda** function (backend). It serves as the personal portfolio of Themistoklis Baltzakis — a Cloud Architect & Cybersecurity Specialist with 15+ years of IT expertise.

---

## Tech Stack

| Layer                  | Technology               |
| ---------------------- | ------------------------ |
| Framework              | Next.js 16 (App Router)                          |
| Language               | TypeScript 5                                      |
| Styling                | Tailwind CSS v4                                   |
| UI components          | Radix UI, shadcn/ui                               |
| Animation              | Framer Motion                                     |
| PWA                    | Workbox (service worker)                          |
| Backend (production)   | AWS Lambda (`figma-portfolio-api`)                |
| Backend (local dev)    | Express.js on port 3001                           |
| Chatbot backend        | AWS Bedrock (Claude 3 Haiku) via Express route |
| Auth + Data backend    | AWS Amplify Gen 2 (Cognito + AppSync + DynamoDB)  |
| Frontend hosting       | S3 (`figma-portfolio-static`) + CloudFront        |
| Analytics              | Google Analytics GA4 + Sentry                     |
| Auth (production)      | AWS Amplify Gen 2 Cognito (Firebase SDK disabled) |
| Security               | reCAPTCHA v3, security headers via amplify.yml    |
| Performance monitoring | web-vitals library                                |
| Real-time features     | Socket.IO                                         |
| 3D visualizations      | Three.js + @react-three/fiber v9 + @react-three/drei v10 |
| Testing                | Playwright 1.58+ E2E, Vitest 4 unit tests         |

---

## Directory Structure

```
portfolio-nextjs/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (providers, Navigation, ChatbotWidget)
│   │   ├── page.tsx          # Home page
│   │   ├── about/            # About page
│   │   ├── agents/           # AI Agents educational guide
│   │   ├── contact/          # Contact form
│   │   ├── performance/      # Performance page (public-facing)
│   │   ├── product/          # Work experience timeline
│   │   ├── projects/         # Projects gallery
│   │   ├── resume/           # Resume & career guide
│   │   ├── settings/         # App preferences
│   │   ├── admin/            # Admin dashboard
│   │   ├── cookies/          # Cookie policy
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of service
│   │   └── builder/          # Builder.io page (optional)
│   ├── components/           # Reusable UI components
│   │   ├── admin/            # Admin dashboard components (10 tab panels)
│   │   ├── performance/      # Performance page components
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── data/                 # Static data
│   ├── types/                # Shared TypeScript types
│   └── styles/               # Global styles
├── server/                   # Express dev server (port 3001) — resume, API keys, playwright-autofix
├── playwright-tests/         # E2E test suite
├── docs/                     # Project documentation
├── public/                   # Static assets
└── scripts/                  # Build & utility scripts
```

---

## Frontend Architecture

### Server vs. Client Components

The app uses the Next.js App Router Server/Client component model:

- **Server Components** (default): Static content, no JavaScript shipped. Used for page shells, static sections, and SEO-sensitive content.
- **Client Components** (`'use client'`): Interactive elements, hooks, browser APIs. Used for animations, live metrics, and user interactions.

### Route Map

| Path           | Component              | Description                                     |
| -------------- | ---------------------- | ----------------------------------------------- |
| `/`            | `page.tsx`             | Home / landing with AIBrain visualisation       |
| `/about`       | `about/page.tsx`       | Professional bio, skills, career timeline       |
| `/product`     | `product/page.tsx`     | Work experience timeline                        |
| `/projects`    | `projects/page.tsx`    | Portfolio projects gallery                      |
| `/resume`      | `resume/page.tsx`      | Educational resume & career guide (ATS, keywords, tips) |
| `/agents`      | `agents/page.tsx`      | Educational AI agents guide with interactive builder    |
| `/contact`     | `contact/page.tsx`     | Contact form with reCAPTCHA v3                  |
| `/settings`    | `settings/page.tsx`    | App preferences (theme, notifications, privacy) |
| `/performance` | `performance/page.tsx` | **Public performance showcase** (see below)     |
| `/admin`       | `admin/page.tsx`       | Admin dashboard (10 tabs — see below)           |
| `/cookies`     | `cookies/page.tsx`     | Cookie policy                                   |
| `/privacy`     | `privacy/page.tsx`     | Privacy policy                                   |
| `/terms`       | `terms/page.tsx`       | Terms of service                                 |
| `*`            | `not-found.tsx`        | 404 fallback                                    |

---

## Performance Page (`/performance`)

A public-facing showcase demonstrating real performance metrics and technical optimisation choices. Designed to engage **recruiters, clients, and fellow developers** — not an internal monitoring dashboard.

### Architecture

The page is a **Server Component shell** with **Client Component islands** for live data. A sticky dot-nav (`SectionNav`) on the right edge (desktop only) tracks the active section via IntersectionObserver.

| Component                 | Type       | Purpose                                                                                                  |
| ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `performance/page.tsx`    | Server     | Layout shell, metadata, `Suspense` wrappers, section IDs for nav                                        |
| `SectionNav`              | Client     | Sticky right-side dot navigation with smooth-scroll and active-section tracking                          |
| `LiveLoadHero`            | Client     | Animated LCP counter + spring-animated grade badge + 4 stat chips (LCP, FCP, CLS, INP)                  |
| `SpeedTestRunner`         | Client     | Interactive test — reveals 5 live Web Vitals sequentially with share (toast feedback) / re-measure       |
| `WebVitalsExplainer`      | Client     | 5 interactive cards (LCP, FCP, CLS, TTFB, INP) with AnimatePresence expand/collapse + live values       |
| `LighthouseScore`         | Client     | Animated SVG score rings for Performance, Accessibility, Best Practices, SEO (count-up on scroll)        |
| `IndustryComparison`      | Client     | Animated bar chart with live LCP vs. industry benchmarks + Top 10% + Google threshold (sorted by value)  |
| `PerformanceMethodology`  | Client     | Tabbed section ("Techniques" / "Tech Stack") merging the former OptimizationChecklist + TechStackRationale |

### Data Sources

| Data                       | Source                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| LCP, FCP, CLS, TTFB, INP  | `web-vitals` library — real-user measurement in the visitor's browser |
| Performance grade          | Computed from live vitals thresholds (Google CWV standards)           |
| Industry benchmarks        | HTTP Archive Web Almanac 2024 — desktop median LCP values             |
| Lighthouse scores          | Latest lab audit (hardcoded, update after each audit)                 |
| Stack / technique content  | Static content in component file                                      |

### Key Components

#### `LiveLoadHero`

- Uses `usePerformanceMonitoring` hook which wraps `web-vitals` `onLCP/onFCP/onCLS/onTTFB/onINP`
- Animated count-up to the visitor's actual LCP value (ease-out cubic via `requestAnimationFrame`)
- Spring-animated circular grade badge (A+ → D) with cyan glow, computed from combined metric scores
- 4 stat chips: LCP, FCP, CLS, INP — colour-coded green/yellow/red by threshold (responsive 2-col mobile / 4-col desktop)

#### `SpeedTestRunner`

- Collects Web Vitals passively on mount via `useEffect` (LCP, FCP, CLS, TTFB, INP)
- "Start Speed Test" button triggers a 3-second animated progress bar
- Snapshots collected metrics, then reveals 5 results one-by-one with a 450ms stagger
- Overall grade (A+ → C) computed from revealed results
- Share button uses `navigator.share` (with clipboard fallback + toast notification)
- "Re-measure" button reloads the page for fresh metrics (web-vitals only reports once per page load)

#### `WebVitalsExplainer`

- Live metric values from `usePerformanceMonitoring` hook
- 5 click-to-expand cards (LCP, FCP, CLS, TTFB, INP) with AnimatePresence height/opacity transitions
- Mini progress bar showing "% faster than industry average"

#### `LighthouseScore`

- 4 animated SVG score rings (Performance, Accessibility, Best Practices, SEO)
- Count-up animation triggered by IntersectionObserver on scroll-in
- Scores are hardcoded from latest Lighthouse 12 audit — update after each audit

#### `IndustryComparison`

- Animated horizontal bars triggered by `IntersectionObserver` (fires once on scroll-in)
- Uses live LCP from `usePerformanceMonitoring` (shows "(measuring…)" until captured)
- Benchmarks: e-commerce (5.1s) → news (4.2s) → avg portfolio (3.1s) → Google "Good" (2.5s) → Top 10% (1.2s) → this site (live LCP)
- Bars sorted longest-first; CSS `transition` with staggered delays

#### `PerformanceMethodology`

- Tabbed UI using shadcn/ui Tabs component ("Techniques" / "Tech Stack")
- Techniques tab: 8-item optimization checklist with icons and tags
- Tech Stack tab: 6 technology cards with performance rationale and impact metrics

---

## Admin Dashboard (`/admin`)

A Firebase-authenticated internal dashboard for site monitoring and management. Protected by `noindex, nofollow` and a login gate.

### Tabs (10)

| Tab            | Component                  | Type       | Purpose                                                                                    |
| -------------- | -------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| **Health**     | `ApiHealthDashboard`       | Client     | 9 API endpoint health checks with 30s auto-refresh polling, SVG sparkline response history |
| **Console**    | `ApiConsole`               | Client     | Interactive HTTP request builder with presets, syntax-highlighted JSON, request history     |
| **Deploy**     | `DeploymentStatus`         | Client     | Production health checks (frontend + API), Lambda uptime/memory, infrastructure details    |
| **Errors**     | `ErrorLogViewer`           | Client     | Real-time capture of browser errors, unhandled rejections, console.error, 5xx network fails|
| **Perf**       | `PerformanceBudget`        | Client     | Live Core Web Vitals (LCP/FCP/CLS/TTFB) from `web-vitals` with budget bars and grades     |
| **SEO**        | `SeoAudit`                 | Client     | Scans all pages for title, description, og:image, canonical, JSON-LD; shows pass/warn/error|
| **Push**       | `PushNotificationTester`   | Client     | Web Push API tester — permission, service worker, subscriptions, send test/custom messages |
| **Analytics**  | `GoogleAnalyticsExplainer` | Client     | Live session info (time on page, referrer), GA4 config reference, event helper docs        |
| **Auth**       | `AuthManagement`           | Client     | Current session details (UID, token expiry), Firebase + Amplify Cognito config status      |
| **Env**        | `EnvironmentInfo`          | Client     | Build version, Node env, site URL, integrations (GA/Sentry/reCAPTCHA), client device info  |

### Features

- **Keyboard shortcuts**: `R` refreshes Health tab, `Ctrl+Enter` sends Console request
- **Auto-refresh**: Health tab polls every 30s with pause/resume toggle and poll counter
- **Response time sparklines**: Inline SVG charts on endpoint cards and summary bar
- **Theme toggle**: Dark/light mode switch in admin header
- **Cyberpunk styling**: All tabs use consistent glass morphism cards, cyan accents, mono fonts

### Components (all in `src/components/admin/`)

- `AdminLayout` — Header bar with logout, theme toggle, online badge
- `AdminLogin` — Firebase email/password login gate with error handling
- `useAdminAuth` — Auth hook wrapping Firebase sign-in with timeout and error mapping
- `ApiEndpointCard` — Individual endpoint status card with sparkline and auto-refresh timestamps

### Testing (`playwright-tests/admin.spec.ts` — 138 tests)

| Section           | Tests | Auth-gated | Coverage                                                                   |
| ----------------- | ----- | ---------- | -------------------------------------------------------------------------- |
| Authentication    | 10    | Partial    | Login form, input attributes, invalid credentials, login/logout/reload     |
| Health Tab        | 16    | Yes        | Endpoints, stats, refresh, service labels, method badges, sparklines       |
| Console Tab       | 18    | Yes        | Request builder, presets, HTTP methods, body toggle, history, Send/replay  |
| Deploy Tab        | 7     | Yes        | Production status, infrastructure, health checks, Check button             |
| Errors Tab        | 6     | Yes        | Error count, Live/Paused toggle, Clear, capture status, empty state        |
| Perf Tab          | 8     | Yes        | Grade, score, Within Budget, CWV metrics, descriptions, budget thresholds  |
| SEO Audit Tab     | 5     | Yes        | Pages count, Re-scan, page paths, status labels, metadata badges           |
| Push Tab          | 15    | Yes        | Permission status, service worker, subscriptions, custom notification form |
| Analytics Tab     | 20    | Yes        | GA4 config, event helpers, code snippets, dashboard link, session info     |
| Auth Tab          | 9     | Yes        | Session details, Firebase config, Amplify Cognito, ID Token                |
| Env Tab           | 9     | Yes        | Build info, integrations, Git, client device info                          |
| Tab Navigation    | 5     | Yes        | 10-tab switching, active state, content isolation, icons                   |
| SEO (noindex)     | 2     | No         | noindex meta tag, login gate for unauthenticated users                     |

> Auth-gated tests skip gracefully via `adminLoginOrSkip()` when Firebase Email/Password auth is not enabled in the test environment.

---

## Shared Page Components

| Component                                 | Purpose                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| `CircuitBackground`                       | Animated SVG circuit board background (used on most pages) |
| `AnimatedSection`                         | Framer Motion scroll-triggered reveal wrapper              |
| `Navigation`                              | Top navbar with active link highlighting                   |
| `HoverButton` / `HoverCard` / `HoverIcon` | Framer Motion hover interaction wrappers                   |
| `ThemeProvider`                           | Light/dark/system theme via CSS custom properties          |
| `ChatbotWidget`                           | Global AI chatbot — AWS Bedrock (lazy-loaded, `inert` when collapsed) |
| `AuthProvider`                            | Firebase auth context (graceful fallback when unconfigured)|
| `AccessibilityEnhancer`                   | Keyboard navigation and focus management                   |
| `GoogleAnalytics`                         | GA4 page view and Web Vitals reporting                     |
| `StructuredData`                          | Schema.org JSON-LD for SEO                                 |
| `OptimizedImage`                          | Wrapper around `next/image` with lazy loading              |
| `Skeleton`                                | Animated loading placeholders                              |

---

## Custom Hooks

| Hook                       | Purpose                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `usePerformanceMonitoring` | Wraps `web-vitals` library; exposes `metrics`, `performanceScore`, `formattedMetrics` |
| `useScrollAnimation`       | IntersectionObserver hook for `AnimatedSection`                                       |
| `useDeviceType`            | Detects mobile/desktop; used to reduce animation intensity                            |
| `useLazyImage`             | IntersectionObserver-based image lazy loading                                         |
| `usePWA`                   | PWA install prompt management                                                         |
| `usePushNotifications`     | Web Push API subscription management                                                  |
| `useSocket`                | Socket.IO connection for real-time features                                           |

---

## Backend Architecture

The frontend is a **static export** (`output: "export"`) — no server-side rendering or API routes in Next.js. All backend logic runs on a **single AWS Lambda function** (`figma-portfolio-api`) fronted by CloudFront at `/api/*`.

### Production (Lambda)

- **Function URL**: `oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws`
- **Runtime**: Node.js, Express 5 + serverless-http
- **Memory**: 256 MB
- **Timeout**: 15 seconds
- **Environment Variables**: 14 (see Deployment section below)

| Route                                     | Method       | Description                                           |
| ----------------------------------------- | ------------ | ----------------------------------------------------- |
| `/api/ping`                               | GET          | Health check                                          |
| `/api/demo`                               | GET          | Demo endpoint                                         |
| `/api/contact`                            | POST         | Contact form — reCAPTCHA v3, SES email, Sentry        |
| `/api/resume`                             | GET          | 302 redirect to `/resume.pdf`                         |
| `/api/push-notifications`                 | GET/PUT/POST/DELETE | Web push subscription management (VAPID)       |
| `/api/organizations/api_keys`             | GET/POST     | List / create API keys (Slack notifications)          |
| `/api/organizations/api_keys/:id`         | GET/POST/DELETE | Get / update / delete API key (Slack notifications)|

### Local Development (Express)

The `server/` directory runs an Express server on **port 3001** for local development:

| Route                             | Handler                        |
| --------------------------------- | ------------------------------ |
| `/api/resume`                     | `server/routes/resume.ts`      |
| `/api/chat`                       | `server/routes/chat.ts` (AWS Bedrock — Claude 3 Haiku) |
| `/api/organizations/api_keys`     | `server/routes/apiKeys.ts`     |
| `/api/playwright-autofix`         | `server/routes/playwrightAutofix.ts` |

---

## PWA

- Service worker via **Workbox** (auto-generated during Next.js build)
- Offline-first caching for static assets
- App manifest for installability
- Background sync for contact form (when offline)
- Push notification support via Web Push API

---

## Analytics & Monitoring

| Tool                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| Google Analytics GA4 | Page views, events, user journeys                                    |
| `web-vitals` library | Real-user CWV measurement — LCP, FCP, CLS, TTFB, INP reported to GA4 |

---

## Security

| Layer              | Implementation                                                      |
| ------------------ | ------------------------------------------------------------------- |
| reCAPTCHA v3       | Applied to contact form submissions                                 |
| Input sanitisation | XSS, SQL injection patterns blocked in API routes                   |
| Security headers   | X-DNS-Prefetch-Control, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, X-XSS-Protection via `amplify.yml` `customHeaders` (`**/*.html` pattern) |
| Cache headers      | Cache-Control, CORS for JS/CSS/images/fonts via `amplify.yml` customHeaders |

> **Note**: Security headers were moved from `next.config.ts headers()` to `amplify.yml customHeaders` because `output: "export"` is incompatible with runtime headers configuration.

---

## Deployment

### Frontend (S3 + CloudFront)

| Item         | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| S3 bucket    | `figma-portfolio-static`                                |
| CloudFront   | Distribution `E134SCTR0QGQKJ`                          |
| Domain       | `www.baltzakisthemis.com` / `baltzakisthemis.com`       |
| Build        | `pnpm build` → `out/` directory (static export)         |
| Deploy       | `aws s3 sync out/ s3://figma-portfolio-static --delete` |
| Invalidation | `aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"` |
| CI/CD        | GitHub Actions (`deploy.yml`) + Agentic Workflow (`deploy-production.md`) |
| Local deploy | `./scripts/deploy.sh`                                   |

> **Note**: Amplify Hosting auto-build is bypassed — Next.js 16 OOMs on the Amplify build instance. Frontend deploys directly to S3.

### Amplify Gen 2 Backend

| Item         | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| App ID       | `d1zjif7pi1h3om`                                        |
| Region       | `us-east-1`                                             |
| Auth         | Cognito (email login)                                   |
| API          | AppSync GraphQL                                         |
| Database     | DynamoDB                                                |
| Deploy       | `ampx pipeline-deploy` (CI) / `ampx sandbox` (local)   |
| Client config| `amplify_outputs.json` (gitignored, generated per env)  |
| Init mode    | Auth-only on startup; call `configureAmplifyData()` for AppSync |

### Backend (Lambda)

| Item          | Detail                            |
| ------------- | --------------------------------- |
| Function name | `figma-portfolio-api`             |
| Region        | `us-east-1`                       |
| Memory        | 256 MB                            |
| Timeout       | 15 seconds                        |
| Routing       | CloudFront `/api/*` → Lambda      |

### Lambda Environment Variables (14)

```
NODE_ENV                          # production
RECAPTCHA_SECRET_KEY              # reCAPTCHA v3 secret
SES_VERIFIED_EMAIL                # SES sender email
SENTRY_DSN                        # Sentry error tracking
SENTRY_ENVIRONMENT                # production
PING_MESSAGE                      # Health check response
SLACK_WEBHOOK_URL                 # Slack incoming webhook
SLACK_CHANNEL                     # Slack channel for notifications
ANTHROPIC_API_KEY                 # Claude API key
VAPID_PUBLIC_KEY                  # Web push VAPID public key
VAPID_PRIVATE_KEY                 # Web push VAPID private key
VAPID_EMAIL                       # VAPID contact email
GOOGLE_ANALYTICS_MEASUREMENT_ID   # GA4 measurement ID
GOOGLE_ANALYTICS_API_SECRET       # GA4 Measurement Protocol secret
```

### Client-side Environment Variables (bundled into JS)

```
NEXT_PUBLIC_SITE_URL              # Canonical URL (https://www.baltzakisthemis.com)
NEXT_PUBLIC_GA_ID                 # Google Analytics GA4 measurement ID
NEXT_PUBLIC_SENTRY_DSN            # Sentry error tracking
NEXT_PUBLIC_RECAPTCHA_SITE_KEY    # reCAPTCHA v3 site key
```

---

## State Management

| Scope               | Strategy                                                           |
| ------------------- | ------------------------------------------------------------------ |
| Component state     | `useState` / `useReducer`                                          |
| Theme               | CSS custom properties + `localStorage` persistence                 |
| Resume data         | `localStorage` auto-save with 2-second debounce                    |
| Real-time           | Socket.IO event listeners in component hooks                       |
| Performance metrics | `usePerformanceMonitoring` hook (in-memory, no persistence needed) |

---

## Authentication

### Production — Amplify Cognito

Production uses **AWS Amplify Gen 2 Cognito** for authentication. Firebase is not configured in production — the Firebase SDK initialises with empty credentials and degrades gracefully:

- `src/lib/firebase.ts` — Proxy object returns safe defaults (`currentUser: null`, no-op `onAuthStateChanged`) when `NEXT_PUBLIC_FIREBASE_API_KEY` is unset
- `src/contexts/AuthContext.tsx` — `AuthProvider` wraps Firebase calls in try/catch; sets `loading: false` immediately when Firebase is unavailable

This prevents the `auth/invalid-api-key` error that would otherwise appear in production console.

### Local Development / Admin — Firebase

Set `NEXT_PUBLIC_FIREBASE_*` environment variables in `.env.local` to enable Firebase auth during local development. When these are absent, the auth proxy silently returns null user — no crashes.

**Firebase Auth Initialization (Mar 2026)**: Uses `initializeAuth()` with explicit `browserLocalPersistence` and `browserPopupRedirectResolver` instead of `getAuth()`. This prevents the `_getRecaptchaConfig is not a function` error introduced in Firebase v12+ where reCAPTCHA verification is enforced by default for email/password sign-in.

### API Health Dashboard Authentication

The API Health Dashboard (`ApiHealthDashboard.tsx`) automatically includes Firebase Bearer tokens in health check requests for endpoints marked with `requiresAuth: true`. Currently the `/api/organizations/api_keys` endpoint requires auth — the health check sends the logged-in user's Firebase ID token in the `Authorization` header to avoid 401 responses.

---

## Testing

- **E2E Tests**: Playwright (`playwright-tests/` — 83 spec files)
- **Unit/Integration**: Vitest (`vitest.config.ts`)
- **Production Smoke Tests**: `playwright-tests/production-smoke.spec.ts` — API-level tests against both `www.baltzakisthemis.com` and `baltzakisthemis.com` (pages, health endpoints, contact form, chat API, booking, HTTPS, 404 handling)
- **Accessibility**: Playwright accessibility assertions on all pages

See [`docs/TESTING.md`](./TESTING.md) for the complete testing guide.