# 🔌 Integrations Guide

**Last Updated**: 2026-02-01
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
7. [Push Notifications & Real-time](#push-notifications--real-time)
8. [Development Tools](#development-tools)
9. [UI & Components](#ui--components)
10. [Performance & Optimization](#performance--optimization)
11. [CI/CD & Deployment](#cicd--deployment)
12. [Configuration Summary](#configuration-summary)

---

## 🌐 External Services & APIs

### Firebase (v12.8.0)

**Purpose**: Cloud Messaging & Push Notifications
**Files**: `/client/lib/firebase.ts`, `/client/hooks/usePushNotifications.ts`

**Features**:

- FCM token generation and management
- Foreground message handling
- Cloud messaging integration
- VAPID key authentication

**Configuration**:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

**Setup**:

1. Create Firebase project: https://console.firebase.google.com/
2. Enable Cloud Messaging in project settings
3. Generate VAPID key for web push
4. Add configuration to `.env`

**Documentation**: [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

---

### Google Analytics 4 (react-ga4 v2.1.0)

**Purpose**: Website analytics and user behavior tracking
**Files**: `/client/components/GoogleAnalytics.tsx`

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

**Configuration**:

```env
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
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
**Files**: `/client/pages/Contact.tsx`, `/server/routes/contact.ts`

**Features**:

- Invisible CAPTCHA integration
- Score-based validation (threshold: 0.5)
- Server-side verification
- Fallback to test keys in development

**Configuration**:

```env
# Client-side (public)
VITE_RECAPTCHA_SITE_KEY=your_site_key
VITE_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key

# Server-side (private)
RECAPTCHA_SECRET_KEY=your_secret_key
VITE_RECAPTCHA_SECRET_KEY=your_secret_key
```

**Setup**:

1. Register site: https://www.google.com/recaptcha/admin
2. Choose reCAPTCHA v3
3. Add your domains
4. Get site key (public) and secret key (private)

**Test Keys** (for development):

- Site key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

---

### GitHub API Integration

**Purpose**: Workflow monitoring and deployment status
**Files**: `/server/routes/github.ts`

**Features**:

- GitHub workflow retrieval
- Deployment run status tracking
- Job details fetching
- Token validation
- LRU caching with TTL (15 seconds)
- Rate limiting (120 requests/60 minutes per IP)
- Metrics tracking (cache hits/misses)

**Configuration**:

```env
GITHUB_TOKEN=ghp_your_personal_access_token
VITE_GITHUB_TOKEN=ghp_your_personal_access_token
```

**Required Scopes**:

- `repo` (full control of private repositories)
- `workflow` (update GitHub Actions workflows)
- `read:user` (read user profile data)

**Setup**:

1. Generate token: https://github.com/settings/tokens
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
**Files**: `/server/routes/ai.ts`, `/client/components/AIAssistant.tsx`

**Features**:

- Direct Claude API integration
- Agent workflow execution (claude-3-haiku-20240307)
- Token usage tracking
- System prompts for context-aware responses
- Streaming responses

**Configuration**:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
```

**Models Available**:

- `claude-3-opus-20240229` (Most capable)
- `claude-3-sonnet-20240229` (Balanced)
- `claude-3-haiku-20240307` (Fast and cost-effective)

**Setup**:

1. Create account: https://console.anthropic.com/
2. Generate API key
3. Add to `.env` file

**Usage**:

```typescript
const response = await anthropic.messages.create({
  model: "claude-3-haiku-20240307",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello" }],
});
```

---

### Multi-Provider AI Service

**Purpose**: Unified AI interface supporting multiple providers
**Files**: `/client/lib/aiService.ts`

**Supported Providers**:

#### 1. OpenAI

**Models**:

- `gpt-4` - Most capable
- `gpt-4o-mini` - Fast, affordable
- `gpt-3.5-turbo` - Legacy support

**Configuration**:

```env
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-your_openai_key_here
VITE_AI_MODEL=gpt-4o-mini
```

#### 2. Together AI

**Models**:

- Meta Llama 2 variants
- Mistral models
- Open-source LLMs

**Configuration**:

```env
VITE_AI_PROVIDER=together
VITE_TOGETHER_API_KEY=your_together_api_key
```

#### 3. Ollama (Local LLMs)

**Models**:

- llama2
- codellama
- mistral
- Any Ollama-supported model

**Configuration**:

```env
VITE_AI_PROVIDER=ollama
VITE_OLLAMA_BASE_URL=http://localhost:11434/v1
VITE_AI_MODEL=llama2
```

**Setup Ollama**:

```bash
# Install Ollama
# Download from: https://ollama.ai/

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

- `/client/components/AIAssistant.tsx` - Chat interface
- `/client/components/AIBrain.tsx` - AI logic components
- `/client/components/agents/AgentBuilder.tsx` - Agent creation
- `/client/components/agents/` - Agent templates

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

### Vitest (v3.2.4)

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

**Purpose**: Error tracking and performance monitoring
**Files**: `/server/sentry.ts`

**Packages**:

- `@sentry/node` (v10.36.0) - Backend
- `@sentry/react` (v10.36.0) - Frontend
- `@sentry/tracing` (v7.120.4) - Performance

**Features**:

- HTTP request tracking
- Performance monitoring:
  - 10% trace rate (production)
  - 100% trace rate (development)
- Custom error filtering
- API request breadcrumbs
- Database operation tracking
- User context and identification
- Release tracking

**Configuration**:

```env
# Client-side
VITE_SENTRY_DSN=https://your_key@o123456.ingest.sentry.io/123456

# Server-side
SENTRY_DSN=https://your_key@o123456.ingest.sentry.io/123456

# API access
SENTRY_ACCESS_TOKEN=sntrys_your_token_here
SENTRY_ORG_SLUG=your_org_name

# Release tracking
VITE_APP_VERSION=1.0.0
```

**Setup**:

1. Create project: https://sentry.io/
2. Get DSN from project settings
3. Add to `.env` file
4. Initialize in application

**Custom Error Filtering**:

```typescript
beforeSend(event, hint) {
  // Suppress non-actionable errors
  if (event.message?.includes('ECONNRESET')) {
    return null;
  }
  return event;
}
```

---

## 🔐 Authentication & Security

### AWS Amplify Configuration

**Purpose**: AWS Amplify client configuration for authentication and API access
**Files**: `/client/lib/amplifyConfig.ts`, `/client/hooks/useAmplifyAuth.ts`

**Features**:

- AWS Cognito User Pool authentication
- Identity Pool for AWS resource access
- REST API (API Gateway) configuration
- GraphQL API configuration
- DataStore sync configuration

**Configuration**:

```typescript
// client/lib/amplifyConfig.ts
import { Amplify } from 'aws-amplify'
import outputs from '../../amplify_outputs.json'

const config = {
  Auth: {
    Cognito: {
      userPoolId: outputs.auth?.user_pool_id,
      userPoolClientId: outputs.auth?.user_pool_client_id,
      identityPoolId: outputs.auth?.identity_pool_id,
      signUpVerificationMethod: 'link',
      loginWith: { email: true },
    },
  },
  API: {
    REST: { api: { endpoint: outputs.api?.url } },
    GraphQL: { endpoint: outputs.data?.url, defaultAuthMode: 'userPool' },
  },
}
```

**Usage**:

```typescript
import { initializeAmplify, isAmplifyConfigured } from './lib/amplifyConfig'

// Initialize on app startup
initializeAmplify()

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

**Files**: `/server/index.ts`

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

**Files**: `/server/routes/contact.ts`

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

**Files**: `/server/routes/analytics.ts`

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

## 🔔 Push Notifications & Real-time

### Web Push API (v3.6.7)

**Purpose**: Server-side push notifications
**Files**: `/server/routes/push-notifications.ts`

**Features**:

- VAPID key management
- Subscription storage (in-memory)
- Push message sending
- Subscription lifecycle (subscribe/unsubscribe)

**Configuration**:

```env
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

**API Endpoints**:

```bash
# Subscribe to push notifications
POST /api/push/subscribe
{
  "subscription": {
    "endpoint": "https://...",
    "keys": { "p256dh": "...", "auth": "..." }
  }
}

# Send push notification
POST /api/push/send
{
  "title": "Hello",
  "body": "World",
  "icon": "/logo.png"
}

# Unsubscribe
POST /api/push/unsubscribe
{
  "endpoint": "https://..."
}
```

---

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

**Toasts**: Sonner (v1.7.4)

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

- `vite-plugin-image-optimizer` (v1.1.9)
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

**Package**: `vite-plugin-pwa` (v1.2.0)

**Features**:

- Auto-update service workers
- Manifest generation
- Workbox integration
- Offline support
- SPA navigation fallback
- App installation prompts

**Hook**: `/client/hooks/usePWA.ts`

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
VITE_LAMBDA_CONTACT_URL=https://your-contact-function.amazonaws.com
VITE_LAMBDA_RESUME_URL=https://your-resume-function.amazonaws.com
VITE_LAMBDA_PUSH_NOTIFICATIONS_URL=https://your-push-function.amazonaws.com
VITE_LAMBDA_PING_URL=https://your-ping-function.amazonaws.com
VITE_LAMBDA_DEMO_URL=https://your-demo-function.amazonaws.com
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
    "VITE_FIREBASE_API_KEY":"your_key",
    "GITHUB_TOKEN":"your_token",
    "VITE_RECAPTCHA_SITE_KEY":"your_key"
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

# Firebase (for push notifications)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=

# reCAPTCHA (for contact form)
VITE_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Google Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=

# GitHub API (optional)
GITHUB_TOKEN=
```

### Optional Integrations

```env
# AI Providers (choose one)
VITE_ANTHROPIC_API_KEY=
VITE_OPENAI_API_KEY=
VITE_TOGETHER_API_KEY=
VITE_OLLAMA_BASE_URL=http://localhost:11434/v1

# Error Tracking
VITE_SENTRY_DSN=
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
VITE_LAMBDA_CONTACT_URL=
VITE_LAMBDA_RESUME_URL=
VITE_LAMBDA_PUSH_NOTIFICATIONS_URL=
VITE_LAMBDA_PING_URL=
VITE_LAMBDA_DEMO_URL=

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
   printenv | grep VITE_
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

- Verify all `VITE_FIREBASE_*` variables are set
- Check Firebase console for project status
- Ensure domain is allowlisted

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

**Last Updated**: 2026-02-22
**Version**: 1.1.0
**Maintainer**: Themistoklis Baltzakis
