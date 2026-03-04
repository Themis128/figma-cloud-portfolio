# Builder.io Integration Guide

This guide explains how Builder.io is integrated into the portfolio project for both React and Next.js apps, including dynamic routing, custom components, preview/editing UI, personalization, analytics, and A/B testing.

## 1. Setup

- Add your Builder.io public API key to `.env` (React) and `.env.local` (Next.js):
  - `VITE_BUILDER_PUBLIC_API_KEY` or `BUILDER_PUBLIC_API_KEY`
- Install SDKs: `@builder.io/react` and `@builder.io/sdk-react`

## 2. Dynamic Routing

- React: All unmatched routes render Builder.io content via a catch-all route using `BuilderPage`.
- Next.js: `[...page]/page.tsx` enables dynamic Builder.io page rendering at any URL.

## 3. Custom Components

- Components like `Button`, `AlertDialog`, and `Badge` are registered with Builder.io for drag-and-drop use in the visual editor.
- To register more, add them in `client/components/BuilderProvider.tsx`.

## 4. Preview & Editing UI

- A floating banner appears in preview/editing mode, with logo, help link, refresh/exit buttons, and keyboard shortcuts.
- Banner is collapsible and shows model/URL context.

## 5. Multiple Models

- Use `BuilderPage` with the `model` prop to render any Builder.io model (e.g., `page`, `section`, `banner`, `product`).
- Use `getBuilderContent` helper to fetch content for any model.

## 6. Personalization & Targeting

- Pass user attributes (ID, role, country, etc.) to `BuilderPage` for targeted content.
- Use Builder.io targeting rules in the editor.

## 7. Analytics & A/B Testing

- Page views and custom events are tracked via Builder.io analytics.
- Use `trackBuilderEvent` and `trackABTest` helpers for custom analytics and experiment tracking.

## 8. Production Readiness

- Only public API keys are exposed to the frontend.
- All environment variables are documented in `.env.example`.
- Integration is tested in staging/production builds.

## 9. Adding New Models/Components

- Register new components in `BuilderProvider.tsx`.
- Create new models in Builder.io and use the `model` prop in `BuilderPage` to render them.

## 10. Troubleshooting

- Ensure API keys are set and valid.
- Check the browser console for Builder.io warnings/errors.
- See the Builder.io docs: https://www.builder.io/c/docs
