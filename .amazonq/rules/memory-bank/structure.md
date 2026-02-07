# Project Structure

## Directory Organization

### Root Level
```
new-portfolio/
├── client/              # Frontend React application
├── server/              # Backend Express server
├── shared/              # Shared types and utilities
├── amplify/             # AWS Amplify configuration
├── playwright-tests/    # E2E test suites
├── tests/               # Unit test suites
├── scripts/             # Build and utility scripts
├── docs/                # Project documentation
├── public/              # Static assets
└── .github/             # CI/CD workflows
```

### Client Directory (`client/`)
Frontend application structure:
- **components/**: React components organized by feature
  - `ui/`: Radix UI-based design system components
  - `agents/`: AI agent-related components
  - `realtime/`: Socket.io real-time features
- **pages/**: Route-level page components (About, Projects, Contact, etc.)
- **hooks/**: Custom React hooks for shared logic
- **lib/**: Utility libraries and service integrations
- **types/**: TypeScript type definitions
- **data/**: Static data and configuration

### Server Directory (`server/`)
Backend Express application:
- **routes/**: API endpoint handlers
  - `ai.ts`: AI agent endpoints
  - `analytics.ts`: Analytics tracking
  - `contact.ts`: Contact form handling
  - `github.ts`: GitHub API integration
  - `push-notifications.ts`: Web Push endpoints
  - `resume.ts`: Resume generation
- **index.ts**: Main server entry point
- **logger.ts**: Logging configuration
- **sentry.ts**: Error monitoring setup

### Shared Directory (`shared/`)
Code shared between client and server:
- **api.ts**: API type definitions and contracts

### Amplify Directory (`amplify/`)
AWS deployment configuration:
- **backend/**: Amplify backend resources
- **functions/**: Lambda function definitions
- **backend.ts**: Amplify backend configuration

### Testing Structure
- **playwright-tests/**: E2E tests organized by feature
  - `real-api/`: Tests for external API integrations
  - Individual spec files for each page/feature
- **tests/**: Unit tests mirroring source structure
  - `components/`: Component tests
  - `pages/`: Page-level tests
  - `__mocks__/`: Test mocks and fixtures

### Scripts Directory (`scripts/`)
Automation and utility scripts:
- Build scripts: `build-resume.js`, `optimize-images.js`
- Testing scripts: `run-playwright-with-dashboard.js`, `continuous-test.js`
- Deployment scripts: `verify-deployment.sh`, `update-aws-secrets.js`
- Setup scripts: `setup-tools.js`, `setup-codacy-coverage.js`

## Core Components and Relationships

### Frontend Architecture
```
App.tsx (Root)
├── ThemeProvider (Theme management)
├── ErrorBoundary (Error handling)
├── Router (react-router-dom)
│   ├── Navigation (Global nav)
│   ├── Pages (Route components)
│   └── PageTransition (Animations)
├── PerformanceMonitor (Metrics)
└── PWAUpdateNotification (Service worker)
```

### Component Hierarchy
- **Layout Components**: Navigation, ThemeProvider, ErrorBoundary
- **Page Components**: Index, About, Projects, Contact, Resume, Settings
- **Feature Components**: Interactive3DDemo, AIAssistant, SearchableProjects
- **UI Components**: Radix-based primitives (Button, Dialog, Toast, etc.)
- **Utility Components**: OptimizedImage, Skeleton, LoadingAnimations

### Backend Architecture
```
Express Server
├── Middleware (CORS, compression, security)
├── Routes
│   ├── /api/ai (AI agent endpoints)
│   ├── /api/analytics (GA4 tracking)
│   ├── /api/contact (Form submission)
│   ├── /api/github (Repository data)
│   ├── /api/push-notifications (Web Push)
│   └── /api/resume (PDF generation)
├── Socket.io (Real-time communication)
└── Error Handling (Sentry integration)
```

### Data Flow
1. **Client Request** → React Router → Page Component
2. **API Call** → lib/api.ts → Express Route Handler
3. **Real-time** → Socket.io Client → Socket.io Server → Broadcast
4. **State Management** → Zustand stores (local state)
5. **External APIs** → Firebase, GitHub, Google Analytics

## Architectural Patterns

### Frontend Patterns
- **Component Composition**: Radix UI primitives composed into custom components
- **Custom Hooks**: Reusable logic extraction (useSocket, usePWA, usePerformanceMonitoring)
- **Code Splitting**: Dynamic imports for heavy components (Three.js, charts)
- **Error Boundaries**: Graceful error handling at component boundaries
- **Lazy Loading**: Route-based and component-based lazy loading

### Backend Patterns
- **RESTful API**: Standard HTTP methods and status codes
- **Middleware Chain**: Request processing pipeline
- **Error Handling**: Centralized error middleware with Sentry
- **Environment Config**: dotenv-based configuration management
- **Serverless Ready**: Designed for AWS Lambda deployment

### Build Patterns
- **Multi-stage Builds**: Separate client and server builds
- **Asset Optimization**: Image compression, code minification
- **Bundle Splitting**: Vendor chunks, route chunks, component chunks
- **Cache Strategies**: Service worker caching with Workbox
- **Tree Shaking**: Aggressive unused code elimination

### Testing Patterns
- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing with Playwright
- **Visual Regression**: Screenshot comparison (Playwright)
- **Performance Tests**: Lighthouse CI integration

## Configuration Files

### Build Configuration
- **vite.config.ts**: Frontend build configuration with plugins
- **vite.config.server.ts**: Backend build configuration
- **tsconfig.json**: TypeScript compiler options
- **tailwind.config.ts**: Tailwind CSS customization
- **postcss.config.js**: PostCSS plugins

### Quality Tools
- **biome.json**: Linting and formatting rules
- **.codacy.yml**: Code quality configuration
- **playwright.config.ts**: E2E test configuration
- **vitest.config.ts**: Unit test configuration

### Deployment
- **amplify.yml**: AWS Amplify build specification
- **.github/workflows/**: CI/CD pipeline definitions
- **package.json**: Scripts and dependencies

## Module Boundaries

### Client Modules
- Pages can import from components, hooks, lib, types
- Components can import from hooks, lib, types
- Hooks can import from lib, types
- Lib can import from types
- Types are standalone

### Server Modules
- Routes can import from shared, logger, sentry
- Shared code is imported by both client and server
- No circular dependencies between modules

### External Dependencies
- **React Ecosystem**: react, react-dom, react-router-dom
- **UI Libraries**: @radix-ui/*, lucide-react, framer-motion
- **Backend**: express, socket.io, firebase
- **Testing**: vitest, playwright, @testing-library/*
- **Build Tools**: vite, typescript, tailwindcss
