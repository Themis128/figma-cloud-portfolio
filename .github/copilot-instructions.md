# Baltzakis Themistoklis Portfolio - AI Agent Instructions

## Architecture Overview

Full-stack React SPA with Express backend, dual-server development setup for AWS Amplify deployment.

**Critical Development Setup:**
- Frontend (Vite): `http://localhost:8081` - serves React SPA with hot reload
- Backend (Express): `http://localhost:3002` - serves API endpoints with Socket.IO
- **Always run both servers** for full functionality (real-time features, contact forms, resume generation)
- **Why dual-server?** Vite dev server proxies `/api/*` requests to Express server, enabling seamless development experience

**Path Aliases:**
- `@/` → `./client/` (React components, pages, hooks)
- `@shared/` → `./shared/` (TypeScript interfaces used by both client/server)
- **Never use relative imports** - always use these aliases for consistency

## Development Workflow

**Starting Development Servers:**
```bash
# Terminal 1: Frontend (required)
pnpm dev

# Terminal 2: Backend (required for API features)
npx tsx server/node-build.ts

# Alternative: Start both servers concurrently
pnpm dev:all
```

**Build Pipeline:**
```bash
pnpm run build:resume    # Generate PDF templates from markdown (required first)
pnpm run build:client    # Build React SPA to dist/spa/
pnpm run build:server    # Build Express server to dist/server/
pnpm build              # Run all builds with secrets wrapper (production)
```

**Development Commands:**
```bash
pnpm dev:all                    # Start both Vite + Express servers
pnpm dev:ci                     # Development with CI environment variables
pnpm start                      # Production server (single port)
pnpm typecheck                  # TypeScript validation
pnpm lint                       # Biome linting
pnpm lint:fix                   # Auto-fix linting issues
pnpm format                     # Format code with Biome
pnpm clean                      # Remove build artifacts
pnpm clean:deps                 # Remove node_modules and lockfile
```

## Code Patterns & Conventions

**State Management:**
- **Zustand** for global state: `const useStore = create((set) => ({ count: 0, increment: () => set((state) => ({ count: state.count + 1 })) }))`
- **React Context** for providers (ThemeProvider, etc.)
- **Local State** with `useState` for component-specific state

**Custom Hooks Pattern:**
All custom hooks follow `use{Feature}` naming in `client/hooks/`:
```tsx
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";

// Example custom hook implementation
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**Component Structure:**
```tsx
import { cn } from "@/lib/utils";

interface ExampleProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Example({
  className,
  children,
  variant = 'default',
  size = 'md'
}: ExampleProps) {
  return (
    <div className={cn(
      "base-classes",
      {
        "bg-blue-500 text-white": variant === 'default',
        "bg-red-500 text-white": variant === 'destructive',
        "border border-gray-300": variant === 'outline',
        "px-2 py-1 text-sm": size === 'sm',
        "px-4 py-2": size === 'md',
        "px-6 py-3 text-lg": size === 'lg',
      },
      className
    )}>
      {children}
    </div>
  );
}
```

**Error Handling Pattern:**
```tsx
// Error boundary component
export class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}

// Async operation with error handling
export async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    // Show user-friendly error message
    toast.error('Operation failed. Please try again.');
    return null;
  }
}
```

**Routing & Pages:**
- All page components **must be lazy-loaded** with `React.lazy()` in `client/App.tsx`
- Routes defined in `client/App.tsx`: `<Route path="/page" element={<Page />} />`
- Page components should be in `client/pages/` directory
- Use `React.Suspense` with fallback loading component

```tsx
// client/App.tsx - Route definition pattern
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const Index = lazy(() => import('./pages/Index'))
const About = lazy(() => import('./pages/About'))
const Agents = lazy(() => import('./pages/Agents'))
const Contact = lazy(() => import('./pages/Contact'))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

**API Communication:**
- Shared types in `@shared/api.ts` for type safety
- API calls through centralized client with Lambda/production support
- Example: `import { submitContactForm } from "@/lib/api";`
- Contact form types: `ContactFormRequest`, `ContactFormResponse`
- AI execution types: `AgentExecutionRequest`, `AgentExecutionResponse`

```tsx
// client/lib/api.ts - API client pattern
import type { ContactFormRequest, ContactFormResponse } from '@shared/api'

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3002'
  : import.meta.env.VITE_LAMBDA_CONTACT_URL

export async function submitContactForm(data: ContactFormRequest): Promise<ContactFormResponse> {
  const response = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`Contact form submission failed: ${response.statusText}`)
  }

  return response.json()
}

// server/routes/contact.ts - Server route pattern
import type { RequestHandler } from 'express'
import type { ContactFormRequest, ContactFormResponse } from '@shared/api'

export const handleContactForm: RequestHandler = async (req, res) => {
  try {
    const data: ContactFormRequest = req.body

    // Validate input
    if (!data.name || !data.email || !data.message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }

    // Process contact form (send email, save to database, etc.)
    // ... implementation ...

    const response: ContactFormResponse = {
      success: true,
      message: 'Contact form submitted successfully'
    }

    res.json(response)
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
```

**Styling:**
- **Tailwind CSS** with navy/cyan color scheme
- **Radix UI** primitives from `client/components/ui/`
- `cn()` utility: `className={cn('base-classes', { 'conditional-class': condition }, props.className)}`
- Dark theme by default with `ThemeProvider`

```tsx
// client/lib/utils.ts - cn utility implementation
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// client/components/ui/Button.tsx - Component with variants
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",

        // Variants
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          "border border-input hover:bg-accent hover:text-accent-foreground": variant === 'outline',
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
          "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
          "underline-offset-4 hover:underline text-primary": variant === 'link',
        },

        // Sizes
        {
          "h-10 py-2 px-4": size === 'default',
          "h-9 px-3 rounded-md": size === 'sm',
          "h-11 px-8 rounded-md": size === 'lg',
          "h-10 w-10": size === 'icon',
        },

        className
      )}
      {...props}
    />
  )
}
```

**Real-time Features:**
Socket.IO integration with typed events:
```tsx
import { useSocket } from "@/hooks/useSocket";
const { socket, isConnected } = useSocket();
socket.emit("join-agent-room", { roomId: "agent-123" });
socket.on("agent-status-update", (data) => { /* handle */ });
```
- User presence tracking with rooms
- Agent collaboration events
- Typing indicators and notifications
- Enhanced connection monitoring

```tsx
// client/hooks/useSocket.ts - Socket hook implementation
import { useCallback, useEffect, useRef, useState } from 'react'
import { socketManager } from '@/lib/socket'

interface User {
  id: string
  name?: string
  lastSeen: Date
}

interface UseSocketOptions {
  userId?: string
  userName?: string
  autoConnect?: boolean
}

const CONNECTION_CHECK_INTERVAL_MS = 1000

export function useSocket(options: UseSocketOptions = {}) {
  const { userId, userName, autoConnect = true } = options
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [presence, setPresence] = useState<User[]>([])
  const hasConnectedRef = useRef(false)

  const connect = useCallback(() => {
    if (!userId) {
      setConnectionError('User ID is required to connect')
      return
    }

    try {
      socketManager.connect(userId, userName)
      hasConnectedRef.current = true
      setConnectionError(null)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect')
    }
  }, [userId, userName])

  const disconnect = useCallback(() => {
    socketManager.disconnect()
    setIsConnected(false)
    setPresence([])
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketManager.emit(event, data)
  }, [])

  // Handle connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketManager.isConnected()
      setIsConnected(connected)
    }

    checkConnection()
    const interval = setInterval(checkConnection, CONNECTION_CHECK_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Handle presence updates
  useEffect(() => {
    const handlePresenceUpdate = (data: unknown) => {
      if (Array.isArray(data)) {
        setPresence(data as User[])
      }
    }

    socketManager.on('presence:update', handlePresenceUpdate)

    return () => {
      socketManager.off('presence:update', handlePresenceUpdate)
    }
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && userId && !hasConnectedRef.current) {
      connect()
    }

    return () => {
      // Don't disconnect on unmount to allow persistence across route changes
    }
  }, [autoConnect, userId, connect])

  return {
    isConnected,
    connectionError,
    presence,
    connect,
    disconnect,
    emit,
    socket: socketManager.getSocket(),
  }
}
```

**AI Agent System:**
- Agent templates in `client/data/agentTemplates.ts`
- Agent executor in `client/lib/agentExecutor.ts`
- Workflow-based execution with nodes (input, llm, decision, tool, output)
- Example workflow execution:
```tsx
import { executeAgent } from "@/lib/agentExecutor";
import { getTemplateById } from "@/data/agentTemplates";

const template = getTemplateById("basic-chatbot");
const result = await executeAgent(template, { userInput: "Hello" });
```

```tsx
// client/lib/agentExecutor.ts - Agent execution engine
export class AgentExecutor {
  private nodes: AgentNode[]
  private connections: AgentConnection[]
  private context: Record<string, unknown> = {}

  constructor(workflow: {
    nodes: AgentNode[]
    connections: AgentConnection[]
  }) {
    this.nodes = workflow.nodes
    this.connections = workflow.connections
  }

  async execute(input?: Record<string, unknown>): Promise<Record<string, unknown>> {
    // Initialize context with input
    this.context = { ...input }

    // Find input nodes
    const inputNodes = this.nodes.filter((node) => node.type === 'input')

    // Execute input nodes
    for (const node of inputNodes) {
      await this.executeNode(node)
    }

    // Continue execution based on connections
    await this.executeWorkflow()

    // Return final context
    return this.context
  }

  private async executeNode(node: AgentNode): Promise<void> {
    switch (node.type) {
      case 'input':
        this.context[node.id] = node.config['prompt'] || ''
        break

      case 'llm': {
        const prompt = this.getConnectedInput(node.id)
        this.context[node.id] = await this.callLLM(prompt, node.config)
        break
      }

      case 'decision': {
        const inputValue = this.getConnectedInput(node.id)
        this.context[node.id] = this.evaluateDecision(inputValue, node.config)
        break
      }

      case 'output': {
        const outputValue = this.getConnectedInput(node.id)
        this.context[node.id] = outputValue
        break
      }

      default:
        break
    }
  }

  private async executeWorkflow(): Promise<void> {
    const processed = new Set<string>()
    const queue = this.nodes.filter((node) => node.type === 'input')

    while (queue.length > 0) {
      const node = queue.shift()
      if (!node || processed.has(node.id)) continue

      await this.executeNode(node)
      processed.add(node.id)

      const connectedNodes = this.getConnectedNodes(node.id)
      for (const connectedNode of connectedNodes) {
        if (!processed.has(connectedNode.id)) {
          queue.push(connectedNode)
        }
      }
    }
  }

  private getConnectedInput(nodeId: string): unknown {
    const incomingConnections = this.connections.filter((conn) => conn.target === nodeId)
    for (const conn of incomingConnections) {
      if (this.context[conn.source] !== undefined) {
        return this.context[conn.source]
      }
    }
    return null
  }

  private getConnectedNodes(nodeId: string): AgentNode[] {
    const outgoingConnections = this.connections.filter((conn) => conn.source === nodeId)
    return outgoingConnections
      .map((conn) => this.nodes.find((node) => node.id === conn.target))
      .filter((node): node is AgentNode => node !== undefined)
  }

  private async callLLM(prompt: unknown, config: Record<string, unknown>): Promise<string> {
    const { aiService } = await import('./aiService')
    const model = (config['model'] as string) || undefined
    const response = await aiService.generateResponse(String(prompt), model)
    return response.content
  }

  private evaluateDecision(input: unknown, config: Record<string, unknown>): boolean {
    const condition = config['condition'] as string
    if (!condition) return false
    const inputStr = String(input).toLowerCase()
    return inputStr.includes(condition.toLowerCase())
  }
}
```

## Testing & Quality

**Testing Setup:**
```bash
pnpm test                    # Run all unit tests (Vitest)
pnpm test:e2e               # Run E2E tests (Playwright)
pnpm test:e2e:fast          # Fast E2E configuration
pnpm test:e2e:critical      # Critical/smoke tests only
```

**Code Quality:**
- **Biome** for linting/formatting: `pnpm lint`, `pnpm lint:fix`
- TypeScript strict mode
- Coverage thresholds at 20%

**Testing Patterns:**
```tsx
// client/__tests__/Button.test.tsx - Component testing
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })
})

// playwright.config.ts - E2E testing configuration
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:8081',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev:all',
    port: 8081,
    timeout: 120000,
  },
})
```

**Playwright Testing Details:**

**Configuration Architecture:**
- **Shared Configuration** (`playwright.config.shared.ts`): Factory pattern for consistent setups across environments
- **Environment-Specific Configs**: `ci.ts`, `fast.ts`, `validation.ts` for different testing needs
- **Browser Launch Args**: Optimized arguments for performance and stability
- **Dynamic Worker Allocation**: CPU-based worker scaling for optimal performance

**Testing Modes:**
```bash
# Development (full browser coverage)
pnpm test:e2e

# Fast mode (Chromium only, optimized for speed)
pnpm test:e2e:fast

# CI mode (comprehensive reporting, environment detection)
PLAYWRIGHT_CONFIG=ci pnpm test:e2e

# Validation mode (configuration health checks)
PLAYWRIGHT_CONFIG=validation pnpm test:e2e
```

**Playwright Configuration Patterns:**
```typescript
// playwright.config.shared.ts - Shared configuration factory
export function createPlaywrightConfig(preset: 'dev' | 'ci' | 'fast' | 'validation', overrides = {}) {
  const baseConfig = {
    testDir: './tests',
    timeout: 30000,
    expect: { timeout: 5000 },
    use: {
      baseURL: 'http://localhost:8081',
      actionTimeout: 5000,
      navigationTimeout: 10000,
      launchOptions: {
        args: BROWSER_LAUNCH_ARGS.getArgs(preset),
      },
    },
    projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
  }
  
  return { ...baseConfig, ...overrides }
}

// playwright.config.ci.ts - CI-optimized configuration
const config = createPlaywrightConfig('ci', {
  metadata: {
    ci: true,
    ciProvider: detectCIProvider(),
    pr: process.env.GITHUB_PR_NUMBER,
    run: process.env.GITHUB_RUN_ID,
  },
  reporter: [
    ['github'], // GitHub Actions annotations
    ['junit', { outputFile: 'test-results/junit-ci.xml' }],
    ['json', { outputFile: 'test-results/results-ci.json' }],
    ['html', { open: 'never' }],
  ],
})
```

**Test Organization:**
- **Component Tests**: `client/__tests__/` - Unit tests for React components using Vitest + React Testing Library
- **API Tests**: `tests/api.spec.ts` - API client function testing with mocked fetch
- **E2E Tests**: `tests/` - Full application flow testing with Playwright
- **Integration Tests**: Component interaction and state management testing

**API Testing Patterns:**
```typescript
// tests/api.spec.ts - API client testing
describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe('submitContactForm', () => {
    it('submits contact form data', async () => {
      const mockResponse = { success: true, message: 'Email sent' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const formData = {
        name: 'John',
        email: 'john@test.com',
        subject: 'Test Subject',
        message: 'Hi',
        recaptchaToken: 'test-token',
      }
      const result = await submitContactForm(formData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(formData),
        }),
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
```

**Performance Testing:**
```tsx
// client/__tests__/performance.test.tsx
import { render } from '@testing-library/react'
import { PerformancePage } from '@/pages/Performance'

describe('Performance', () => {
  it('renders without performance regressions', async () => {
    const startTime = performance.now()
    render(<PerformancePage />)
    const renderTime = performance.now() - startTime
    expect(renderTime).toBeLessThan(100) // 100ms threshold
  })
})
```

**Browser Launch Optimization:**
- **Performance Args**: `--disable-dev-shm-usage`, `--memory-pressure-off`, `--max_old_space_size=4096`
- **Stability Args**: `--disable-background-timer-throttling`, `--disable-renderer-backgrounding`
- **CI Args**: Environment-specific optimizations for headless execution
- **Fast Mode**: Single browser (Chromium) with minimal artifacts for speed

**Test Reporting:**
- **CI**: GitHub Actions annotations, JUnit XML, JSON results, HTML reports
- **Local**: HTML reports with screenshots and videos on failure
- **Validation**: Configuration health scoring and optimization recommendations
- **Coverage**: 20% minimum coverage threshold with detailed reporting

## Deployment & Infrastructure

**AWS Amplify Configuration:**
- Multi-stage builds in `amplify.yml`
- Lambda functions replace Express routes in production
- Environment variables switch between dev (`/api/*`) and production (Lambda URLs)

**Environment Variables:**
```bash
# Development
NODE_ENV=development
PORT=3002

# AI Services (choose one provider)
VITE_AI_PROVIDER=ollama|openai|together

# Contact Form
VITE_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# Production Lambda URLs
VITE_LAMBDA_CONTACT_URL=...
VITE_LAMBDA_RESUME_URL=...
```

**Build Configuration:**
```yaml
# amplify.yml - Multi-stage build configuration
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist/spa
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/

backend:
  phases:
    build:
      commands:
        - npm run build:server
  cache:
    paths:
      - node_modules/**/
```

**Lambda Functions:**
```typescript
// amplify/functions/contact-handler/resource.ts
import { defineFunction } from '@aws-amplify/backend'

export const contactHandler = defineFunction({
  name: 'contact-handler',
  entry: './handler.ts',
  environment: {
    SES_REGION: 'us-east-1',
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  },
})
```

**CDN & Performance:**
- CloudFront distribution for global content delivery
- S3 bucket for static assets
- Route 53 for DNS management
- Certificate Manager for SSL certificates

## Common Pitfalls

1. **Single Server Development**: Never run only `pnpm dev` - Socket.IO, contact forms, resume PDFs require backend server
2. **Port Conflicts**: Frontend uses 8081, backend uses 3002, HMR uses 24681
3. **Path Imports**: Always use `@/` and `@shared/` aliases, never relative paths
4. **Type Safety**: Define interfaces in `@shared/api.ts` before implementing features
5. **Lazy Loading**: All page components MUST be lazy-loaded with `React.lazy()`
6. **Build Order**: Run `pnpm run build:resume` before `pnpm run build:client`
7. **Secrets**: Never commit `.env` files - use AWS Secrets Manager in production

## Security & Best Practices

- Input validation with Zod schemas
- reCAPTCHA integration for contact forms
- CSP headers configured in `vite.config.ts`
- AWS SNS for push notifications
- Secrets management via AWS Secrets Manager

## File Organization Reference

```
client/
├── App.tsx              # Route definitions, providers setup
├── pages/               # Route components (lazy loaded)
├── components/ui/       # Radix UI component library
├── lib/                 # Utilities (api.ts, aiService.ts, agentExecutor.ts)
├── hooks/               # Custom React hooks
├── data/                # Static data (agentTemplates.ts)
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
```

**Performance Optimization:**
- Lazy loading for all route components
- Code splitting with dynamic imports
- Image optimization with Vite plugin
- Service worker for caching strategies
- Bundle analysis with rollup visualizer

```tsx
// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Core Web Vitals tracking
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log)
        getFID(console.log)
        getFCP(console.log)
        getLCP(console.log)
        getTTFB(console.log)
      })
    }
  }, [])
}

// Lazy loading pattern
const HeavyComponent = lazy(() =>
  import('./HeavyComponent').then(module => ({ default: module.HeavyComponent }))
)
```

**Monitoring & Analytics:**
- Sentry for error tracking and performance monitoring
- Google Analytics 4 for user analytics
- Custom performance metrics collection
- Real-time error reporting with context

**Before Implementing Features:**
- Check existing patterns in similar components/routes
- Define shared types in `@shared/api.ts` first
- Consider performance implications (lazy loading, code splitting)
- Follow security best practices (sanitization, validation)
- Write tests alongside implementation
- Update documentation when adding/changing features

**Implementation Checklist:**
1. **Type Safety First**: Define interfaces in `@shared/api.ts`
2. **Component Structure**: Use `cn()` utility for conditional classes
3. **State Management**: Choose Zustand for global state, local state for components
4. **Error Handling**: Implement error boundaries and safe async operations
5. **Testing**: Write unit tests for components, E2E for critical flows
6. **Performance**: Lazy load routes, optimize images, monitor bundle size
7. **Security**: Validate inputs, use CSP headers, sanitize data
8. **Documentation**: Update this file when adding new patterns

**Code Review Guidelines:**
- All components must be lazy-loaded in routes
- Use path aliases (`@/` and `@shared/`) exclusively
- Follow TypeScript strict mode requirements
- Maintain test coverage above 20%
- Ensure accessibility with proper ARIA labels
- Follow semantic HTML and CSS practices