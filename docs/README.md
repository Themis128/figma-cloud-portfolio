# Baltzakis Themistoklis Portfolio

A production-ready full-stack React application for a professional portfolio, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod, PWA capabilities, and Web Push API notifications.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: AWS Lambda (production), Express dev server (local)
- **PWA**: Service worker with offline caching and installable features
- **Notifications**: Web Push API with VAPID keys (no external services required)
- **Testing**: Vitest 4 + Playwright E2E
- **UI**: Radix UI + shadcn/ui + Tailwind CSS v4 + Lucide React icons
- **Package Manager**: PNPM

## 📁 Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx               # App entry point with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Shared API interfaces

amplify/                  # AWS Amplify Gen 2 backend
├── functions/            # Lambda functions
└── backend/              # Amplify backend configuration

public/                   # Static assets and PWA files
scripts/                  # Build and utility scripts
```

## ⚡ Key Features

- **SPA Routing**: React Router 6 with clean URL structure
- **PWA Ready**: Offline caching, installable, push notifications
- **Type Safety**: Full TypeScript throughout client, server, and shared code
- **Modern UI**: Radix UI components with TailwindCSS styling
- **Performance**: Optimized images, lazy loading, performance monitoring
- **Testing**: Comprehensive test suite with Vitest and Playwright
- **Deployment**: Multiple deployment options (Netlify, Vercel, AWS Amplify)
- **Theme System**: Light/dark/system theme toggle with persistence
- **Cookie Consent**: GDPR-compliant cookie consent banner
- **Accessibility**: Accessibility button with quick settings
- **AI Autofix**: Playwright AI-powered test failure analysis and suggestions

## 🚀 Development

### Prerequisites

- Node.js 18+
- PNPM
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Themis128/new-portfolio.git
cd new-portfolio

# Install dependencies
pnpm install
```

### Running Development Servers

```bash
# Terminal 1: Start Vite dev server (frontend - default: http://localhost:8082)
pnpm dev

# Terminal 2: Start Express API server (backend - default: http://localhost:3002)
npx tsx server/node-build.ts
```

> **Note**: For push notifications to work in development, you need both servers running. The Vite dev server proxies `/api` requests to the Express server.

## 📋 Available Scripts

```bash
pnpm dev                        # Start Vite dev server (frontend)
npx tsx server/node-build.ts    # Start Express API server (backend)
pnpm build                      # Production build
pnpm start                      # Start production server
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest tests
pnpm test:e2e                   # Run Playwright E2E tests
```

## 🔌 API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/push-notifications?action=vapid-public-key` - Get VAPID public key
- `PUT /api/push-notifications` - Store push subscription
- `POST /api/push-notifications` - Send push notification
- `DELETE /api/push-notifications` - Remove subscription
- `GET /api/playwright-autofix/config` - Get Playwright autofix configuration
- `POST /api/playwright-autofix/config` - Update Playwright autofix configuration
- `POST /api/playwright-autofix/analyze` - Analyze test failure and get AI suggestions
- `GET /api/playwright-autofix/patterns` - Get common error patterns

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Cloud Deployment Options

- **Netlify**: See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for comprehensive guide
- **Vercel**: Deploy with zero configuration
- **AWS Amplify**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full instructions

### Deployment Documentation

| Platform       | Documentation                                    | Use Case                           |
| -------------- | ------------------------------------------------ | ---------------------------------- |
| Netlify        | [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) | Static sites, serverless functions |
| AWS Amplify    | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)     | Full-stack with backend            |
| GitHub Actions | [CI_CD_README.md](./CI_CD_README.md)             | CI/CD pipeline setup               |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👤 Author

**Themistoklis Baltzakis**

- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]
- Email: [Your Email]
