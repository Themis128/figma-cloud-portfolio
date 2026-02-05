# New Portfolio App - Upgrade Plan

## Project Overview

A modern, full-stack portfolio website built with React, TypeScript, Express, and deployed on AWS Amplify. This upgrade plan focuses on improving performance, security, and maintainability by updating dependencies and adding new features.

## Current Tech Stack

- **Frontend**: React 18.3.1, TypeScript 5.9.3, Vite 7.3.1, Tailwind CSS 3.4.19
- **Backend**: Express.js 5.2.1, Socket.io 4.8.3, Firebase 12.8.0
- **Testing**: Vitest 3.2.4, Playwright 1.58.0
- **Code Quality**: Biome 2.3.12, Codacy
- **Performance**: Vite PWA, Web Vitals, Sentry 10.36.0

## Upgrade Plan Summary

### 1. Core Dependency Upgrades (High Priority)

#### 1.1 React & React DOM (Complexity: 7/10)

- Upgrade from React 18.3.1 to latest React 19.x
- Benefits: Improved performance, new features (Server Components, Suspense), better error handling
- Changes: Update package.json, check for compatibility with existing code, update React Router
- Code Example:
  ```json
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
  ```

#### 1.2 TypeScript (Complexity: 5/10)

- Upgrade from TypeScript 5.9.3 to TypeScript 6.x
- Benefits: Improved type safety, faster compilation, new language features (Pattern Matching, Decorators)
- Changes: Update tsconfig.json with stricter type checking options
- Code Example:

  ```json
  "devDependencies": {
    "typescript": "^6.0.0"
  }

  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
  ```

#### 1.3 Vite (Complexity: 6/10)

- Upgrade from Vite 7.3.1 to Vite 8.x
- Benefits: Faster build times, better tree-shaking, improved developer experience
- Changes: Update vite.config.ts, related plugins
- Code Example:
  ```json
  "devDependencies": {
    "vite": "^8.0.0",
    "@vitejs/plugin-react-swc": "^5.0.0"
  }
  ```

#### 1.4 Tailwind CSS (Complexity: 8/10)

- Upgrade from Tailwind CSS 3.4.19 to Tailwind CSS 4.x
- Benefits: Improved utility classes, better performance, new features (Just-in-Time mode improvements)
- Changes: Update tailwind.config.ts, postcss.config.js
- Code Example:
  ```json
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "postcss": "^9.0.0",
    "autoprefixer": "^10.4.0"
  }
  ```

### 2. Backend Upgrades (Medium Priority)

#### 2.1 Express.js (Complexity: 4/10)

- Upgrade from Express.js 5.2.1 to 5.x stable
- Benefits: Improved performance, security fixes, new features
- Changes: Check for breaking changes in API
- Code Example:
  ```json
  "dependencies": {
    "express": "^5.0.0"
  }
  ```

#### 2.2 Firebase (Complexity: 5/10)

- Upgrade from Firebase 12.8.0 to 13.x
- Benefits: Improved performance, security, new features
- Changes: Update Firebase configuration and related code
- Code Example:
  ```json
  "dependencies": {
    "firebase": "^13.0.0"
  }
  ```

### 3. Testing & Code Quality Upgrades

#### 3.1 Playwright (Complexity: 5/10)

- Upgrade from Playwright 1.58.0 to 2.x
- Benefits: Improved E2E testing capabilities, better browser support
- Changes: Update playwright.config.ts if necessary
- Code Example:
  ```json
  "devDependencies": {
    "@playwright/test": "^2.0.0"
  }
  ```

#### 3.2 Vitest (Complexity: 4/10)

- Upgrade from Vitest 3.2.4 to 4.x
- Benefits: Improved unit testing capabilities, better performance
- Changes: Update vitest.config.ts if necessary
- Code Example:
  ```json
  "devDependencies": {
    "vitest": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0"
  }
  ```

#### 3.3 Biome (Complexity: 4/10)

- Upgrade from Biome 2.3.12 to 3.x
- Benefits: Faster linting and formatting, improved error detection
- Changes: Check for configuration breaking changes
- Code Example:
  ```json
  "devDependencies": {
    "@biomejs/biome": "^3.0.0"
  }
  ```

### 4. UI & Animation Upgrades

#### 4.1 Radix UI Components (Complexity: 7/10)

- Upgrade all Radix UI components to latest versions
- Benefits: Improved accessibility, performance, new features
- Changes: Check for breaking changes in component APIs
- Code Example:
  ```json
  "devDependencies": {
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.0",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.3.0",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-hover-card": "^1.1.0",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.3.0",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.2.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.3.0",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.2.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.2.0"
  }
  ```

#### 4.2 Framer Motion (Complexity: 4/10)

- Upgrade from Framer Motion 12.29.0 to 13.x
- Benefits: Improved animation performance, new features, better React 18+ compatibility
- Code Example:
  ```json
  "devDependencies": {
    "framer-motion": "^13.0.0"
  }
  ```

### 5. Data Management & Performance

#### 5.1 React Query (Complexity: 6/10)

- Upgrade from React Query 5.90.20 to 6.x
- Benefits: Improved data fetching, caching, performance
- Changes: Check for breaking changes in API
- Code Example:
  ```json
  "devDependencies": {
    "@tanstack/react-query": "^6.0.0"
  }
  ```

#### 5.2 React Router (Complexity: 5/10)

- Upgrade from React Router 7.13.0 to 7.x
- Benefits: Improved routing capabilities, better performance
- Changes: Check for breaking changes in API
- Code Example:
  ```json
  "devDependencies": {
    "react-router-dom": "^7.0.0"
  }
  ```

### 6. Error Tracking & Monitoring

#### 6.1 Sentry SDK (Complexity: 6/10)

- Upgrade from Sentry 10.36.0 to 11.x
- Benefits: Improved error tracking and performance monitoring
- Changes: Update sentry configuration in both frontend and backend
- Code Example:
  ```json
  "dependencies": {
    "@sentry/node": "^11.0.0",
    "@sentry/react": "^11.0.0",
    "@sentry/tracing": "^11.0.0"
  }
  ```

### 7. Performance Optimization Features

#### 7.1 TypeScript Strict Mode Improvements (Complexity: 3/10)

- Enhance TypeScript configuration with stricter type checking
- Benefits: Improved code quality, catch more errors at compile time
- Changes: Update tsconfig.json
- Code Example:
  ```json
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true
  }
  ```

#### 7.2 Vite Build Optimization (Complexity: 6/10)

- Enhance Vite build configuration for faster build times and smaller bundles
- Changes: Update vite.config.ts
- Code Example:
  ```typescript
  build: {
    outDir: '../dist/spa',
    rollupOptions: {
      output: {
        manualChunks: {
          framework: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [...radixComponents, 'lucide-react', 'sonner'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          utils: ['clsx', 'tailwind-merge', 'date-fns', 'zod'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          state: ['@tanstack/react-query'],
          performance: ['web-vitals']
        }
      }
    },
    chunkSizeWarningLimit: 400,
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext',
    assetsInlineLimit: 4096,
    cssTarget: ['chrome61', 'firefox60', 'safari11', 'edge16']
  }
  ```

#### 7.3 Accessibility Improvements (Complexity: 7/10)

- Enhance accessibility with ARIA labels, semantic HTML, keyboard navigation
- Benefits: Improved accessibility for screen reader users
- Code Example:
  ```jsx
  <button
    aria-label="Toggle navigation menu"
    aria-expanded={isMenuOpen}
    aria-controls="navigation-menu"
    onKeyDown={handleKeyDown}
    tabIndex={0}
  >
    {isMenuOpen ? "Close" : "Open"}
  </button>
  ```

#### 7.4 Performance Monitoring Enhancements (Complexity: 8/10)

- Add more detailed web vitals tracking
- Benefits: Better performance analysis and optimization
- Code Example:

  ```typescript
  import { getCLS, getFID, getLCP, getTTFB, getFCP } from "web-vitals";

  const sendToAnalytics = (metric) => {
    const body = JSON.stringify(metric);
    const url = "/api/analytics";

    navigator.sendBeacon(url, body);
  };

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  getFCP(sendToAnalytics);
  ```

#### 7.5 PWA Feature Upgrades (Complexity: 8/10)

- Enhance PWA capabilities with updated service worker, offline support
- Changes: Update service worker, push notification functionality
- Code Example:
  ```javascript
  self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title || "Portfolio Update";
    const options = {
      body: data.body || "New content available!",
      icon: "/logo.jpg",
      badge: "/badge.png",
      vibrate: [200, 100, 200],
      tag: "portfolio-update",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  });
  ```

#### 7.6 Security Enhancements (Complexity: 6/10)

- Update security headers and CSP (Content Security Policy)
- Benefits: Improved security against XSS and other attacks
- Code Example:
  ```typescript
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.github.com https://www.google-analytics.com;",
    'X-DNS-Prefetch-Control': 'off'
  }
  ```

### 8. CI/CD Pipeline Improvements (Complexity: 8/10)

- Enhance CI/CD pipeline with more detailed testing, security scanning
- Benefits: Faster releases, better reliability
- Code Example (GitHub Actions):

  ```yaml
  name: CI/CD Pipeline
  on: [push, pull_request]

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
        - run: npm ci
        - run: npm run build
        - run: npm run test:coverage
        - uses: codecov/codecov-action@v3
  ```

## Implementation Strategy

### Phase 1: Core Dependency Updates (Weeks 1-2)

1. Update React & React DOM to 19.x
2. Update TypeScript to 6.x
3. Update Vite to 8.x
4. Update Vitest to 4.x
5. Update React Router to 7.x

### Phase 2: UI & Animation Updates (Weeks 3-4)

1. Update Tailwind CSS to 4.x
2. Update all Radix UI components to latest versions
3. Update Framer Motion to 13.x
4. Update React Query to 6.x

### Phase 3: Backend & Security (Weeks 5-6)

1. Update Express.js to 5.x stable
2. Update Firebase to 13.x
3. Update Sentry SDK to 11.x
4. Update security headers and CSP
5. Improve accessibility features

### Phase 4: Testing & Performance (Weeks 7-8)

1. Update Playwright to 2.x
2. Update Biome to 3.x
3. Enhance performance monitoring
4. Upgrade PWA features
5. Optimize Vite build configuration

### Phase 5: CI/CD & Deployment (Week 9)

1. Improve CI/CD pipeline
2. Test all features thoroughly
3. Deploy to staging environment
4. Perform final testing and optimization

## Risk Management

### High Risk Items

- Tailwind CSS 4.x upgrade may have breaking changes
- React 19.x may require significant code changes
- Firebase 13.x may require configuration updates

### Mitigation Strategies

- Test upgrades in staging environment first
- Create detailed test plans for each upgrade
- Implement feature flags for risky changes
- Maintain rollback plans for critical functionality

## Expected Benefits

1. **Performance**: Faster load times, improved bundle sizes, better web vitals
2. **Security**: Enhanced CSP, security headers, updated dependencies
3. **Maintainability**: Up-to-date dependencies, better type safety
4. **Accessibility**: Improved ARIA support,
