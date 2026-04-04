// Service Worker with Workbox caching strategies
// v8 — cleaned up: removed broken precache, dead analytics, misused BackgroundSync

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js",
);

if (workbox) {
  console.log("Workbox loaded successfully");

  // Claim all clients immediately
  workbox.core.clientsClaim();

  // Do NOT call self.skipWaiting() here — let the new SW wait in the
  // "installed" state so PWAUpdateNotification can show the "Update Now"
  // button. The user triggers skipWaiting via postMessage({ type: "SKIP_WAITING" }).

  // Clean up old caches
  workbox.precaching.cleanupOutdatedCaches();

  // Handle navigation requests with NetworkFirst + offline fallback
  const navigationHandler = new workbox.strategies.NetworkFirst({
    cacheName: "pages-cache",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  });

  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    async (args) => {
      try {
        return await navigationHandler.handle(args);
      } catch (error) {
        // Network failed and no cache — serve the offline page
        const offlineCache = await caches.open("offline-fallback");
        const offlinePage = await offlineCache.match("/offline.html");
        if (offlinePage) return offlinePage;
        return new Response("You are offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      }
    },
  );

  // Enhanced images caching with WebP/AVIF support
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: "images-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

  // Static resources (JS, CSS, fonts)
  workbox.routing.registerRoute(
    /.*\.(js|css|woff|woff2)$/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "static-resources",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
      ],
    }),
  );

  // CDN resources caching
  workbox.routing.registerRoute(
    /^https:\/\/(cdn|unpkg|jsdelivr)\./,
    new workbox.strategies.CacheFirst({
      cacheName: "cdn-resources",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );
} else {
  console.log("Workbox failed to load");
}

// Install event — precache the offline fallback page
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install event — waiting for user to accept update");
  event.waitUntil(
    caches.open("offline-fallback").then((cache) => cache.add("/offline.html")),
  );
  // Do NOT call self.skipWaiting() here — the new SW stays in "waiting"
  // state until the user clicks "Update Now" in PWAUpdateNotification,
  // which sends a SKIP_WAITING message (handled in the message listener).
});

// Activate event — clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const currentCaches = [
        "pages-cache",
        "offline-fallback",
        "images-cache",
        "static-resources",
        "cdn-resources",
      ];
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name)),
      );
    }),
  );
});

// Message event — handle skip-waiting and version queries
self.addEventListener("message", (event) => {
  // Validate message origin
  if (event.origin && event.origin !== self.location.origin) {
    console.warn("Ignoring message from unexpected origin:", event.origin);
    return;
  }

  if (event.data?.type) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        self.skipWaiting();
        break;
      case "CLAIM_CLIENTS":
        event.waitUntil(self.clients.claim());
        break;
      case "GET_VERSION":
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ version: "1.0.0" });
        }
        break;
      default:
        console.log("Unknown message type:", event.data.type);
    }
  }
});
