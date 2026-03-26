# Application Architecture

## Overview

This is a **Next.js 16 application** with the App Router, deployed as a **static export** on **S3 + CloudFront** (frontend) with an **AWS Lambda** function (backend). It serves as the personal portfolio of Themistoklis Baltzakis | Cloud Architect & Cybersecurity Specialist with 15+ years of IT expertise.

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
| Chatbot backend        | AWS Bedrock (Claude 3.5 Haiku) via Express route |
| Auth + Data backend    | AWS Amplify Gen 2 (Cognito + AppSync + DynamoDB)  |
| Frontend hosting       | S3 (`figma-portfolio-static`) + CloudFront        |
| Analytics              | Google Analytics GA4 + Sentry                     |
| Auth                   | AWS Amplify Gen 2 Cognito                         |
| Security               | reCAPTCHA v3, security headers via amplify.yml    |
| Performance monitoring | web-vitals library                                |
| Real-time features     | Socket.IO                                         |
| 3D visualizations      | Three.js + @react-three/fiber v9 + @react-three/drei v10 |
| Blog / Content         | Velite (MDX to typed JSON), rehype-pretty-code      |
| Testing                | Playwright 1.58+ E2E, Vitest 4 unit tests         |

---

## Directory Structure

```
portfolio-nextjs/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (providers, Navigation, ChatbotWidget, interactive components)
│   │   ├── page.tsx          # Home page
│   │   ├── about/            # About page
│   │   ├── agents/           # AI Agents educational guide
│   │   ├── blog/             # Blog listing + [slug] post pages (MDX via Velite)
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
│   │   ├── agents/           # Agent builder components (Blockly visual builder + template playground)
│   │   ├── interactive/      # Interactive engagement components (22 in folder)
│   │   ├── performance/      # Performance page components
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── data/                 # Static data
│   ├── types/                # Shared TypeScript types
│   └── styles/               # Global styles
├── content/
│   └── blog/                # MDX blog posts (processed by Velite at build time)
├── velite.config.ts           # Velite content schema (Zod) + MDX pipeline config
├── .velite/                   # Generated typed content (gitignored)
├── server/                   # Express dev server (port 3001), all API routes
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
| `/`            | `page.tsx`             | Home / landing with AIBrain visualisation, TypeWriter hero, 2 CTAs (Get In Touch primary + Learn More secondary) |
| `/about`       | `about/page.tsx`       | Professional bio, skills, SkillsRadar chart, career timeline |
| `/product`     | `product/page.tsx`     | Work experience InteractiveTimeline              |
| `/projects`    | `projects/page.tsx`    | Portfolio projects gallery + live GitHub repos (via `GitHubRepos` component) |
| `/resume`      | `resume/page.tsx`      | Educational resume & career guide (ATS, keywords, tips) |
| `/agents`      | `agents/page.tsx`      | Educational AI agents guide with Blockly drag-and-drop builder + interactive builder |
| `/blog`        | `blog/page.tsx`        | Blog listing: MDX posts via Velite, tags, reading time  |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Individual blog post with syntax highlighting    |
| `/contact`     | `contact/page.tsx`     | Server component wrapper with metadata; renders `ContactPage` client component |
| `/settings`    | `settings/page.tsx`    | Server component wrapper with metadata; renders `SettingsPage` client component |
| `/performance` | `performance/page.tsx` | **Public performance showcase** (see below)     |
| `/builder`     | `builder/page.tsx`     | Server component wrapper with metadata; renders `BuilderPage` client component |
| `/admin`       | `admin/page.tsx`       | Admin dashboard (10 tabs, see below)           |
| `/cookies`     | `cookies/page.tsx`     | Cookie policy                                   |
| `/privacy`     | `privacy/page.tsx`     | Privacy policy                                   |
| `/terms`       | `terms/page.tsx`       | Terms of service                                 |
| `*`            | `not-found.tsx`        | 404 fallback with `noindex` metadata and semantic H1 |

### SEO & AI Visibility

All public pages include:
- **OpenGraph tags**: `og:title`, `og:description`, `og:url`, `og:image` for social sharing (including legal pages)
- **Canonical URLs**: `<link rel="canonical">` pointing to `https://www.baltzakisthemis.com/...`
- **Server-rendered JSON-LD**: Structured data output in static HTML at build time (not client-side injected) via `<script type="application/ld+json">`
  - `WebSite` schema with `SearchAction` and `@id` entity linking
  - `Person` schema with `knowsAbout`, `sameAs`, `worksFor`, `image`
  - `ProfilePage` schema linking to Person via `mainEntity`
  - `BreadcrumbList` on all pages (via `BreadcrumbSchema` component)
  - `BlogPosting` on blog post pages with author, dates, keywords

**AI Agent Discovery**:
- `/llms.txt`: Curated Markdown site map for AI agents (follows llmstxt.org spec)
- `/llms-full.txt`: Extended context with professional summary, services, and technical details
- `robots.txt` explicitly allows AI search bots (GPTBot, ClaudeBot, PerplexityBot, etc.) while blocking training-only scrapers (CCBot, Bytespider)

The sitemap (`public/sitemap.xml`) includes all public pages and blog posts. The `/admin/` page is excluded and marked `noindex, nofollow`.

#### Extracted Client Components

Pages that needed server component wrappers for Next.js metadata export have their interactive UI extracted into dedicated client components:

| Client Component                    | Used By               | Purpose                                       |
| ----------------------------------- | --------------------- | --------------------------------------------- |
| `src/components/ContactPage.tsx`    | `/contact/page.tsx`   | Contact form UI with reCAPTCHA v3             |
| `src/components/SettingsPage.tsx`   | `/settings/page.tsx`  | App preferences (theme, notifications, privacy)|
| `src/components/BuilderPage.tsx`    | `/builder/page.tsx`   | Builder.io page UI                            |
| `src/components/BreadcrumbSchema.tsx` | Multiple pages      | Reusable breadcrumb JSON-LD structured data   |
| `src/components/GitHubRepos.tsx`     | `/projects/page.tsx` | Live GitHub repository cards. Fetches from `/api/github/repos` and `/api/github/stats`, shows repo name, description, topics, language, stars, forks, updated date, plus stats header (repos count, stars, followers, profile link) |

---

## Shared Components

### `SectionNav` (`src/components/SectionNav.tsx`)

A sticky dot navigation component (desktop-only, `lg:flex`) that floats on the right edge of the viewport. It highlights the currently visible section and provides smooth-scroll navigation.

- **Visibility**: Hidden until user scrolls past 300px (hero area)
- **Active tracking**: Uses `IntersectionObserver` with thresholds `[0.1, 0.3, 0.5]` and `rootMargin: "-80px 0px -40% 0px"`
- **UI**: Dot indicators with label text on hover; active dot is cyan with glow
- **Props**: `sections` (array of `{ id, label }`), `ariaLabel` (default: "Page sections")

Used on:

| Page | Sections | `ariaLabel` |
| --- | --- | --- |
| `/performance` | hero, speed-test, vitals, field-data, lighthouse, comparison, methodology | Performance page sections |
| `/about` | hero, summary, focus-areas, skills, badges, awards | About page sections |
| `/contact` | hero, contact-info, contact-form, more-info | Contact page sections |
| `/agents` | hero, what-is-agent, agentic-loop, components, architecture, terminology, use-cases, block-builder, playground | Agents page sections |

> **Note**: `AnimatedSection` does not pass the `id` prop through to its rendered `<m.div>`, so each section target is wrapped in a `<div id="...">` element.

---

## Performance Page (`/performance`)

A public-facing showcase demonstrating real performance metrics and technical optimisation choices. Designed to engage **recruiters, clients, and fellow developers**, not an internal monitoring dashboard.

### Architecture

The page is a **Server Component shell** with **Client Component islands** for live data. A sticky dot-nav (`SectionNav`, shared component, see below) on the right edge (desktop only) tracks the active section via IntersectionObserver.

| Component                 | Type       | Purpose                                                                                                  |
| ------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `performance/page.tsx`    | Server     | Layout shell, metadata, `Suspense` wrappers, section IDs for nav                                        |
| `SectionNav` (shared)     | Client     | Sticky right-side dot navigation with smooth-scroll and active-section tracking (see Shared Components)  |
| `LiveLoadHero`            | Client     | Animated LCP counter + spring-animated grade badge + 4 stat chips (LCP, FCP, CLS, INP)                  |
| `SpeedTestRunner`         | Client     | Interactive test: reveals 5 live Web Vitals sequentially with share (toast feedback) / re-measure       |
| `WebVitalsExplainer`      | Client     | 5 interactive cards (LCP, FCP, CLS, TTFB, INP) with AnimatePresence expand/collapse + live values       |
| `CrUXFieldData`           | Client     | Chrome UX Report real-user field data: 5 metric cards (LCP, FCP, CLS, INP, TTFB) with p75 values, color-coded thresholds, and good/needs-improvement/poor distribution bars. Fetches from `/api/crux` with loading skeleton and graceful unavailable state |
| `LighthouseScore`         | Client     | Animated SVG score rings for Performance, Accessibility, Best Practices, SEO (count-up on scroll)        |
| `IndustryComparison`      | Client     | Animated bar chart with live LCP vs. industry benchmarks + Top 10% + Google threshold (sorted by value)  |
| `PerformanceMethodology`  | Client     | Tabbed section ("Techniques" / "Tech Stack") merging the former OptimizationChecklist + TechStackRationale |

### Data Sources

| Data                       | Source                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| LCP, FCP, CLS, TTFB, INP  | `web-vitals` library: real-user measurement in the visitor's browser |
| CrUX field data (p75, distributions) | Chrome UX Report API via `/api/crux`. Real-user data from the last 28 days. Server-side 1-hour cache. Phone form factor (primary) with All fallback. Requires `CRUX_API_KEY` env var |
| Performance grade          | Computed from live vitals thresholds (Google CWV standards)           |
| Industry benchmarks        | HTTP Archive Web Almanac 2024, desktop median LCP values             |
| Lighthouse scores          | Latest lab audit (hardcoded, update after each audit)                 |
| Stack / technique content  | Static content in component file                                      |

### Key Components

#### `LiveLoadHero`

- Uses `usePerformanceMonitoring` hook which wraps `web-vitals` `onLCP/onFCP/onCLS/onTTFB/onINP`
- Animated count-up to the visitor's actual LCP value (ease-out cubic via `requestAnimationFrame`)
- Spring-animated circular grade badge (A+ to D) with cyan glow, computed from combined metric scores
- 4 stat chips: LCP, FCP, CLS, INP, colour-coded green/yellow/red by threshold (responsive 2-col mobile / 4-col desktop)

#### `SpeedTestRunner`

- Collects Web Vitals passively on mount via `useEffect` (LCP, FCP, CLS, TTFB, INP)
- "Start Speed Test" button triggers a 3-second animated progress bar
- Snapshots collected metrics, then reveals 5 results one-by-one with a 450ms stagger
- Overall grade (A+ to C) computed from revealed results
- Share button uses `navigator.share` (with clipboard fallback + toast notification)
- "Re-measure" button reloads the page for fresh metrics (web-vitals only reports once per page load)

#### `WebVitalsExplainer`

- Live metric values from `usePerformanceMonitoring` hook
- 5 click-to-expand cards (LCP, FCP, CLS, TTFB, INP) with AnimatePresence height/opacity transitions
- Mini progress bar showing "% faster than industry average"

#### `LighthouseScore`

- 4 animated SVG score rings (Performance, Accessibility, Best Practices, SEO)
- Count-up animation triggered by IntersectionObserver on scroll-in
- Scores are hardcoded from latest Lighthouse 12 audit. Update after each audit

#### `IndustryComparison`

- Animated horizontal bars triggered by `IntersectionObserver` (fires once on scroll-in)
- Uses live LCP from `usePerformanceMonitoring` (shows "(measuring…)" until captured)
- Benchmarks: e-commerce (5.1s), news (4.2s), avg portfolio (3.1s), Google "Good" (2.5s), Top 10% (1.2s), this site (live LCP)
- Bars sorted longest-first; CSS `transition` with staggered delays

#### `PerformanceMethodology`

- Tabbed UI using shadcn/ui Tabs component ("Techniques" / "Tech Stack")
- Techniques tab: 8-item optimization checklist with icons and tags
- Tech Stack tab: 6 technology cards with performance rationale and impact metrics

---

## Admin Dashboard (`/admin`)

A Cognito-authenticated internal dashboard for site monitoring and management. Protected by `noindex, nofollow` and a login gate.

### Tabs (10)

| Tab            | Component                  | Type       | Purpose                                                                                    |
| -------------- | -------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| **Health**     | `ApiHealthDashboard`       | Client     | 9 API endpoint health checks with 30s auto-refresh polling, SVG sparkline response history |
| **Console**    | `ApiConsole`               | Client     | Interactive HTTP request builder with presets, syntax-highlighted JSON, request history     |
| **Deploy**     | `DeploymentStatus`         | Client     | Production health checks (frontend + API), Lambda uptime/memory, infrastructure details    |
| **Errors**     | `ErrorLogViewer`           | Client     | Real-time error capture with type filters, text search, error grouping, severity levels, error rate sparkline, session persistence, sound alerts, copy-to-clipboard, and JSON export |
| **Perf**       | `PerformanceBudget`        | Client     | Live Core Web Vitals (LCP/FCP/CLS/TTFB) from `web-vitals` with budget bars and grades     |
| **SEO**        | `SeoAudit`                 | Client     | Scans all pages for title, description, og:image, canonical, JSON-LD; shows pass/warn/error|
| **Push**       | `PushNotificationTester`   | Client     | Web Push API tester: permission, SW registration, subscriber list (S3-persisted), send test/custom messages |
| **Analytics**  | `GoogleAnalyticsExplainer` | Client     | Live session info (time on page, referrer), GA4 config reference, event helper docs        |
| **Auth**       | `AuthManagement`           | Client     | Current session details (user ID, token expiry), Cognito config status                     |
| **Env**        | `EnvironmentInfo`          | Client     | Build version, Node env, site URL, integrations (GA/Sentry/reCAPTCHA), client device info  |

### Features

- **Mobile responsive**: Dropdown tab selector on mobile, tabs on desktop
- **Keyboard shortcuts**: `R` refreshes Health tab, `Ctrl+Enter` sends Console request, `?` shows help
- **Auto-refresh**: Health tab polls every 30s with pause/resume toggle and poll counter
- **Response time sparklines**: Inline SVG charts on endpoint cards and summary bar
- **Health trend indicators**: ↑↓→ arrows showing improving/stable/degrading response times
- **Session timeout warning**: Token expiry badge with yellow/red warning and refresh button
- **Data export**: JSON export for health check history and error logs
- **Sensitive data sanitization**: JWT tokens and API keys redacted in error logs
- **Request timeouts**: All API calls use AbortController (10s API, 15s SEO audit)
- **Offline detection**: Red banner when network is unavailable
- **Loading skeletons**: Shimmer cards before first health check completes
- **Accessibility**: ARIA labels, roles, aria-live regions, keyboard navigation
- **Security**: Safe JSON rendering (no dangerouslySetInnerHTML), URL validation in API console
- **Theme toggle**: Dark/light mode switch in admin header
- **Cyberpunk styling**: All tabs use consistent glass morphism cards, cyan accents, mono fonts

### Components (all in `src/components/admin/`)

- `AdminDashboard`: Main client component with tab management (mobile dropdown + desktop tabs)
- `AdminLayout`: Header bar with logout, session timeout, theme toggle, offline indicator
- `AdminLogin`: Cognito email/password login gate with ARIA accessibility
- `useAdminAuth`: Auth hook wrapping Cognito sign-in with timeout and error mapping
- `ApiEndpointCard`: Individual endpoint status card with sparkline, trend indicator, and status icons

### Testing (`playwright-tests/admin.spec.ts`, 155 tests)

| Section           | Tests | Auth-gated | Coverage                                                                   |
| ----------------- | ----- | ---------- | -------------------------------------------------------------------------- |
| Authentication    | 10    | Partial    | Login form, input attributes, invalid credentials, login/logout/reload     |
| Health Tab        | 16    | Yes        | Endpoints, stats, refresh, service labels, method badges, sparklines       |
| Console Tab       | 18    | Yes        | Request builder, presets, HTTP methods, body toggle, history, Send/replay  |
| Deploy Tab        | 7     | Yes        | Production status, infrastructure, health checks, Check button             |
| Errors Tab        | 14    | Yes        | Error count, type filters, search, group/flat, sound toggle, sparkline, Live/Paused, Export, Clear, capture status, empty state, copy-to-clipboard |
| Perf Tab          | 8     | Yes        | Grade, score, Within Budget, CWV metrics, descriptions, budget thresholds  |
| SEO Audit Tab     | 5     | Yes        | Pages count, Re-scan, page paths, status labels, metadata badges           |
| Push Tab          | 15    | Yes        | Permission status, service worker, subscriptions, custom notification form |
| Analytics Tab     | 20    | Yes        | GA4 config, event helpers, code snippets, dashboard link, session info     |
| Auth Tab          | 9     | Yes        | Session details, Cognito config, ID Token                                  |
| Env Tab           | 9     | Yes        | Build info, integrations, Git, client device info                          |
| Tab Navigation    | 5     | Yes        | 10-tab switching, active state, content isolation, icons                   |
| SEO (noindex)     | 2     | No         | noindex meta tag, login gate for unauthenticated users                     |

> Auth-gated tests skip gracefully via `adminLoginOrSkip()` when Cognito auth is not available in the test environment.

---

## Interactive Engagement Components

Interactive components enhance user engagement across the site. Most are Client Components (`'use client'`) in `src/components/interactive/`, plus `CommandPalette` and several homepage/blog components in `src/components/`.

### Global Components (in Root Layout)

| Component           | Type   | Purpose                                                                                  |
| ------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `ScrollProgress`    | Client | Fixed top-of-page progress bar. Tracks scroll position via `requestAnimationFrame`, cyan gradient, `role="progressbar"` with ARIA attributes |
| `MatrixRain`        | Client | Canvas-based matrix rain effect. Toggled via `MatrixRainToggle` navbar button (custom event `toggle-matrix-rain`), auto-disables after 15s with 1s fade-out, respects `prefers-reduced-motion` (canvas hidden entirely), Katakana + Latin + digit characters |
| `CyberTerminal`     | Client | Full-screen terminal easter egg. Opened with backtick key, commands: `help`, `whoami`, `skills`, `certs`, `projects`, `contact`, `experience`, `matrix`, `clear`, `exit`, `sudo hire me` |
| `CursorTrail`       | Client | 10-particle trailing cursor effect. Desktop only (hover-capable devices), respects `prefers-reduced-motion`, renders nothing on mobile/touch |
| `CommandPalette`    | Client | Ctrl+K / Cmd+K command palette. Search pages and actions, keyboard navigation (↑↓ Enter), 9 nav items + 4 actions (theme, chat, accessibility, retro terminal toggle), cyberpunk glass panel. **Server-powered search**: queries `/api/search?q=` with 300ms debounce when 2+ chars typed; results shown in a "Search Results" section between Pages and Actions |
| `KonamiEasterEgg`   | Client | Global easter egg. ↑↑↓↓←→←→BA triggers Matrix rain with Greek characters (lazy-loaded via `LazyInteractive`) |
| `SoundEffects`      | Client | Subtle Web Audio hover/click blips. Navbar toggle button (Volume icon), provides ambient audio feedback on interactive elements, `instanceof Element` guard for non-Element event targets |
| `MatrixRainToggle`  | Client | Navbar button for toggling MatrixRain canvas via custom event, reflects active state with cyan glow styling |

### Homepage Components

| Component            | Page       | Purpose                                                                                  |
| -------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `SiteStats`          | Home (`/`) | Lighthouse score, tech stack count, pages, and uptime badges. Social-proof stats section |
| `GitHubHeatmap`      | Home (`/`) | Live GitHub contribution heatmap fetched from the GitHub Events API                      |
| `Testimonials`       | Home (`/`) | Carousel with colleague quotes (3 entries), prev/next navigation, auto-rotates every 5s, pauses on hover/focus |
| `CyberQuiz`          | Home (`/`) | 5-question cybersecurity & cloud quiz with scoring and grades                            |

> **Homepage section order**: Hero, Core Expertise, SiteStats, GitHubHeatmap, Testimonials, CyberQuiz, Quick Contact

### Blog Components

| Component            | Page               | Purpose                                                                                  |
| -------------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `ReadingProgress`    | Blog posts (`/blog/[slug]`) | Sticky progress bar with estimated reading time for blog posts                  |
| `BlogReactions`      | Blog posts (`/blog/[slug]`) | Per-post helpful/interesting/bookmark reactions persisted in `localStorage`      |

### Page-Specific Components

| Component            | Page      | Purpose                                                                                  |
| -------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `TypeWriter`         | Home (`/`) | Cycling text animation in hero. Types/deletes through `['IT Network Engineer', 'Cloud Architect', 'Cybersecurity Specialist', 'DevOps Engineer']` with blinking cursor |
| `SkillsRadar`        | About (`/about`) | SVG radar chart with 6 skill axes (Networking, Security, Cloud, DevOps, Programming, Systems). Click labels for detail panel with proficiency bar, certifications, and years of experience |
| `InteractiveTimeline`| Product (`/product`) | Vertical timeline with animated line, clickable expand/collapse nodes (desktop), all-expanded cards (mobile). Renders both desktop (`hidden md:block`) and mobile (`md:hidden`) views |

---

## Shared Page Components

| Component                                 | Purpose                                                    |
| ----------------------------------------- | ---------------------------------------------------------- |
| `CircuitBackground`                       | SVG circuit board background with CSS `drop-shadow` glow (used on most pages, no SVG filters) |
| `AnimatedSection`                         | Framer Motion scroll-triggered reveal wrapper (20px offset, skips animation on low-end devices) |
| `Navigation`                              | Sticky glassmorphic navbar (`bg-background/80 backdrop-blur-xl`). **Desktop**: horizontal nav links + "Get In Touch" CTA button + toolbar (bell, theme | sound, matrix, a11y) with Radix Separator between groups. **Mobile**: bell + theme + hamburger in top bar; hamburger opens shadcn Sheet (slide-from-right) with icon-labeled nav links, Effects & Settings row, and CTA |
| `HoverButton` / `HoverCard` / `HoverIcon` | Framer Motion hover interaction wrappers                   |
| `ThemeProvider`                           | Light/dark/system theme via CSS custom properties          |
| `ChatbotWidget`                           | Global AI chatbot. AWS Bedrock with tool use + blog RAG (lazy-loaded via `LazyInteractive`, `inert` when collapsed). Auto-nudge bounce animation after 30s idle. Action tokens: `[BOOK_CALL]` (booking), `[CONTACT]` (contact form), `[GOTO:/path/]` (navigation links). Tools: search_portfolio, search_blog, get_github_stats, check_booking_availability, get_resume_link, get_site_performance, search_projects, send_message_to_themis, get_system_health. **Cover letter generation**: visitors can paste a job description and the bot writes a tailored 3 to 4 paragraph cover letter highlighting Themis's relevant experience from the knowledge base |
| `LazyInteractive`                         | Lazy-loads MatrixRain, CursorTrail, CyberTerminal, ChatbotWidget, CommandPalette, KonamiEasterEgg via `next/dynamic` (ssr: false). SoundEffects and MatrixRainToggle moved to Navigation |
| `AuthProvider`                            | Amplify Cognito auth context (Hub listener + getCurrentUser)|
| `AccessibilityEnhancer`                   | Accessibility panel (opened via `open-accessibility-panel` custom event, no floating button) |
| `NotificationButton`                      | Bell icon with dropdown announcement panel. Announcements auto-generated from git commits at build time (`scripts/generate-announcements.sh` to `public/announcements.json`). Per-item dismiss (persisted in localStorage), read/unread tracking, auto-expire support. Responsive: fixed full-width panel on mobile (`left-4 right-4 top-16`), absolute `w-80` dropdown on `sm`+. Rendered in both mobile and desktop nav groups |
| `AvailabilityBadge`                       | Badge with pulsing green dot: "Available for Consulting" (component exists but no longer used on homepage) |
| `Footer`                                  | Mini sitemap nav, social icon circles (LinkedIn, GitHub, Email), legal links, "Built with" tech line |
| `GoogleAnalytics`                         | GA4 page view and Web Vitals reporting                     |
| `RouteProgressBar`                        | Thin cyan progress bar at top of page during route changes, provides visual navigation feedback |
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
| `useRecaptcha`             | reCAPTCHA v3 on-demand loading and token generation; `preload()` on form focus, `getToken(action)` on submit |
| `useConsent`               | Cookie consent state management (localStorage-persisted)                              |
| `useAgentRealtime`         | Real-time agent execution state for Blockly agent builder                             |
| `useTypingIndicator`       | Typing animation state for chatbot messages                                           |
| `useVoiceCommands`         | Voice command recognition for accessibility                                           |
| `use-toast`                | shadcn/ui toast notification state management                                         |
| `use-mobile`               | Mobile viewport detection hook                                                        |

---

## Backend Architecture

The frontend is a **static export** (`output: "export"`), with no server-side rendering or API routes in Next.js. All backend logic runs on a **single AWS Lambda function** (`figma-portfolio-api`) fronted by CloudFront at `/api/*`.

> **Same-origin API routing**: The frontend calls `/api/*` using relative paths (empty origin string from `getApiOrigin()`). CloudFront routes these requests to the Lambda Function URL origin. This eliminates CORS preflight requests, avoids Edge Tracking Prevention in Safari/Brave, and simplifies the security model. The direct Lambda Function URL is no longer used at runtime. It is retained in `LAMBDA_API_URL` as a fallback reference only.

### Production (Lambda)

- **Function URL**: `oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws`
- **Runtime**: Node.js, Express 5 + serverless-http
- **Memory**: 1024 MB
- **Timeout**: 30 seconds
- **Environment Variables**: 17 (see Deployment section below)

| Route                                     | Method       | Description                                           |
| ----------------------------------------- | ------------ | ----------------------------------------------------- |
| `/api/ping`                               | GET          | Health check ping                                     |
| `/api/health`                             | GET          | Detailed health status (uptime, memory, env)          |
| `/api/search?q=`                          | GET          | Portfolio content search                              |
| `/api/monitor`                            | GET          | Server monitoring (requests, errors, memory)          |
| `/api/webhook`                            | POST         | Generic webhook receiver                              |
| `/api/docs`                               | GET          | API endpoint documentation (JSON)                     |
| `/api/contact`                            | POST         | Contact form: reCAPTCHA v3, SES email, Sentry        |
| `/api/chat`                               | POST         | AI assistant: Claude 3.5 Haiku via Bedrock (SSE, tool use, blog RAG) |
| `/api/booking/slots`                      | GET          | Available booking slots (Cal.com)                     |
| `/api/booking/create`                     | POST         | Create booking with Google Meet link (Cal.com)        |
| `/api/resume/download`                    | GET          | Resume PDF download (jsPDF-generated with full content) |
| `/api/resume/generate`                    | GET          | Resume data as JSON with PDF link                     |
| `/api/github/stats`                       | GET          | GitHub profile statistics (repos, stars, followers)   |
| `/api/github/repos`                       | GET          | Public repositories (paginated, with topics)          |
| `/api/push-notifications`                 | GET/PUT/POST/DELETE | Web push subscription management (VAPID, S3-persisted, dev poll fallback) |
| `/api/crux`                               | GET          | Chrome UX Report field data (1-hour server cache, requires `CRUX_API_KEY`) |
| `/api/organizations/api_keys`             | GET/POST     | List / create API keys (Slack notifications)          |
| `/api/organizations/api_keys/:id`         | GET/POST/DELETE | Get / update / delete API key (Slack notifications)|

### Local Development (Express)

The `server/` directory runs an Express server on **port 3001** for local development:

| Route                             | Handler                        |
| --------------------------------- | ------------------------------ |
| `/api/ping`, `/api/health`, `/api/search`, `/api/monitor`, `/api/webhook`, `/api/docs` | `server/routes/general.ts` |
| `/api/resume`                     | `server/routes/resume.ts` (jsPDF-generated PDF) |
| `/api/chat`                       | `server/routes/chat.ts` (AWS Bedrock, Claude 3.5 Haiku) |
| `/api/github`                     | `server/routes/github.ts` (GitHub API: stats, repos) |
| `/api/push-notifications`         | `server/routes/pushNotifications.ts` (VAPID, S3-persisted) |
| `/api/organizations/api_keys`     | `server/routes/apiKeys.ts` (Slack notifications) |
| `/api/booking`                    | `server/routes/booking.ts` (Cal.com integration) |
| `/api/crux`                       | `server/routes/crux.ts` (Chrome UX Report API proxy) |
| `/api/contact`                    | `server/routes/contact.ts` (reCAPTCHA, SES) |

---

## PWA

- Service worker via **Workbox v7** (CDN-loaded in `public/sw.js`)
- Offline-first caching: CacheFirst for images (30d), StaleWhileRevalidate for static assets (7d), NetworkFirst for pages (7d) and API (5min)
- App manifest with 192x192 + 512x512 icons, maskable icon, screenshots, 4 shortcuts (About, Projects, Blog, Contact)
- PWA install button (`PWAInstallButton`) rendered in root layout with 30s delay prompt
- SW update detection: 60-minute interval + visibilitychange (tab focus) check
- **Dev-mode guard**: In non-production environments, `ServiceWorkerRegistration` automatically unregisters any stale service workers to prevent Workbox from serving cached chunks that Turbopack has replaced. This eliminates `ChunkLoadError` and `no-response` console errors during development
- Meta tags: `application-name`, `color-scheme`, `msapplication-TileColor`, `msapplication-TileImage`
- IndexedDB-backed offline analytics queue and failed request retry
- Background sync for contact form (when offline)
- Push notification support via Web Push API (VAPID keys, S3-persisted subscriptions)
- Subscribe/unsubscribe toggle in the Announcements bell dropdown (public site)
- Service worker registration automatic on subscribe; manual from admin Push tab
- **Same-origin API routing**: All `/api/*` requests route through CloudFront to the Lambda origin. The frontend uses relative paths (empty origin), eliminating third-party domain issues (CORS, Edge Tracking Prevention). The `LAMBDA_API_URL` constant in `src/lib/admin-constants.ts` is retained as a fallback reference only.
- **In-app push toasts** (`src/components/PushToast.tsx`): Cyberpunk-themed toast notifications that slide in from the top-right when the service worker receives a push message. Listens for `PUSH_RECEIVED` postMessage from `sw.js`, glass morphism styling with cyan accents, auto-dismiss after 8s with animated progress bar, stacks up to 5 toasts, dismiss button, and optional "View" link. Added to the root layout.
- **Push notifications in Announcements dropdown**: `NotificationButton` listens for `PUSH_RECEIVED` messages from the service worker. Received push notifications are saved to `localStorage` (key: `site-push-notifications`, max 20 items) and displayed with a purple "Push" badge and timestamp. The dropdown merges push notifications (newest first) with static announcements.
- **Service worker push forwarding**: `public/sw.js` sends `postMessage({ type: "PUSH_RECEIVED", title, body, url })` to all open client tabs after displaying the OS notification. SW also supports `CLAIM_CLIENTS` message for on-demand `clients.claim()`.
- **Dev poll fallback**: Edge/WNS returns 401 for VAPID push from localhost, a known platform limitation. In development (`NODE_ENV !== "production"`), when all push sends fail, notifications are queued in-memory on the server. The client polls `GET /api/push-notifications/poll?since=<timestamp>` every 3s and shows native notifications + adds them to the bell dropdown. This is dev-only; production uses real Web Push via WNS/FCM.
- **Per-step subscribe timeouts**: Each async step in the subscribe flow (permission, SW ready, VAPID fetch, PushManager.subscribe, server PUT) has its own timeout via `withTimeout()` helper, preventing any single step from hanging the UI. Edge's "Quiet notification requests" is detected with a 5s timeout and actionable console warning.

---

## MCP Server (Model Context Protocol)

A local MCP server (`server/mcp/index.ts`) exposes portfolio data for AI coding agents (Claude Code, Cursor, etc.) via stdio JSON-RPC transport.

**Run**: `pnpm mcp:start` or `npx tsx server/mcp/index.ts`

### Resources

| URI                     | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `knowledge://all`       | Full chatbot knowledge base (10 MD files, ~33KB)         |
| `blog://all`            | All MDX blog posts from `content/blog/`                  |
| `docs://architecture`   | Architecture documentation (`docs/ARCHITECTURE.md`)      |
| `project://package.json`| Package manifest with dependencies                       |

### Tools

| Tool                | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `search_knowledge`  | Full-text search across chatbot knowledge base files              |
| `search_blog`       | Search blog articles by keyword (title + content)                 |
| `github_stats`      | Fetch GitHub profile statistics (repos, followers, bio)           |
| `project_structure` | List files in a project directory                                 |
| `read_file`         | Read file contents (with path traversal security guard)           |
| `deployment_info`   | Get deployment configuration (S3, CloudFront, region, URLs)       |

**Security**: `read_file` rejects paths containing `..` or starting with `/` to prevent directory traversal.

---

## Analytics & Monitoring

| Tool                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| Google Analytics GA4 | Page views, events, user journeys                                    |
| `web-vitals` library | Real-user CWV measurement: LCP, FCP, CLS, TTFB, INP reported to GA4 |
| Chrome UX Report     | CrUX field data (p75 percentiles + distributions) via `/api/crux`. Real-user data aggregated over 28 days |

---

## Performance Optimizations

| Optimization | Impact | Details |
| --- | --- | --- |
| `CircuitBackground` `content-visibility: auto` | LCP | Defers rendering of 240-line SVG until visible, prevents blocking hero text paint |
| `AIBrain` `content-visibility: auto` | LCP | Defers 109-line hero SVG with `containIntrinsicSize: 0 500px` placeholder |
| `AvailabilityBadge` removed from homepage | LCP | Simplified hero section, removed badge that was delaying LCP with AnimatedSection wrapper |
| Hero text removed `AnimatedSection` | LCP | TypeWriter and description paragraphs render immediately without scroll-reveal delay |
| reCAPTCHA on-demand loading | TBT | Removed global script from layout; loaded by `useRecaptcha.preload()` on form focus (saves 214KB initial load) |
| Sentry replay lazy-load | TBT | `replayIntegration` loaded via `lazyLoadIntegration()` 2s after page load (saves ~94KB initial bundle) |
| Third-party script deferral | TBT | Ahrefs analytics and reCAPTCHA use `lazyOnload` strategy |
| `AnimatedSection` low-end skip | LCP | Skips Framer Motion entirely on low-end devices, renders plain `<div>` |
| Image pre-compression | Transfer | `scripts/optimize-images.mjs` converts PNG/JPG to WebP/AVIF at build time |
| `LazyInteractive` wrapper | TTI | MatrixRain, CursorTrail, CyberTerminal, ChatbotWidget, CommandPalette, KonamiEasterEgg loaded via `next/dynamic` (ssr: false) |

**Measured results** (local Lighthouse, median of 3 runs):
- LCP: 8-11s to 3.8-5.3s (~50% improvement)
- TBT: 690-1900ms to 670-860ms (~30% improvement)

---

## Security

| Layer              | Implementation                                                      |
| ------------------ | ------------------------------------------------------------------- |
| reCAPTCHA v3       | Applied to contact form submissions; script loaded on-demand via `useRecaptcha.preload()` on form focus (not globally) |
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
| Build        | `pnpm build` produces `out/` directory (static export)         |
| Deploy       | `aws s3 sync out/ s3://figma-portfolio-static --delete` |
| Invalidation | `aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"` |
| CI/CD        | GitHub Actions (`deploy.yml`) + Agentic Workflow (`deploy-production.md`) |
| Local deploy | `./scripts/deploy.sh`                                   |

> **Note**: Amplify Hosting auto-build is bypassed. Next.js 16 OOMs on the Amplify build instance. Frontend deploys directly to S3.

### Amplify Gen 2 Backend

| Item         | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| App ID       | `d1zjif7pi1h3om`                                        |
| Region       | `us-east-1`                                             |
| Auth         | Cognito (email login, `admin` group, `USER_PASSWORD_AUTH`) |
| API          | AppSync GraphQL                                         |
| Database     | DynamoDB (ContactSubmission, Booking)                   |
| Deploy       | `ampx pipeline-deploy` (CI) / `ampx sandbox --identifier t` (local) |
| Client config| `amplify_outputs.json` (gitignored, generated per env)  |

### Backend (Lambda)

| Item          | Detail                            |
| ------------- | --------------------------------- |
| Function name | `figma-portfolio-api`             |
| Region        | `us-east-1`                       |
| Memory        | 1024 MB                           |
| Timeout       | 30 seconds                        |
| Routing       | CloudFront `/api/*` to Lambda      |
| Monitoring    | CloudWatch alarms (errors >5/5min, throttles >0, avg duration >10s) |

### Lambda Environment Variables (15)

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
COGNITO_USER_POOL_ID              # Cognito user pool ID for JWT verification
COGNITO_CLIENT_ID                 # Cognito app client ID for JWT verification
CRUX_API_KEY                      # Google Chrome UX Report API key
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

### AWS Cognito (All Environments)

Authentication is handled by **AWS Amplify Gen 2 Cognito** in all environments (local development and production). A single auth provider simplifies the stack and eliminates the need for dual auth configuration.

- `src/contexts/AuthContext.tsx`: `AuthProvider` uses Amplify Hub to listen for `signedIn`/`signedOut` events + `getCurrentUser()` on mount
- `src/components/admin/useAdminAuth.ts`: Admin login hook wrapping Amplify `signIn`/`signOut` with timeout and error mapping
- `src/lib/amplify.ts`: Configures Amplify with auth + data from `amplify_outputs.json`

### Admin Access

Admin users must be created in the Cognito User Pool and added to the `admin` group. The admin dashboard login gate uses Amplify `signIn()` with email/password.

### Server-Side JWT Verification

The Express backend (`server/middleware/requireAuth.ts`) uses `aws-jwt-verify` to validate Cognito ID tokens. Environment variables `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` configure the verifier (falls back to sandbox values for local dev).

### API Health Dashboard Authentication

The API Health Dashboard (`ApiHealthDashboard.tsx`) automatically includes Cognito Bearer tokens in health check requests for endpoints marked with `requiresAuth: true`. Currently the `/api/organizations/api_keys` endpoint requires auth. The health check sends the logged-in user's Cognito ID token in the `Authorization` header to avoid 401 responses.

---

## Testing

- **E2E Tests**: Playwright (`playwright-tests/`, 106 spec files)
- **Unit/Integration**: Vitest (`vitest.config.ts`)
- **Chatbot Tests**: `playwright-tests/chatbot.spec.ts` (123 tests): toggle, panel, welcome, sending, streaming, multi-turn, response quality, NLP synonyms, booking/contact/navigation actions, thinking indicator, blog search, SSE protocol (route interception), knowledge base coverage, conversation history, cover letter generation, auto-nudge bounce
- **Engagement Tests**: `playwright-tests/engagement-features.spec.ts` (81 tests): SiteStats, GitHubHeatmap, Testimonials (incl. auto-rotate, pause on hover), CyberQuiz, ReadingProgress, BlogReactions, SoundEffects (incl. non-Element target safety), KonamiEasterEgg, Retro Terminal theme, section ordering
- **CrUX Field Data Tests**: `playwright-tests/crux-field-data.spec.ts` (18 tests): section structure, loading skeleton, success state with mocked data (5 metrics, p75 values, distribution bars, color coding), error/unavailable state, threshold color coding
- **MCP Server Tests**: `playwright-tests/mcp-server.spec.ts` (10 tests): initialization, resource listing/reading (knowledge base, package.json), tool listing/calling (deployment info, project structure, path traversal security, knowledge search)
- **About Page Tests**: `playwright-tests/about-page.spec.ts` (23 tests): hero, summary, focus areas, SkillsRadar interaction, badges grid, CountUpStats, responsive layout
- **Cookie Consent Tests**: `playwright-tests/cookie-consent.spec.ts` (11 tests): banner lifecycle, accept/reject, customise toggles, localStorage persistence, accessibility
- **Footer Tests**: `playwright-tests/footer-links.spec.ts` (15 tests): nav/legal/social links, hrefs, target attributes, mailto, copyright, tech stack, mobile layout
- **Theme Toggle Tests**: `playwright-tests/theme-toggle.spec.ts` (13 tests): dark/light mode, body class toggle, persistence after reload, rapid toggles, mobile toolbar, tooltip
- **Projects Tests**: `playwright-tests/projects-comprehensive.spec.ts` (17 tests): search, category filters, combined search+filter, featured badges, GitHub links, mobile layout
- **Navigation Tests**: `playwright-tests/navigation.spec.ts` (20 tests): sticky header, Sheet menu, toolbar separator, active link highlighting, mobile bell/theme, Get In Touch CTA, accessibility tooltip
- **Route Progress Tests**: `playwright-tests/route-progress.spec.ts` (3 tests): progress bar during navigation, component rendered in layout, ARIA attributes
- **Home Page Tests**: `playwright-tests/home-page.spec.ts` (19 tests): hero content, social links, hero CTAs (Get In Touch primary, Learn More secondary), CTA styling verification, layout
- **Performance Page Tests**: `playwright-tests/performance-page.spec.ts`: structure (incl. field-data section), speed test, Web Vitals, Lighthouse, methodology, industry comparison
- **PWA Tests**: `playwright-tests/pwa.spec.ts` (5 tests): manifest, offline fallback, sw.js, dev-mode SW unregistration
- **Production Smoke Tests**: `playwright-tests/production-smoke.spec.ts`: API-level tests against both `www.baltzakisthemis.com` and `baltzakisthemis.com` (pages, health endpoints, contact form, chat API, booking, HTTPS, 404 handling)
- **Accessibility**: Playwright accessibility assertions on all pages

See [`docs/TESTING.md`](./TESTING.md) for the complete testing guide.