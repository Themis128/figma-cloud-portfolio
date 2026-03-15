# Baltzakis Themistoklis Portfolio

A production-ready portfolio built with **Next.js 16**, **React 19**, **TypeScript 5**, **Tailwind CSS v4**, and a dark cyberpunk aesthetic. Static export deployed to S3 + CloudFront with a Lambda backend.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with static export
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **Backend**: AWS Lambda (production), Express dev server (local)
- **Hosting**: S3 + CloudFront (frontend), Lambda Function URL (backend)
- **PWA**: Service worker with offline caching and push notifications
- **Testing**: Playwright 1.57+ E2E (69+ test files)
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
playwright-tests/       # E2E test suite (69+ specs)
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
- **Real-time Features**: Socket.IO integration for live updates
- **3D Visualizations**: Three.js for interactive 3D components
- **Accessibility**: WCAG 2.1 AA compliant with comprehensive testing

## Development

### Prerequisites

- Node.js 20+
- PNPM
- Git

### Installation

```bash
pnpm install
```

### Amplify Backend Setup

Before running `pnpm build` or `pnpm dev`, generate the Amplify backend configuration:

```bash
# Generate amplify_outputs.json from the Amplify Gen 2 backend
pnpm amplify:outputs

# Or for sandbox testing:
pnpm amplify:dev
```

See [Deployment Guide](docs/DEPLOYMENT.md#environment-setup) for detailed backend setup instructions.

### Running Development Servers

```bash
# Terminal 1: Start Next.js dev server (frontend on port 8082)
pnpm dev

# Terminal 2: Start Express API server (backend on port 3001)
npx tsx server/index.ts

# Or run all servers concurrently
pnpm dev:all
```

## Available Scripts

```bash
pnpm dev                        # Start Next.js dev server
pnpm dev:server               # Start Express API server
pnpm dev:all                  # Start all development servers (Next.js + Express)
pnpm build                      # Production static export (out/)
pnpm build:server             # Build server for Lambda deployment
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest unit tests
pnpm test:e2e                   # Run Playwright E2E tests
pnpm test:playwright            # Run Playwright tests
pnpm test:playwright:ui         # Run Playwright tests with UI
pnpm test:playwright:headed     # Run Playwright tests with visible browser
pnpm test:playwright:debug      # Run Playwright tests in debug mode
pnpm test:playwright:ci         # Run Playwright tests for CI
pnpm test:playwright:fast       # Run fast subset of Playwright tests
pnpm test:playwright:isolated   # Run isolated Playwright tests
pnpm test:playwright:autofix    # Run Playwright tests with AI autofix
pnpm lint                       # Run ESLint
pnpm format                     # Format code with Prettier
```

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ping` | GET | Health check |
| `/api/demo` | GET | Demo endpoint |
| `/api/contact` | POST | Contact form (reCAPTCHA v3 validated) |
| `/api/resume` | GET | Redirect to resume PDF |
| `/api/push-notifications` | GET/PUT/POST/DELETE | Web push subscription management |
| `/api/organizations/api_keys` | GET/POST | List / create API keys |
| `/api/organizations/api_keys/:id` | GET/POST/DELETE | Get / update / delete API key |

### AI & Agent Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/ai/claude` | POST | Execute Claude API calls |
| `/api/ai/agent` | POST | Execute AI agent workflows |
| `/api/agents` | GET/POST | List / create agents |
| `/api/chat` | POST | Stream chat responses from AI assistant |

### GitHub Integration

| Endpoint | Method | Description |
|---|---|---|
| `/api/github/workflows` | GET | List repository workflows |
| `/api/github/workflows/:workflowId/runs` | GET | Get workflow runs |
| `/api/github/runs/:runId/jobs` | GET | Get workflow jobs |
| `/api/github/metrics` | GET | Get proxy cache metrics |
| `/api/github/validate` | POST | Validate GitHub token |

### Performance & Monitoring

| Endpoint | Method | Description |
|---|---|---|
| `/api/performance/bundle-size` | GET | Get bundle size information |
| `/api/version/latest` | GET | Get current application version |
| `/api/health` | GET | Basic health check |
| `/api/health/detailed` | GET | Extended health check with metrics |

## Architecture

### Frontend Architecture

- **Next.js 16 App Router**: Server and Client components
- **TypeScript 5**: Full type safety with strict mode
- **Tailwind CSS v4**: Utility-first CSS with custom plugins
- **Radix UI**: Accessible, unstyled components
- **shadcn/ui**: Beautiful component library
- **Framer Motion**: Smooth animations and transitions
- **React Query**: Server state management
- **Next Themes**: Theme switching with CSS custom properties

### Backend Architecture

- **AWS Lambda**: Single function handling all API routes
- **Express.js**: Local development server (port 3001)
- **Python FastAPI**: Chatbot backend (port 8001)
- **Socket.IO**: Real-time communication
- **AWS SDK**: Integration with AWS services
- **Serverless HTTP**: Lambda function wrapper

### Database & Storage

- **AWS Amplify GraphQL**: AppSync API for data management
- **S3**: Static asset storage and hosting
- **CloudFront**: CDN for global content delivery
- **Lambda**: Serverless compute for API endpoints

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

### Python Chatbot (AWS Lambda)

- Function URL: `https://3qwsvw4rykz7ohbywemjeq5vxq0bekyw.lambda-url.us-east-1.on.aws`
- Runtime: Python 3.10
- Memory: 512MB, 30s timeout
- HuggingFace Inference API integration

### Documentation

| Topic | File |
|---|---|
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| API Reference | [docs/API_REFERENCE.md](docs/API_REFERENCE.md) |
| Deployment | [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |
| Integrations | [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) |
| Testing | [docs/TESTING.md](docs/TESTING.md) |
| Security | [docs/SECURITY_SUMMARY.md](docs/SECURITY_SUMMARY.md) |
| Performance | [docs/PERFORMANCE.md](docs/PERFORMANCE.md) |

## GitHub Agentic Workflows

AI-powered automation using [GitHub Agentic Workflows (gh-aw)](https://github.github.com/gh-aw/) with the Copilot engine.

### Active Workflows

| Workflow | File | Trigger | Description |
|---|---|---|---|
| Daily Repo Status | `daily-repo-status.md` | Scheduled / manual | Creates daily repo activity reports as GitHub issues |
| CI Doctor | `ci-doctor.md` | On CI failure | Analyzes CI failures and provides diagnostic reports |
| Daily QA | `daily-qa.md` | Daily / manual | Validates builds, tests, docs, and code quality |
| Accessibility Review | `daily-accessibility-review.md` | Daily / manual | WCAG 2.2 compliance checks via Playwright |
| Malicious Code Scan | `daily-malicious-code-scan.md` | Daily / manual | Reviews recent code for suspicious patterns |
| Link Checker | `link-checker.md` | Weekdays / manual | Finds and fixes broken documentation links |
| Playwright Test Runner | `playwright-test-runner.md` | Weekdays / manual | Runs full E2E test suite and reports results |

### Setup

Workflows live in `.github/workflows/` as Markdown files compiled to `.lock.yml` by `gh aw compile`.

**Required secret**: `COPILOT_GITHUB_TOKEN` — fine-grained PAT with "Copilot Requests" Account permission (Read).

```bash
# Compile workflows after editing
gh aw compile

# Trigger a workflow manually
gh aw run daily-repo-status

# Debug a failed run
gh aw audit <run-id>
```

## Development Workflow

### Code Quality

- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting
- **TypeScript**: Type checking and strict mode
- **Playwright**: E2E testing with 100% coverage
- **Vitest**: Unit testing framework

### Git Workflow

1. Create feature branch from `production`
2. Make changes with descriptive commits
3. Run tests locally: `pnpm test:e2e`
4. Push to GitHub and create PR
5. CI/CD runs automated tests and deployment

### Environment Variables

#### Client-side (bundled into JS)
```
NEXT_PUBLIC_SITE_URL              # Canonical URL
NEXT_PUBLIC_GA_ID                 # Google Analytics GA4 measurement ID
NEXT_PUBLIC_SENTRY_DSN            # Sentry error tracking
NEXT_PUBLIC_RECAPTCHA_SITE_KEY    # reCAPTCHA v3 site key
```

#### Server-side (Lambda environment)
```
NODE_ENV                          # production
RECAPTCHA_SECRET_KEY              # reCAPTCHA v3 secret
SES_VERIFIED_EMAIL                # SES sender email
SENTRY_DSN                        # Sentry error tracking
SLACK_WEBHOOK_URL                 # Slack notifications
ANTHROPIC_API_KEY                 # Claude API key
VAPID_PUBLIC_KEY                  # Web push VAPID public key
VAPID_PRIVATE_KEY                 # Web push VAPID private key
VAPID_EMAIL                       # VAPID contact email
GOOGLE_ANALYTICS_MEASUREMENT_ID   # GA4 measurement ID
GOOGLE_ANALYTICS_API_SECRET       # GA4 Measurement Protocol secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `pnpm test:e2e`
6. Submit a pull request

## License

This project is private and proprietary.

## Author

**Themistoklis Baltzakis** — Cloud Architect & Cybersecurity Specialist
- Portfolio: [baltzakis.dev](https://baltzakis.dev)
- GitHub: [github.com/themis128](https://github.com/themis128)
- LinkedIn: [linkedin.com/in/baltzakis-themis](https://www.linkedin.com/in/baltzakis-themis)
