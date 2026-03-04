# GitHub Copilot – Project Instructions

## Workspace Root

The workspace root is `/home/tbaltzakis/portfolio-nextjs/` (WSL: Ubuntu-24.04).
All source files live under `src/` at this root. Do NOT reference the nested `portfolio-nextjs/portfolio-nextjs/` subfolder.

## Project Overview

Next.js portfolio for Themistoklis Baltzakis (Cloudless.gr — Strategic IT Analyst & Cloud Solutions Architect).
Showcases cloud architecture, AWS, web development, and data analytics expertise.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **3D**: Three.js + @react-three/fiber + @react-three/drei
- **Animation**: Framer Motion
- **State**: TanStack Query v5
- **Forms**: react-hook-form
- **Backend**: Express (server/)
- **Deployment**: AWS Amplify
- **Package Manager**: pnpm

## Project Structure

```
src/
  app/              → App Router pages and layouts
  components/
    ui/             → shadcn/ui primitive components (Radix-based)
    sections/       → Page section components
  hooks/            → Custom React hooks
  lib/              → Utilities, helpers, constants
  styles/           → Global CSS
server/             → Express backend (tsx)
shared/             → Shared types between client and server
public/             → Static assets
prisma/             → Database schema
playwright-tests/   → E2E tests
```

## Coding Conventions

- Use `@/` path alias for absolute imports (`@/components/...`, `@/lib/...`)
- Default to Server Components; add `'use client'` only when using hooks/browser APIs
- Tailwind utility classes for styling; shadcn/ui for UI primitives
- PascalCase for components, camelCase for functions/variables, kebab-case for files
- Never use `any` TypeScript type
- Use `next/image` instead of `<img>`
- Use `next/link` instead of `<a>` for internal links

## Standard Component Pattern

```tsx
interface HeroProps {
  title: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return <section className="...">{/* ... */}</section>;
}
```

## Domain Context

- Owner: Cloud Solutions Architect at Cloudless.gr (Athens, Greece)
- Certifications: AWS Cloud Practitioner, Cisco DevNet Associate, MSc Data Analytics
- Target audience: recruiters and enterprise clients in Greece/Cyprus/EU

## Priorities

1. Accessibility (semantic HTML, ARIA labels)
2. Performance (`next/image`, lazy loading, Server Components)
3. SEO (Next.js Metadata API)
4. Mobile-first responsive design
5. TypeScript strict compliance
