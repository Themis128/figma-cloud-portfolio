# Themistoklis Baltzakis — Portfolio

> Personal portfolio and professional showcase for Themistoklis Baltzakis, Systems & Network Engineer and Full-Stack Developer.

**Live Site:** [AWS Amplify](https://d1zjif7pi1h3om.amplifyapp.com) · **App ID:** `d1zjif7pi1h3om`

---

## Tech Stack

| Layer         | Technology           |
| ------------- | -------------------- |
| Framework     | React 19 (SPA)       |
| Build Tool    | Vite 7               |
| Language      | TypeScript 5.9.3     |
| Styling       | Tailwind CSS v4      |
| UI Components | Radix UI / shadcn/ui |
| Routing       | React Router DOM v7  |
| 3D            | Three.js             |
| Real-time     | Socket.IO            |
| PWA           | Workbox              |
| Backend       | Express.js           |
| Deployment    | AWS Amplify          |
| Analytics     | Google Analytics GA4 |
| Security      | reCAPTCHA v3         |
| Testing       | Playwright E2E       |

---

## Pages

| Route          | Description                                     |
| -------------- | ----------------------------------------------- |
| `/`            | Home — hero, feature cards, contact form        |
| `/about`       | Professional bio, skills, career timeline       |
| `/product`     | Work experience timeline                        |
| `/projects`    | Portfolio projects gallery (GitHub integration) |
| `/resume`      | Interactive resume builder with PDF export      |
| `/agents`      | AI agents showcase                              |
| `/settings`    | App preferences (theme, notifications, privacy) |
| `/performance` | Real-time performance monitoring dashboard      |
| `*`            | 404 Not Found fallback                          |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-v3-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-v3-secret
GITHUB_TOKEN=your-github-token
CONTACT_EMAIL=your@email.com
```

### Development

```bash
# Frontend (Vite dev server — default: http://localhost:8082)
pmn dev

# Backend (Express API server — default: http://localhost:3002)
npx tsx server/node-build.ts

# Start both servers together (concurrently)
pnpm dev:all
```

> Note: Playwright/CI now uses the canonical dev port `8082` by default — override with `PLAYWRIGHT_BASE_URL` if needed.
### Build

```bash
pnpm build
```

Output goes to `dist/`.

### Preview Production Build

```bash
pnpm preview
```

---

## Testing

This project uses **Playwright** for E2E testing with 100% page and feature coverage.

```bash
# Run all E2E tests
pnpm exec playwright test

# Interactive UI mode
pnpm exec playwright test --ui

# Run a specific spec
pnpm exec playwright test playwright-tests/product.spec.ts

# Run with visible browser
pnpm exec playwright test --headed

# HTML report
pnpm exec playwright test --reporter=html
```

See [`docs/TESTING.md`](docs/TESTING.md) for the complete testing guide including coverage map.

---

## Project Structure

```
new-portfolio/
├── client/               # React 19 frontend
│   ├── components/       # Reusable components
│   ├── pages/            # Route-level pages
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities & API clients
│   ├── data/             # Static data
│   └── App.tsx           # Root + routing
├── server/               # Express API
│   └── routes/           # API handlers
├── playwright-tests/     # E2E tests (50+ spec files)
├── docs/                 # Documentation
├── public/               # Static assets
├── amplify/              # AWS Amplify config
├── playwright.config.ts  # Playwright config
├── vite.config.ts        # Vite config
└── tailwind.config.ts    # Tailwind config
```

---

## Documentation

| Doc                                                            | Description                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                 | Full app architecture, tech stack, routing, backend                    |
| [`docs/TESTING.md`](docs/TESTING.md)                           | Testing guide, coverage map, best practices                            |
| [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md)         | AWS Amplify deployment steps                                           |
| [`docs/GITHUB_SECRETS_SETUP.md`](docs/GITHUB_SECRETS_SETUP.md) | GitHub Actions secrets configuration                                   |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)               | Server endpoints + shared TypeScript types (auto-sync source of truth) |
| [`docs/GA4_UPGRADE_GUIDE.md`](docs/GA4_UPGRADE_GUIDE.md)       | Google Analytics GA4 setup                                             |
| [`docs/SECURITY_SUMMARY.md`](docs/SECURITY_SUMMARY.md)         | Security measures overview                                             |
| [`docs/PWA_README.md`](docs/PWA_README.md)                     | PWA / service worker details                                           |
| [`docs/CONTACT_FORM_SETUP.md`](docs/CONTACT_FORM_SETUP.md)     | Contact form + reCAPTCHA setup                                         |

---

## Features

### 🎨 Interactive Resume Builder
- Live tabbed editor with real-time preview
- Auto-saves to localStorage (2s debounce)
- PDF download export

### 📊 Performance Dashboard
- Real-time memory, CPU, network metrics
- Lighthouse score display
- Bundle analysis

### 🔔 Push Notifications
- Web Push API integration
- Subscription management
- Background sync

### 🌐 PWA
- Workbox service worker
- Offline fallback
- Installable on mobile/desktop

### 🤖 AI Agents
- AI workflow demonstrations
- Agentic automation showcases

### 🔒 Security
- reCAPTCHA v3 on all forms
- XSS, SQL injection, command injection protection
- Helmet.js HTTP security headers
- Rate limiting on API endpoints

### 📈 Analytics
- Google Analytics GA4 page views + custom events
- Web Vitals (LCP, FID, CLS, TTFB, FCP) reporting

---

## Deployment

Deployed on **AWS Amplify** with automatic builds on push to `main`.

```bash
# Manual deploy via Amplify CLI
amplify publish
```

**App ID:** `d1zjif7pi1h3om`  
**Build config:** `amplify.yml`

See [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for full deployment instructions.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT © Themistoklis Baltzakis
