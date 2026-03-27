# Progressive Web App (PWA) Setup

This project includes full Progressive Web App functionality: installable, offline-capable, with background sync.

## Features

- **Installable**: users can add the app to their home screen / desktop
- **Offline fallback**: dedicated `/offline.html` page served when the network is unavailable and no cached page exists
- **Offline indicator**: banner at the top of the page warns users when they lose connectivity
- **Service worker caching**: Workbox 7 with NetworkFirst (pages, API), CacheFirst (images, CDN), StaleWhileRevalidate (JS/CSS/fonts)
- **Background sync**: failed API requests are queued in IndexedDB and retried when connectivity returns
- **Offline analytics**: analytics events stored in IndexedDB and synced when back online
- **Update notifications**: users are prompted when a new service worker version is available
- **App shortcuts**: manifest shortcuts to /about/, /projects/, /contact/

## Architecture

```
Browser
  ├─ ServiceWorkerRegistration.tsx   registers /sw.js, checks for updates every 60 min
  ├─ OfflineIndicator.tsx            listens to online/offline events, shows banner
  ├─ PWAUpdateNotification.tsx       detects waiting SW, prompts user to update
  ├─ PWAInstallButton.tsx            deferred install prompt with 30s delay
  └─ usePWA.ts hook                  tracks installability, standalone mode

Service Worker (public/sw.js)
  ├─ Workbox 7 (CDN)                caching strategies
  ├─ offline-fallback cache          precaches /offline.html on install
  ├─ IndexedDB (sw-store)            failed-requests + offline-analytics stores
  ├─ Background sync                 retries queued requests on connectivity
  └─ Periodic sync                   cache stats, prefetch, cleanup
```

## Files

| File | Purpose |
| --- | --- |
| `public/manifest.webmanifest` | Web App Manifest (name, icons, shortcuts, display) |
| `public/sw.js` | Service worker: Workbox caching, offline fallback, IndexedDB sync |
| `public/offline.html` | Static offline fallback page (self-contained HTML/CSS) |
| `src/components/ServiceWorkerRegistration.tsx` | Registers SW in production, auto-update checks |
| `src/components/OfflineIndicator.tsx` | Amber banner shown when `navigator.onLine` is false |
| `src/components/PWAUpdateNotification.tsx` | Update prompt when new SW version is waiting |
| `src/components/PWAInstallButton.tsx` | Install prompt with smart timing and dismissal |
| `src/hooks/usePWA.ts` | PWA state: installability, standalone detection |
| `src/components/DynamicMetadata.tsx` | Client-side apple-mobile-web-app-capable meta tags |

## Caching Strategies

| Content | Strategy | Cache Name | TTL |
| --- | --- | --- | --- |
| Navigation (pages) | NetworkFirst + offline fallback | `pages-cache` | 7 days |
| API requests | NetworkFirst + background sync | `enhanced-api-cache` | 5 min |
| Images (png/jpg/svg/webp/avif) | CacheFirst | `enhanced-images-cache` | 30 days |
| Static (JS/CSS/fonts) | StaleWhileRevalidate | `enhanced-static-resources` | 7 days |
| CDN resources | CacheFirst | `cdn-resources` | 30 days |
| Analytics | NetworkFirst | `analytics-cache` | 1 day |
| Offline page | Precached on install | `offline-fallback` | Permanent |

## IndexedDB Storage (sw-store)

The service worker uses IndexedDB database `sw-store` (version 1) with two object stores:

| Store | Purpose |
| --- | --- |
| `failed-requests` | Queued API requests for retry on reconnect |
| `offline-analytics` | Analytics events collected while offline |

Expired entries (older than 7 days) are cleaned up during periodic sync.

## Offline Behaviour

1. **Navigation to cached page**: served from `pages-cache` (NetworkFirst)
2. **Navigation to uncached page while offline**: `/offline.html` is served from `offline-fallback` cache
3. **Offline indicator**: amber banner with "You are currently offline" appears at the top of the page (uses `online`/`offline` events)
4. **Auto-reconnect**: `offline.html` listens for the `online` event and reloads automatically

## Manifest

```json
{
  "name": "T. Baltzakis - Cloud Architect",
  "short_name": "T. Baltzakis",
  "display": "standalone",
  "theme_color": "#1e293b",
  "background_color": "#0f172a",
  "start_url": "/",
  "scope": "/",
  "shortcuts": ["/about/", "/projects/", "/contact/"]
}
```

## Automated Announcements

Announcements are **auto-generated from git commits at build time**:

1. `scripts/generate-announcements.sh` runs as part of `pnpm build`
2. Extracts `feat`/`fix`/`refactor`/`perf` commits from the last 30 days
3. Outputs `public/announcements.json` (max 10 items)
4. `NotificationButton` fetches this JSON on mount

**Per-item dismiss**: Users can dismiss individual announcements via an X button. Dismissed IDs are persisted in `localStorage` (`site-announcements-dismissed`).

**localStorage keys**:
- `site-announcements-read`: JSON array of read announcement IDs
- `site-announcements-dismissed`: JSON array of dismissed announcement IDs
- `site-announcements-last-seen`: timestamp of last seen announcement

## Local Development

```bash
# Start Next.js dev server (port 3000)
pnpm dev

# Start Express API server (port 3001)
pnpm dev:server
```

Service worker registration only activates in production (`NODE_ENV === "production"`). To test SW locally, build and serve the static export.

## Testing

### Playwright E2E Tests

```bash
# Run PWA-specific tests
pnpm exec playwright test playwright-tests/pwa.spec.ts playwright-tests/pwa-features.spec.ts

# Run all tests
pnpm test:e2e
```

**Test coverage**: manifest validation, meta tags, service worker registration, offline fallback, offline indicator, update notifications, install prompt, theme colors, icons, shortcuts, accessibility.

### Lighthouse Audit

Run in Chrome DevTools → Lighthouse → Progressive Web App category.

### Manual Testing

1. **Installability**: check install prompt in browser
2. **Offline**: DevTools → Network → Offline, then navigate
3. **Caching**: DevTools → Application → Cache Storage
4. **Service Worker**: DevTools → Application → Service Workers
5. **IndexedDB**: DevTools → Application → IndexedDB → sw-store

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Install button not showing | Not served over HTTPS | Deploy to production or use localhost |
| Offline page not appearing | SW not installed | Build and serve production build |
| No offline indicator | Component not rendered | Verify `OfflineIndicator` in layout.tsx |
| SW not registering | Dev mode | SW only registers when `NODE_ENV === "production"` |
| Stale content after deploy | Old SW cached | Click "Update Now" in update notification |
