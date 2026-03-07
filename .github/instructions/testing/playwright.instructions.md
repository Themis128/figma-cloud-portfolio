---
applyTo: "playwright-tests/**/*.spec.ts"
---

# Playwright Testing Instructions

- Use `@playwright/test` for all E2E tests
- Test against the production build (`npm run build && npm start`)
- Include accessibility checks using `@axe-core/playwright` where applicable
- Use semantic selectors (`getByRole`, `getByText`, `getByLabel`) over CSS selectors
- Test responsive breakpoints: mobile (375px), tablet (768px), desktop (1280px)
- Add `test.describe` blocks to group related tests
- Use `page.waitForLoadState('networkidle')` for pages with async data
