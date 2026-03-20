# Claude Code – Project Rules

## Project Overview

Next.js portfolio for Themistoklis Baltzakis — Cloud Architect & Cybersecurity Specialist.
Deployed as static export on S3 + CloudFront with Lambda backend and Amplify Gen 2 (auth + data).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with static export
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui + Radix UI
- **Animation**: Framer Motion
- **3D**: Three.js + @react-three/fiber
- **State**: TanStack Query v5
- **Backend**: AWS Lambda (production), Amplify Gen 2 (Cognito + AppSync + DynamoDB), Express dev server (local, port 3001)
- **Chatbot**: AWS Bedrock (Claude 3.5 Haiku) via Express route — knowledge base in `server/bot/knowledge/`
- **Testing**: Playwright 1.58+ E2E, Vitest unit tests
- **Package Manager**: pnpm

## Project Structure

```
src/
  app/              # App Router pages and layouts
  components/
    admin/          # Admin dashboard components (10 tabs)
    interactive/    # Interactive engagement components (7 in folder + CommandPalette in layout)
    ui/             # shadcn/ui primitives (Radix-based)
    sections/       # Page section components
    performance/    # Performance page components
  hooks/            # Custom React hooks
  lib/              # Utilities, helpers, constants
  types/            # TypeScript type definitions
  styles/           # Global CSS
server/             # Express backend (tsx)
playwright-tests/   # E2E tests (88 spec files)
public/             # Static assets and PWA files
docs/               # Documentation
```

## Coding Conventions

- Use `@/` path alias for imports (`@/components/...`, `@/lib/...`)
- Default to Server Components; add `'use client'` only when using hooks/browser APIs
- Tailwind utility classes for styling; shadcn/ui for UI primitives
- PascalCase for components, camelCase for functions/variables, kebab-case for files
- Never use `any` TypeScript type
- Use `next/image` instead of `<img>`
- Use `next/link` instead of `<a>` for internal links
- Tailwind v4 gradient syntax: `bg-linear-to-r` (NOT `bg-gradient-to-r`)

## Design Language

- Dark cyberpunk aesthetic with circuit board background
- Primary accent: cyan (`text-cyan-400`, `border-cyan-400`)
- Glass morphism cards: `bg-card/40 backdrop-blur-sm border border-border/20`
- Uppercase tracking headings: `uppercase tracking-[0.15em]`
- Mono font (JetBrains Mono) for numbers and labels

## Security

- Never commit API keys or secrets to version control
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Validate all user inputs

## Testing

- Run `pnpm typecheck` before committing
- Run Playwright tests: `pnpm test:e2e`
- Include accessibility tests for new components
- All URLs must use trailing slashes (`/about/` not `/about`) due to `trailingSlash: true`

## Git

- Use feature branches for development
- Write meaningful commit messages
- Default branch: `production`

## GitHub Agentic Workflows (gh-aw)

- AI engine: Copilot (requires `COPILOT_GITHUB_TOKEN` secret — fine-grained PAT with "Copilot Requests" Account permission)
- Workflows in `.github/workflows/` as Markdown → compiled to `.lock.yml`
- Active: `daily-repo-status` (repo activity reports), `ci-doctor` (CI failure analysis)
- CLI: `gh aw compile`, `gh aw run <name>`, `gh aw audit <run-id>`
- Agent dispatcher: `.github/agents/agentic-workflows.agent.md`
