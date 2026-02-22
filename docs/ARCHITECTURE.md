# Application Architecture

## Overview

This is a **React 19 Single-Page Application (SPA)** built with Vite 7, deployed on **AWS Amplify** (App ID: `d1zjif7pi1h3om`). It serves as a personal portfolio for Themistoklis Baltzakis — a Systems & Network Engineer with full-stack and AI development skills.


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 (SPA) |
| Build tool | Vite 7 |
| Language | TypeScript 5.9.3 |
| Styling | Tailwind CSS v4 |
| UI components | Radix UI, shadcn/ui |
| Routing | React Router DOM v7 |
| 3D graphics | Three.js |
| Real-time | Socket.IO |
| PWA | Workbox (service worker) |
| Backend | Express.js (Node) |
 | Deployment | AWS Amplify (us-east-1) |
| Analytics | Google Analytics GA4 |
| Security | reCAPTCHA v3 |

---

## Directory Structure

```
new-portfolio/
├── client/                   # React frontend source
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route-level page components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions & API clients
│   ├── data/                 # Static data (resume, projects, etc.)
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Root app with routing
│   ├── main.tsx              # Entry point
│   ├── global.css            # Global styles
│   └── index.html            # HTML template
├── server/                   # Express backend
│   ├── routes/               # API route handlers
│   └── index.ts              # Server entry point
├── shared/                   # Shared types between client & server
├── playwright-tests/         # E2E test suite
├── docs/                     # Project documentation
├── amplify/                  # AWS Amplify configuration
├── public/                   # Static assets
├── scripts/                  # Build & utility scripts
├── playwright.config.ts      # Playwright test config
├── vite.config.ts            # Vite build config
├── tailwind.config.ts        # Tailwind config
└── tsconfig.json             # TypeScript config
```

---

## Frontend Architecture

### Routing

Client-side routing is handled by **React Router DOM v7**. All navigation uses `<Link>` components (not `<a>` tags) to prevent full page reloads in the SPA.

**Route Map:**

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Home / landing page |
| `/about` | `About` | Professional bio & skills |
| `/product` | `Product` | Work experience timeline |
| `/projects` | `Projects` | Portfolio projects gallery |
| `/resume` | `Resume` | Interactive resume builder |
| `/agents` | `Agents` | AI agents showcase |
| `/contact` | `Contact` (inline) | Contact form |
| `/settings` | `Settings` | App preferences |
| `/performance` | `Performance` | Performance monitoring dashboard |
| `*` | `NotFound` | 404 fallback |

### Page Components

#### `Index.tsx` — Home Page
- Hero section with animated introduction
- Feature cards (Skills, Experience, Projects)
- Inline contact form with reCAPTCHA v3 validation
- Calls `POST /api/contact` on submission
- AnimatedSection wrapper for scroll-triggered animations

#### `About.tsx` — About Page
- Professional biography
- Skills and technology stack
- Career timeline

#### `Product.tsx` — Work Experience
- Lists professional work experiences as timeline cards
- Each experience has: company, position, period, location, responsibilities array
- Uses `CircuitBackground` animated background component
- Navigation link back to home

#### `Projects.tsx` — Projects Gallery
- Portfolio projects with filtering by category
- Project cards with links, descriptions, and tech tags
- GitHub integration for live repository data

#### `Resume.tsx` — Interactive Resume Builder
- Tabbed editor: Personal Info, Experience, Education, Certifications, Skills
- Live preview panel (side-by-side on desktop, stacked on mobile)
- Auto-save to `localStorage` with 2-second debounce
- PDF download via `generateResumePDF()` utility
- Pre-populated with real resume data for Themistoklis Baltzakis

#### `Agents.tsx` — AI Agents
- Showcases AI agent capabilities and integrations
- Demonstrates agentic workflows
- Links to demos and source code

#### `Settings.tsx` — Application Settings
- **Appearance**: Theme (light/dark/system), animations toggle, reduced motion
- **Notifications**: Push notification enable/disable
- **Privacy**: Analytics consent, data export, data clear
- **About**: App version, update checker (queries `/api/version/latest`), changelog link
- **Real-time Features (Beta)**: Uses `RealtimeTest` component via Socket.IO

#### `Performance.tsx` — Performance Dashboard
- Real-time memory, CPU, and network metrics (polled via `setInterval`)
- Lighthouse score display
- Bundle analysis visualization
- `PerformanceTester` and `PushNotificationTester` (lazy-loaded)
- Buttons to run tests and generate JSON performance reports

### Key Components

| Component | Purpose |
|---|---|
| `Navigation` | Top navbar with SPA `<Link>` routing, mobile hamburger menu |
| `CircuitBackground` | Animated SVG/Canvas circuit board background |
| `AnimatedSection` | Intersection Observer scroll animation wrapper |
| `ThemeSwitcher` | Light/dark/system theme toggle |
| `OptimizedImage` | Lazy-loading, responsive image wrapper |
| `Skeleton` | Loading placeholder animations |
| `HoverAnimations` | CSS/JS hover interaction effects |
| `RealtimeTest` | Socket.IO connection tester |
| `PerformanceTester` | Performance benchmark runner |
| `PushNotificationTester` | Push notification API tester |

---

## Backend Architecture

### Server (`server/`)

Express.js API server providing:

| Route | Method | Description |
|---|---|---|
| `POST /api/contact` | POST | Contact form submission with reCAPTCHA, XSS protection |
| `GET /api/github/*` | GET | GitHub profile/repo data proxy |
| `GET /api/resume` | GET | Resume data endpoint |
| `POST /api/analytics` | POST | Analytics event tracking |
| `GET /api/push-notifications` | GET | Push subscription management |
| `POST /api/ai/*` | POST | AI agent endpoints |
| `GET /api/demo/*` | GET | Demo content endpoints |

### Contact Route (`server/routes/contact.ts`)
- Input validation (name, email, message required)
- Comprehensive XSS/SQL injection/command injection pattern blocking
- reCAPTCHA v3 token verification against Google's API
- Email dispatch (configurable SMTP)
- Rate limiting applied

### GitHub Route (`server/routes/github.ts`)
- Proxies GitHub REST API v3 requests
- Caches responses to avoid rate limits
- Returns user profile and repository lists

---

## PWA (Progressive Web App)

- Service worker via **Workbox** (auto-generated during Vite build)
- Offline-first caching strategy for static assets
- App manifest for installability
- Background sync for contact form (when offline)
- Push notification support via Web Push API

---

## Analytics & Monitoring

- **Google Analytics GA4**: Tracks page views, events, user journeys
- **Custom analytics route** (`/api/analytics`): Server-side event logging
- **Performance monitoring**: Web Vitals (CLS, FID, LCP, TTFB, FCP) reported to GA4

---

## Security

- **reCAPTCHA v3**: Applied to contact form submissions
- **Input sanitization**: XSS, SQL injection, and command injection patterns blocked server-side
- **CORS**: Configured for allowed origins
- **Helmet.js**: HTTP security headers
- **Rate limiting**: Applied to API endpoints
- **Content Security Policy (CSP)**: Configured in Amplify headers

---

## Deployment

- **Platform**: AWS Amplify (App ID: `d1zjif7pi1h3om`)
- **Build**: `npm run build` → Vite bundles to `dist/`
- **Server**: Express runs as Lambda function or Amplify Server-Side Rendering
- **CI/CD**: GitHub Actions + Amplify auto-deploy on push to `main`
- **Config**: `amplify.yml` defines build phases

### Environment Variables (required)
```
VITE_GA_MEASUREMENT_ID     # Google Analytics GA4 measurement ID
VITE_RECAPTCHA_SITE_KEY    # reCAPTCHA v3 site key
RECAPTCHA_SECRET_KEY       # reCAPTCHA v3 secret (server-side)
GITHUB_TOKEN               # GitHub API token
CONTACT_EMAIL              # Destination email for contact form
SMTP_HOST / SMTP_PORT      # Mail server config
```

---

## State Management

- **Local component state**: `useState` / `useReducer`
- **Theme**: CSS custom properties + `localStorage` persistence
- **Resume data**: `localStorage` auto-save
- **Real-time state**: Socket.IO event listeners in component hooks

---

## Testing Strategy

See [`docs/TESTING.md`](./TESTING.md) for the complete testing guide.

- **E2E Tests**: Playwright (50+ spec files in `playwright-tests/`)
- **Test utilities**: `playwright-tests/test-utils.ts`
- **Coverage target**: 100% page and feature coverage
