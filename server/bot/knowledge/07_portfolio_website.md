# Portfolio Website Technical Details

## Website
- URL: https://baltzakisthemis.com and https://www.baltzakisthemis.com
- SSL covers both domains

## Tech Stack
- **Framework**: Next.js 16 with App Router and static export
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **Animation**: Framer Motion for scroll reveals and hover effects
- **3D Visualization**: Three.js + @react-three/fiber (interactive AI Brain on homepage)
- **State Management**: TanStack Query v5
- **Backend**: AWS Lambda (production), Express dev server (local, port 3001)
- **Auth**: AWS Amplify Gen 2 (Cognito + AppSync + DynamoDB)
- **Testing**: Playwright E2E (83 spec files), Vitest unit tests
- **Package Manager**: pnpm

## Design Language
- Dark cyberpunk aesthetic with animated circuit board background
- Primary accent color: Cyan
- Glass morphism cards with backdrop blur
- Uppercase tracking headings
- Mono font (JetBrains Mono) for numbers and code labels
- Framer Motion scroll-reveal animations

## Deployment
- **Frontend**: S3 bucket + CloudFront CDN
- **Backend**: AWS Amplify Gen 2 (Cognito auth + AppSync GraphQL + DynamoDB)
- **CI/CD**: GitHub Actions + GitHub Agentic Workflows
- **Region**: us-east-1

## Website Pages
1. **Home** (`/`): Hero section with name, title, tagline, social links, 3D AI Brain visualization, quick contact form
2. **About** (`/about/`): Professional summary, key focus areas, top skills, certifications, languages, honors & awards
3. **Work Experience** (`/product/`): Detailed timeline of 5 professional positions with responsibilities
4. **Projects** (`/projects/`): Searchable gallery of 6 projects with category filters and sort options
5. **Contact** (`/contact/`): Contact cards (email, LinkedIn, GitHub, location, phone, portfolio), contact form with reCAPTCHA, quick actions, stats
6. **Resume Builder** (`/resume/`): Coming soon — AI-powered resume generation with ATS optimization
7. **Performance** (`/performance/`): Live Core Web Vitals, speed test, industry comparison, optimization checklist
8. **AI Agents** (`/agents/`): 5 AI agent templates (Chatbot, Content Writer, Data Analyzer, Customer Support, Code Reviewer)
9. **Admin Dashboard** (`/admin/`): Internal dashboard with 10 tabs — Health, Console, Deploy, Errors, Performance, SEO, Analytics, Notifications, Auth, Environment
10. **Settings** (`/settings/`): Theme, animations, notifications, analytics consent
11. **Privacy Policy** (`/privacy/`): GDPR/CCPA compliant privacy policy
12. **Terms of Service** (`/terms/`): Website usage terms
13. **Cookie Policy** (`/cookies/`): Cookie categories and management

## Key Features
- AI Chatbot assistant (this chatbot) for answering visitor questions
- Booking system for scheduling teleconference calls with Themis via Cal.com
- Progressive Web App (PWA) with offline support and push notifications
- Real-time performance monitoring with web-vitals
- Google Analytics 4 integration
- Contact form with reCAPTCHA v3 spam protection
- Interactive 3D AI Brain visualization on homepage
- Dark/Light theme toggle
