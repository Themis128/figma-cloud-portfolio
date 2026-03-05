# Application Architecture

## Overview

This is a **Next.js 15 application** with the App Router, deployed as a **static export** on **S3 + CloudFront** (frontend) with an **AWS Lambda** function (backend). It serves as the personal portfolio of Themistoklis Baltzakis — a Cloud Architect & Cybersecurity Specialist with 15+ years of IT expertise.

---

## Tech Stack

| Layer                  | Technology               |
| ---------------------- | ------------------------ |
| Framework              | Next.js 15 (App Router)                          |
| Language               | TypeScript 5                                      |
| Styling                | Tailwind CSS v4                                   |
| UI components          | Radix UI, shadcn/ui                               |
| Animation              | Framer Motion                                     |
| PWA                    | Workbox (service worker)                          |
| Backend (production)   | AWS Lambda (`figma-portfolio-api`)                |
| Backend (local dev)    | Express.js on port 3001                           |
| Frontend hosting       | S3 (`figma-portfolio-static`) + CloudFront        |
| Analytics              | Google Analytics GA4 + Sentry                     |
| Security               | reCAPTCHA v3, security headers via next.config.ts |
| Performance monitoring | web-vitals library                                |

---

## Directory Structure

```
portfolio-nextjs/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (providers, Navigation, ChatbotWidget)
│   │   ├── page.tsx          # Home page
│   │   ├── about/            # About page
│   │   ├── agents/           # AI Agents showcase
│   │   ├── contact/          # Contact form
│   │   ├── performance/      # Performance page (public-facing)
│   │   ├── product/          # Work experience timeline
│   │   ├── projects/         # Projects gallery
│   │   ├── resume/           # Interactive resume builder
│   │   ├── settings/         # App preferences
│   │   └── builder/          # Builder.io page (optional)
│   ├── components/           # Reusable UI components
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
| `/resume`      | `resume/page.tsx`      | Interactive resume builder with PDF export      |
| `/agents`      | `agents/page.tsx`      | AI agents showcase                              |
| `/contact`     | `contact/page.tsx`     | Contact form with reCAPTCHA v3                  |
| `/settings`    | `settings/page.tsx`    | App preferences (theme, notifications, privacy) |
| `/performance` | `performance/page.tsx` | **Public performance showcase** (see below)     |
| `*`            | `not-found.tsx`        | 404 fallback                                    |

---

## Performance Page (`/performance`)

A public-facing showcase demonstrating real performance metrics and technical optimisation choices. Designed to engage **recruiters, clients, and fellow developers** — not an internal monitoring dashboard.

### Architecture

The page is a **Server Component shell** with **Client Component islands** for live data.

| Component               | Type       | Purpose                                                                                         |
| ----------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `performance/page.tsx`  | Server     | Layout shell, metadata, `Suspense` wrappers                                                     |
| `LiveLoadHero`          | Client     | Animated counter showing the visitor's actual LCP + performance grade                           |
| `SpeedTestRunner`       | Client     | Interactive test — reveals live Web Vitals sequentially with share/retry                        |
| `WebVitalsExplainer`    | Client     | 4 interactive cards (LCP, FCP, CLS, TTFB) with live values + plain-English tooltips             |
| `IndustryComparison`    | Client     | Animated bar chart comparing this site vs. industry benchmarks (IntersectionObserver triggered) |
| `OptimizationChecklist` | **Server** | Static checklist of 8 performance optimisations — zero client JS                                |
| `TechStackRationale`    | **Server** | 6 tech cards with performance rationale — zero client JS                                        |

### Data Sources

| Data                | Source                                                                |
| ------------------- | --------------------------------------------------------------------- |
| LCP, FCP, CLS, TTFB | `web-vitals` library — real-user measurement in the visitor's browser |
| Performance grade   | Computed from live vitals thresholds (Google CWV standards)           |
| Industry benchmarks | HTTP Archive Web Almanac 2024 — desktop median LCP values             |
| Stack rationale     | Static content in component file                                      |

### Key Components

#### `LiveLoadHero`

- Uses `usePerformanceMonitoring` hook which wraps `web-vitals` `onLCP/onFCP/onCLS/onTTFB`
- Animated count-up to the visitor's actual LCP value (ease-out cubic via `requestAnimationFrame`)
- Circular grade badge (A+ → D) computed from combined metric scores
- 3 stat chips: LCP, FCP, CLS — colour-coded green/yellow/red by threshold

#### `SpeedTestRunner`

- Collects Web Vitals passively on mount via `useEffect`
- "Start Speed Test" button triggers a 3-second animated progress bar
- Snapshots collected metrics, then reveals results one-by-one with a 450ms stagger
- Overall grade (A+ → C) computed from revealed results
- Share button uses `navigator.share` (with clipboard fallback) for native sharing

#### `WebVitalsExplainer`

- Live metric values from `usePerformanceMonitoring` hook
- Click-to-expand cards showing plain-English explanations per metric
- Mini progress bar showing "% faster than industry average"

#### `IndustryComparison`

- Animated horizontal bars triggered by `IntersectionObserver` (fires once on scroll-in)
- Benchmarks: e-commerce (5.1s) → news (4.2s) → avg portfolio (3.1s) → this site (0.8s LCP)
- CSS `transition` with staggered delays — no Framer Motion needed

---

## Shared Page Components

| Component                                 | Purpose                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| `CircuitBackground`                       | Animated SVG circuit board background (used on most pages) |
| `AnimatedSection`                         | Framer Motion scroll-triggered reveal wrapper              |
| `Navigation`                              | Top navbar with active link highlighting                   |
| `HoverButton` / `HoverCard` / `HoverIcon` | Framer Motion hover interaction wrappers                   |
| `ThemeProvider`                           | Light/dark/system theme via CSS custom properties          |
| `ChatbotWidget`                           | Global AI chatbot (lazy-loaded)                            |
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
| Security headers   | X-Content-Type-Options, X-Frame-Options, Referrer-Policy via next.config.ts |
| CloudFront headers | Cache-Control, CORS via amplify.yml customHeaders                   |

---

## Deployment

### Frontend (S3 + CloudFront)

| Item         | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| S3 bucket    | `figma-portfolio-static`                                |
| CloudFront   | Distribution `E134SCTR0QGQKJ`                          |
| Build        | `pnpm build` → `out/` directory (static export)         |
| Deploy       | `aws s3 sync out/ s3://figma-portfolio-static --delete` |
| Invalidation | `aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"` |

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
NEXT_PUBLIC_SITE_URL              # Canonical URL (https://baltzakis.dev)
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

## Testing

- **E2E Tests**: Playwright (`playwright-tests/` — 69 spec files)
- **Unit/Integration**: Vitest (`vitest.config.ts`)
- **Accessibility**: Playwright accessibility assertions on all pages

See [`docs/TESTING.md`](./TESTING.md) for the complete testing guide.