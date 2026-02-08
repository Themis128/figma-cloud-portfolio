# Baltzakis Themistoklis Portfolio - AI Agent Instructions

## Architecture Overview

Full-stack React SPA with Express backend, dual-server development setup for AWS Amplify deployment.

**Critical Development Setup:**
- Frontend (Vite): `http://localhost:8081` - serves React SPA with hot reload
- Backend (Express): `http://localhost:3002` - serves API endpoints with Socket.IO
- **Always run both servers** for full functionality (real-time features, contact forms, resume generation)

**Path Aliases:**
- `@/` → `./client/` (React components, pages, hooks)
- `@shared/` → `./shared/` (TypeScript interfaces used by both client/server)

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
pnpm run build:resume    # Generate PDF templates from markdown
pnpm run build:client    # Build React SPA to dist/spa/
pnpm run build:server    # Build Express server to dist/server/
pnpm build              # Run all builds with secrets wrapper
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
```

**Component Structure:**
```tsx
import { cn } from "@/lib/utils";

interface ExampleProps {
  className?: string;
  children: React.ReactNode;
}

export function Example({ className, children }: ExampleProps) {
  return <div className={cn("base-classes", className)}>{children}</div>;
}
```

**Routing & Pages:**
- All page components **must be lazy-loaded** with `React.lazy()` in `client/App.tsx`
- Routes defined in `client/App.tsx`: `<Route path="/page" element={<Page />} />`

**API Communication:**
- Shared types in `@shared/api.ts` for type safety
- API calls through centralized client with Lambda/production support
- Example: `import { submitContactForm } from "@/lib/api";`

**Styling:**
- **Tailwind CSS** with navy/cyan color scheme
- **Radix UI** primitives from `client/components/ui/`
- `cn()` utility: `className={cn('base-classes', { 'conditional-class': condition }, props.className)}`
- Dark theme by default with `ThemeProvider`

**Real-time Features:**
Socket.IO integration with typed events:
```tsx
import { useSocket } from "@/hooks/useSocket";
const { socket, isConnected } = useSocket();
socket.emit("join-agent-room", { roomId: "agent-123" });
socket.on("agent-status-update", (data) => { /* handle */ });
```

**AI Agent System:**
- Agent templates in `client/data/agentTemplates.ts`
- Agent executor in `client/lib/agentExecutor.ts`
- Workflow-based execution with nodes (input, llm, decision, tool, output)

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

**Before Implementing Features:**
- Check existing patterns in similar components/routes
- Define shared types in `@shared/api.ts` first
- Consider performance implications (lazy loading, code splitting)
- Follow security best practices (sanitization, validation)
- Write tests alongside implementation
- Update documentation when adding/changing features