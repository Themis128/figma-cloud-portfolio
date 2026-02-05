# Baltzakis Themistoklis Portfolio

A modern, full-stack portfolio website built with React, TypeScript, Express, and deployed on AWS Amplify.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Express.js, Tailwind CSS, Vite
- **AI-Powered**: Anthropic Claude, OpenAI, Together AI, and Ollama integration
- **Real-time Communication**: Socket.IO, Firebase Cloud Messaging, Web Push notifications
- **Performance Optimized**: Vite build system, code splitting, image optimization, PWA support
- **SEO & Analytics**: Google Analytics 4, Core Web Vitals tracking, structured data
- **Responsive Design**: Mobile-first approach with Radix UI accessible components
- **Code Quality**: Biome linting, Codacy integration, comprehensive testing suite
- **Security**: reCAPTCHA v3, Sentry error tracking, secure headers, secrets management
- **CI/CD**: Automated testing, linting, deployment with GitHub Actions
- **Comprehensive Testing**: Playwright E2E tests, Vitest unit tests, accessibility testing

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite 7** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **Framer Motion** for animations
- **Three.js** with React Three Fiber for 3D graphics
- **React Router v7** for navigation

### Backend

- **Express.js 5** with TypeScript
- **Socket.IO 4** for real-time features
- **Firebase 12** for cloud messaging and push notifications
- **Web Push** for push notification API
- **Node.js** with ES modules

### AI & Machine Learning

- **Anthropic Claude** (v0.72.1) - AI agent workflows
- **OpenAI** - GPT-4, GPT-4o-mini support
- **Together AI** - Open-source LLMs
- **Ollama** - Local AI model support
- **MCP** (Model Context Protocol) for browser tools

### Testing & Quality

- **Biome** for fast linting and formatting (replaces ESLint + Prettier)
- **Vitest** for unit testing with coverage
- **Playwright** for E2E testing across browsers
- **Testing Library** for React component testing
- **Codacy** for automated code quality analysis and security scanning

### Monitoring & Analytics

- **Google Analytics 4** with Core Web Vitals tracking
- **Sentry** for error tracking and performance monitoring
- **Custom analytics endpoint** for backend event tracking

### Security & Performance

- **Google reCAPTCHA v3** for bot protection
- **Content Security Policy** (CSP) headers
- **Vite PWA** for Progressive Web App features
- **Image Optimization** (Sharp, WebP, AVIF)
- **Bundle Analysis** with Rollup Visualizer

### Development Tools

- **TypeScript 5.9** with strict mode
- **pnpm** package manager
- **Git Bash** / PowerShell support
- **VS Code** with TypeScript LSP
- **Hot Module Replacement** (HMR)

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Themis128/figma-cloud-portfolio.git
   cd figma-cloud-portfolio
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Install required external tools (recommended)**

   ```bash
   pnpm setup:tools
   ```

4. **Set up environment variables**

   **Option A: Using AWS Secrets Manager** (Recommended for Production)

   ```bash
   # Set AWS credentials
   export AWS_SECRETS_MANAGER_ID=portfolio/env
   export AWS_REGION=us-east-1

   # Secrets are automatically loaded when running:
   pnpm dev  # Uses scripts/run-with-secrets.js wrapper
   ```

   **Option B: Using Local .env File** (Development)

   ```bash
   cp .env.example .env
   # Edit .env with your configuration

   # Or use interactive setup
   .\scripts\setup-env-vars.ps1 -Interactive  # PowerShell
   ```

   **See**: `SECRETS_MANAGEMENT.md` for complete guide on secure secret handling

5. **Start development servers**

   ```bash
   # Start frontend + backend
   pnpm dev:all

   # Or start frontend only
   pnpm dev
   ```

## 🔐 Security & Secrets Management

This project uses a comprehensive secrets management system:

- **Local Development**: PowerShell profile or `.env` file (git-ignored)
- **Production**: AWS Secrets Manager integration
- **CI/CD**: GitHub Secrets
- **Automatic Loading**: Scripts wrapped with `run-with-secrets.js`

**Important**: Never commit `.env` files or hardcode secrets in source code.

**Documentation**:

- `SECRETS_MANAGEMENT.md` - Complete secrets guide
- `SECURITY_SUMMARY.md` - Security checklist
- `TOKEN_ROTATION_CHECKLIST.md` - Token rotation procedures
- `MCP_SECURE_CONFIG.md` - MCP security configuration

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:unit --watch
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/app.spec.ts

# Run with UI mode
pnpm test:e2e:ui

# Run in CI mode (optimized)
pnpm test:e2e:ci

# Fast mode (development)
pnpm test:e2e:fast

# Continuous testing
pnpm test:e2e:continuous

# Debug mode
pnpm test:e2e:debug
```

### Test Coverage

- Playwright tests cover 20+ scenarios including:
  - Core application functionality
  - 3D graphics rendering
  - Accessibility (WCAG compliance)
  - AI agent functionality
  - Analytics integration
  - API endpoints
  - PWA features
  - Security & privacy
  - Performance monitoring
  - SEO validation

**See**: `PLAYWRIGHT_CONFIG_README.md` for detailed testing documentation

## 🔍 Code Quality & Analysis

### Codacy Integration

This project uses **Codacy** for automated code quality analysis. Codacy provides:

- **Real-time Analysis**: Code quality feedback as you work
- **Security Scanning**: Automated vulnerability detection
- **Coverage Reports**: Test coverage visualization
- **AI Guardrails**: AI-generated code validation
- **PR Analysis**: Automated pull request quality checks

#### Setup Codacy

1. **Run the setup script**

   ```bash
   pnpm setup:codacy
   ```

2. **Complete the setup**
   - Visit [Codacy](https://app.codacy.com)
   - Add your repository: `Themis128/figma-cloud-portfolio`
   - Get your Project Token from Settings → Integrations
   - Add `CODACY_PROJECT_TOKEN` to GitHub repository secrets

3. **Connect VS Code Extension**
   - Install the Codacy extension
   - Click the Codacy icon in the activity bar
   - Click "Connect to Codacy"
   - Sign in with GitHub

#### Codacy Features in VS Code

- **Issue Browser**: Browse issues by category and severity
- **Inline Coverage**: Visualize test coverage in your editor
- **AI Guardrails**: Validate AI-generated code
- **Local Analysis**: Run analysis without pushing to GitHub
- **PR Integration**: See quality feedback on pull requests

## 📜 Available Scripts

```bash
# Development
pnpm dev              # Start frontend dev server (with secrets loaded)
pnpm dev:all          # Start both frontend and backend
pnpm dev:ci           # Start in CI mode
pnpm start            # Start production server

# Building
pnpm build            # Build for production (with secrets loaded)
pnpm build:client     # Build frontend only
pnpm build:server     # Build backend only
pnpm build:resume     # Generate resume PDF
pnpm build:analyze    # Build with bundle analysis

# Quality & Testing
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Biome
pnpm format:fix       # Format and write changes
pnpm typecheck        # Run TypeScript checks
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm coverage         # Generate coverage report
pnpm coverage:upload  # Upload coverage to Codacy

# Quality Checks
pnpm quality          # Run comprehensive quality checks
pnpm quality:ci       # Quality checks for CI

# Setup & Utilities
pnpm optimize-images  # Optimize images for web
pnpm clean            # Clean build artifacts
pnpm clean:deps       # Remove node_modules and lock file
pnpm setup:tools      # Install required external tools
pnpm setup:playwright # Install Playwright browsers
```

## 🔗 Key Integrations

### AI & Machine Learning

- **Anthropic Claude** - AI agent workflows and chat
- **OpenAI GPT-4** - Alternative AI provider
- **Together AI / Ollama** - Open-source and local LLMs
- **MCP** - Model Context Protocol for browser automation

### Cloud Services

- **Firebase** - Cloud Messaging and push notifications
- **AWS Amplify** - Hosting and serverless functions
- **AWS Secrets Manager** - Centralized secrets storage

### Analytics & Monitoring

- **Google Analytics 4** - Web analytics with Core Web Vitals
- **Sentry** - Error tracking and performance monitoring
- **Codacy** - Code quality and security analysis

### Security & Performance

- **Google reCAPTCHA v3** - Bot protection
- **Vite PWA** - Progressive Web App features
- **Socket.IO** - Real-time communication
- **Sharp** - Image optimization

**See**: `INTEGRATIONS.md` for complete integration documentation

## 🚀 Deployment

### AWS Amplify

The project is configured for AWS Amplify deployment with:

- **Multi-stage builds**: Separate frontend/backend builds
- **Environment-specific configs**: Development, staging, production
- **Automated deployments**: Triggered by GitHub pushes
- **Custom build scripts**: Optimized for the tech stack

### Environment Variables

#### Core Configuration

```env
NODE_ENV=development
```

#### Firebase (Cloud Messaging & Push Notifications)

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

#### Google Services

```env
# reCAPTCHA v3
VITE_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### AI Services (Choose one or more)

```env
# Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-your_key_here

# OpenAI
VITE_OPENAI_API_KEY=sk-your_key_here
VITE_AI_MODEL=gpt-4o-mini
VITE_AI_PROVIDER=openai

# Together AI
VITE_TOGETHER_API_KEY=your_together_key

# Ollama (Local)
VITE_OLLAMA_BASE_URL=http://localhost:11434/v1
VITE_AI_MODEL=llama2
```

#### Error Tracking & Monitoring

```env
# Sentry
VITE_SENTRY_DSN=https://your_key@sentry.io/project_id
SENTRY_DSN=https://your_key@sentry.io/project_id
SENTRY_ACCESS_TOKEN=your_token
SENTRY_ORG_SLUG=your_org
VITE_APP_VERSION=1.0.0
```

#### Code Quality

```env
CODACY_API_TOKEN=your_codacy_api_token
CODACY_PROJECT_TOKEN=your_codacy_project_token
CODACY_ORGANIZATION_PROVIDER=gh
CODACY_USERNAME=Themis128
CODACY_PROJECT_NAME=figma-cloud-portfolio
```

#### GitHub API

```env
GITHUB_TOKEN=ghp_your_personal_access_token
VITE_GITHUB_TOKEN=ghp_your_personal_access_token
```

#### AWS Services (Production)

```env
# Amplify
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AMPLIFY_PRODUCTION_APP_ID=your_production_app_id
AMPLIFY_STAGING_APP_ID=your_staging_app_id

# Secrets Manager
AWS_SECRETS_MANAGER_ID=portfolio/env

# Lambda Function URLs
VITE_LAMBDA_CONTACT_URL=https://your-contact-function.amazonaws.com
VITE_LAMBDA_RESUME_URL=https://your-resume-function.amazonaws.com
VITE_LAMBDA_PUSH_NOTIFICATIONS_URL=https://your-push-function.amazonaws.com
VITE_LAMBDA_PING_URL=https://your-ping-function.amazonaws.com
VITE_LAMBDA_DEMO_URL=https://your-demo-function.amazonaws.com
```

**See**: `.env.example` for complete list with descriptions

## 📚 Documentation

Comprehensive documentation is available for all aspects of the project:

### Getting Started

- **README.md** (this file) - Project overview and quick start
- **.env.example** - Environment variables template

### Integrations

- **INTEGRATIONS.md** - Complete guide for all external services and APIs

### Security

- **SECURITY_SUMMARY.md** - Security overview and quick reference
- **SECURITY_REMEDIATION.md** - Security incident response guide
- **SECRETS_MANAGEMENT.md** - Comprehensive secrets management
- **TOKEN_ROTATION_CHECKLIST.md** - Token rotation procedures
- **MCP_SECURE_CONFIG.md** - MCP configuration security
- **GITHUB_SECRETS_SETUP.md** - GitHub Actions secrets

### Deployment

- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **DEPLOYMENT_ISSUES_GUIDE.md** - Troubleshooting guide
- **DEPLOYMENT_MONITOR_README.md** - Monitoring setup
- **POST_DEPLOYMENT_VERIFICATION.md** - Verification steps

### Testing

- **PLAYWRIGHT_CONFIG_README.md** - E2E testing configuration

### Development

- **SOFTWARE_PLANNING_PROPOSAL.md** - Project planning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure tests pass
4. Run code quality checks: `pnpm lint && pnpm typecheck`
5. Commit your changes: `git commit -m 'feat: add your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Themistoklis Baltzakis**

- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]
- Email: [Your Email]
