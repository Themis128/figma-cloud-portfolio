# Development Guidelines

## Code Quality Standards

### Formatting Conventions
- **Indentation**: 2 spaces (enforced by Biome)
- **Line Width**: 100 characters maximum
- **Line Endings**: LF (Unix-style)
- **Quotes**: Single quotes for JSX and JavaScript strings
- **Semicolons**: As needed (ASI-aware, omit where safe)
- **Trailing Commas**: Always use in multi-line structures
- **Arrow Functions**: Always use parentheses around parameters

### Naming Conventions
- **Components**: PascalCase (e.g., `Navigation`, `ThemeToggle`, `AIBrain`)
- **Files**: Match component name for React components (e.g., `Navigation.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useSocket`, `usePWA`)
- **Utilities**: camelCase (e.g., `cn`, `sanitizeHtml`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `HTTP_STATUS`, `MAX_LENGTHS`)
- **Types/Interfaces**: PascalCase (e.g., `ContactFormRequest`, `UseSocketOptions`)
- **CSS Classes**: Tailwind utility classes, kebab-case for custom classes

### File Organization
- **Component Structure**: One component per file
- **Export Pattern**: Default export for main component, named exports for utilities
- **Import Order**:
  1. External dependencies (React, third-party libraries)
  2. Internal components (from `@/components`)
  3. Hooks (from `@/hooks`)
  4. Utilities (from `@/lib`)
  5. Types (from `@/types` or `@shared`)
  6. Styles (CSS imports)

### TypeScript Standards
- **Strict Mode**: Enabled in tsconfig.json
- **Type Annotations**: Explicit for function parameters and return types
- **Type Inference**: Allowed for simple variable assignments
- **Any Usage**: Avoided (warn level in Biome), use `unknown` instead
- **Interface vs Type**: Prefer `interface` for object shapes, `type` for unions/intersections
- **Const Assertions**: Use `as const` for literal types and readonly arrays

## Structural Conventions

### Component Patterns

#### Functional Components
```typescript
// Standard pattern with TypeScript
export default function ComponentName() {
  const [state, setState] = useState(initialValue)
  
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### Component with Props
```typescript
interface ComponentProps {
  title: string
  onAction?: () => void
}

export default function Component({ title, onAction }: ComponentProps) {
  // Implementation
}
```

#### Lazy Loading Pattern
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('@/components/HeavyComponent'))

// Usage
<Suspense fallback={<LoadingState />}>
  <HeavyComponent />
</Suspense>
```

### Custom Hooks Pattern
```typescript
interface UseHookOptions {
  option1?: string
  option2?: boolean
}

export function useCustomHook(options: UseHookOptions = {}) {
  const [state, setState] = useState()
  
  // Hook logic with useEffect, useCallback, etc.
  
  return {
    state,
    actions: {
      doSomething: () => {},
    },
  }
}
```

### API Route Handlers
```typescript
// Constants at top
const CONSTANTS = {
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
  // Other constants
} as const

export const handlerName = async (req: Request, res: Response) => {
  try {
    // Validation
    // Processing
    // Response
    return res.status(CONSTANTS.HTTP_STATUS.OK).json(response)
  } catch (error) {
    // Error handling
    return res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse)
  }
}
```

## Semantic Patterns

### React Patterns

#### State Management
- Use `useState` for local component state
- Use `useRef` for mutable values that don't trigger re-renders
- Use `useCallback` for memoized callbacks passed to child components
- Use `useMemo` for expensive computations
- Use Zustand for global state (lightweight alternative to Redux)

#### Effect Patterns
```typescript
// Cleanup pattern
useEffect(() => {
  const subscription = subscribe()
  
  return () => {
    subscription.unsubscribe()
  }
}, [dependencies])

// Conditional execution
useEffect(() => {
  if (condition) {
    doSomething()
  }
}, [condition])
```

#### Event Handlers
```typescript
// Inline for simple handlers
<button onClick={() => setState(newValue)}>Click</button>

// Extracted for complex logic
const handleClick = useCallback(() => {
  // Complex logic
}, [dependencies])

<button onClick={handleClick}>Click</button>
```

### Accessibility Patterns

#### Semantic HTML
- Use semantic elements: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Always include `aria-label` or `aria-labelledby` for landmarks
- Use `aria-describedby` for additional context
- Include `aria-hidden="true"` for decorative icons

#### Form Accessibility
```typescript
<label htmlFor="inputId" className="...">
  Label Text
</label>
<Input
  id="inputId"
  type="text"
  aria-describedby="inputId-error"
  required
/>
<div id="inputId-error" className="sr-only" aria-live="polite"></div>
```

#### Skip Links
```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ..."
>
  Skip to main content
</a>
```

### Security Patterns

#### Input Sanitization
```typescript
// Trim and normalize
const sanitized = input.trim().toLowerCase()

// HTML entity encoding
const sanitizeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
```

#### Validation Patterns
```typescript
// Length validation
if (input.length > MAX_LENGTH) {
  return error
}

// Pattern matching
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return error
}

// Dangerous pattern detection
const dangerousPatterns = [/<script/gi, /javascript:/gi]
for (const pattern of dangerousPatterns) {
  if (pattern.test(input)) {
    return error
  }
}
```

### Error Handling Patterns

#### Try-Catch with Typed Errors
```typescript
try {
  await riskyOperation()
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  console.error(message)
}
```

#### Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

## Internal API Usage

### Path Aliases
```typescript
// Use @ for client code
import { Component } from '@/components/Component'
import { useHook } from '@/hooks/useHook'
import { utility } from '@/lib/utility'

// Use @shared for shared code
import type { ApiType } from '@shared/api'
```

### Utility Functions

#### Class Name Merging
```typescript
import { cn } from '@/lib/utils'

// Merge Tailwind classes with conditional logic
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### Component Composition

#### Radix UI Pattern
```typescript
// Re-export Radix primitives with semantic names
import * as PrimitiveName from '@radix-ui/react-primitive'

const Component = PrimitiveName.Root
const ComponentTrigger = PrimitiveName.Trigger
const ComponentContent = PrimitiveName.Content

export { Component, ComponentTrigger, ComponentContent }
```

#### Wrapper Components
```typescript
// Extend Radix with custom styling
import * as RadixDialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Dialog = RadixDialog.Root

const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Content
    ref={ref}
    className={cn('custom-styles', className)}
    {...props}
  >
    {children}
  </RadixDialog.Content>
))
DialogContent.displayName = 'DialogContent'

export { Dialog, DialogContent }
```

## Code Idioms

### Frequently Used Patterns

#### Conditional Rendering
```typescript
// Boolean condition
{isVisible && <Component />}

// Ternary for alternatives
{isLoading ? <Spinner /> : <Content />}

// Null coalescing
{data ?? <EmptyState />}
```

#### Array Mapping
```typescript
{items.map((item) => (
  <Component key={item.id} {...item} />
))}
```

#### Object Destructuring
```typescript
// Props destructuring
const { title, description, ...rest } = props

// State destructuring
const [state, setState] = useState()
```

#### Spread Operators
```typescript
// Props spreading
<Component {...commonProps} specificProp="value" />

// Object merging
const merged = { ...defaults, ...overrides }
```

### Constants Definition
```typescript
// Group related constants
const FEATURE_CONSTANTS = {
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
  },
  MAX_LENGTHS: {
    NAME: 100,
    MESSAGE: 1000,
  },
  TIMING: {
    DELAY_MS: 1000,
    TIMEOUT_MS: 5000,
  },
} as const

// Use with dot notation
if (status === FEATURE_CONSTANTS.HTTP_STATUS.OK) {
  // Handle success
}
```

### Type Guards
```typescript
// Check for Error type
if (error instanceof Error) {
  console.error(error.message)
}

// Check for array
if (Array.isArray(data)) {
  setItems(data as Item[])
}
```

## Popular Annotations

### TypeScript Annotations

#### Type Assertions
```typescript
// As const for literal types
const config = {
  mode: 'production',
  port: 3000,
} as const

// Type casting when necessary
const element = document.getElementById('id') as HTMLInputElement
```

#### Generic Types
```typescript
// Generic function
function identity<T>(value: T): T {
  return value
}

// Generic component props
interface Props<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}
```

### React Annotations

#### Component Display Names
```typescript
Component.displayName = 'ComponentName'
```

#### Prop Types (via TypeScript)
```typescript
interface ComponentProps {
  required: string
  optional?: number
  callback?: (value: string) => void
}
```

### Testing Annotations

#### Test IDs
```typescript
<div data-testid="component-name">
  {/* Content */}
</div>
```

#### ARIA Attributes
```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
>
  Close
</button>
```

## Best Practices Summary

### Performance
- Use lazy loading for heavy components (Three.js, charts)
- Implement code splitting at route level
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for pure components that re-render frequently

### Security
- Always sanitize user input
- Validate on both client and server
- Use environment variables for secrets
- Implement rate limiting on API endpoints
- Use HTTPS in production

### Accessibility
- Include semantic HTML elements
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

### Testing
- Write unit tests for utilities and hooks
- Write E2E tests for critical user flows
- Use data-testid for test selectors
- Mock external dependencies
- Aim for >80% code coverage

### Code Organization
- Keep components small and focused
- Extract reusable logic into hooks
- Group related files in feature folders
- Use barrel exports (index.ts) for cleaner imports
- Document complex logic with comments
