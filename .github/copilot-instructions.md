# Baltzakis Themistoklis Portfolio - AI Agent Instructions

## Architecture Overview

This is a full-stack React SPA with Express backend, designed for AWS Amplify deployment. The app features a complex dual-server development setup where the frontend (Vite) and backend (Express) run on separate ports during development.

### Key Structural Patterns

**Multi-Server Development Setup:**

- Frontend (Vite): `http://localhost:8081` - serves React SPA with hot reload
- Backend (Express): `http://localhost:3000` - serves API endpoints with Socket.IO
- Vite proxies `/api/*` requests to Express server automatically
- **Critical**: Always run both servers for full functionality (push notifications, contact forms, resume generation, real-time features)

**Path Aliases:**

- `@/` → `./client/` (React components, pages, hooks)
- `@shared/` → `./shared/` (TypeScript interfaces used by both client/server)

**Build Pipeline:**

```bash
pnpm run build:resume    # Generate PDF templates from markdown
pnpm run build:client    # Build React SPA to dist/spa/
pnpm run build:server    # Build Express server to dist/server/
pnpm build              # Run all builds + copy static assets
```

## Development Workflow

### Starting Development Servers

```bash
# Terminal 1: Frontend (required)
pnpm dev

# Terminal 2: Backend (required for API features)
npx tsx server/node-build.ts
```

**Never run only one server** - features like contact forms, push notifications, resume downloads, and real-time collaboration require both servers running.

### Adding New Features

**New Page Route:**

1. Create `client/pages/NewPage.tsx`
2. Add lazy import in `client/App.tsx`: `const NewPage = lazy(() => import('./pages/NewPage'))`
3. Add route: `<Route path="/new-page" element={<NewPage />} />`

**New API Endpoint:**

1. Define types in `shared/api.ts`
2. Create handler in `server/routes/new-endpoint.ts`
3. Register in `server/index.ts`: `app.get('/api/new-endpoint', handleNewEndpoint)`

**UI Components:**

- Use Radix UI primitives from `client/components/ui/`
- Apply `cn()` utility for conditional Tailwind classes: `className={cn('base-classes', { 'conditional-class': condition }, props.className)}`
- Follow navy/cyan color scheme defined in `tailwind.config.ts`

## Code Patterns & Conventions

### Component Structure

```tsx
// client/components/Example.tsx
import { cn } from '@/lib/utils'

interface ExampleProps {
  className?: string
  children: React.ReactNode
}

export function Example({ className, children }: ExampleProps) {
  return <div className={cn('base-styles', className)}>{children}</div>
}
```

### API Communication

```tsx
// Use shared types for type safety
import type { ContactFormRequest } from '@shared/api'

// API calls go through centralized client
import { submitContactForm } from '@/lib/api'

const handleSubmit = async (data: ContactFormRequest) => {
  const response = await submitContactForm(data)
  // Response includes success/error handling
}
```

### Error Handling

```tsx
// API functions throw on error - handle in components
try {
  await apiCall()
} catch (error: unknown) {
  // Handle error - check error instanceof Error
}
```

### Styling Patterns

- **Colors**: Use navy/cyan palette from `tailwind.config.ts` (navy-900: #0f1729, cyan: #00d4ff)
- **Layout**: Container queries with responsive padding
- **Animations**: CSS custom properties for consistent timing
- **Dark Mode**: CSS variables automatically switch themes (default dark theme)
- **Mobile-first**: Use responsive utilities like `text-responsive-xl`, `btn-mobile`, `card-mobile`

### Testing Setup

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e              # Run all browsers
pnpm test:e2e:ui          # Interactive mode
```

**Test Configuration:**

- Vitest: Unit tests with jsdom environment, coverage thresholds at 20%
- Playwright: Multi-browser E2E with custom timeouts and retry logic
- Visual regression: 20% threshold for screenshot comparisons
- Test globals enabled, setup in `./tests/vitest-setup.ts`

## Deployment & Infrastructure

### AWS Amplify Configuration

- **Region**: us-east-1 (configured in `amplify/team-provider-info.json`)
- **Build**: Custom multi-stage process in `amplify.yml` with Puppeteer Chrome installation
- **Backend**: Lambda functions replace Express routes for serverless deployment

### Environment Variables

```bash
# Required for full functionality
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
VITE_FIREBASE_*=firebase_config
VITE_LAMBDA_*_URL=lambda_function_urls  # For Amplify deployment
```

### Performance Optimizations

- **Images**: Automatic optimization via Vite plugin (WebP/AVIF generation)
- **PWA**: Service worker with Workbox caching strategies (API, fonts, images, static resources)
- **Bundle**: Manual chunk splitting for vendor/router/ui libraries
- **Fonts**: Google Fonts preloaded with display=swap
- **Build**: Tree shaking, minification, sourcemap disabled in production

## Common Pitfalls

1. **Single Server Development**: Never run only `pnpm dev` - API features won't work
2. **Path Imports**: Always use `@/` and `@shared/` aliases, never relative paths
3. **Type Safety**: Define interfaces in `@shared/api.ts` before implementing features
4. **Build Order**: Always run `pnpm run build:resume` before `pnpm run build:client`
5. **Environment Setup**: Copy `.env.example` to `.env` and configure all required variables
6. **Testing**: Exclude app.spec.ts and logo.spec.ts from Vitest runs (handled by Playwright)

## File Organization Reference

```
client/
├── App.tsx              # Route definitions, providers setup
├── pages/               # Route components (lazy loaded)
├── components/ui/       # Radix UI component library
├── lib/                 # Utilities (api.ts, utils.ts)
└── global.css           # Theme variables, global styles

server/
├── index.ts             # Express app setup, middleware, Socket.IO
├── routes/              # API handlers
└── node-build.ts        # Production server

shared/
└── api.ts               # TypeScript interfaces

amplify/
├── functions/           # AWS Lambda handlers
└── backend/             # Amplify infrastructure

playwright-tests/
├── global.d.ts          # Test global declarations
└── **/*.spec.ts         # E2E test files
```

## Quality Assurance

- **Linting**: Biome (fast, comprehensive) with custom rules (noExplicitAny: warn)
- **Formatting**: Biome format (consistent code style, single quotes, semicolons as needed)
- **Type Checking**: TypeScript strict mode
- **Testing**: 100% coverage target with Vitest + Playwright
- **Performance**: Lighthouse CI integration planned, Web Vitals monitoring

## AI Agent Templates System

**Route**: `/agents`

- Browse 5 pre-built templates (Basic Chatbot, Code Reviewer, Data Analyzer, Content Writer, Task Automator)
- Clone and customize existing templates
- Create templates from scratch with workflow definitions
- Categories: Basic, Advanced, Specialized
- Features: Search, filtering, difficulty levels, visual template browser

## Real-time Features

- **Socket.IO**: Integrated for presence, typing indicators, agent collaboration
- **Agent Rooms**: Real-time collaboration in `agent:${roomId}` rooms
- **Status Updates**: Live agent status broadcasting
- **Presence**: Connected users tracking and broadcasting

## PDF Generation System

- **Puppeteer**: Headless browser for high-quality PDF rendering
- **Markdown Parsing**: Marked library for content processing
- **Dynamic Templates**: Resume generation from `public/resume-content.md`
- **API Endpoint**: `GET/POST /api/resume/download`

## Push Notifications

- **Web Push API**: VAPID key-based notifications
- **Server-side**: VAPID keys handled by Express server
- **Endpoints**: GET/PUT/POST/DELETE `/api/push-notifications`

Remember: This codebase emphasizes type safety, performance, and developer experience. Always check existing patterns before implementing new features.</content>
<parameter name="filePath">d:\Nuxt Projects\new-portfolio\.github\copilot-instructions.md
