---
applyTo: "src/**/*.{ts,tsx}"
---

# Performance Instructions

- Prefer Server Components to reduce client-side JavaScript bundle
- Use `next/dynamic` with `{ ssr: false }` for heavy client-only components (Three.js, charts)
- Lazy-load below-the-fold content with `loading="lazy"` or dynamic imports
- Use `next/image` with appropriate `sizes` and `priority` for above-the-fold images
- Minimize `'use client'` boundary — push it as deep in the component tree as possible
- Avoid importing large libraries in Server Components if they're only needed client-side
