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
- ✅ Resume generation flow
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
- ✅ Experience cards render with required fields
- ✅ Company names, positions, periods, locations visible
- ✅ Responsibilities lists render
- ✅ Navigation back to home works
- ✅ CircuitBackground renders
- ✅ Responsive layout (mobile/tablet/desktop)
- ✅ Accessibility (headings, lists, ARIA)
- ✅ No broken links
- ✅ Text is readable (contrast)

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
- ✅ Current Session section with user details (Email, UID, Email Verified, Provider)
- ✅ Firebase Auth section with config status badge (configured/disabled)
- ✅ Amplify Cognito section with production badge
- ✅ Firebase Project and Auth Domain fields
- ✅ Amplify Region, App ID, Auth Method fields
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

> All auth-gated tests skip gracefully via `adminLoginOrSkip()` when Firebase Email/Password auth is not enabled.

---

### Page-Specific Tests

#### `playwright-tests/projects.spec.ts`

- ✅ Projects gallery loads
- ✅ Project cards display title, description, tech tags
- ✅ GitHub links present
- ✅ Filter/category buttons work
- ✅ Responsive grid layout

#### `playwright-tests/resume.spec.ts`

- ✅ Resume builder loads with default data
- ✅ Tab switching (Personal, Experience, Education, Certifications, Skills)
- ✅ Field editing updates live preview
- ✅ Auto-save to localStorage (2s debounce)
- ✅ PDF download button triggers download
- ✅ Responsive layout (editor + preview)

#### `playwright-tests/agents.spec.ts` / `playwright-tests/ai-agents.spec.ts`

- ✅ Agents page loads
- ✅ Agent cards render
- ✅ AI integration demos
- ✅ Links to demos/source

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

#### `playwright-tests/chatbot.spec.ts` — AI Chatbot Widget (12 tests)

**Coverage:** Toggle behaviour, welcome message, suggested questions, message sending, streaming UI, booking flow, accessibility

The chatbot uses a **local RAG + LLM pipeline** (ChromaDB + Llama 3.2 3B Instruct via llama-cpp-python) — fully offline, no API keys required. Tests that require the FastAPI bot server (port 8001) skip gracefully when it's not running.

**Toggle behaviour (3 tests)**
- ✅ Floating toggle button visible on page load with "Chat with AI" text
- ✅ Panel opens on click (header, subtitle visible; toggle becomes aria-hidden)
- ✅ Panel closes via close button (toggle reappears)

**Welcome message & suggested questions (2 tests)**
- ✅ Welcome message displayed on open
- ✅ 4 suggested questions visible (skills, cloud experience, certifications, booking)

**Sending messages (4 tests)**
- ✅ Typed message sent and local LLM response received
- ✅ Suggested question click sends message and gets response
- ✅ Enter key sends message
- ✅ Empty messages cannot be sent (Send button disabled)

**Streaming UI (1 test)**
- ✅ Input disabled and loading indicator shown during LLM inference

**Booking flow (1 test)**
- ✅ Booking intent triggers either BookingCard or text response

**Accessibility (2 tests)**
- ✅ Toggle and close buttons have proper aria-labels
- ✅ Input auto-focused when chat opens

---

### Feature Tests

#### `playwright-tests/accessibility.spec.ts`

- ✅ WCAG 2.1 AA compliance on all pages
- ✅ Keyboard-only navigation
- ✅ Screen reader ARIA labels
- ✅ Color contrast ratios
- ✅ Focus indicators visible

#### `playwright-tests/performance-monitoring.spec.ts`

- ✅ Performance dashboard renders
- ✅ Metrics display (memory, CPU, network)
- ✅ Run tests button triggers benchmark
- ✅ JSON report download
- ✅ Lighthouse scores displayed

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
| Agents (/agents)           | `agents.spec.ts`, `ai-agents.spec.ts`                                      | ✅ Covered |
| Settings (/settings)       | `settings-page.spec.ts`, `app.spec.ts`                                     | ✅ Covered |
| Performance (/performance) | `performance-monitoring.spec.ts`, `app.spec.ts`                            | ✅ Covered |
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
