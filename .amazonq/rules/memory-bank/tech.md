# Technology Stack

## Programming Languages

### TypeScript (v5.9.3)
- **Usage**: Primary language for both frontend and backend
- **Configuration**: Strict mode enabled, ESNext target
- **Type Safety**: Comprehensive type definitions for all modules
- **Compiler Options**: Path aliases (@/, @shared), JSX support

### JavaScript (ES2022+)
- **Usage**: Build scripts, configuration files
- **Module System**: ES Modules (type: "module" in package.json)

### Python (3.14)
- **Usage**: Utility scripts for analysis and reporting
- **Scripts**: extract_report.py, analyze_stats.py

## Frontend Technologies

### Core Framework
- **React 19.2.4**: Latest React with concurrent features
- **React DOM 19.2.4**: Client-side rendering
- **React Router DOM 7.13.0**: Client-side routing with data loading

### UI Libraries
- **Radix UI**: Accessible component primitives
  - Dialog, Dropdown, Tooltip, Toast, Accordion, Popover, Select, Tabs
  - All components follow WAI-ARIA patterns
- **Tailwind CSS 4.1.18**: Utility-first CSS framework
- **Framer Motion 12.29.2**: Animation library
- **Lucide React 0.539.0**: Icon library
- **Headless UI 2.2.9**: Additional unstyled components

### 3D Graphics
- **Three.js 0.182.0**: WebGL 3D library
- **@react-three/fiber 8.18.0**: React renderer for Three.js
- **@react-three/drei 9.122.0**: Useful helpers for react-three-fiber

### State Management
- **Zustand 5.0.10**: Lightweight state management
- **@tanstack/react-query 5.90.20**: Server state management

### Forms & Validation
- **React Hook Form 7.71.1**: Form state management
- **@hookform/resolvers 5.2.2**: Validation resolvers
- **Zod 3.25.76**: Schema validation

## Backend Technologies

### Server Framework
- **Express 5.2.1**: Web application framework
- **Compression 1.7.4**: Response compression middleware
- **CORS 2.8.6**: Cross-origin resource sharing

### Real-time Communication
- **Socket.io 4.8.3**: WebSocket server
- **Socket.io-client 4.8.3**: WebSocket client

### External Services
- **Firebase 12.8.0**: Authentication and database
- **Web Push 3.6.7**: Push notification server
- **Node Fetch 3.3.2**: HTTP client for Node.js

### Monitoring & Analytics
- **@sentry/react 10.38.0**: Frontend error tracking
- **@sentry/node 10.38.0**: Backend error tracking
- **React GA4 2.1.0**: Google Analytics 4 integration
- **Web Vitals 5.1.0**: Performance metrics

## Build System

### Primary Build Tool
- **Vite 7.3.1**: Fast build tool and dev server
  - **Plugins**:
    - @vitejs/plugin-react 5.1.3: React support
    - @vitejs/plugin-react-swc 4.2.2: SWC-based React plugin
    - vite-plugin-pwa 1.2.0: Progressive Web App support
    - vite-plugin-image-optimizer 1.1.9: Image optimization
    - rollup-plugin-visualizer 5.14.0: Bundle analysis

### Bundler Configuration
- **Code Splitting**: Manual chunks for vendors, pages, components
- **Tree Shaking**: Aggressive unused code elimination
- **Minification**: esbuild for JS, esbuild for CSS
- **Asset Optimization**: Inline limit 4KB, hash-based naming

## Testing Framework

### Unit Testing
- **Vitest 4.0.18**: Fast unit test runner
- **@vitest/coverage-v8 4.0.18**: Code coverage
- **@testing-library/react 16.1.0**: React component testing
- **@testing-library/jest-dom 6.9.1**: Custom matchers
- **@testing-library/user-event 14.6.1**: User interaction simulation
- **jsdom 26.1.0**: DOM implementation for Node.js

### E2E Testing
- **Playwright 1.58.1**: Browser automation
  - Multi-browser support (Chromium, Firefox, WebKit)
  - Mobile device emulation
  - Screenshot and video recording
  - Trace viewer for debugging

## Code Quality Tools

### Linting & Formatting
- **Biome 2.3.13**: Fast linter and formatter (primary)
  - Replaces ESLint and Prettier
  - Faster than traditional tools
- **ESLint (legacy)**: TypeScript and React plugins
  - @typescript-eslint/eslint-plugin 8.53.1
  - @typescript-eslint/parser 8.53.1
  - eslint-plugin-react 7.37.5
  - eslint-plugin-react-hooks 7.0.1

### Code Analysis
- **Codacy**: Automated code review and quality metrics
- **TypeScript Compiler**: Static type checking
- **cspell**: Spell checking for code

## Development Tools

### Package Manager
- **pnpm 10.14.0**: Fast, disk space efficient package manager
  - Workspace support
  - Peer dependency resolution
  - Overrides for security patches

### Task Runners
- **npm-run-all 4.1.5**: Run multiple npm scripts
- **concurrently 9.2.1**: Run commands concurrently
- **cross-env 10.1.0**: Cross-platform environment variables

### Utilities
- **tsx 4.21.0**: TypeScript execution for Node.js
- **dotenv 17.2.3**: Environment variable management
- **sharp 0.34.5**: Image processing
- **puppeteer 24.36.0**: Headless browser for PDF generation

## Deployment & Infrastructure

### Cloud Platform
- **AWS Amplify**: Hosting and deployment
  - @aws-amplify/backend 1.20.0
  - @aws-sdk/client-amplify 3.975.0

### CI/CD
- **GitHub Actions**: Automated workflows
  - ci.yml: Continuous integration
  - deploy-production.yml: Production deployment
  - deploy-staging.yml: Staging deployment
  - playwright.yml: E2E test execution

### Serverless
- **serverless-http 3.2.0**: Express to Lambda adapter
- **@sparticuz/chromium 123.0.1**: Chromium for Lambda

## Development Commands

### Development
```bash
pnpm dev              # Start frontend dev server (port 8082)
pnpm dev:all          # Start frontend + backend (port 3002)
pnpm start            # Start production server
```

### Building
```bash
pnpm build            # Full production build
pnpm build:client     # Build frontend only
pnpm build:server     # Build backend only
pnpm build:resume     # Generate resume PDF
pnpm build:analyze    # Build with bundle analysis
```

### Testing
```bash
pnpm test             # Run unit tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm test:coverage    # Run tests with coverage
```

### Code Quality
```bash
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm format:fix       # Format and fix code
pnpm typecheck        # Run TypeScript checks
pnpm check            # Run all checks (typecheck + lint + format)
```

### Utilities
```bash
pnpm optimize-images  # Optimize images
pnpm setup:tools      # Install external tools
pnpm setup:playwright # Install Playwright browsers
pnpm clean            # Clean build artifacts
pnpm clean:deps       # Clean dependencies
```

## Environment Variables

### Required Variables
```env
# Firebase
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY

# Analytics
VITE_GA_MEASUREMENT_ID
```

### Optional Variables
```env
# Codacy
CODACY_PROJECT_TOKEN

# Sentry
VITE_SENTRY_DSN
SENTRY_AUTH_TOKEN

# GitHub
GITHUB_TOKEN
```

## Browser Support

### Target Browsers
- Chrome/Edge 91+
- Firefox 89+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Polyfills
- None required (modern browsers only)
- Service Worker API for PWA features
- WebGL for 3D graphics

## Performance Targets

### Build Metrics
- Bundle size: <500KB per chunk
- Total bundle: <2MB (gzipped)
- Build time: <60s (production)

### Runtime Metrics
- First Contentful Paint: <2s
- Time to Interactive: <3.5s
- Lighthouse Score: >90 (all categories)
- Core Web Vitals: All "Good" ratings
