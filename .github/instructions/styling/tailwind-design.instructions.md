---
applyTo: "**/*.{tsx,css}"
---

# Tailwind CSS & Design System Instructions

## Tailwind v4 Syntax
- Use `bg-linear-to-r` (NOT `bg-gradient-to-r`) for gradients
- Use Tailwind utility classes for all styling; avoid inline styles

## Design Language — Dark Cyberpunk
- **Primary accent**: cyan (`text-cyan-400`, `border-cyan-400`, `shadow-cyan-500/20`)
- **Glass cards**: `bg-card/40 backdrop-blur-sm border border-border/20`
- **Headings**: `uppercase tracking-[0.15em]` or `tracking-wider`
- **Dividers**: `w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full`
- **Mono font**: `font-mono` for numbers, code snippets, and labels (JetBrains Mono)

## Responsive
- Mobile-first: start with base styles, add `sm:`, `md:`, `lg:` breakpoints
- Test layouts at 320px, 768px, and 1280px widths
