# Baltzakis Themistoklis Portfolio

A modern, full-stack portfolio website built with React, TypeScript, Express, and deployed on AWS Amplify.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Express.js, Tailwind CSS
- **Performance Optimized**: Vite build system, code splitting, image optimization
- **SEO Ready**: Server-side rendering, meta tags, structured data
- **Responsive Design**: Mobile-first approach with modern UI components
- **Code Quality**: ESLint, Biome, comprehensive testing suite
- **CI/CD**: Automated testing, linting, and deployment

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

### Backend

- **Express.js** with TypeScript
- **Socket.io** for real-time features
- **Firebase** for authentication and database
- **Web Push** for notifications

### Development & Quality

- **Biome** for fast linting and formatting
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **Codacy** for code quality analysis
- **ESLint** for advanced code analysis

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

   This installs:
   - gitleaks (secret scanning)
   - AWS CLI (deployment)
   - Python (for scripts)
   - Playwright browsers (E2E testing)

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   pnpm dev:all
   ```

## 🧪 Testing

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# All tests
pnpm test
```

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
pnpm dev              # Start frontend dev server
pnpm dev:all          # Start both frontend and backend
pnpm start            # Start production server

# Building
pnpm build            # Build for production
pnpm build:client     # Build frontend only
pnpm build:server     # Build backend only
pnpm build:resume     # Generate resume PDF

# Quality & Testing
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm typecheck        # Run TypeScript checks
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests

# Setup & Utilities
pnpm setup:codacy     # Configure Codacy integration
pnpm setup:tools      # Install required external tools (gitleaks, AWS CLI, Python, Playwright browsers)
pnpm setup:playwright # Install Playwright browsers only
pnpm format           # Format code with Biome
pnpm optimize-images  # Optimize images for web
```

## 🚀 Deployment

### AWS Amplify

The project is configured for AWS Amplify deployment with:

- **Multi-stage builds**: Separate frontend/backend builds
- **Environment-specific configs**: Development, staging, production
- **Automated deployments**: Triggered by GitHub pushes
- **Custom build scripts**: Optimized for the tech stack

### Environment Variables

Required environment variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Optional: Codacy Integration
CODACY_PROJECT_TOKEN=your_codacy_token
```

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
