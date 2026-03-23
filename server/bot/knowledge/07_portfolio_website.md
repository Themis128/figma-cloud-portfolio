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
- **Blog**: Velite (MDX → typed JSON at build time) with rehype-pretty-code syntax highlighting
- **Chatbot**: AWS Bedrock (Claude 3.5 Haiku) with structured knowledge base and SSE streaming
- **Testing**: Playwright E2E (103 spec files across 9 browser/viewport configs), Vitest unit tests
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
- **CI/CD**: GitHub Actions + GitHub Agentic Workflows (automated deploy, CI doctor, QA, accessibility review)
- **Region**: us-east-1

## Website Pages
1. **Home** (`/`): Hero section with rotating titles (IT Network Engineer, Cloud Architect, Cybersecurity Specialist, DevOps Engineer), 3D AI Brain visualization, availability badge, quick contact form, social links
2. **About** (`/about/`): Professional summary, key focus areas, top skills with radar chart, 16 Credly certification badges, languages (English, Greek), honors & awards
3. **Work Experience** (`/product/`): Interactive timeline of 7 professional positions with detailed responsibilities
4. **Projects** (`/projects/`): Searchable gallery of 12 projects with category filters (Web, Infrastructure, AI/Data, DevOps, Tools), sort options, featured markers, and GitHub/live links
5. **Blog** (`/blog/`): Articles on cloud architecture, cybersecurity, and web development. Featured latest post with hero card, 2-column grid for older posts, tag cloud with counts, reading time estimates. Individual post pages (`/blog/[slug]/`) with syntax-highlighted code blocks, older/newer navigation, breadcrumbs, and BlogPosting structured data.
6. **Contact** (`/contact/`): 6 contact cards (email, LinkedIn, GitHub, location, phone, portfolio), contact form with reCAPTCHA v3, quick actions, stats (15+ years, 100+ projects, 5+ certs)
7. **Resume Builder** (`/resume/`): Interactive CV builder with 7 HTML/CSS templates (Classic, Modern, Minimal, Executive, Creative, Bold, Emerald), live preview, PDF download, JSON export/import, localStorage auto-save, plus an ATS optimization guide
8. **Performance** (`/performance/`): Live Core Web Vitals, interactive speed test runner, web vitals explainer cards, industry comparison chart, 8-item optimization checklist, tech stack rationale
9. **AI Agents** (`/agents/`): Educational guide on AI agents with core concepts (Observe → Think → Act → Evaluate), architecture patterns, key terminology (RAG, ReAct, MCP, Guardrails), network engineering use cases, 5 agent templates, and a Blockly drag-and-drop agent builder for kids
10. **Admin Dashboard** (`/admin/`): Internal dashboard with 10 tabs — Health (API monitoring), Console (HTTP request builder), Deploy (production status), Errors (real-time capture), Performance (CWV budgets), SEO (page audit), Push (notification tester), Analytics (GA4), Auth (session details), Environment (build info)
11. **Settings** (`/settings/`): Theme, animations, notifications, analytics consent
12. **Privacy Policy** (`/privacy/`): GDPR/CCPA compliant privacy policy
13. **Terms of Service** (`/terms/`): Website usage terms
14. **Cookie Policy** (`/cookies/`): Cookie categories and management

## Key Features
- MDX-powered blog with syntax-highlighted code blocks, tags, reading time, and SEO (BlogPosting structured data)
- AI Chatbot assistant (this chatbot) powered by AWS Bedrock for answering visitor questions
- Booking system for scheduling teleconference calls with Themis
- Progressive Web App (PWA) with offline support and push notifications
- Interactive CV builder with 7 templates and client-side PDF generation
- Command palette (Ctrl+K) for quick navigation
- Automated announcement system — announcements auto-generated from git commits at build time, with per-item dismiss and push notification integration
- Real-time performance monitoring with web-vitals
- Google Analytics 4 integration
- Contact form with reCAPTCHA v3 spam protection
- Interactive 3D AI Brain visualization on homepage
- Matrix Rain animation toggle with glow effects
- Dark/Light theme toggle
- Blockly visual agent builder for educational purposes
- Availability status badge on homepage
