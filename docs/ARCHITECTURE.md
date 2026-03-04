# Application Architecture

## Overview

This is a **Next.js 16 application** with the App Router, deployed on **AWS Amplify** (App ID: `d1zjif7pi1h3om`). It serves as the personal portfolio of Themistoklis Baltzakis — a Cloud Architect & Cybersecurity Specialist with 15+ years of IT expertise.

---

## Tech Stack

| Layer                  | Technology               |
| ---------------------- | ------------------------ |
| Framework              | Next.js 16 (App Router)  |
| Language               | TypeScript 5.9.3         |
| Styling                | Tailwind CSS v4          |
| UI components          | Radix UI, shadcn/ui      |
| Animation              | Framer Motion            |
| 3D graphics            | Three.js                 |
| Real-time              | Socket.IO                |
| PWA                    | Workbox (service worker) |
| Backend                | Express.js (Node)        |
| Deployment             | AWS Amplify (us-east-1)  |
| Analytics              | Google Analytics GA4     |
| Security               | reCAPTCHA v3, Helmet.js  |
| Performance monitoring | web-vitals library       |

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
│   │   └── api/              # API Routes (backend)
│   │       ├── contact/      # Contact form handler
│   │       ├── github/       # GitHub API proxy
│   │       ├── resume/       # Resume JSON endpoint
│   │       ├── chat/         # AI chatbot (HuggingFace)
│   │       └── booking/      # Cal.com booking (create + slots)
│   ├── components/           # Reusable UI components
│   │   ├── performance/      # Performance page components
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── data/                 # Static data
│   ├── types/                # Shared TypeScript types
│   └── styles/               # Global styles
├── server/                   # Legacy Express stubs (dev-only, not deployed)
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

All backend logic runs as **Next.js API Routes** (`src/app/api/`), deployed alongside the frontend via Amplify (Lambda compute for SSR + API routes, S3 + CloudFront for static assets).

| Route                      | Method | Description                                                        |
| -------------------------- | ------ | ------------------------------------------------------------------ |
| `POST /api/contact`        | POST   | Contact form — reCAPTCHA v3, XSS/SQL injection protection          |
| `GET /api/github`          | GET    | GitHub profile/repo proxy with 5-min in-memory cache               |
| `GET /api/resume`          | GET    | Resume JSON data endpoint                                          |
| `POST /api/chat`           | POST   | AI chatbot — HuggingFace Llama 3.1, SSE streaming, booking intent |
| `POST /api/booking/create` | POST   | Create a booking via Cal.com API                                   |
| `GET /api/booking/slots`   | GET    | Fetch available booking slots from Cal.com                         |

> **Note:** The `server/` directory contains legacy Express stubs from the pre-migration era. All production API logic lives in `src/app/api/`.

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

| Item     | Detail                                                      |
| -------- | ----------------------------------------------------------- |
| Platform | AWS Amplify (App ID: `d1zjif7pi1h3om`, region: `us-east-1`) |
| Build    | `next build` → `.next/` output                              |
| CI/CD    | GitHub Actions + Amplify auto-deploy on push to `main`      |
| Config   | `amplify.yml` defines build phases                          |

### Required Environment Variables

```
# Client-side (NEXT_PUBLIC_ prefix — bundled into JS)
NEXT_PUBLIC_SITE_URL              # Canonical URL (https://baltzakis.dev)
NEXT_PUBLIC_GA_ID                 # Google Analytics GA4 measurement ID
NEXT_PUBLIC_SENTRY_DSN            # Sentry error tracking (optional)

# Server-side (used only in API routes — never exposed to browser)
RECAPTCHA_SECRET_KEY              # reCAPTCHA v3 secret
GITHUB_TOKEN                      # GitHub API token
HF_TOKEN                          # HuggingFace Inference API token (chat)
CAL_API_KEY                       # Cal.com API key (booking)
CAL_EVENT_TYPE_ID                 # Cal.com event type ID (booking)
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

- **E2E Tests**: Playwright (`playwright-tests/` — 50+ spec files)
- **Unit/Integration**: Vitest (`vitest.config.ts`)
- **Accessibility**: Playwright accessibility assertions on all pages

See [`docs/TESTING.md`](./TESTING.md) for the complete testing guide.