# Progressive Web App (PWA) Setup

This project now includes Progressive Web App functionality, allowing users to install the application on their devices for a native app-like experience.

## Features Added

### PWA Capabilities

- **Installable**: Users can install the app on their desktop or mobile devices
- **Offline Support**: Service worker caches essential resources for offline functionality
- **App-like Experience**: Runs in standalone mode without browser UI
- **Fast Loading**: Cached resources load instantly on subsequent visits

### Components Added

- `usePWA` hook: Manages PWA installation state and functionality
- `PWAInstallButton` component: Provides an install button in the navigation
- Web App Manifest: Defines app metadata for installation
- Service Worker: Handles caching and offline functionality

## Technical Implementation

### Dependencies

PWA functionality is built into Next.js — no additional plugin required. The manifest and service worker are served from the `public/` directory.

### Configuration

The PWA is configured via:

- `public/manifest.json` — app manifest with branding and icons
- `public/sw.js` — service worker with caching strategies
- Next.js static export deploys both files automatically

### Manifest Configuration

```json
{
  "name": "Themistoklis Baltzakis - Cloud Architect",
  "short_name": "T. Baltzakis",
  "description": "Cloud Architect & Cybersecurity Specialist Portfolio",
  "theme_color": "#1e293b",
  "background_color": "#0f172a",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "logo.jpg",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "logo.jpg",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Usage

### Installation

1. **Desktop**: Click the "Install App" button in the navigation or use browser's install prompt
2. **Mobile**: The browser will show an install banner or use the "Install App" button

### Development

- The PWA features are automatically enabled in development
- Service worker updates automatically when the app is rebuilt
- Use browser dev tools to inspect service worker and cache status

### Production

- Build the app with `pnpm build`
- The service worker and manifest are included in the static export
- Deploy the `out/` folder to S3 + CloudFront

## Browser Support

PWA features are supported in:

- Chrome/Chromium-based browsers (recommended)
- Firefox (partial support)
- Safari (iOS 11.3+, macOS 10.14.5+)
- Edge (Chromium-based)

## Testing PWA Features

### Playwright E2E Tests

The PWA implementation includes comprehensive end-to-end testing:

```bash
# Run all PWA tests
pnpm exec playwright test tests/app.spec.ts --project=chromium --project=webkit --project="Mobile Chrome" --project="Mobile Safari"

# Results: ✅ 40/40 tests passing
```

**Test Coverage:**

- ✅ Page loading and navigation
- ✅ PWA install button functionality
- ✅ Accessibility features (skip links, ARIA labels)
- ✅ Mobile menu interactions
- ✅ Keyboard navigation
- ✅ Responsive design
- ✅ Cross-browser compatibility

### Lighthouse Audit

Run a Lighthouse audit in Chrome DevTools to check PWA compliance:

1. Open DevTools → Lighthouse
2. Select "Progressive Web App" category
3. Run the audit

**Expected Scores:**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100 (when served over HTTPS)

### Manual Testing

- **Installability**: Check if the install prompt appears
- **Offline**: Disable network and refresh the page
- **Performance**: Use Network tab to verify caching
- **Manifest**: Check Application tab in DevTools

## Customization

### Updating the Manifest

Edit the manifest in `public/manifest.json`:

- Change app name, description, colors
- Update icons (place in `public/` directory)
- Modify display mode or orientation

### Service Worker Configuration

Modify the service worker in `public/sw.js`:

- Add custom caching rules
- Configure runtime caching strategies
- Set cache expiration policies

### Install Button Styling

Customize the `PWAInstallButton` component:

- Change button appearance
- Add custom install logic
- Modify responsive behavior

## Troubleshooting

### Install Button Not Showing

- Check browser compatibility
- Ensure HTTPS in production
- Verify service worker registration

### Service Worker Issues

- Clear browser cache and service workers
- Check console for registration errors
- Verify build output includes sw.js

### Offline Not Working

- Check network tab for cached resources
- Verify workbox configuration
- Test with different caching strategies

## File Structure

```
portfolio-nextjs/
├── src/
│   ├── components/
│   │   ├── PWAUpdateNotification.tsx  # PWA update notification component
│   │   └── NotificationButton.tsx     # Site announcements toggle
│   └── hooks/
│       └── usePWA.ts                  # PWA state management hook
├── public/
│   ├── manifest.json                  # Web App Manifest
│   ├── sw.js                          # Service worker
│   ├── logo.jpg                       # App icon
│   └── ...                            # Other static assets
└── out/                               # Static export output
```

## Next Steps

- ~~Add push notifications for real-time updates~~ ✅ Implemented
- ~~Add PWA update notification UI~~ ✅ Implemented
- Implement background sync for offline actions
- Add app shortcuts for quick actions
- Configure different caching strategies per route
- Add PWA-specific analytics tracking

---

## PWA Update Notifications

The application includes a PWA update notification system that alerts users when a new version is available.

### Features

- **Update Detection**: Automatically detects when a new service worker version is available
- **User Notification**: Shows a non-intrusive notification banner prompting users to update
- **One-Click Update**: Users can update with a single click
- **Dismiss Option**: Users can dismiss the notification if they prefer to update later

### Component

- `tests/pwa-update-notification.spec.ts` - Tests for PWA update notification functionality

---

## Push Notifications

Push notifications are implemented using the Web Push API with VAPID keys.

### Architecture

- **Frontend**: `usePushNotifications` hook handles subscription management
- **Backend**: Express API server on port 3001 (dev) / AWS Lambda (production) handles VAPID keys and notification sending
- **Service Worker**: Receives and displays push notifications

### Development Setup

Push notifications require the Express API server to be running:

```bash
# Terminal 1: Start Next.js dev server (frontend on port 3000)
pnpm dev

# Terminal 2: Start Express API server (backend on port 3001)
pnpm dev:server
```

The Next.js dev server proxies `/api` requests to the Express server.

### API Endpoints

| Endpoint                                          | Method | Description                                 |
| ------------------------------------------------- | ------ | ------------------------------------------- |
| `/api/push-notifications?action=vapid-public-key` | GET    | Get VAPID public key                        |
| `/api/push-notifications?action=subscriptions`    | GET    | List all subscriptions                      |
| `/api/push-notifications`                         | GET    | Send test notification to all subscribers   |
| `/api/push-notifications`                         | PUT    | Store a new subscription                    |
| `/api/push-notifications`                         | POST   | Send notification to specific subscriptions |
| `/api/push-notifications?endpoint=...`            | DELETE | Remove a subscription                       |

### VAPID Keys

VAPID keys are configured in `server/routes/push-notifications.ts`. For production, generate new keys:

```bash
npx web-push generate-vapid-keys
```

Update the keys in the server configuration and set a proper contact email.

### Testing Push Notifications

1. Start both servers (Next.js + Express)
2. Click "Enable notifications" button in the app
3. Grant notification permission when prompted
4. Test with: `curl http://localhost:3001/api/push-notifications`
