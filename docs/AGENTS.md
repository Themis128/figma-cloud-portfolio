# Baltzakis Themistoklis Portfolio

A production-ready full-stack React application for a professional portfolio, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod, PWA capabilities, and Web Push API notifications.

While the starter comes with a express server, only create endpoint when strictly necessary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **PWA**: Vite PWA plugin with service worker, offline caching, and installable features
- **Notifications**: Web Push API with VAPID keys (no external services required)
- **PDF Generation**: Puppeteer for headless browser PDF generation + Marked for markdown parsing
- **Testing**: Vitest + Playwright E2E
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
├── dev-server.ts         # Development server (API only, no static files)
├── node-build.ts         # Production server (serves static files + API)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

### Resume Download System

Dynamic PDF generation from markdown content:

- **Dynamic Generation**: Resume PDFs are generated on-demand from `public/resume-content.md`
- **Modern Design**: Professional HTML template with responsive design and animations
- **Headless Browser**: Uses Puppeteer for high-quality PDF rendering
- **Type-Safe Parsing**: Markdown content is parsed into structured TypeScript interfaces
- **API Endpoint**: `GET /api/resume/download` serves generated PDFs for download

### SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css`
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**:
  - Vite dev server runs on port **8081** (frontend)
  - Express API server runs on port **3000** (backend)
  - Vite proxies `/api` requests to the Express server automatically
- **Production**: Single port serves both frontend and API
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Running Development Servers

```bash
# Terminal 1: Start Vite dev server (frontend)
pnpm dev

# Terminal 2: Start Express API server (for VAPID keys and push notifications)
npx tsx server/dev-server.ts
```

#### Alternative Development Commands

```bash
pnpm dev:all                    # Start both Vite and Express servers concurrently
npx tsx server/node-build.ts    # Production-style server (serves static files)
```

#### Example API Routes

- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint
- `GET /api/resume/download` - Generate and download resume PDF from markdown content
- `GET /api/push-notifications?action=vapid-public-key` - Get VAPID public key for push notifications
- `PUT /api/push-notifications` - Store push subscription
- `POST /api/push-notifications` - Send push notification
- `DELETE /api/push-notifications` - Remove subscription

### Shared Types

Import consistent types in both client and server:

```typescript
import { DemoResponse } from "@shared/api";
```

Path aliases:

- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev                        # Start Vite dev server (frontend on port 8081)
npx tsx server/dev-server.ts    # Start Express API server (backend on port 3000)
pnpm dev:all                    # Start both servers concurrently
pnpm build                      # Production build
pnpm start                      # Start production server (serves both frontend + API)
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest tests
```

> **Note**: For push notifications and resume download to work in development, you need both servers running. The Vite dev server proxies `/api` requests to the Express server.

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route

1. **Optional**: Create a shared interface in `shared/api.ts`:

   ```typescript
   export interface MyRouteResponse {
     message: string;
     // Add other response properties here
   }
   ```

2. Create a new route handler in `server/routes/my-route.ts`:

   ```typescript
   import { RequestHandler } from "express";
   import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

   export const handleMyRoute: RequestHandler = (req, res) => {
     const response: MyRouteResponse = {
       message: "Hello from my endpoint!",
     };
     res.json(response);
   };
   ```

3. Register the route in `server/index.ts`:

   ```typescript
   import { handleMyRoute } from "./routes/my-route";

   // Add to the createServer function:
   app.get("/api/my-endpoint", handleMyRoute);
   ```

4. Use in React components with type safety:

   ```typescript
   import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

   const response = await fetch("/api/my-endpoint");
   const data: MyRouteResponse = await response.json();
   ```

### New Page Route

1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:

```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- **Development**: Two-server setup (Vite on 8081, Express on 3000) with API proxy
- **Production**: Single-port deployment with Express serving both frontend and API
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
- Web Push API for notifications (requires Express server for VAPID key handling)
- Dynamic PDF generation for resume downloads using Puppeteer and markdown parsing
