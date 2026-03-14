# Development Workflow

This document outlines the development workflow, best practices, and conventions for the portfolio project.

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 20 or higher
- **PNPM**: Package manager (version 10.14.0+)
- **Git**: Version control
- **AWS CLI**: Configured with credentials for Bedrock access

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/themis128/figma-cloud-portfolio.git
cd portfolio-nextjs

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local  # Fill in required variables

# Start development servers
pnpm dev:all  # Runs all three servers concurrently
```

### Required Environment Variables

#### Local Development (.env.local)

```env
# Client-side variables (bundled into JS)
NEXT_PUBLIC_SITE_URL=https://localhost:8082
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Server-side variables (for Express dev server)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
ANTHROPIC_API_KEY=your-anthropic-api-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com

# AWS Bedrock chatbot (uses AWS credentials from ~/.aws/credentials or env vars)
BEDROCK_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

## Development Servers

### Three-Tier Development Setup

The project uses three separate development servers:

1. **Frontend Server** (port 3000): Next.js development server
2. **Backend API Server** (port 3001): Express.js API server (includes chatbot via AWS Bedrock)

### Running Servers

```bash
# Option 1: Run all servers concurrently (recommended)
pnpm dev:all

# Option 2: Run servers individually
pnpm dev              # Frontend only
pnpm dev:server       # Backend API only (includes chatbot)
```

### Server Communication

- **Frontend ↔ Backend**: API calls to `/api/*` are proxied to `http://localhost:3001` in development
- **Chatbot**: Chat requests go to Express `/api/chat`, which calls AWS Bedrock directly
- **CORS**: Properly configured for local development

## Code Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [page]/            # Dynamic routes
│   ├── api/               # API routes (if needed)
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui primitives
│   ├── performance/      # Performance-specific components
│   └── [feature]/        # Feature-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── data/                  # Static data files
└── styles/               # Global styles

server/
├── routes/               # Express route handlers (includes chat.ts for Bedrock)
├── middleware/           # Express middleware
├── bot/knowledge/        # Chatbot knowledge base (10 markdown files)
└── lib/                  # Server utilities

playwright-tests/         # E2E test suite
docs/                     # Documentation
public/                   # Static assets
```

### Component Architecture

#### Server vs Client Components

- **Server Components** (default): Use for static content, data fetching, SEO-critical content
- **Client Components** (`'use client'`): Use for interactive elements, browser APIs, state management

#### Component Naming

- Use PascalCase for component names
- Use descriptive names that reflect the component's purpose
- Group related components in feature directories

```typescript
// Good
components/Performance/SpeedTestRunner.tsx
components/Chatbot/MessageBubble.tsx

// Avoid
components/Comp1.tsx
components/Feature.tsx
```

### TypeScript Best Practices

#### Strict Mode

The project uses TypeScript strict mode. Always:

- Provide explicit type annotations
- Handle null/undefined cases
- Use proper interfaces for complex objects

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // Implementation
}

// Avoid
function getUser(id) {
  // No types
}
```

#### Type Safety

- Use `unknown` instead of `any` when possible
- Create proper interfaces for API responses
- Use utility types (`Pick`, `Omit`, `Partial`) for derived types

## Styling Guidelines

### Tailwind CSS

- Use Tailwind classes directly in JSX
- Create custom components for repeated styles
- Use semantic class names in comments for complex layouts

```tsx
// Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Content */}
</div>

// Avoid
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

### Custom Components

Create reusable styled components for complex UI patterns:

```tsx
// components/ui/card.tsx
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}
```

### Dark Mode Support

All components should support both light and dark themes:

```tsx
// Use CSS custom properties for theme colors
<div className="bg-background text-foreground">
  {/* Content */}
</div>
```

## State Management

### Local State

Use React's built-in state management for component-level state:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [data, setData] = useState<Data | null>(null);
```

### Global State

For application-wide state, use:

- **Context API** for theme, user preferences
- **localStorage** for persistent data (resume, settings)
- **React Query** for server state

### State Persistence

Implement auto-save for important user data:

```tsx
// Auto-save resume data
useEffect(() => {
  const timeout = setTimeout(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, 2000);
  
  return () => clearTimeout(timeout);
}, [resumeData]);
```

## API Development

### Route Organization

Organize API routes by feature:

```
server/routes/
├── contact.ts          # Contact form
├── resume.ts           # Resume generation
├── apiKeys.ts          # API key management
├── github.ts           # GitHub integration
└── playwrightAutofix.ts # Test automation
```

### Error Handling

Always implement proper error handling:

```typescript
app.post('/api/contact', async (req, res) => {
  try {
    const result = await processContactForm(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process contact form' 
    });
  }
});
```

### Input Validation

Validate all inputs on the server:

```typescript
function validateContactForm(data: any): ContactFormRequest {
  if (!data.name || !data.email || !data.message) {
    throw new Error('All fields are required');
  }
  
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email format');
  }
  
  return data as ContactFormRequest;
}
```

## Testing Strategy

### E2E Testing with Playwright

- Target 100% coverage of user flows
- Test all interactive components
- Include accessibility testing
- Test both desktop and mobile viewports

### Unit Testing with Vitest

- Test utility functions
- Test custom hooks
- Test API route handlers
- Mock external dependencies

### Test Organization

```
playwright-tests/
├── app.spec.ts              # Main application tests
├── [feature].spec.ts        # Feature-specific tests
├── api-integration.spec.ts  # API integration tests
└── test-utils.ts           # Shared test utilities

__tests__/
├── lib/
├── hooks/
└── utils/
```

## Performance Optimization

### Image Optimization

- Use `next/image` for all images
- Provide width and height attributes
- Use WebP format when possible
- Implement lazy loading

### Code Splitting

- Use dynamic imports for heavy components
- Implement route-based code splitting
- Lazy load non-critical features

```tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### Bundle Analysis

Regularly analyze bundle size:

```bash
pnpm build
pnpm analyze  # If bundle analyzer is configured
```

## Security Best Practices

### Input Sanitization

Always sanitize user inputs:

```typescript
import DOMPurify from 'isomorphic-dompurify';

const cleanInput = DOMPurify.sanitize(userInput);
```

### Environment Variables

- Never commit secrets to the repository
- Use different values for development and production
- Validate required environment variables on startup

### CORS Configuration

Properly configure CORS for API endpoints:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://baltzakis.dev'] 
    : ['http://localhost:8082'],
  credentials: true
}));
```

## Git Workflow

### Branching Strategy

- Use feature branches for new development
- Keep `main` branch stable and deployable
- Use descriptive branch names: `feature/add-contact-form`, `fix/responsive-navigation`

### Commit Messages

Use conventional commit format:

```
feat: add contact form with reCAPTCHA
fix: resolve mobile navigation bug
docs: update API documentation
chore: update dependencies
```

### Pull Requests

- Create small, focused PRs
- Include relevant tests
- Update documentation for new features
- Use PR templates when available

## Deployment Process

### Pre-deployment Checklist

- [ ] Run all tests: `pnpm test:e2e`
- [ ] Check TypeScript compilation: `pnpm typecheck`
- [ ] Verify build succeeds: `pnpm build`
- [ ] Test locally with production build
- [ ] Update version numbers if needed

### Deployment Commands

```bash
# Build for production
pnpm build

# Deploy frontend
aws s3 sync out/ s3://figma-portfolio-static --delete
aws cloudfront create-invalidation --distribution-id E134SCTR0QGQKJ --paths "/*"

# Deploy backend (if changes made)
# Follow Lambda deployment process
```

## Debugging

### Browser Developer Tools

- Use React DevTools for component inspection
- Monitor network requests for API calls
- Check console for errors and warnings

### Server Debugging

- Use `console.log` for quick debugging
- Implement proper logging with structured format
- Use error tracking (Sentry) for production issues

### Performance Debugging

- Use Chrome DevTools Performance tab
- Monitor Web Vitals metrics
- Check bundle size and loading times

## Code Review Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No console.log statements in production code
- [ ] Documentation updated if needed

### Review Checklist

- [ ] Code is readable and well-commented
- [ ] Error handling is implemented
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Tests cover new functionality

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check which process is using a port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Dependency Issues
```bash
# Clear cache and reinstall
pnpm store prune
pnpm install --force
```

#### Build Failures
```bash
# Check TypeScript errors
pnpm typecheck

# Check ESLint errors
pnpm lint

# Clean build cache
rm -rf .next
pnpm build
```

### Getting Help

- Check existing documentation in `/docs`
- Search for similar issues in the repository
- Ask for help in team channels
- Create detailed bug reports with reproduction steps