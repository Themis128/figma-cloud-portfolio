---
applyTo: "src/components/**/*.tsx"
---

# Next.js Component Instructions

- Default to **Server Components**; only add `'use client'` when using hooks, browser APIs, or event handlers
- Use `next/image` instead of `<img>` for all images
- Use `next/link` instead of `<a>` for internal navigation
- Use `@/` path alias for all imports (`@/components/...`, `@/lib/...`)
- Wrap scroll-animated sections in `<AnimatedSection delay={N}>` with staggered delays (0.1, 0.2, etc.)
- Use shadcn/ui primitives from `@/components/ui/` (Card, Badge, Button, Progress, etc.)
- Never use the `any` TypeScript type

## Standard Pattern

```tsx
interface ComponentProps {
  title: string;
  description?: string;
}

export default function Component({ title, description }: ComponentProps) {
  return <section className="...">{/* content */}</section>;
}
```
