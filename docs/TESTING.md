# Testing Guide

## Overview

This project uses **Playwright** for end-to-end (E2E) testing, targeting 100% coverage of all pages, features, and API integrations.

---

## Test Framework

| Tool             | Version | Purpose                           |
| ---------------- | ------- | --------------------------------- |
| Playwright       | ^1.57   | Browser automation & E2E testing  |
| @playwright/test | ^1.57   | Test runner, assertions, fixtures |
| Vitest           | ^3.2.4  | Unit testing framework            |

### Configuration

**File:** `playwright.config.ts`

- Base URL (local dev): `http://localhost:3000` (Next.js dev server) — backend: `http://localhost:3001` (Express dev server)
- Override with `PLAYWRIGHT_BASE_URL` for CI or production testing.
- Browsers: Chromium, Firefox, WebKit (desktop + mobile viewports)
- Test timeout: 30 seconds
- Retries: 2 on CI, 0 locally
- Parallel execution enabled

---

## Running Tests

```bash
# Run all tests
pnpm exec playwright test

# Run a specific spec file
pnpm exec playwright test playwright-tests/product.spec.ts

# Run with UI mode (interactive)
pnpm exec playwright test --ui

# Run with headed browser (visible)
pnpm exec playwright test --headed

# Run specific browser
pnpm exec playwright test --project=chromium

# Generate HTML report
pnpm exec playwright test --reporter=html
open playwright-report/index.html
```

---

## Test Utilities (`playwright-tests/test-utils.ts`)

Shared helpers used across spec files:

| Function                                      | Description                                   |
| --------------------------------------------- | --------------------------------------------- |
| `waitForAppReady(page)`                       | Waits for React hydration & all animations    |
| `setupTestEnvironment(page)`                  | Mocks APIs, sets localStorage, prepares state |
| `measurePerformance(page)`                    | Captures Web Vitals and Lighthouse metrics    |
| `runAccessibilityAudit(page)`                 | Runs axe-core accessibility scan              |
| `findElementWithFallbacks(page, selectors[])` | Tries multiple selectors with fallbacks       |
| `navigateWithMobileSupport(page, href)`       | Handles mobile hamburger menu navigation      |

---

## Test Files Reference

### Core Application Tests

#### `playwright-tests/app.spec.ts` — Main Application Suite

**Coverage:** Home page, Navigation, Contact Form, Theme, About, Settings, Performance

- ✅ Home page load and initial render
- ✅ Performance metrics (LCP, FID, CLS, TTFB)
- ✅ Heading structure (h1 → h2 → h3 hierarchy)
- ✅ Desktop navigation links (all routes)
- ✅ Mobile hamburger menu open/close
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA roles and labels
- ✅ Contact form fill and submit
- ✅ Contact form validation (empty, invalid email)
- ✅ Contact form error handling (server errors)
- ✅ Contact form keyboard accessibility
- ✅ Contact form responsive layout
- ✅ Theme switcher (light/dark/system)
- ✅ Theme persistence (localStorage)
- ✅ System preference detection
- ✅ About page professional content
- ✅ About page responsive design
- ✅ Settings page (all sections)
- ✅ Performance dashboard
- ✅ Push notification tester
- ✅ Error boundary rendering
- ✅ AnimatedSection intersections
- ✅ Resume & career guide page
- ✅ Navigation component isolated tests
- ✅ Skeleton loading states
- ✅ OptimizedImage rendering
- ✅ HoverAnimations
- ✅ Accessibility compliance (axe)
- ✅ Performance monitoring

#### `playwright-tests/routing-test.spec.ts` — SPA Routing

- ✅ /projects URL navigation

#### `playwright-tests/navigation-spa.spec.ts` — SPA Navigation (Link-based)

- ✅ All routes navigate without full page reload
- ✅ Browser back/forward buttons
- ✅ Direct URL access (deep linking)
- ✅ 404 fallback for unknown routes
- ✅ Mobile navigation for all routes

#### `playwright-tests/product.spec.ts` — Work Experience Page

- ✅ Page loads at /product
- ✅ Experience cards render via InteractiveTimeline (dual desktop/mobile views)
- ✅ Company names, positions, periods, locations visible (`.first()` for dual-view)
- ✅ Responsibilities lists render
- ✅ Navigation back to home works
- ✅ CircuitBackground renders
- ✅ Responsive layout (mobile/tablet/desktop)
- ✅ Accessibility (headings, lists, ARIA)
- ✅ No broken links
- ✅ Text is readable (contrast)

#### `playwright-tests/interactive-components.spec.ts` — Interactive Engagement Components (28 tests)

**Coverage:** All 7 interactive components — ScrollProgress, MatrixRain, CyberTerminal, TypeWriter, SkillsRadar, InteractiveTimeline, CursorTrail

**ScrollProgress (2 tests)**
- ✅ Progressbar element with ARIA attributes (aria-label, aria-valuemin, aria-valuemax)
- ✅ Progress value updates on scroll (0 at top, >50 after scrolling)

**MatrixRain (2 tests)**
- ✅ Toggle button renders with proper aria-label
- ✅ Click enables canvas, updates label to "Disable"; click again disables

**CyberTerminal (11 tests)**
- ✅ Opens with backtick key, displays CYBER_TERMINAL header
- ✅ Shows boot messages (Initializing, Secure connection)
- ✅ Input field with "Enter command..." placeholder
- ✅ Close button with aria-label, closes with Escape key
- ✅ `help` command shows available commands list
- ✅ `whoami` command shows identity (THEMISTOKLIS BALTZAKIS)
- ✅ Unknown command shows error message
- ✅ Input disabled during typing animation

**TypeWriter (2 tests)**
- ✅ Cursor element renders with blinking animation
- ✅ Types "IT Network Engineer" within 10s timeout

**SkillsRadar (6 tests)**
- ✅ "Skills Radar" heading visible
- ✅ SVG radar chart with role="img" and aria-label
- ✅ All 6 skill labels (Networking, Security, Cloud, DevOps, Programming, Systems)
- ✅ Skill labels are clickable buttons (role="button")
- ✅ Clicking label shows detail panel (proficiency, certifications, experience)
- ✅ Clicking same label again hides detail panel

**InteractiveTimeline (4 tests)**
- ✅ Renders all 5 companies (Skaramangas, Estarta, Cosmos, CPI SA, Printec)
- ✅ Responsibilities render as list items
- ✅ Mobile view shows all experiences expanded (375px viewport)

**CursorTrail (1 test)**
- ✅ Trail container has aria-hidden="true" (graceful on CI/mobile)

#### `playwright-tests/admin.spec.ts` — Admin Dashboard Suite (138 tests)

**Coverage:** Authentication, all 10 tabs (Health, Console, Deploy, Errors, Perf, SEO, Push, Analytics, Auth, Env), Tab Navigation, SEO

**Authentication (10 tests)**
- ✅ Login form rendering (email, password, submit, lock icon, divider)
- ✅ Input attributes (autocomplete, placeholder, required)
- ✅ Invalid credentials rejection (wrong email, wrong password, both wrong)
- ✅ Valid credentials login (dashboard, online status, logout button)
- ✅ Dashboard subtitle and user email display
- ✅ Logout and re-login flow
- ✅ Session persistence across page reload

**Health Tab (16 tests)**
- ✅ Endpoint cards (9 endpoints), refresh all, individual refresh buttons
- ✅ Summary stats (total, healthy count), average response time with sparkline
- ✅ Service labels (Lambda, Cal.com, HuggingFace, Web Push, reCAPTCHA + SES)
- ✅ Method badges (GET, POST), endpoint descriptions
- ✅ Auto-run health checks, response times in ms, status labels (Healthy/Degraded/Down)
- ✅ "Checked" timestamps, auth header for API Keys endpoint

**Console Tab (18 tests)**
- ✅ Request builder, GET/POST/PUT/DELETE/OPTIONS/HEAD methods
- ✅ Preset buttons (Ping, Health, Slots, API Keys, Subscriptions)
- ✅ Request execution, response viewer (status badge, timing), history
- ✅ Body textarea toggle for POST, disable Send when URL empty

**Deploy Tab (7 tests)**
- ✅ Production Deployment header, Check button
- ✅ Frontend and API (Lambda) sections
- ✅ Infrastructure (S3 Bucket, CloudFront, Region, Amplify App)
- ✅ Health Checks (frontend reachable, API responding, latency < 2s)
- ✅ Hosting details (S3 + CloudFront), deployment check execution

**Errors Tab (6 tests)**
- ✅ Error count (Captured), Live/Paused toggle, Clear button
- ✅ Capture status message, empty state ("No errors captured yet")
- ✅ Toggle capturing on/off (Live ↔ Paused)

**Perf Tab (8 tests)**
- ✅ Performance grade, score, Within Budget count
- ✅ "Live from web-vitals" badge
- ✅ All 4 CWV metrics (LCP, FCP, CLS, TTFB) with descriptions
- ✅ Budget thresholds section with values (2500ms, 1800ms, 800ms)

**SEO Audit Tab (5 tests)**
- ✅ Pages count, Re-scan button
- ✅ Scan results with page paths, status labels (Pass/Warn/Error)
- ✅ Metadata badges (og:image, canonical, JSON-LD, og:title)

**Push Tab (15 tests)**
- ✅ Web Push API Tester heading and description
- ✅ Notification permission status (Granted/Denied/Not Requested)
- ✅ Service worker status (Active/Inactive/Not Registered)
- ✅ Active subscriptions display and Check Subscriptions button
- ✅ Send Test / Send Custom Notification buttons
- ✅ Custom notification form (title, URL, body) with defaults and editing
- ✅ Requirements checklist (5 items), form labels

**Analytics Tab (20 tests)**
- ✅ Measurement ID, GA detection badge, copy button
- ✅ NEXT_PUBLIC_GA_ID, afterInteractive, Configuration details
- ✅ Event Helpers (trackEvent, trackConversion parameters/descriptions)
- ✅ Code snippets, gtag internals, GA4 Dashboard link
- ✅ Implementation Reference, route tracking details

**Auth Tab (9 tests)**
- ✅ Current Session section with user details (Username, User ID, Sign-in Method, Groups)
- ✅ AWS Cognito section with active badge
- ✅ Cognito Region, App ID, User Pool, Auth Method fields
- ✅ ID Token section (Expires, Issuer) when logged in

**Env Tab (9 tests)**
- ✅ Build Info (App Version, Environment, Site URL, Framework: Next.js 16)
- ✅ Integrations (Google Analytics, Sentry, reCAPTCHA v3) with status badges
- ✅ Git section (Branch), Client section (Viewport, Language, Platform)

**Tab Navigation (5 tests)**
- ✅ Switch between all 10 tabs, correct content isolation
- ✅ Exactly 10 tabs, active state tracking, icons in labels

**SEO (2 tests)**
- ✅ noindex meta tag, login gate for unauthenticated users

> All auth-gated tests skip gracefully via `adminLoginOrSkip()` when Cognito auth is not available.

---

### Page-Specific Tests

#### `playwright-tests/projects.spec.ts`

- ✅ Projects gallery loads
- ✅ Project cards display title, description, tech tags
- ✅ GitHub links present
- ✅ Filter/category buttons work
- ✅ Responsive grid layout

#### `playwright-tests/resume.spec.ts` — Resume & Career Guide (12 tests)

**Coverage:** Educational resume guide with ATS tips, keyword categories, and career advice

- ✅ Hero heading ("Resume & Career Guide") and ATS subtitle
- ✅ How ATS Systems Work section (4 pipeline steps: Parsing, Keyword Matching, Ranking, Human Review)
- ✅ Anatomy of a Strong IT Resume (4 sections: Professional Summary, Work Experience, Certifications, Technical Skills)
- ✅ Good and bad examples (≥4 "Good Example" and ≥4 "Avoid This" labels)
- ✅ Common mistakes section ("6 Mistakes That Get Resumes Rejected")
- ✅ ATS Keywords for IT Professionals (4 categories: Network Infrastructure, Network Security, Cloud & Identity, DevOps & Automation)
- ✅ Specific IT keywords visible (Cisco IOS, Fortinet, Azure AD, Kubernetes)
- ✅ Career Tips for Network Engineers (Build a Home Lab, Stack Certifications Strategically)
- ✅ Pre-Submission Checklist (Single-column layout, PDF format)
- ✅ Navigation links to About (/about/) and Work Experience (/product/)
- ✅ Responsive layout on mobile viewport (375×667)

#### `playwright-tests/agents.spec.ts` — AI Agents Educational Page (18 tests)

**Coverage:** Educational AI agents guide with concepts, architectures, terminology, use cases, and interactive builder

**Educational Content (12 tests)**
- ✅ Page heading ("Understanding AI Agents") and subtitle ("From Language Models to Autonomous Systems")
- ✅ What Is an AI Agent section (agent capabilities: break tasks into steps, call external tools)
- ✅ The Agentic Loop section with 4 phases (Observe, Think, Act, Evaluate) — scrolls into view on mobile
- ✅ Core Components section (LLM, Tools & APIs, Memory & Retrieval, Planning & Reasoning)
- ✅ Architecture Patterns (Single Agent, Router Agent, Multi-Agent Collaboration)
- ✅ Difficulty levels for patterns (Beginner, Intermediate, Advanced)
- ✅ Pros and cons (Advantages, Trade-offs) for each pattern
- ✅ Key Terminology section (RAG, ReAct, Tool Use, MCP, Guardrails) with full names
- ✅ Use Cases in Network Engineering (Security Monitoring, Network Troubleshooting, Infrastructure Automation, Documentation)
- ✅ Networking-relevant tags (Fortinet, Cisco, SNMP, DevNet)

**Interactive Agent Builder (3 tests)**
- ✅ Interactive Agent Builder section heading and subtitle
- ✅ Template cards render in builder
- ✅ Search functionality in builder

**Accessibility & Responsiveness (3 tests)**
- ✅ Keyboard accessible (Tab navigation)
- ✅ Mobile responsive (375×667 viewport)
- ✅ Screen reader support (sr-only, aria-label, aria-labelledby)

#### `playwright-tests/agent-builder.spec.ts` — Agent Builder Interactive Section (13 tests)

**Coverage:** Interactive agent builder embedded in the educational agents page

- ✅ Builder section loads with heading and search input
- ✅ Template cards with categorization (All Templates filter, h3 names, descriptions)
- ✅ Template selection navigates to builder view (Workflow Builder, Agent Configuration)
- ✅ Workflow SVG visualization with ARIA roles
- ✅ Workflow nodes (rect role="button") clickable → Node Details
- ✅ Agent configuration form (Agent Name, Description, Category fields)
- ✅ Test Agent button triggers "Running..." state
- ✅ Save Agent navigates back to template selection
- ✅ Agent Stats display (Nodes, Connections counts)
- ✅ Quick Actions (Export Configuration, Duplicate Agent)
- ✅ Workflow connections (SVG paths, arrow markers)
- ✅ Responsive design (mobile 375×667, desktop 1920×1080)
- ✅ Accessibility (SVG aria-label, rect aria-label attributes)

#### `playwright-tests/ai-agents.spec.ts` — AI Agent Functionality (3 tests)

- ✅ Page loads successfully (document.readyState === "complete")
- ✅ Window object available
- ✅ Async operations supported

---

#### `playwright-tests/legal-pages.spec.ts` — Legal Pages Suite

**Coverage:** Cookie Policy, Privacy Policy, Terms of Service, Cross Navigation

- ✅ Cookie Policy: page title, meta description, effective date
- ✅ Cookie Policy: essential, analytics, functional, third-party cookie sections
- ✅ Cookie Policy: manage cookies button, privacy link, GA opt-out link
- ✅ Privacy Policy: page title, meta description, data controller section
- ✅ Privacy Policy: GDPR legal bases, data collected, third parties table
- ✅ Privacy Policy: GDPR rights, CCPA rights, data retention
- ✅ Privacy Policy: cookie policy link, external privacy links, Hellenic DPA link
- ✅ Terms of Service: page title, meta description, acceptance section
- ✅ Terms of Service: services, responsibilities, IP, disclaimer, AI chat sections
- ✅ Terms of Service: Cal.com booking links, governing law (Greek), contact section
- ✅ Cross navigation: cookies→privacy, privacy→cookies, terms→privacy links
- ✅ All legal pages use trailing slashes in URLs

#### `playwright-tests/settings-page.spec.ts` — Settings Page Suite

**Coverage:** Appearance, Accessibility, Notifications, Privacy, Persistence

- ✅ Settings page heading and navigation
- ✅ Appearance: three theme options (Light, Dark, System) with aria-pressed
- ✅ Appearance: theme toggle on click
- ✅ Accessibility: animations toggle, reduced motion toggle
- ✅ Notifications: push notifications toggle
- ✅ Privacy: analytics toggle
- ✅ Action buttons: Reset to Defaults, Save Settings
- ✅ Save confirmation: "Saved!" text appears after save
- ✅ Theme persistence to localStorage (portfolio-theme key)
- ✅ Animation persistence to localStorage (portfolio-animations key)
- ✅ Reset to defaults functionality
- ✅ Responsive layout on mobile viewport (375×812)

#### `playwright-tests/chatbot.spec.ts` — AI Chatbot Widget (41 tests)

**Coverage:** Toggle behaviour, panel structure, welcome message, suggested questions, message sending, streaming UI, multi-turn conversation, booking flow, keyboard interaction, accessibility, state persistence

The chatbot uses **AWS Bedrock** (Claude 3 Haiku) via the Express server. Tests that require the Bedrock backend skip gracefully when AWS credentials are not configured or the Express server is not running.

**Toggle behaviour (7 tests)**
- ✅ Floating toggle button visible on page load with "Chat with AI" text
- ✅ Pulsing status indicator (animated ping dot + solid cyan dot)
- ✅ Cyberpunk styling (fixed position, font-mono)
- ✅ Panel opens on click (header, subtitle visible; toggle becomes inert with opacity-0 + pointer-events-none)
- ✅ Toggle gets tabIndex -1 when panel is open
- ✅ Panel closes via close button (toggle reappears with full opacity)
- ✅ Multiple open/close cycles work correctly

**Panel structure (5 tests)**
- ✅ Header displays "TB" avatar initials with green online indicator
- ✅ Glass-morphism styling (backdrop-blur)
- ✅ Input field with correct placeholder ("Ask about Themis…")
- ✅ Send button visible with "Send" text
- ✅ Input and Send button both interactive in bottom bar

**Welcome message & suggested questions (5 tests)**
- ✅ Full welcome message displayed (including "book a teleconference call")
- ✅ Welcome message styled as assistant bubble (bg-white/5)
- ✅ All 4 suggested questions visible (skills, cloud experience, certifications, booking)
- ✅ Suggested questions are clickable `<button>` elements
- ✅ Suggested questions disappear after sending a message (bot-dependent, skips)

**Sending messages (8 tests)**
- ✅ Typed message sent and local LLM response received (bot-dependent)
- ✅ User messages have distinct styling from assistant (cyan vs white, bot-dependent)
- ✅ Suggested question click sends message and gets response (bot-dependent)
- ✅ Enter key sends message (bot-dependent)
- ✅ Input field cleared after sending (bot-dependent)
- ✅ Empty messages cannot be sent (Send button disabled)
- ✅ Whitespace-only messages cannot be sent
- ✅ Enter key does not send empty message (no user bubble created)

**Streaming UI (3 tests)**
- ✅ Input disabled and bouncing dots shown during LLM inference; Send text hidden (bot-dependent)
- ✅ Typing cursor (animated pulse) shown during streaming (bot-dependent)
- ✅ Send button re-enables with "Send" text after response completes (bot-dependent)

**Multi-turn conversation (1 test)**
- ✅ Two sequential messages sent and both receive responses; both user messages visible (bot-dependent)

**Booking flow (2 tests)**
- ✅ Booking intent triggers either BookingCard or text response (bot-dependent)
- ✅ Booking suggested question appears as user message bubble (bot-dependent)

**Keyboard interaction (3 tests)**
- ✅ Shift+Enter does not send the message
- ✅ Typing in the input field updates its value
- ✅ Send button enables/disables reactively as input text changes

**Accessibility (5 tests)**
- ✅ Toggle and close buttons have proper aria-labels
- ✅ Aria-label toggles between "Open chat" and "Chat is open" states
- ✅ Input auto-focused when chat opens (after 100ms delay)
- ✅ Close button visible and clickable
- ✅ Input is enabled and editable

**State persistence (2 tests)**
- ✅ Messages preserved after close and reopen (bot-dependent)
- ✅ Welcome message and suggested questions persist after close/reopen (no messages sent)

---

### Feature Tests

#### `playwright-tests/accessibility.spec.ts`

- ✅ WCAG 2.1 AA compliance on all pages
- ✅ Keyboard-only navigation
- ✅ Screen reader ARIA labels
- ✅ Color contrast ratios
- ✅ Focus indicators visible

#### `playwright-tests/performance-monitoring.spec.ts`

- ✅ Core Web Vitals tracking (LCP, FCP, CLS, TTFB, INP)
- ✅ Performance dashboard renders with heading
- ✅ Analytics data endpoint integration
- ✅ Navigation timing measurement
- ✅ Resource loading performance tracking
- ✅ Interaction responsiveness measurement (Speed Test button)
- ✅ Error handling for unsupported environments

#### `playwright-tests/push-notifications.spec.ts`

- ✅ Push notification UI renders
- ✅ Permission request flow
- ✅ Subscribe/unsubscribe actions
- ✅ Notification received confirmation

#### `playwright-tests/theme-provider.integration.spec.ts`

- ✅ Theme provider initializes correctly
- ✅ Theme persists across page reloads
- ✅ System theme detection works
- ✅ Theme toggle cycles through options

#### `tests/cookie-consent.spec.ts`

- ✅ Cookie consent bar renders on first visit
- ✅ Accept button stores consent
- ✅ Decline button stores decline
- ✅ Consent bar hidden after choice
- ✅ Responsive layout on mobile

#### `tests/accessibility-button.spec.ts`

- ✅ Accessibility button renders
- ✅ Opens accessibility menu
- ✅ Toggles accessibility features
- ✅ Keyboard navigation works

#### `tests/pwa-update-notification.spec.ts`

- ✅ PWA update notification appears
- ✅ Update button triggers service worker update
- ✅ Dismiss button hides notification

#### `playwright-tests/pwa-advanced.spec.ts`

- ✅ Service worker registers
- ✅ Manifest is valid
- ✅ App is installable
- ✅ Offline fallback page

#### `playwright-tests/contact-form-analytics.spec.ts`

- ✅ GA4 event fires on form submit
- ✅ reCAPTCHA token generated
- ✅ Success/error analytics events

---

### Integration Tests

#### `playwright-tests/api-integration.spec.ts`

- ✅ `POST /api/contact` — valid submission
- ✅ `POST /api/contact` — validation errors
- ✅ `POST /api/contact` — reCAPTCHA failure
- ✅ `GET /api/github/user` — profile data
- ✅ `GET /api/github/repos` — repository list
- ✅ `GET /api/resume` — resume data
- ✅ `POST /api/analytics` — event logging

#### `playwright-tests/github-api-integration.spec.ts`

- ✅ GitHub profile fetched and displayed
- ✅ Repos loaded in projects
- ✅ Star/fork counts visible
- ✅ Error handling when API unavailable

#### `playwright-tests/analytics-integration.spec.ts` / `playwright-tests/recaptcha-analytics.spec.ts`

- ✅ GA4 pageview on every route change
- ✅ Custom events tracked
- ✅ reCAPTCHA v3 loads on contact page

#### `playwright-tests/socketio-realtime.spec.ts`

- ✅ Socket.IO connects on Settings page
- ✅ Real-time features beta UI
- ✅ Disconnect gracefully

#### `playwright-tests/aws-integration.spec.ts`

- ✅ App served from Amplify
- ✅ Health check endpoint responds
- ✅ Static assets load from CDN

---

### Security Tests

#### `playwright-tests/security-privacy.spec.ts`

- ✅ XSS in contact form is blocked
- ✅ SQL injection patterns rejected
- ✅ CSP headers present
- ✅ HTTPS enforced (production)
- ✅ Analytics consent respected
- ✅ Data export / clear works

---

### Visual & UX Tests

#### `playwright-tests/seo.spec.ts`

- ✅ `<title>` tags on all pages
- ✅ Meta description tags
- ✅ Open Graph tags
- ✅ Canonical URLs
- ✅ robots.txt / sitemap.xml

#### `playwright-tests/3d-demos.spec.ts`

- ✅ Three.js canvas renders
- ✅ WebGL context available
- ✅ Animation loop runs
- ✅ No WebGL errors in console

#### `playwright-tests/image-optimization.spec.ts`

- ✅ Images have width/height attributes
- ✅ Lazy loading applied
- ✅ WebP format served where supported
- ✅ No oversized images

#### `playwright-tests/visual-progress.spec.ts`

- ✅ Progress bars animate
- ✅ Skill meters fill correctly
- ✅ Counter animations run

#### `playwright-tests/logo.spec.ts`

- ✅ Logo renders in navigation
- ✅ Logo links to home
- ✅ Logo visible in all viewports

---

### Modern Web API Tests

#### `playwright-tests/modern-web-apis.spec.ts`

- ✅ Web Vitals API integration
- ✅ Performance Observer
- ✅ Intersection Observer (AnimatedSection)
- ✅ ResizeObserver
- ✅ Clipboard API (copy to clipboard)

#### `playwright-tests/resource-preloading.spec.ts`

- ✅ Critical CSS preloaded
- ✅ Fonts preloaded
- ✅ Key images preloaded

---

### Production Smoke Tests

#### `playwright-tests/production-smoke.spec.ts`

Tests both `https://www.baltzakisthemis.com` and `https://baltzakisthemis.com` across 9 browser configs (Chromium, Firefox, WebKit × desktop + mobile viewports).

- ✅ All 9 frontend pages return 200 (`/`, `/about/`, `/contact/`, `/resume/`, `/projects/`, `/performance/`, `/agents/`, `/settings/`, `/product/`)
- ✅ API health endpoints (`/api/ping`, `/api/health`)
- ✅ Contact form POST (accepts 200, 400, or 403 for reCAPTCHA rejection)
- ✅ Chat API responds (SSE stream)
- ✅ Booking slots API
- ✅ HTTPS enforcement
- ✅ Non-existent page handling (S3 returns 403 for missing keys)

**Run production smoke tests:**

```bash
pnpm exec playwright test playwright-tests/production-smoke.spec.ts
```

> **Note**: These are API-level tests (using `request` context, not browser rendering) designed for fast post-deployment verification.

---

## Coverage Map

| Page/Feature               | Spec File(s)                                                               | Status     |
| -------------------------- | -------------------------------------------------------------------------- | ---------- |
| Admin (/admin)             | `admin.spec.ts`                                                            | ✅ Covered |
| Home (/)                   | `app.spec.ts`                                                              | ✅ Covered |
| About (/about)             | `app.spec.ts`                                                              | ✅ Covered |
| Product (/product)         | `product.spec.ts`                                                          | ✅ Covered |
| Projects (/projects)       | `projects.spec.ts`, `routing-test.spec.ts`                                 | ✅ Covered |
| Resume (/resume)           | `resume.spec.ts`, `app.spec.ts`                                            | ✅ Covered |
| Agents (/agents)           | `agents.spec.ts`, `agent-builder.spec.ts`, `ai-agents.spec.ts`             | ✅ Covered |
| Settings (/settings)       | `settings-page.spec.ts`, `app.spec.ts`                                     | ✅ Covered |
| Performance (/performance) | `performance-page.spec.ts`, `performance-dashboard.spec.ts`, `performance-monitoring.spec.ts`, `app.spec.ts` | ✅ Covered |
| Cookies (/cookies)         | `legal-pages.spec.ts`                                                      | ✅ Covered |
| Privacy (/privacy)         | `legal-pages.spec.ts`                                                      | ✅ Covered |
| Terms (/terms)             | `legal-pages.spec.ts`                                                      | ✅ Covered |
| 404 Page                   | `navigation-spa.spec.ts`, `app.spec.ts`                                    | ✅ Covered |
| SPA Routing                | `navigation-spa.spec.ts`, `routing-test.spec.ts`                           | ✅ Covered |
| Contact API                | `api-integration.spec.ts`, `contact-form-analytics.spec.ts`                | ✅ Covered |
| GitHub API                 | `github-api-integration.spec.ts`, `api-integration.spec.ts`                | ✅ Covered |
| Analytics GA4              | `analytics-integration.spec.ts`, `recaptcha-analytics.spec.ts`             | ✅ Covered |
| reCAPTCHA v3               | `recaptcha-analytics.spec.ts`, `comprehensive-recaptcha-analytics.spec.ts` | ✅ Covered |
| Push Notifications         | `push-notifications.spec.ts`, `app.spec.ts`                                | ✅ Covered |
| AI Chatbot                 | `chatbot.spec.ts`                                                          | ✅ Covered |
| PWA / Service Worker       | `pwa-advanced.spec.ts`                                                     | ✅ Covered |
| Socket.IO                  | `socketio-realtime.spec.ts`                                                | ✅ Covered |
| Interactive Components     | `interactive-components.spec.ts`                                            | ✅ Covered |
| Three.js 3D                | `3d-demos.spec.ts`                                                         | ✅ Covered |
| Accessibility              | `accessibility.spec.ts`, `app.spec.ts`                                     | ✅ Covered |
| Security                   | `security-privacy.spec.ts`                                                 | ✅ Covered |
| SEO                        | `seo.spec.ts`                                                              | ✅ Covered |
| Image Optimization         | `image-optimization.spec.ts`                                               | ✅ Covered |
| Performance Metrics        | `performance-monitoring.spec.ts`, `app.spec.ts`                            | ✅ Covered |
| Production Smoke Tests     | `production-smoke.spec.ts`                                                 | ✅ Covered |
| Theme Switching            | `app.spec.ts`, `theme-provider.integration.spec.ts`                        | ✅ Covered |
| Cookie Consent             | `tests/cookie-consent.spec.ts`                                             | ✅ Covered |
| Accessibility Button       | `tests/accessibility-button.spec.ts`                                       | ✅ Covered |
| PWA Update Notification    | `tests/pwa-update-notification.spec.ts`                                    | ✅ Covered |
| Playwright Autofix API     | `server/routes/playwright-autofix.ts`                                      | ✅ Covered |
| API Keys CRUD              | `api-keys.spec.ts`                                                         | ✅ Covered |

**Total coverage: 100% of pages and major features**

---

## Writing New Tests

### Template

```typescript
import { test, expect } from "@playwright/test";
import { waitForAppReady, setupTestEnvironment } from "./test-utils";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/route");
    await waitForAppReady(page);
  });

  test("should do something", async ({ page }) => {
    const element = page.locator('[data-testid="element"]');
    await expect(element).toBeVisible();
  });
});
```

### Best Practices

1. **Use `data-testid` attributes** for stable selectors
2. **Use `waitForAppReady()`** before assertions to avoid flakiness
3. **Test mobile viewports** using `page.setViewportSize({ width: 375, height: 812 })`
4. **Mock external APIs** in `beforeEach` to avoid network dependency
5. **Test accessibility** with `runAccessibilityAudit()` on every page
6. **Use `test.describe`** to group related tests
7. **Avoid hard-coded waits** (`page.waitForTimeout`) — prefer `waitForSelector` / `waitForResponse`

---

## CI/CD Integration

Tests run automatically in GitHub Actions on every push:

```yaml
- name: Run Playwright Tests
  run: pnpm exec playwright test
  env:
    CI: true
    BASE_URL: http://localhost:5173
```

Test reports are uploaded as artifacts and visible in the GitHub Actions summary.
