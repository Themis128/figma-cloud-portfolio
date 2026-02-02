# Baltzakis Themistoklis Portfolio - AI Agent Instructions

## Architecture Overview

This is a full-stack React SPA with Express backend, designed for AWS Amplify deployment. The app features a complex dual-server development setup where the frontend (Vite) and backend (Express) run on separate ports during development.

### Key Structural Patterns

**Multi-Server Development Setup:**

- Frontend (Vite): `http://localhost:3001` - serves React SPA with hot reload (HMR port: 24681)
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

### State Management

**Zustand** (Lightweight global state):
```tsx
// Minimal boilerplate, direct state access
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

**React Context** (Theme, providers):
- `ThemeProvider` - Manages light/dark/system themes with localStorage persistence
- Access via `useTheme()` hook: `const { theme, setTheme, actualTheme } = useTheme()`

**Local State** - Prefer `useState` for component-specific state

### Custom Hooks Pattern

The codebase uses custom hooks extensively for reusable logic:

```tsx
// Performance monitoring
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
// Tracks Core Web Vitals: LCP, CLS, FCP, INP, TTFB

// Device detection
import { useDeviceType } from '@/hooks/useDeviceType'
const { isMobile, isTablet, isDesktop } = useDeviceType()

// Push notifications
import { usePushNotifications } from '@/hooks/usePushNotifications'
const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

// Real-time features
import { useSocket } from '@/hooks/useSocket'
import { useTypingIndicator } from '@/hooks/useTypingIndicator'

// Image optimization
import { useLazyImage } from '@/hooks/useLazyImage'
```

**Convention**: All custom hooks follow `use{Feature}` naming and are in `client/hooks/`

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

### Socket.IO Real-Time Patterns

Socket.IO is used for real-time features with typed events:

```tsx
// Client-side socket usage
import { useSocket } from '@/hooks/useSocket'

const { socket, isConnected } = useSocket()

// Agent collaboration rooms
socket.emit('join-agent-room', { roomId: 'agent-123' })
socket.on('agent-status-update', (data) => {
  // Handle agent status changes
})

// Typing indicators
socket.emit('typing-start', { roomId, userId })
socket.emit('typing-stop', { roomId, userId })
socket.on('user-typing', ({ userId }) => { /* update UI */ })

// Presence tracking
socket.on('user-connected', ({ userId, userCount }) => { /* ... */ })
socket.on('user-disconnected', ({ userId, userCount }) => { /* ... */ })
```

**Socket Events**:
- `join-agent-room` / `leave-agent-room` - Agent collaboration
- `agent-status-update` - Broadcast agent state changes
- `typing-start` / `typing-stop` - Typing indicators
- `user-connected` / `user-disconnected` - Presence tracking

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
- **Build**: Custom multi-stage process in `amplify.yml` with optimized memory settings
- **Compute**: LARGE_16GB build compute type for complex builds
- **Backend**: Lambda functions replace Express routes for serverless deployment

**Lambda Functions** (`amplify.yml`):
- `ping` - Health check (256MB, 10s timeout)
- `demo` - Demo endpoint (512MB, 30s timeout)
- `contact` - Contact form handler (512MB, 30s timeout)
- `resume` - PDF generation (2048MB, 300s timeout) - memory-intensive Puppeteer
- `pushnotifications` - Web push handler (512MB, 30s timeout)

**Important**: Frontend URLs automatically switch between Express `/api/*` routes (dev) and Lambda URLs (production) via environment variables:
```bash
VITE_LAMBDA_CONTACT_URL=https://your-contact-function.amazonaws.com
VITE_LAMBDA_RESUME_URL=https://your-resume-function.amazonaws.com
# etc.
```

**Build Optimization**:
- Secrets loaded via `scripts/load-secrets.sh --write-env .env.production`
- Resume/server builds skipped in CI to prevent memory issues
- Custom headers for MIME types and CORS

### Performance Optimizations

- **Images**: Automatic optimization via Vite plugin (WebP/AVIF generation)
  - PNG: 70% quality, 9 compression level, 128 color palette
  - JPEG: 70% quality, progressive, mozjpeg
  - WebP: 75% quality, effort 6
  - AVIF: 70% quality, effort 6
- **PWA**: Service worker with Workbox caching strategies (API, fonts, images, static resources)
- **Bundle**: Manual chunk splitting for optimal caching:
  - `framework` - React/ReactDOM
  - `router` - React Router DOM
  - `ui` - Radix UI components, Lucide icons, Sonner toasts
  - `three` - Three.js, React Three Fiber, Drei
  - `utils` - clsx, tailwind-merge, date-fns, zod
  - `forms` - React Hook Form, resolvers
  - `state` - TanStack Query
  - `performance` - Web Vitals
- **Fonts**: Google Fonts preloaded with display=swap (Inter, Fira Code)
- **Build**: Tree shaking, minification, sourcemap disabled in production, esbuild minifier
- **Assets**: Inline assets <4KB, CSS code splitting enabled
- **Terser**: Drop console logs in production (console.log, console.info, console.debug)

## Common Pitfalls

1. **Single Server Development**: Never run only `pnpm dev` - Socket.IO, contact forms, resume PDFs, and push notifications require backend server (`npx tsx server/node-build.ts`)
2. **Port Conflicts**: Frontend uses port 3001 (not 8081), backend uses 3000, HMR uses 24681
3. **Path Imports**: Always use `@/` and `@shared/` aliases, never relative paths like `../../`
4. **Type Safety**: Define interfaces in `@shared/api.ts` before implementing client/server features
5. **Build Order**: Always run `pnpm run build:resume` before `pnpm run build:client` (PDF templates needed)
6. **Environment Setup**: Copy `.env.example` to `.env` and configure all required variables - or use AWS Secrets Manager
7. **Testing**: Exclude app.spec.ts and logo.spec.ts from Vitest runs (handled by Playwright)
8. **Image Optimization**: Disabled in CI/CD mode to prevent build failures - ViteImageOptimizer only in dev
9. **Manual Chunks**: Disabled in CI/CD (`isCI` check) to prevent memory issues on Amplify
10. **Secrets in Git**: NEVER commit `.env`, `.env.local`, or any files with secrets - use `.gitignore`
11. **Console Logs**: Biome warns about console statements - remove before production or use structured logging
12. **Socket.IO Rooms**: Always leave rooms when component unmounts to prevent memory leaks
13. **reCAPTCHA**: Contact form requires valid reCAPTCHA token - test with real API keys
14. **CSP Headers**: Modifying CSP in `vite.config.ts` requires restarting dev server
15. **Lazy Loading**: All page components MUST be lazy-loaded with React.lazy() for code splitting
16. **Documentation Updates**: ALWAYS update relevant documentation when adding/changing features:
    - Update `README.md` for new features or setup changes
    - Update `INTEGRATIONS.md` for new external services
    - Update `.env.example` when adding new environment variables
    - Update API documentation in `@shared/api.ts` comments
    - Update this file (`.github/copilot-instructions.md`) for new patterns or conventions
17. **MCP Configuration**: MCP server settings live in `%APPDATA%` (outside repo) - never commit Cline MCP settings with hardcoded tokens, always use environment variable references like `${GITHUB_TOKEN}`

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

### Biome Linting & Formatting

**Fast, comprehensive tooling** (replaces ESLint + Prettier):

```bash
pnpm lint         # Check for issues
pnpm lint:fix     # Auto-fix issues
pnpm format       # Format code
pnpm format:fix   # Format and write
```

**Key Rules** (`biome.json`):
- `noUnusedVariables`: warn (clean up unused vars)
- `noUnusedImports`: error (strict import hygiene)
- `noExplicitAny`: warn (prefer typed code)
- `noConsole`: warn (remove console logs in production)
- `useConst`: error (prefer const over let)
- `noMagicNumbers`: warn (use named constants)
- **Security**: Enabled with `noDangerouslySetInnerHtml` off (sanitized elsewhere)
- **A11y**: Accessibility rules enabled

**Special Overrides**:
- Scripts: `noConsole` allowed
- Tests: `noExplicitAny` allowed, `noMagicNumbers` allowed
- Server: `noConsole` allowed

**Formatting**:
- Indent: 2 spaces
- Line width: 100 characters
- JSX quotes: Single quotes

### Type Checking & Testing

- **Linting**: Biome (fast, comprehensive) with custom rules (noExplicitAny: warn)
- **Formatting**: Biome format (consistent code style, single quotes, semicolons as needed)
- **Type Checking**: TypeScript strict mode
- **Testing**: 100% coverage target with Vitest + Playwright
- **Performance**: Lighthouse CI integration planned, Web Vitals monitoring

## AI Agent Templates System

**Route**: `/agents`

### Agent Architecture

**AgentExecutor** (`client/lib/agentExecutor.ts`):
- Node-based workflow execution engine
- Supports sequential and parallel execution
- Built-in retry logic and error handling

**Node Types**:
- `input` - User input collection
- `llm` - LLM API calls (Claude, OpenAI, Together AI, Ollama)
- `decision` - Conditional branching based on data
- `data-processor` - Data transformation
- `tool` - External tool integration
- `output` - Final result formatting

**Agent Workflow Structure**:
```typescript
interface AgentWorkflow {
  nodes: Array<{
    id: string
    type: 'input' | 'llm' | 'decision' | 'data-processor' | 'tool' | 'output'
    config: Record<string, unknown>
  }>
  connections: Array<{
    from: string
    to: string
    condition?: string
  }>
}
```

**Template System** (`client/data/agentTemplates.ts`):
- Browse 5 pre-built templates (Basic Chatbot, Code Reviewer, Data Analyzer, Content Writer, Task Automator)
- Clone and customize existing templates- Create templates from scratch with workflow definitions
- Categories: Basic, Advanced, Specialized
- Features: Search, filtering, difficulty levels, visual template browser

**API Integration**:
```tsx
import { claudeApi } from '@/lib/api'

// Execute Claude API
const response = await claudeApi.executeClaude({
  prompt: 'Your prompt',
  model: 'claude-3-sonnet-20240229',
  maxTokens: 1000
})

// Execute agent workflow
const result = await claudeApi.executeAgent({
  agentId: 'agent-123',
  workflow: agentWorkflow,
  input: { /* ... */ }
})
```

## Security Patterns

### Input Validation & Sanitization

```tsx
// XSS and injection prevention - regex patterns in use
const sanitizeInput = (input: string) => {
  // Remove script tags, SQL injection patterns, etc.
  // See server validation for patterns
}
```

### reCAPTCHA Integration

```tsx
// Contact form with reCAPTCHA v3
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const { executeRecaptcha } = useGoogleReCaptcha()
const token = await executeRecaptcha('contact_form')
// Token sent with form submission for server validation
```

### Content Security Policy (CSP)

Configured in `vite.config.ts` with strict policies:
- `script-src`: Self, Google Analytics, reCAPTCHA
- `style-src`: Self, Google Fonts
- `connect-src`: API domains, WebSocket connections
- `frame-src`: reCAPTCHA only
- `object-src`: None
- `frame-ancestors`: None (X-Frame-Options: DENY)

### Secrets Management

**Never commit secrets**. Use one of these methods:

1. **Development**: PowerShell profile variables or `.env` file (git-ignored)
2. **Production**: AWS Secrets Manager (auto-loaded via `scripts/run-with-secrets.js`)
3. **CI/CD**: GitHub Secrets

**Key Scripts**:
- `scripts/run-with-secrets.js` - Automatic secret loading wrapper
- `scripts/load-secrets.sh` / `.ps1` - Load from AWS Secrets Manager
- `scripts/validate-secrets.js` / `.ps1` - Validate environment variables

**Docs**: See `SECRETS_MANAGEMENT.md`, `MCP_SECURE_CONFIG.md`

## MCP (Model Context Protocol) Servers

**Package**: `@agentdeskai/browser-tools-mcp` v1.2.1
**Purpose**: AI agent browser automation and tool integration

### MCP Server Configuration

MCP servers are configured in VS Code user settings to extend AI agent capabilities with external tools and services.

**Configuration Files**:
1. **VS Code MCP Settings**: `%APPDATA%\Code - Insiders\User\mcp.json`
2. **Cline MCP Settings**: `%APPDATA%\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

### Active MCP Servers in This Project

**Development & Version Control**:
- **GitHub MCP** - Repository operations, PR management, issue tracking (Docker-based: `ghcr.io/github/github-mcp-server`)
- **Git MCP** - Git commands (status, diff, commit, branch, log, etc.) via `uvx mcp-server-git`

**Browser Automation & Testing**:
- **Playwright MCP** (Microsoft) - `@playwright/mcp` - Full browser automation with pnpm dlx
- **Playwright MCP** (ExecuteAutomation) - `@executeautomation/playwright-mcp-server` - Extended tools for codegen, navigate, screenshot, click, fill, etc.
- **Browser Tools MCP** (AgentDeskAI) - `@agentdeskai/browser-tools-mcp` - Performance/SEO/accessibility audits, console logs, network monitoring

**File & Content Operations**:
- **Filesystem MCP** - `@modelcontextprotocol/server-filesystem` - File operations scoped to project directory
  - Auto-approved: read, write, edit, create directories, search files, directory tree, move files
- **Fetch MCP** - `mcp-fetch-server` - Web content fetching (HTML, markdown, txt, JSON)

**Design & Documentation**:
- **Figma MCP** - `figma-developer-mcp` - Figma API integration (requires `FIGMA_API_KEY`)
- **Context7 MCP** - `@upstash/context7-mcp` - Library documentation querying
- **AWS Frontend MCP** - `awslabs.frontend-mcp-server` - React documentation access

**Cloud & Infrastructure**:
- **Azure MCP** - `@azure/mcp` - Comprehensive Azure operations (AKS, Functions, Storage, Cosmos, Key Vault, etc.)

**Productivity & Planning**:
- **Software Planning MCP** - Todo management, project planning via local node server
- **Sequential Thinking MCP** - `@modelcontextprotocol/server-sequential-thinking` - Structured reasoning
- **Time MCP** - `mcp-server-time` - Current time and timezone conversions

**Code Tools**:
- **UTCP Code Mode** - `@utcp/code-mode-mcp` - Universal Tool Calling Protocol for code operations

### Security Best Practices

**CRITICAL**: Never hardcode tokens in `mcp.json` - always use environment variable references.

**Secure Configuration** (`mcp.json`):
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["path/to/github-mcp-server"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "codacy": {
      "command": "node",
      "args": ["scripts/codacy-mcp-endpoint.js"],
      "env": {
        "CODACY_API_TOKEN": "${CODACY_API_TOKEN}",
        "CODACY_PROJECT_TOKEN": "${CODACY_PROJECT_TOKEN}"
      }
    }
  }
}
```

**Environment Variable Resolution**:
1. **System Environment Variables** (Recommended) - Set via PowerShell or system settings
2. **PowerShell Profile** - Add to `$PROFILE` for persistent variables
3. **VS Code Settings** - Set in user or workspace settings (not committed)

**Setup Commands**:
```powershell
# PowerShell - Set user environment variable
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')

# Then restart VS Code to pick up changes
```

**Helper Script**:
```bash
pnpm codacy:mcp  # Display correct Codacy MCP server configuration
```

### MCP Browser Tools Features

The MCP ecosystem provides extensive capabilities:

**Browser Automation**:
- **Navigation**: Load URLs, go back/forward, refresh, switch tabs
- **Element Interaction**: Click, fill forms, select options, drag, hover, upload files
- **Screenshot**: Full page or element-specific captures, save as PDF
- **Console**: Get console logs, errors, network requests/errors
- **Performance**: Run performance, SEO, accessibility, best practices audits
- **Testing**: CodeGen sessions, resize viewport, handle dialogs, evaluate JavaScript

**File Operations** (Auto-approved for project directory):
- Read/write files, edit files, create directories
- List directory contents with sizes, generate directory trees
- Search files, get file info, move files

**Git Operations** (Auto-approved):
- Status, diff (staged/unstaged), log, show
- Add, commit, reset, branch operations
- Create branch, checkout, merge

**Content Fetching**:
- Fetch HTML, Markdown, TXT, JSON from URLs
- React documentation lookup
- Library documentation querying (Context7)

**Design Integration**:
- Fetch Figma design data
- Download Figma images

**Cloud Operations** (Azure):
- Full Azure resource management
- AKS, App Service, Functions, Storage, Key Vault
- Monitoring, diagnostics, deployment operations

### MCP Auto-Approve Lists

Many MCP servers have pre-configured auto-approve lists for common operations. This allows AI agents to perform these operations without manual confirmation:

**Filesystem**: `read_file`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `search_files`
**Git**: `git_status`, `git_diff`, `git_commit`, `git_add`, `git_log`, `git_branch`
**Playwright**: `playwright_navigate`, `playwright_screenshot`, `playwright_click`, `playwright_fill`
**Browser Tools**: `runPerformanceAudit`, `runSEOAudit`, `runAccessibilityAudit`, `takeScreenshot`
**Fetch**: `fetch_html`, `fetch_markdown`, `fetch_txt`, `fetch_json`

**Usage in Agent Workflows**:
```typescript
// Agent workflow node with browser tool
{
  id: 'navigate',
  type: 'tool',
  config: {
    tool: 'browser-tools-mcp',
    action: 'navigate',
    url: 'https://example.com'
  }
}
```

### Important Files

- `MCP_SECURE_CONFIG.md` - Complete MCP security configuration guide
- `scripts/codacy-mcp-endpoint.js` - Codacy MCP server helper
- `.gitignore` - Ensures `mcp.json` is never committed (if placed in repo)
- `%APPDATA%\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` - Cline MCP configuration

### Required Environment Variables for MCP

Some MCP servers require environment variables to be set:
- **GitHub MCP**: `GITHUB_TOKEN` or `GITHUB_PERSONAL_ACCESS_TOKEN`
- **Figma MCP**: `FIGMA_API_KEY`
- **Codacy MCP**: `CODACY_API_TOKEN`, `CODACY_PROJECT_TOKEN`

Set via PowerShell:
```powershell
[System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')
[System.Environment]::SetEnvironmentVariable('FIGMA_API_KEY', 'your_key', 'User')
```

**Never**:
- ❌ Commit `mcp.json` with hardcoded tokens
- ❌ Share MCP configuration files with actual token values
- ❌ Use plain text tokens in VS Code settings

**Always**:
- ✅ Use `${VARIABLE_NAME}` syntax for environment variable references
- ✅ Keep actual tokens in system environment variables or PowerShell profile
- ✅ Restart VS Code after changing environment variables
- ✅ Verify MCP servers connect successfully before using them

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

## Development Philosophy & Best Practices

This codebase emphasizes:

1. **Type Safety First**: TypeScript strict mode, shared types in `@shared/`, never use `any` without a warn
2. **Performance Matters**: Code splitting, lazy loading, image optimization, Core Web Vitals tracking
3. **Security by Default**: CSP headers, input sanitization, reCAPTCHA, secrets management
4. **Developer Experience**: Fast dev server (Vite), comprehensive tooling (Biome), clear patterns
5. **Real-time Capabilities**: Socket.IO for presence, collaboration, live updates
6. **Scalable Architecture**: Modular routes, shared types, Lambda-ready APIs
7. **Testing Culture**: Unit tests (Vitest), E2E tests (Playwright), accessibility testing
8. **Documentation**: Inline examples, clear conventions, comprehensive README docs

**Before Implementing Features**:
- Check existing patterns in similar components/routes
- Define shared types in `@shared/api.ts` first
- Consider performance implications (lazy loading, code splitting)
- Follow security best practices (sanitization, validation)
- Write tests alongside implementation
- **Update documentation** - Always update relevant docs when adding/changing features
- Run `pnpm lint:fix && pnpm typecheck` before committing

Remember: This codebase emphasizes type safety, performance, and developer experience. Always check existing patterns before implementing new features.</content>
<parameter name="filePath">d:\Nuxt Projects\new-portfolio\.github\copilot-instructions.md
