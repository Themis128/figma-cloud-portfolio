# Baltzakis Themistoklis Portfolio

A production-ready portfolio built with Next.js 15 (App Router), TypeScript 5, Tailwind CSS v4, and a dark cyberpunk aesthetic. Static export deployed to S3 + CloudFront with a Lambda backend.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with static export
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **Backend**: AWS Lambda (production), Express dev server (local)
- **Hosting**: S3 + CloudFront (frontend), Lambda Function URL (backend)
- **PWA**: Service worker with offline caching and push notifications
- **Testing**: Playwright 1.49+ E2E (69 test files)
- **Analytics**: Google Analytics 4 + Sentry error tracking
- **Package Manager**: PNPM

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    about/              # About page
    agents/             # AI agents showcase
    contact/            # Contact form (reCAPTCHA v3)
    performance/        # Performance monitoring showcase
    product/            # Work experience
    projects/           # Projects gallery
    resume/             # Resume builder
    settings/           # App settings
  components/           # Reusable UI components
    ui/                 # shadcn/ui components
    performance/        # Performance page components
  hooks/                # Custom React hooks
  lib/                  # Utility functions (api.ts, sentry.ts, etc.)
  types/                # TypeScript interfaces (api.ts)
  data/                 # Static data files
  styles/               # Global styles
server/                 # Express dev server (port 3001)
  routes/               # API handlers (resume, apiKeys, playwrightAutofix)
playwright-tests/       # E2E test suite (69 specs)
docs/                   # Documentation (~55 reference files)
public/                 # Static assets and PWA files
```

## Key Features

- **Dark Cyberpunk Design**: Circuit board backgrounds, cyan accents, glass morphism
- **Static Export**: Pre-rendered HTML served from CloudFront CDN
- **PWA Ready**: Offline caching, installable, web push notifications
- **Type Safety**: Full TypeScript with strict mode
- **Performance Showcase**: Live Web Vitals, industry benchmarks, optimization checklist
- **AI Integrations**: Multi-provider AI (Ollama, OpenAI, Together, Anthropic)
- **Analytics**: GA4 + Sentry + custom performance monitoring
- **API Keys Management**: Full CRUD with Slack notifications

## Development

### Prerequisites

- Node.js 20+
- PNPM
- Git

### Installation

```bash
pnpm install
```

### Running Development Servers

```bash
# Terminal 1: Start Next.js dev server (frontend on port 8082)
pnpm dev

# Terminal 2: Start Express API server (backend on port 3001)
npx tsx server/index.ts
```

## Available Scripts

```bash
pnpm dev                        # Start Next.js dev server
pnpm build                      # Production static export (out/)
pnpm typecheck                  # TypeScript validation
pnpm test:e2e                   # Run Playwright E2E tests
pnpm lint                       # Run Biome linter
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ping` | GET | Health check |
| `/api/demo` | GET | Demo endpoint |
| `/api/contact` | POST | Contact form (reCAPTCHA v3 validated) |
| `/api/resume` | GET | Redirect to resume PDF |
| `/api/push-notifications` | GET/PUT/POST/DELETE | Web push subscription management |
| `/api/organizations/api_keys` | GET/POST | List / create API keys |
| `/api/organizations/api_keys/:id` | GET/POST/DELETE | Get / update / delete API key |

## Deployment

### Frontend (S3 + CloudFront)

```bash
pnpm build
aws s3 sync out/ s3://figma-portfolio-static --delete
aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"
```

### Backend (AWS Lambda)

Single Lambda function (`figma-portfolio-api`) fronted by CloudFront at `/api/*`.
- Function URL: `oh4rscben2kxm32mhbtoiw7lbi0hkujs.lambda-url.us-east-1.on.aws`
- Runtime: Node.js, 256MB memory, 15s timeout
- 14 environment variables (see [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md))

### Documentation

| Topic | File |
|---|---|
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API Reference | [docs/API_REFERENCE.md](docs/API_REFERENCE.md) |
| Deployment | [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |
| Integrations | [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) |
| Testing | [docs/TESTING.md](docs/TESTING.md) |

## License

This project is private and proprietary.

## Author

**Themistoklis Baltzakis** — Cloud Architect & Cybersecurity Specialist
- Portfolio: [baltzakis.dev](https://baltzakis.dev)
