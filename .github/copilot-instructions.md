# Baltzakis Themistoklis Portfolio - AI Agent Instructions

## Architecture Overview

This is a full-stack React SPA with Express backend, designed for AWS Amplify deployment. The app features a complex dual-server development setup where the frontend (Vite) and backend (Express) run on separate ports during development.

### Key Structural Patterns

**Multi-Server Development Setup:**

- Frontend (Vite): `http://localhost:8081` - serves React SPA with hot reload
- Backend (Express): `http://localhost:3000` - serves API endpoints
- Vite proxies `/api/*` requests to Express server automatically
- **Critical**: Always run both servers for full functionality (push notifications, contact forms, resume generation)

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

**Never run only one server** - features like contact forms, push notifications, and resume downloads require both servers running.

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
- Apply `cn()` utility for conditional Tailwind classes
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

- **Colors**: Use navy/cyan palette from `tailwind.config.ts`
- **Layout**: Container queries with responsive padding
- **Animations**: CSS custom properties for consistent timing
- **Dark Mode**: CSS variables automatically switch themes

### Testing Setup

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e              # Run all browsers
pnpm test:e2e:ui          # Interactive mode
```

**Test Configuration:**

- Vitest: Unit tests with jsdom environment
- Playwright: Multi-browser E2E with custom timeouts and retry logic
- Visual regression: 20% threshold for screenshot comparisons

## Deployment & Infrastructure

### AWS Amplify Configuration

- **Region**: us-east-1 (configured in `amplify/team-provider-info.json`)
- **Build**: Custom multi-stage process in `amplify.yml`
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
- **PWA**: Service worker with Workbox caching strategies
- **Bundle**: Manual chunk splitting for vendor/router/ui libraries
- **Fonts**: Google Fonts preloaded with display=swap

## Common Pitfalls

1. **Single Server Development**: Never run only `pnpm dev` - API features won't work
2. **Path Imports**: Always use `@/` and `@shared/` aliases, never relative paths
3. **Type Safety**: Define interfaces in `@shared/api.ts` before implementing features
4. **Build Order**: Always run `pnpm run build:resume` before `pnpm run build:client`
5. **Environment Setup**: Copy `.env.example` to `.env` and configure all required variables

## File Organization Reference

```
client/
├── App.tsx              # Route definitions, providers setup
├── pages/               # Route components (lazy loaded)
├── components/ui/       # Radix UI component library
├── lib/                 # Utilities (api.ts, utils.ts)
└── global.css           # Theme variables, global styles

server/
├── index.ts             # Express app setup, middleware
├── routes/              # API handlers
└── node-build.ts        # Production server

shared/
└── api.ts               # TypeScript interfaces

amplify/
├── functions/           # AWS Lambda handlers
└── backend/             # Amplify infrastructure
```

## Quality Assurance

- **Linting**: Biome (fast, comprehensive)
- **Formatting**: Biome format (consistent code style)
- **Type Checking**: TypeScript strict mode
- **Testing**: 100% coverage target with Vitest + Playwright
- **Performance**: Lighthouse CI integration planned

Remember: This codebase emphasizes type safety, performance, and developer experience. Always check existing patterns before implementing new features.

## Detailed Development Commands Reference

### Core Development Commands

```bash
# Start both servers (recommended)
pnpm dev                    # Frontend (Vite) on :8081
npx tsx server/node-build.ts # Backend (Express) on :3000

# Individual server commands
pnpm dev:client            # Frontend only
pnpm dev:server            # Backend only

# Build commands
pnpm run build:resume      # Generate resume PDFs from markdown
pnpm run build:client      # Build React SPA to dist/spa/
pnpm run build:server      # Build Express to dist/server/
pnpm build                 # Full production build

# Testing commands
pnpm test                  # Unit tests (Vitest)
pnpm test:watch           # Unit tests in watch mode
pnpm test:coverage        # Unit tests with coverage
pnpm test:e2e             # E2E tests (Playwright)
pnpm test:e2e:ui          # E2E tests with UI
pnpm test:e2e:debug       # Debug E2E tests

# Quality assurance
pnpm lint                  # Lint with Biome
pnpm format               # Format with Biome
pnpm type-check           # TypeScript type checking
```

### Advanced Development Workflows

**Hot Module Replacement (HMR):**

- Frontend changes auto-reload via Vite
- Backend requires manual restart for route changes
- Shared types auto-sync between client/server

**Debug Configuration:**

- Frontend: Use browser dev tools on `localhost:8081`
- Backend: Debug via VS Code launch config targeting `server/index.ts`
- API debugging: Use `api-tests.http` file for manual testing

## Advanced Code Patterns & Examples

### Component Patterns

**Form Components with Validation:**

```tsx
// client/components/ContactForm.tsx
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ContactFormRequest } from '@shared/api'

interface ContactFormProps {
  onSubmit: (data: ContactFormRequest) => Promise<void>
  className?: string
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormRequest>({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({ name: '', email: '', message: '' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* Form fields with proper validation */}
    </form>
  )
}
```

**Custom Hooks Pattern:**

```tsx
// client/hooks/useContactForm.ts
import { useState, useCallback } from 'react'
import { submitContactForm } from '@/lib/api'
import type { ContactFormRequest } from '@shared/api'

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: ContactFormRequest) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitContactForm(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submit, isSubmitting, error }
}
```

### API Route Patterns

**RESTful API Handler:**

```ts
// server/routes/contact.ts
import express from 'express'
import type { ContactFormRequest, ApiResponse } from '@shared/api'

const router = express.Router()

router.post('/contact', async (req, res) => {
  try {
    const data: ContactFormRequest = req.body

    // Validate input
    if (!data.name || !data.email || !data.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      } as ApiResponse)
    }

    // Process contact form (email sending, database, etc.)
    // Implementation depends on requirements

    res.json({
      success: true,
      message: 'Contact form submitted successfully',
    } as ApiResponse)
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as ApiResponse)
  }
})

export default router
```

### Real-time Features Implementation

**Socket.IO Integration:**

```ts
// server/index.ts
import { createServer } from 'http'
import { Server } from 'socket.io'

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:8081',
  },
})

// Real-time collaboration features
io.on('connection', (socket) => {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
  })

  socket.on('update-content', (data) => {
    socket.to(data.roomId).emit('content-updated', data)
  })
})
```

**Client-side Socket Usage:**

```tsx
// client/hooks/useSocket.ts
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(roomId?: string) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    socketRef.current = io('/api/socket')

    if (roomId) {
      socketRef.current.emit('join-room', roomId)
    }

    return () => {
      socketRef.current?.disconnect()
    }
  }, [roomId])

  return socketRef.current
}
```

### PWA and Service Worker Patterns

**Service Worker Registration:**

```ts
// client/lib/pwa.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    })
  }
}
```

**Push Notification Setup:**

```ts
// client/lib/notifications.ts
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.avif',
      badge: '/logo.avif',
      ...options,
    })
  }
}
```

### Agent Templates and AI Features

**AI Agent Template Structure:**

```tsx
// client/components/AgentTemplate.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface AgentTemplateProps {
  onGenerate: (prompt: string) => Promise<string>
  placeholder?: string
}

export function AgentTemplate({ onGenerate, placeholder }: AgentTemplateProps) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await onGenerate(prompt)
      setResponse(result)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder || 'Enter your prompt...'}
        className="min-h-[100px]"
      />
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Generating...' : 'Generate'}
      </Button>
      {response && (
        <div className="p-4 bg-muted rounded-lg">
          <pre className="whitespace-pre-wrap">{response}</pre>
        </div>
      )}
    </div>
  )
}
```

### Performance Monitoring

**Performance Metrics Hook:**

```tsx
// client/hooks/usePerformance.ts
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  cls: number | null // Cumulative Layout Shift
  fid: number | null // First Input Delay
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
  })

  useEffect(() => {
    // Use Performance Observer API
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            setMetrics((prev) => ({ ...prev, fcp: entry.startTime }))
          }
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics((prev) => ({ ...prev, lcp: entry.startTime }))
        } else if (entry.entryType === 'layout-shift') {
          setMetrics((prev) => ({
            ...prev,
            cls: (prev.cls || 0) + (entry as any).value,
          }))
        }
      }
    })

    observer.observe({
      entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'],
    })

    // FID measurement
    const handleFirstInput = (entry: any) => {
      setMetrics((prev) => ({
        ...prev,
        fid: entry.processingStart - entry.startTime,
      }))
      removeEventListener('pointerdown', handleFirstInput)
    }
    addEventListener('pointerdown', handleFirstInput)

    return () => observer.disconnect()
  }, [])

  return metrics
}
```

### Theming and Customization

**Theme Provider Pattern:**

```tsx
// client/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      setResolvedTheme(systemTheme)
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      setResolvedTheme(theme)
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## Troubleshooting Guide

### Common Development Issues

**API Calls Failing:**

- Check if backend server is running on port 3000
- Verify Vite proxy configuration in `vite.config.ts`
- Ensure environment variables are set in `.env`

**Hot Reload Not Working:**

- Restart both development servers
- Clear browser cache and Vite cache (`rm -rf node_modules/.vite`)
- Check for TypeScript compilation errors

**Build Failures:**

- Run `pnpm run build:resume` before `pnpm run build:client`
- Check for missing environment variables
- Verify all dependencies are installed

**Test Failures:**

- For E2E tests: Ensure both servers are running
- For unit tests: Check Vitest configuration
- Clear test cache: `pnpm test --clearCache`

### Performance Issues

**Slow Development Server:**

- Use `pnpm dev` instead of `npm run dev`
- Enable Vite's dependency pre-bundling
- Check for large node_modules or excessive file watching

**Large Bundle Size:**

- Analyze bundle with `pnpm build --analyze`
- Implement lazy loading for routes
- Use dynamic imports for heavy components

**Memory Leaks:**

- Monitor React DevTools for component leaks
- Use `useEffect` cleanup functions properly
- Avoid circular references in state

### Deployment Issues

**Amplify Build Failures:**

- Check `amplify.yml` configuration
- Verify environment variables in Amplify console
- Ensure Lambda functions are properly configured

**Lambda Function Timeouts:**

- Optimize function cold start times
- Reduce bundle size for Lambda functions
- Implement proper error handling and logging

**CORS Issues:**

- Configure CORS in Express server
- Update Amplify environment variables
- Check API Gateway CORS settings

### Environment-Specific Problems

**Local vs Production Differences:**

- Always test features in both environments
- Use environment variables for configuration
- Mock external services in development

**Browser Compatibility:**

- Test in multiple browsers during development
- Use Playwright for cross-browser testing
- Implement progressive enhancement

**Mobile Responsiveness:**

- Test on actual devices, not just browser dev tools
- Use container queries for component-level responsiveness
- Verify touch interactions work properly

This comprehensive guide ensures AI agents can work effectively across all aspects of the Baltzakis Themistoklis portfolio codebase, from basic development to advanced features and troubleshooting.</content>
<parameter name="filePath">d:\Nuxt Projects\new-portfolio\.github\copilot-instructions.md
