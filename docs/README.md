# Baltzakis Themistoklis Portfolio

A production-ready full-stack React application for a professional portfolio, featuring Next.js 16 App Router, TypeScript, Tailwind CSS v4, and PWA capabilities.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: AWS Lambda (production), Express dev server (local)
- **PWA**: Service worker with offline caching and installable features
- **Testing**: Vitest 4 + Playwright E2E
- **UI**: Radix UI + shadcn/ui + Tailwind CSS v4 + Lucide React icons
- **Package Manager**: PNPM

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # React components (ui/, sections/, performance/, admin/)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, helpers, constants
├── types/            # TypeScript type definitions
└── styles/           # Global CSS

server/               # Express backend (tsx)
amplify/              # AWS Amplify Gen 2 backend
playwright-tests/     # E2E tests
public/               # Static assets and PWA files
docs/                 # Documentation
```

## ⚡ Key Features

- **App Router**: Next.js 16 file-based routing with trailing slashes
- **PWA Ready**: Offline caching, installable, background sync
- **Type Safety**: Full TypeScript throughout client, server, and shared code
- **Modern UI**: Radix UI components with TailwindCSS styling
- **Performance**: Optimized images, lazy loading, performance monitoring
- **Testing**: Comprehensive test suite with Vitest and Playwright
- **Deployment**: S3 + CloudFront (production), GitHub Actions CI/CD
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
# Terminal 1: Start Next.js dev server (frontend - default: http://localhost:3000)
pnpm dev

# Terminal 2: Start Express API server (backend - default: http://localhost:3001)
pnpm dev:server
```

## 📋 Available Scripts

```bash
pnpm dev                        # Start Next.js dev server (frontend)
pnpm dev:server                 # Start Express API server (backend)
pnpm build                      # Production build
pnpm start                      # Start production server
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest tests
pnpm test:e2e                   # Run Playwright E2E tests
```

## 🔌 API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/github/stats` - GitHub profile statistics (repos, stars, followers)
- `GET /api/github/repos` - Public repositories with languages and topics
- `GET /api/search?q=` - Search portfolio content (skills, pages, experience)
- `GET /api/monitor` - Server monitoring data (uptime, memory, request count)
- `GET /api/resume/download` - Download resume as PDF (jsPDF-generated)
- `GET /api/resume/generate` - Resume data as JSON
- `POST /api/webhook` - Generic webhook receiver
- `GET /api/docs` - API documentation (JSON)

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Production Deployment

- **Frontend**: S3 + CloudFront via `./scripts/deploy.sh` or GitHub Actions
- **Backend**: Amplify Gen 2 via `ampx pipeline-deploy`

### Deployment Documentation

| Component      | Documentation                                | Use Case                     |
| -------------- | -------------------------------------------- | ---------------------------- |
| Frontend       | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | S3 + CloudFront deploy       |
| Backend        | [DEPLOYMENT.md](./DEPLOYMENT.md)             | Amplify Gen 2 backend deploy |
| GitHub Actions | [CI_CD_README.md](./CI_CD_README.md)         | CI/CD pipeline setup         |

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
