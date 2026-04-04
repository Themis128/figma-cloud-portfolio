# 🔌 Integrations Guide

**Last Updated**: 2026-03-10
**Project**: Baltzakis Portfolio
**Status**: ✅ All integrations active and documented

---

## 📋 Table of Contents

1. [External Services & APIs](#external-services--apis)
2. [AI & Machine Learning](#ai--machine-learning)
3. [Testing & Quality Assurance](#testing--quality-assurance)
4. [Error Tracking & Monitoring](#error-tracking--monitoring)
5. [Authentication & Security](#authentication--security)
6. [Analytics & Metrics](#analytics--metrics)
7. [Real-time Features](#real-time-features)
8. [Development Tools](#development-tools)
9. [UI & Components](#ui--components)
10. [Performance & Optimization](#performance--optimization)
11. [CI/CD & Deployment](#cicd--deployment)
12. [Configuration Summary](#configuration-summary)

---

## 🌐 External Services & APIs

### Firebase (v12.10.0)

**Purpose**: Authentication (admin panel)
**Files**: `src/lib/firebase.ts`, `src/components/admin/useAdminAuth.ts`

**Features**:

- Email/password authentication for the admin panel (`/admin`)

**Auth Initialization (Mar 2026)**: Uses `initializeAuth()` with explicit `browserLocalPersistence` and `browserPopupRedirectResolver` instead of `getAuth()` to avoid the `_getRecaptchaConfig is not a function` error in Firebase v12+ (which enforces reCAPTCHA for email/password sign-in by default).

**Configuration**:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Setup**:

1. Create Firebase project: https://console.firebase.google.com/
2. Add configuration to `.env`

---

### Google Analytics 4 (react-ga4 v2.1.0)

**Purpose**: Website analytics and user behavior tracking
**Files**: `src/components/GoogleAnalytics.tsx`

**Features**:

- Core Web Vitals tracking (CLS, INP, FCP, LCP, TTFB)
- Bundle loading performance metrics
- Resource performance monitoring
- Custom event tracking:
  - Page views
  - Contact form submissions
  - Resume downloads
  - Error tracking
- Supports both GA4 and legacy ReactGA APIs
- Interactive engagement events (added Mar 2026):
  - `theme_toggle` — theme switch (light/dark/system)
  - `quiz_complete` — CyberQuiz completion with score
  - `testimonial_view` — testimonial carousel navigation
  - `share` — social share (X, LinkedIn, copy link)
  - `blog_filter` — blog search/tag filter usage
  - `toc_click` — table of contents heading click
  - `command_select` — command palette selection

**Configuration**:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Setup**:

1. Create GA4 property: https://analytics.google.com/
2. Get Measurement ID from Admin → Data Streams
3. Add to `.env` file

**Custom Events**:

```typescript
// Track page view
trackPageView(path);

// Track custom event
trackEvent("category", "action", "label", value);
```

---

### Google reCAPTCHA v3 (v1.11.0)

**Purpose**: Bot protection for contact form
**Files**: `src/app/contact/page.tsx`, Lambda-based backend

**Features**:

- Invisible CAPTCHA integration
- Score-based validation (threshold: 0.5)
- Server-side verification
- Fallback to test keys in development

**Configuration**:

```env
# Client-side (public)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key

# Server-side (private)
RECAPTCHA_SECRET_KEY=your_secret_key
```

**Setup**:

1. Register site: https://www.google.com/recaptcha/admin
2. Choose reCAPTCHA v3
3. Add your domains
4. Get site key (public) and secret key (private)

**Production Keys**: Real reCAPTCHA v3 keys registered for `baltzakisthemis.com` are used in production.

**Test Keys** (for development only):

- Site key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

---

### GitHub API Integration

**Purpose**: Public profile stats and repository data for portfolio display and admin monitoring
**Files**: `server/routes/github.ts` (Lambda)

**Endpoints**:

- `GET /api/github/stats`: Profile statistics (repos, stars, followers, bio)
- `GET /api/github/repos`: Public repositories (paginated, with topics/languages)

**Features**:

- Live GitHub profile data (auto-updates without redeploy)
- Repository listing with stars, forks, languages, and topics
- Authenticated requests (5,000 req/hr vs 60 unauthenticated)
- Used by admin Deploy tab (GitHub Activity card) and Health tab monitoring

**Configuration**:

```env
GITHUB_TOKEN=ghp_your_fine_grained_pat    # No repo access needed (public read only)
GITHUB_USERNAME=Themis128                  # GitHub username
```

**Required Scopes**: None. Fine-grained PAT with default permissions (public read only)

**Setup**:

1. Generate fine-grained token: https://github.com/settings/tokens?type=beta
2. Select required scopes
3. Add to `.env` file
4. **Never commit token to git**

**API Endpoints**:

- `GET /api/github/workflows/:repo` - Get workflows
- `GET /api/github/runs/:workflow_id` - Get workflow runs
- `GET /api/github/jobs/:run_id` - Get job details

---

## 🤖 AI & Machine Learning

### Anthropic Claude (v0.72.1)

**Purpose**: AI-powered chat and agent workflows
**Files**: Lambda-based backend, `src/components/AIAssistant.tsx`

**Features**:

- Direct Claude API integration
- Agent workflow execution (claude-3-5-haiku-20241022)
- Token usage tracking
- System prompts for context-aware responses
- Streaming responses

**Configuration**:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
```

**Models Available**:

- `claude-3-opus-20240229` (Most capable)
- `claude-3-sonnet-20240229` (Balanced)
- `claude-3-5-haiku-20241022` (Fast and cost-effective)

**Setup**:

1. Create account: https://console.anthropic.com/
2. Generate API key
3. Add to `.env` file

**Usage**:

```typescript
const response = await anthropic.messages.create({
  model: "claude-3-5-haiku-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});
```

---

### Multi-Provider AI Service

**Purpose**: Unified AI interface supporting multiple providers
**Files**: `src/lib/aiService.ts`

**Supported Providers**:

#### 1. OpenAI

**Models**:

- `gpt-4` - Most capable
- `gpt-4o-mini` - Fast, affordable
- `gpt-3.5-turbo` - Legacy support

**Configuration**:

```env
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_key_here
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini
```

#### 2. Together AI

**Models**:

- Meta Llama 2 variants
- Mistral models
- Open-source LLMs

**Configuration**:

```env
NEXT_PUBLIC_AI_PROVIDER=together
NEXT_PUBLIC_TOGETHER_API_KEY=your_together_api_key
```

#### 3. Ollama (Local LLMs) — Deprecated

> **Note:** Local LLM support has been removed. The chatbot now uses AWS Bedrock (Claude 3.5 Haiku).

```bash
# Pull a model
ollama pull llama2

# Start Ollama server
ollama serve
```

**Features**:

- Automatic provider switching
- Fallback responses on error
- Model-agnostic architecture
- Consistent API across providers

---

### AI Components

**Files**:

- `src/components/AIAssistant.tsx` - Chat interface
- `src/components/AIBrain.tsx` - AI logic components
- `src/components/agents/AgentBuilder.tsx` - Agent creation
- `src/components/agents/` - Agent templates

**Features**:

- Interactive chat UI
- Agent workflow builder
- Template library
- Real-time responses
- Context management

---

## 🧪 Testing & Quality Assurance

### Playwright (v1.58.0)

**Purpose**: End-to-end testing
**Files**: Multiple `playwright.config.*.ts` files, `/playwright-tests/*`

**Configurations**:

1. **playwright.config.ts** (Main)
   - 3-minute timeout per test
   - 5 retries on failure
   - Full browser coverage (Chromium, Firefox, WebKit)
   - Mobile device testing

2. **playwright.config.ci.ts** (CI/CD Optimized)
   - Faster timeouts
   - Reporter: HTML + JSON
   - Headless mode only

3. **playwright.config.shared.ts** (Shared Config)
   - Common settings across environments
   - Reusable configuration

4. **playwright.config.fast.ts** (Rapid Testing)
   - Minimal browser coverage
   - Shorter timeouts
   - Development use

**Test Suites**:

- `3d-demos.spec.ts` - Three.js integration tests
- `accessibility.spec.ts` - WCAG compliance
- `agents.spec.ts` - AI agent functionality
- `analytics-integration.spec.ts` - Analytics tracking
- `api-integration.spec.ts` - Backend API tests
- `app.spec.ts` - Core application tests
- `code-quality.spec.ts` - Code standards
- `performance-monitoring.spec.ts` - Performance tests
- `projects.spec.ts` - Portfolio projects
- `pwa-advanced.spec.ts` - PWA functionality
- `security-privacy.spec.ts` - Security tests
- `seo.spec.ts` - SEO validation

**Running Tests**:

```bash
# Run all tests
pnpm test:e2e

# Run specific test
pnpm test:e2e tests/app.spec.ts

# Run with UI
pnpm test:e2e:ui

# Run in CI mode
pnpm test:e2e:ci

# Fast mode (development)
pnpm test:e2e:fast

# Continuous testing
pnpm test:e2e:continuous
```

---

### Vitest (v4.0.18)

**Purpose**: Unit and component testing
**Files**: `/vitest-setup.ts`, `/tests/*`

**Features**:

- Fast test execution with hot module reload
- Coverage reporting with v8
- TypeScript support
- React component testing

**Test Files**:

- `/tests/components/navigation.spec.tsx`
- `/tests/pages/about.spec.tsx`
- `/tests/pages/resume.spec.tsx`
- `/tests/hooks.spec.ts`

**Running Tests**:

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:unit --watch
```

**Configuration**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

---

### Testing Libraries

**Packages**:

- `@testing-library/react` (v16.3.2) - React testing utilities
- `@testing-library/jest-dom` (v6.9.1) - DOM matchers
- `@testing-library/user-event` (v14.6.1) - User interaction simulation
- `jsdom` (v27.4.0) - DOM implementation

**Best Practices**:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## 📊 Error Tracking & Monitoring

### Sentry

**Purpose**: Error tracking, performance monitoring, and session replay
**Project**: `javascript-nextjs` on `baltzakisthemiscom` org (DE region)

**Files**:

- `sentry.client.config.ts`: Client-side Sentry initialization (auto-loaded by `@sentry/nextjs`)
- `instrumentation.ts`: Next.js instrumentation hook for server-side Sentry (dev only)
- `src/lib/sentry.ts`: Consent-aware enable/disable + helper functions
- `src/components/SentryInit.tsx`: Client component that sets up consent listener
- `next.config.ts`: Wrapped with `withSentryConfig` (webpack plugins disabled for static export)

**Package**: `@sentry/nextjs` (v10.43.0)

**Features**:

- `browserTracingIntegration` with INP tracking (`enableInp: true`)
- Session Replay (10% production, 100% dev; 100% on error)
- GDPR-compliant consent-based enable/disable (not init/no-init)
- Custom error filtering (network errors, chunk load failures, script errors)
- `replayIntegration` imported from `@sentry/browser` (the `lazyLoadIntegration` API was removed in Sentry v10)
- `allowUrls` filter for `baltzakisthemis.com` and `localhost`
- 100% trace sampling (low-traffic site ~127 txns/week)
- Performance helpers: `measurePerformance`, `reportError`, `trackPageView`, `trackInteraction`
- User context: `setUser`, `setTag`, `setContext`

**Configuration**:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your_key@o123456.ingest.de.sentry.io/123456
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Architecture**:

1. `sentry.client.config.ts` runs at page load. Initializes Sentry with full config
2. `SentryInit` component (in layout) calls `setupSentryConsentListener()`. Checks localStorage for analytics consent and enables/disables accordingly
3. When consent changes, a `consent-updated` CustomEvent toggles `client.getOptions().enabled`
4. Static export: `withSentryConfig` wraps `next.config.ts` with all webpack/server plugins disabled

**Custom Error Filtering**:

```typescript
beforeSend(event, hint) {
  const message = String(error.message).toLowerCase();
  if (message.includes("network error") || message.includes("failed to fetch") ||
      message.includes("load chunk") || message.includes("script error")) {
    return null;
  }
  return event;
}
```

---

## 🔐 Authentication & Security

### AWS Amplify Configuration

**Purpose**: AWS Amplify client configuration for authentication and API access
**Files**: `src/lib/amplifyConfig.ts`, `src/hooks/useAmplifyAuth.ts`

**Features**:

- AWS Cognito User Pool authentication
- Identity Pool for AWS resource access
- REST API (API Gateway) configuration
- GraphQL API configuration
- DataStore sync configuration

**Configuration**:

```typescript
// src/lib/amplifyConfig.ts
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

const config = {
  Auth: {
    Cognito: {
      userPoolId: outputs.auth?.user_pool_id,
      userPoolClientId: outputs.auth?.user_pool_client_id,
      identityPoolId: outputs.auth?.identity_pool_id,
      signUpVerificationMethod: "link",
      loginWith: { email: true },
    },
  },
  API: {
    REST: { api: { endpoint: outputs.api?.url } },
    GraphQL: { endpoint: outputs.data?.url, defaultAuthMode: "userPool" },
  },
};
```

**Usage**:

```typescript
import { initializeAmplify, isAmplifyConfigured } from "./lib/amplifyConfig";

// Initialize on app startup
initializeAmplify();

// Check if configured
if (isAmplifyConfigured()) {
  // Use Amplify features
}
```

**Setup**:

1. Deploy Amplify backend: `amplify sandbox`
2. This generates `amplify_outputs.json`
3. Configuration is auto-loaded from outputs file

---

### Web Security Headers

**Files**: `next.config.ts` (headers configuration)

**Implemented Headers**:

- **CSP** (Content Security Policy)
  - Allowlists: Google Analytics, reCAPTCHA, Google Fonts, Typekit
  - Script sources with nonces
  - Style sources with unsafe-inline (required for styled-components)
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **HSTS** (production only): max-age=31536000; includeSubDomains

**Configuration**:

```typescript
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    ...
  `,
  );
  next();
});
```

---

### Contact Form Security

**Files**: Lambda-based backend

**Security Measures**:

- XSS/SQL injection pattern detection
- HTML entity sanitization
- reCAPTCHA v3 score validation (threshold: 0.5)
- Input length limits (10,000 chars)
- Email format validation
- Rate limiting per IP

**Validation Rules**:

```typescript
// XSS patterns blocked
const xssPatterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

// SQL injection patterns blocked
const sqlPatterns = [/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi];
```

---

### Secrets Management

**Files**: `/scripts/load-secrets.ps1`, `/scripts/run-with-secrets.js`

**Features**:

- AWS Secrets Manager integration
- PowerShell profile for local secrets
- Environment variable isolation
- Git-ignored `.env` files
- Automatic secret loading on app start

**Configuration**:

```env
# AWS Secrets Manager
AWS_SECRETS_MANAGER_ID=portfolio/env
AWS_REGION=us-east-1
```

**Commands**:

```bash
# Load secrets and run command
node scripts/run-with-secrets.js pnpm dev

# Interactive setup
.\scripts\setup-env-vars.ps1 -Interactive
```

**Documentation**: See `SECRETS_MANAGEMENT.md` for complete guide

---

## 📈 Analytics & Metrics

### Custom Analytics Endpoint

**Files**: Lambda-based backend

**Features**:

- Backend analytics tracking
- Custom event logging
- Page view tracking
- Error tracking
- Performance metrics
- Web Vitals integration

**API Endpoints**:

```typescript
POST /api/analytics/event
{
  "category": "user_action",
  "action": "button_click",
  "label": "download_resume",
  "value": 1
}

POST /api/analytics/pageview
{
  "path": "/projects",
  "title": "Projects Page"
}
```

---

### Web Vitals Tracking (v5.1.0)

**Purpose**: Core Web Vitals monitoring

**Metrics Tracked**:

- **CLS** (Cumulative Layout Shift)
- **INP** (Interaction to Next Paint)
- **FCP** (First Contentful Paint)
- **LCP** (Largest Contentful Paint)
- **TTFB** (Time to First Byte)

**Integration**:

```typescript
import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";

onCLS((metric) => trackEvent("Web Vitals", "CLS", metric.value));
onLCP((metric) => trackEvent("Web Vitals", "LCP", metric.value));
```

---

## 🔔 Real-time Features

### Socket.IO (v4.8.3)

**Purpose**: Real-time bidirectional communication

**Features**:

- Presence tracking
- Typing indicators
- Agent collaboration
- Real-time updates
- Room/namespace support

**Client Usage**:

```typescript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected");
});

socket.emit("message", { text: "Hello" });
```

**Server Events**:

- `connection` - New client connected
- `disconnect` - Client disconnected
- `message` - Client message received
- Custom events as needed

---

## 🛠️ Development Tools

### Biome (v2.3.12)

**Purpose**: Fast linting and formatting
**Files**: `/biome.json`

**Features**:

- Unified linting + formatting
- Replaces ESLint + Prettier
- 10-100x faster than alternatives
- TypeScript-first design

**Rules Enabled**:

- Accessibility (a11y)
- Security
- Correctness
- Performance
- Complexity

**Commands**:

```bash
# Check code
pnpm lint

# Fix issues
pnpm lint:fix

# Format code
pnpm format

# Format and write
pnpm format:fix
```

**Configuration**:

```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": { "recommended": true },
      "security": { "recommended": true }
    }
  }
}
```

---

### Codacy Integration

**Purpose**: Automated code quality analysis

**Features**:

- Real-time code analysis
- Security vulnerability scanning
- Test coverage visualization
- AI code validation (Guardrails)
- PR quality checks

**Configuration**:

```env
CODACY_API_TOKEN=your_api_token
CODACY_PROJECT_TOKEN=your_project_token
CODACY_ORGANIZATION_PROVIDER=gh
CODACY_USERNAME=Themis128
CODACY_PROJECT_NAME=figma-cloud-portfolio
```

**Scripts**:

```bash
# Upload coverage
pnpm coverage:upload

# Run quality checks
pnpm quality
```

**Setup**:

1. Visit https://app.codacy.com/
2. Add repository
3. Get tokens from Settings → Integrations
4. Add to `.env` file

---

### MCP (Model Context Protocol)

**Package**: `@agentdeskai/browser-tools-mcp` (v1.2.1)
**Purpose**: AI agent browser automation

**Features**:

- Browser automation for AI agents
- Page interaction
- Form filling
- Screenshot capture
- Navigation control

---

## 🎨 UI & Components

### Radix UI (v1.x - v2.x)

**Purpose**: Headless accessible component primitives

**Components Included**:

- Accordion, Alert Dialog, Avatar
- Checkbox, Radio Group, Switch, Toggle
- Dialog, Dropdown Menu, Context Menu, Menubar
- Popover, Tooltip, Hover Card
- Tabs, Navigation Menu, Collapsible
- Select, Combobox, Slider
- Toast, Progress, Scroll Area
- Label, Separator, Aspect Ratio

**Usage**:

```typescript
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
    <Dialog.Description>Description</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>
```

---

### Additional UI Libraries

**Icons**: Lucide React (v0.539.0)

```typescript
import { Home, User, Mail } from "lucide-react";
```

**Animations**: Framer Motion (v12.29.0)

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
/>
```

**Toasts**: Sonner (v2.0.7)

```typescript
import { toast } from "sonner";
toast.success("Success!");
```

**Carousels**: Embla Carousel (v8.6.0)
**Charts**: Recharts (v2.15.4)
**Date Picker**: React Day Picker (v9.13.0)

---

## ⚡ Performance & Optimization

### Image Optimization

**Packages**:

- `next/image` (built-in Next.js Image component)
- `sharp` (v0.34.5)

**Configuration**:

```typescript
imageOptimizer({
  png: { quality: 80 },
  jpg: { quality: 80 },
  webp: { quality: 80, effort: 6 },
  avif: { quality: 70, effort: 6 },
});
```

**Supported Formats**:

- WebP (best compression)
- AVIF (next-gen)
- JPEG (legacy)
- PNG (lossless)

---

### Bundle Analysis

**Package**: `rollup-plugin-visualizer` (v5.14.0)

**Usage**:

```bash
pnpm build:analyze
```

Opens visual bundle analysis showing:

- Module sizes
- Dependencies
- Tree-map visualization
- Optimization opportunities

---

### PWA (Progressive Web App)

**Implementation**: Native service worker + `public/manifest.json`

**Features**:

- Service worker with offline caching (`public/sw.js`)
- Web App Manifest (`public/manifest.json`)
- PWA update notification component
- Offline support
- SPA navigation fallback
- App installation prompts

**Hook**: `src/hooks/usePWA.ts`

```typescript
const { isInstallable, install, isInstalled } = usePWA();
```

---

### Lazy Loading

**Package**: `react-intersection-observer` (v10.0.2)

**Usage**:

```typescript
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: true
});

<div ref={ref}>
  {inView && <HeavyComponent />}
</div>
```

---

## 🚀 CI/CD & Deployment

### AWS Amplify

**Package**: `@aws-amplify/backend` (v1.20.0)

**Configuration**: `amplify.yml`

**Features**:

- Multi-stage builds (frontend/backend separation)
- Environment-specific configs
- Automated deployments
- Lambda function hosting

**Environment Variables Required**:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AMPLIFY_PRODUCTION_APP_ID=your_production_app_id
AMPLIFY_STAGING_APP_ID=your_staging_app_id
```

**Lambda Function URLs**:

```env
NEXT_PUBLIC_LAMBDA_CONTACT_URL=https://your-contact-function.amazonaws.com
NEXT_PUBLIC_LAMBDA_RESUME_URL=https://your-resume-function.amazonaws.com
NEXT_PUBLIC_LAMBDA_PING_URL=https://your-ping-function.amazonaws.com
NEXT_PUBLIC_LAMBDA_DEMO_URL=https://your-demo-function.amazonaws.com
```

---

### GitHub Workflows

**Files**:

- `.github/workflows/deploy-production.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/playwright.yml`

**Features**:

- Automated deployments on push
- E2E test execution
- Code quality checks
- Coverage reporting

**Environment Branches**:

- `production` → Production deployment
- `develop` → Staging deployment
- Feature branches → PR checks only

---

### AWS Secrets Manager

**Purpose**: Centralized secrets storage for production

**Configuration**:

```env
AWS_SECRETS_MANAGER_ID=portfolio/env
AWS_REGION=us-east-1
```

**Create Secret**:

```bash
aws secretsmanager create-secret \
  --name portfolio/env \
  --secret-string '{
    "NEXT_PUBLIC_FIREBASE_API_KEY":"your_key",
    "GITHUB_TOKEN":"your_token",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY":"your_key"
  }'
```

**Usage in Application**:

```bash
# Scripts automatically load from AWS Secrets Manager
pnpm dev    # Wrapped with secrets loader
pnpm build  # Wrapped with secrets loader
```

---

## ⚙️ Configuration Summary

### Required for Development

```env
# Core
NODE_ENV=development

# Firebase (for admin auth)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# reCAPTCHA (for contact form)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=

# GitHub API (optional)
GITHUB_TOKEN=
```

### Optional Integrations

```env
# AI Providers (choose one)
ANTHROPIC_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_TOGETHER_API_KEY=
NEXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434/v1

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ACCESS_TOKEN=

# Code Quality
CODACY_API_TOKEN=
CODACY_PROJECT_TOKEN=

# Design Tools
FIGMA_API_KEY=
FIGMA_FILE_KEY=

# AWS (for production)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_SECRETS_MANAGER_ID=portfolio/env
```

### Production Only

```env
# Lambda Functions
NEXT_PUBLIC_LAMBDA_CONTACT_URL=
NEXT_PUBLIC_LAMBDA_RESUME_URL=
NEXT_PUBLIC_LAMBDA_PING_URL=
NEXT_PUBLIC_LAMBDA_DEMO_URL=

# Amplify
AMPLIFY_PRODUCTION_APP_ID=
AMPLIFY_STAGING_APP_ID=
```

---

## 📚 Related Documentation

- **Security**: `SECURITY_SUMMARY.md`, `TOKEN_ROTATION_CHECKLIST.md`
- **Secrets**: `SECRETS_MANAGEMENT.md`, `MCP_SECURE_CONFIG.md`
- **Deployment**: `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_MONITOR_README.md`
- **Testing**: `PLAYWRIGHT_CONFIG_README.md`
- **Setup**: `README.md`, `GITHUB_SECRETS_SETUP.md`

---

## 🔄 Maintenance & Updates

### Regular Tasks

**Weekly**:

- Review Sentry error reports
- Check analytics for anomalies
- Monitor Core Web Vitals

**Monthly**:

- Update dependencies: `pnpm update`
- Review and rotate access tokens
- Audit security scans
- Check CI/CD pipeline health

**Quarterly**:

- Rotate all API tokens
- Review integration costs
- Update documentation
- Audit integrations (remove unused)

### Monitoring Integration Health

**Sentry** (errors):

- Dashboard: https://sentry.io/
- Alert threshold: >10 errors/hour

**Google Analytics** (traffic):

- Dashboard: https://analytics.google.com/
- Check daily active users

**GitHub Actions** (CI/CD):

- Workflows: https://github.com/Themis128/figma-cloud-portfolio/actions
- Alert on failed deployments

**Codacy** (code quality):

- Dashboard: https://app.codacy.com/
- Maintain grade A or B

---

## 🆘 Troubleshooting

### Integration Not Working

1. **Check environment variables**:

   ```bash
   # View all env vars
   printenv | grep NEXT_PUBLIC_
   ```

2. **Verify API keys are valid**:
   - Check expiration dates
   - Verify scopes/permissions
   - Test with curl or Postman

3. **Review error logs**:
   - Browser console (client-side)
   - Server logs (backend)
   - Sentry dashboard

4. **Check service status**:
   - Firebase: https://status.firebase.google.com/
   - GitHub: https://www.githubstatus.com/
   - AWS: https://status.aws.amazon.com/

### Common Issues

**Firebase not initializing**:

- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check Firebase console for project status
- Ensure domain is allowlisted

**Firebase `_getRecaptchaConfig` error**:

- This occurs in Firebase v12+ when email/password auth uses `getAuth()` which auto-configures reCAPTCHA
- Fix: `src/lib/firebase.ts` uses `initializeAuth()` with explicit persistence/resolver dependencies
- Alternative: Disable "Email Enumeration Protection" in Firebase Console → Authentication → Settings

**reCAPTCHA failing**:

- Verify site key matches domain
- Check secret key on server
- Test score threshold (default: 0.5)

**GitHub API rate limited**:

- Check `X-RateLimit-Remaining` header
- Increase cache TTL
- Use authenticated requests

**AI providers timing out**:

- Check API key validity
- Verify network connectivity
- Try different model (e.g., haiku instead of opus)

---

## 📞 Support

**Project Repository**: https://github.com/Themis128/figma-cloud-portfolio

**Service Support**:

- Firebase: https://firebase.google.com/support
- Google Analytics: https://support.google.com/analytics
- GitHub: https://support.github.com/
- AWS: https://aws.amazon.com/support/
- Sentry: https://sentry.io/support/
- Anthropic: https://support.anthropic.com/

---

**Last Updated**: 2026-03-31
**Version**: 1.3.0
**Maintainer**: Themistoklis Baltzakis

## 🆕 Latest Updates - February 22, 2026

### **Major New Features & Components**

#### **✅ New UI Components**

- **CookieConsentBar**: GDPR-compliant cookie consent banner with accept/decline options
- **ThemeToggleButton**: Compact theme toggle button with sun/moon icons and smooth transitions
- **AccessibilityButton**: Quick access accessibility settings button
- **SkillsMatrix**: Skills visualization grid for the About page
- **Timeline**: Career timeline component for the About page
- **ContactForm**: Reusable contact form with validation
- **ProjectShowcase**: Project gallery display component

#### **✅ AI-Powered Playwright Autofix System**

- **Lambda Function**: Deploy Playwright autofix as AWS Lambda for cloud-based analysis
- **Local Server Route**: Built-in Express endpoint for local development
- **Offline Mode**: Built-in analysis without external dependencies
- **Real-time Configuration**: Dynamic configuration updates without redeployment
- **Intelligent Suggestions**: AI-powered test failure analysis with confidence scores

#### **✅ Enhanced Test Coverage**

- **theme-provider.integration.spec.ts**: Theme provider integration tests
- **cookie-consent.spec.ts**: Cookie consent bar tests
- **accessibility-button.spec.ts**: Accessibility button tests
- **pwa-update-notification.spec.ts**: PWA update notification tests
- **performance-monitoring.spec.ts**: Performance monitoring tests

#### **✅ New API Endpoints**

- `GET /api/playwright-autofix/config` - Get Playwright autofix configuration
- `POST /api/playwright-autofix/config` - Update Playwright autofix configuration
- `POST /api/playwright-autofix/analyze` - Analyze test failure and get AI suggestions
- `GET /api/playwright-autofix/patterns` - Get common error patterns for autofix
- `GET /api/playwright-autofix/health` - Health check for autofix service
