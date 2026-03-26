// Enhanced Service Worker with React 19 optimizations and advanced PWA features
// Uses Workbox from CDN (compatible with both dev and production)
// v7 — version polling + SW event detection

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js",
);

// Check if Workbox loaded successfully
if (workbox) {
  console.log("Enhanced Workbox loaded successfully");

  // Claim all clients immediately
  workbox.core.clientsClaim();

  // Do NOT call self.skipWaiting() here — let the new SW wait in the
  // "installed" state so PWAUpdateNotification can show the "Update Now"
  // button. The user triggers skipWaiting via postMessage({ type: "SKIP_WAITING" }).

  // Clean up old caches
  workbox.precaching.cleanupOutdatedCaches();

  // Precache critical resources
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

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

  // Enhanced API caching with background sync
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(
    "api-queue",
    {
      maxRetentionTime: 24 * 60, // 24 hours
    },
  );

  workbox.routing.registerRoute(
    /^\/api\//,
    new workbox.strategies.NetworkFirst({
      cacheName: "enhanced-api-cache",
      networkTimeoutSeconds: 10,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes for fresh API data
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        bgSyncPlugin,
      ],
    }),
  );

  // Enhanced Google Fonts caching (disabled - using system fonts)
  // workbox.routing.registerRoute(
  //   /^https:\/\/fonts\.googleapis\.com/i,
  //   new workbox.strategies.CacheFirst({
  //     cacheName: "google-fonts-stylesheets",
  //     plugins: [
  //       new workbox.expiration.ExpirationPlugin({
  //         maxEntries: 10,
  //         maxAgeSeconds: CACHE_DURATION_1_YEAR,
  //       }),
  //       new workbox.cacheableResponse.CacheableResponsePlugin({
  //         statuses: [0, 200],
  //       }),
  //     ],
  //   }),
  // );

  // workbox.routing.registerRoute(
  //   /^https:\/\/fonts\.gstatic\.com/i,
  //   new workbox.strategies.CacheFirst({
  //     cacheName: "google-fonts-webfonts",
  //     plugins: [
  //       new workbox.expiration.ExpirationPlugin({
  //         maxEntries: 30,
  //         maxAgeSeconds: CACHE_DURATION_1_YEAR,
  //       }),
  //       new workbox.cacheableResponse.CacheableResponsePlugin({
  //         statuses: [0, 200],
  //       }),
  //     ],
  //   }),
  // );

  // Enhanced images caching with WebP/AVIF support
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: "enhanced-images-cache",
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

  // Enhanced static resources with better caching
  workbox.routing.registerRoute(
    /.*\.(js|css|woff|woff2)$/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "enhanced-static-resources",
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

  // Analytics and external services
  workbox.routing.registerRoute(
    /^https:\/\/(www\.google-analytics\.com|www\.googletagmanager\.com|analytics\.google\.com)/,
    new workbox.strategies.NetworkFirst({
      cacheName: "analytics-cache",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
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

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate event");
  event.waitUntil(self.clients.claim());
});

// Enhanced Push event - handle incoming push notifications with React 19 features
self.addEventListener("push", (event) => {
  console.log("Service Worker: Enhanced Push event received", event);

  if (!event.data) {
    console.log("Push event but no data");
    // Send default notification with enhanced features
    event.waitUntil(
      self.registration.showNotification("Portfolio Update", {
        body: "Check out the latest updates on Themistoklis Baltzakis Portfolio!",
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        tag: "portfolio-default",
        vibrate: [125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600],
        timestamp: Date.now(),
        requireInteraction: true,
        actions: [
          {
            action: "view",
            title: "View Portfolio",
            icon: "/logo.jpg",
          },
          {
            action: "dismiss",
            title: "Dismiss",
            icon: "/logo.jpg",
          },
        ],
        data: {
          url: "/",
          dateOfArrival: Date.now(),
          primaryKey: "default",
        },
      }),
    );
    return;
  }

  try {
    const data = event.data.json();
    console.log("Enhanced push data:", data);

    const options = {
      body: data.body || "You have a new notification",
      icon: data.icon || "/logo.jpg",
      badge: data.badge || "/logo.jpg",
      image: data.image,
      tag: data.tag || "portfolio-notification",
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [
        125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600,
      ],
      timestamp: Date.now(),
      renotify: data.renotify || false,
      actions: data.actions || [
        {
          action: "view",
          title: "View",
          icon: "/logo.jpg",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/logo.jpg",
        },
      ],
      data: {
        url: data.url || "/",
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || "default",
        analytics: data.analytics !== false,
        ...data.data,
      },
    };

    event.waitUntil(
      self.registration
        .showNotification(data.title || "Portfolio Notification", options)
        .then(() => {
          // Forward push data to all open tabs for in-app display
          self.clients.matchAll({ type: "window" }).then((clientList) => {
            for (const client of clientList) {
              client.postMessage({
                type: "PUSH_RECEIVED",
                title: data.title || "Portfolio Notification",
                body: data.body || "",
                url: data.url || "/",
              });
            }
          });
          // Track notification metrics if analytics enabled
          if (options.data.analytics) {
            trackNotificationReceived(data);
          }
        })
        .catch((error) => {
          console.error("Failed to show notification:", error);
        }),
    );
  } catch (error) {
    console.error("Error processing enhanced push event:", error);
    event.waitUntil(
      self.registration.showNotification("Notification Error", {
        body: "You have a new notification from Themistoklis Baltzakis Portfolio",
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        tag: "portfolio-error",
        actions: [
          {
            action: "view",
            title: "View Portfolio",
            icon: "/logo.jpg",
          },
        ],
        data: {
          url: "/",
          dateOfArrival: Date.now(),
        },
      }),
    );
  }
});

// Enhanced Notification click event with intelligent navigation
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Enhanced notification click event", event);

  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  notification.close();

  // Track notification interaction if analytics enabled
  if (data.analytics) {
    trackNotificationClicked(data, action);
  }

  // Handle dismiss action
  if (action === "dismiss") {
    return;
  }

  // Determine target URL based on action
  const targetUrl =
    action === "view"
      ? data.url || "/"
      : data.actionUrls?.[action] || data.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const targetOrigin = new URL(targetUrl, self.location.origin).origin;

        // Try to find an existing window with the same origin
        for (const client of clientList) {
          if (
            client.url &&
            new URL(client.url).origin === targetOrigin &&
            "focus" in client
          ) {
            // If we need to navigate to a specific URL, send a message
            if (targetUrl !== "/" && !client.url.endsWith(targetUrl)) {
              client.postMessage({
                type: "NAVIGATE_TO",
                url: targetUrl,
                source: "notification",
              });
            }
            return client.focus();
          }
        }

        // If no suitable window is found, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
        // Fallback: try to open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

// Enhanced Message event with React 19 integration features
self.addEventListener("message", (event) => {
  // Validate message origin — only accept messages from same origin
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
        // Safely send response only if port exists
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ version: "1.0.0" });
        }
        break;
      case "CACHE_STATS":
        reportCacheStats().then((stats) => {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: "CACHE_STATS_RESPONSE", stats });
          }
        }).catch((error) => {
          console.error("Error getting cache stats:", error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: "CACHE_STATS_RESPONSE", error: error.message });
          }
        });
        break;
      case "CLEAR_CACHE":
        clearSpecificCache(event.data.cacheName).then((result) => {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
              type: "CACHE_CLEARED",
              success: result,
            });
          }
        }).catch((error) => {
          console.error("Error clearing cache:", error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({
              type: "CACHE_CLEARED",
              success: false,
              error: error.message,
            });
          }
        });
        break;
      case "PERFORMANCE_METRICS":
        // Store performance metrics from main thread
        storePerformanceMetrics(event.data.metrics);
        break;
      case "PREFETCH_ROUTES":
        // Prefetch important routes
        prefetchRoutes(event.data.routes);
        break;
      default:
        console.log("Unknown enhanced message type:", event.data.type);
    }
  }

  // Don't return true - this prevents the "async response" error
  // The message handling is now synchronous and doesn't indicate async responses
});

// Enhanced Background sync with intelligent queue management
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Enhanced background sync event", event.tag);

  switch (event.tag) {
    case "background-sync":
      event.waitUntil(doEnhancedBackgroundSync());
      break;
    case "api-retry":
      event.waitUntil(retryFailedApiCalls());
      break;
    case "analytics-sync":
      event.waitUntil(syncAnalytics());
      break;
    case "prefetch-content":
      event.waitUntil(prefetchCriticalContent());
      break;
    default:
      console.log("Unknown sync tag:", event.tag);
      event.waitUntil(doEnhancedBackgroundSync());
  }
});

async function doEnhancedBackgroundSync() {
  try {
    console.log("Performing enhanced background sync...");

    // Sync cached API responses
    await syncCachedRequests();

    // Update critical resources
    await updateCriticalResources();

    // Clean up old cache entries
    await cleanupOldCaches();

    console.log("Enhanced background sync completed successfully");
  } catch (error) {
    console.error("Enhanced background sync failed:", error);
  }
}

async function retryFailedApiCalls() {
  try {
    console.log("Retrying failed API calls...");

    // Get failed requests from indexedDB or cache
    const failedRequests = await getFailedRequests();

    for (const request of failedRequests) {
      try {
        // Validate URL is same-origin to prevent SSRF
        const requestUrl = new URL(request.url, self.location.origin);
        if (requestUrl.origin !== self.location.origin) {
          console.warn("Skipping cross-origin retry:", request.url);
          await removeFailedRequest(request.id);
          continue;
        }
        const response = await fetch(requestUrl.href, request.options);
        if (response.ok) {
          await removeFailedRequest(request.id);
          console.log("Successfully retried:", request.url);
        }
      } catch (error) {
        console.log("Retry failed for:", request.url, error);
      }
    }
  } catch (error) {
    console.error("Failed to retry API calls:", error);
  }
}

async function syncAnalytics() {
  try {
    console.log("Syncing analytics data...");

    // Sync offline analytics events
    const offlineEvents = await getOfflineAnalytics();

    for (const event of offlineEvents) {
      try {
        await sendAnalyticsEvent(event);
        await removeOfflineEvent(event.id);
      } catch (error) {
        console.log("Failed to sync analytics event:", error);
      }
    }
  } catch (error) {
    console.error("Analytics sync failed:", error);
  }
}

async function prefetchCriticalContent() {
  try {
    console.log("Prefetching critical content...");

    const criticalUrls = [
      "/",
      "/about/",
      "/projects/",
      "/contact/",
      "/blog/",
    ];

    for (const url of criticalUrls) {
      try {
        await fetch(url);
        console.log("Prefetched:", url);
      } catch (error) {
        console.log("Failed to prefetch:", url);
      }
    }
  } catch (error) {
    console.error("Critical content prefetch failed:", error);
  }
}

// Periodic background sync
self.addEventListener("periodicsync", (event) => {
  console.log("Service Worker: Periodic sync event", event);
  if (event.tag === "periodic-background-sync") {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    console.log("Performing periodic sync...");

    // Update cache statistics
    await updateCacheStatistics();

    // Prefetch popular content
    await prefetchPopularContent();

    // Clean up expired data
    await cleanupExpiredData();
  } catch (error) {
    console.error("Periodic sync failed:", error);
  }
}

// Enhanced helper functions for React 19 integration

// Analytics tracking functions
async function trackNotificationReceived(data) {
  try {
    const event = {
      name: "notification_received",
      params: {
        notification_tag: data.tag,
        notification_title: data.title,
        timestamp: Date.now(),
      },
    };
    await storeOfflineAnalytics(event);
  } catch (error) {
    console.error("Failed to track notification received:", error);
  }
}

async function trackNotificationClicked(data, action) {
  try {
    const event = {
      name: "notification_clicked",
      params: {
        notification_tag: data.tag,
        action: action || "default",
        url: data.url,
        timestamp: Date.now(),
      },
    };
    await storeOfflineAnalytics(event);
  } catch (error) {
    console.error("Failed to track notification clicked:", error);
  }
}

// Cache management functions
async function reportCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = [];

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      const size = requests.length;

      // Calculate approximate cache size
      let totalSize = 0;
      for (const request of requests.slice(0, 5)) {
        // Sample first 5
        try {
          const response = await cache.match(request);
          if (response) {
            const clone = response.clone();
            const buffer = await clone.arrayBuffer();
            totalSize += buffer.byteLength;
          }
        } catch (e) {
          // Ignore errors for size calculation
        }
      }

      stats.push({
        name: cacheName,
        entries: size,
        estimatedSize: Math.round((totalSize * size) / Math.min(5, size)), // Extrapolate
      });
    }

    return stats;
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return [];
  }
}

async function clearSpecificCache(cacheName) {
  try {
    if (!cacheName) return false;
    const deleted = await caches.delete(cacheName);
    console.log("Cache cleared:", cacheName, deleted);
    return deleted;
  } catch (error) {
    console.error("Error clearing cache:", error);
    return false;
  }
}

// Performance monitoring
async function storePerformanceMetrics(metrics) {
  try {
    // Store in IndexedDB or send to analytics
    console.log("Storing performance metrics:", metrics);

    const event = {
      name: "performance_metrics",
      params: {
        ...metrics,
        source: "service_worker",
        timestamp: Date.now(),
      },
    };

    await storeOfflineAnalytics(event);
  } catch (error) {
    console.error("Failed to store performance metrics:", error);
  }
}

// Route prefetching
async function prefetchRoutes(routes) {
  try {
    if (!Array.isArray(routes)) return;

    console.log("Prefetching routes:", routes);

    // Only prefetch safe relative paths (no external URLs or protocol-relative)
    const safeRoutes = routes.filter((r) => typeof r === "string" && r.startsWith("/") && !r.startsWith("//"));
    const prefetchPromises = safeRoutes.map(async (route) => {
      try {
        const response = await fetch(route, {
          method: "GET",
          cache: "force-cache",
        });

        if (response.ok) {
          console.log("Successfully prefetched:", route);
          return true;
        }
        return false;
      } catch (error) {
        console.log("Failed to prefetch:", route, error);
        return false;
      }
    });

    await Promise.allSettled(prefetchPromises);
  } catch (error) {
    console.error("Route prefetching failed:", error);
  }
}

// Data management functions
async function syncCachedRequests() {
  try {
    const failedRequests = await getFailedRequests();
    if (failedRequests.length === 0) return;
    console.log(`Syncing ${failedRequests.length} cached request(s)...`);
    for (const request of failedRequests) {
      try {
        const requestUrl = new URL(request.url, self.location.origin);
        if (requestUrl.origin !== self.location.origin) {
          await removeFailedRequest(request.id);
          continue;
        }
        const response = await fetch(requestUrl.href, request.options);
        if (response.ok) {
          await removeFailedRequest(request.id);
        }
      } catch {
        // Will retry on next sync
      }
    }
  } catch (error) {
    console.error("Failed to sync cached requests:", error);
  }
}

async function updateCriticalResources() {
  try {
    console.log("Updating critical resources...");

    const criticalResources = [
      "/manifest.webmanifest",
      "/offline.html",
      "/logo.svg",
    ];

    for (const resource of criticalResources) {
      try {
        await fetch(resource, { cache: "reload" });
      } catch (error) {
        console.log("Failed to update critical resource:", resource);
      }
    }
  } catch (error) {
    console.error("Failed to update critical resources:", error);
  }
}

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const currentCaches = [
      "pages-cache",
      "offline-fallback",
      "enhanced-api-cache",
      "enhanced-images-cache",
      "enhanced-static-resources",
      "cdn-resources",
      "analytics-cache",
    ];

    const oldCaches = cacheNames.filter(
      (name) => !currentCaches.includes(name),
    );

    for (const cacheName of oldCaches) {
      await caches.delete(cacheName);
      console.log("Cleaned up old cache:", cacheName);
    }

  } catch (error) {
    console.error("Failed to cleanup old caches:", error);
  }
}

// ---------------------------------------------------------------------------
// IndexedDB helpers — "sw-store" database with two object stores
// ---------------------------------------------------------------------------

const DB_NAME = "sw-store";
const DB_VERSION = 1;
const STORE_FAILED_REQUESTS = "failed-requests";
const STORE_OFFLINE_ANALYTICS = "offline-analytics";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = req.result;
      const oldVersion = event.oldVersion;

      // Version 1: initial schema
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(STORE_FAILED_REQUESTS)) {
          db.createObjectStore(STORE_FAILED_REQUESTS, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains(STORE_OFFLINE_ANALYTICS)) {
          db.createObjectStore(STORE_OFFLINE_ANALYTICS, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      }

      // Future migrations: if (oldVersion < 2) { ... }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(storeName) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

function idbPut(storeName, value) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.put(value);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

function idbDelete(storeName, key) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }),
  );
}

// Offline storage helpers — backed by IndexedDB
async function getFailedRequests() {
  try {
    return await idbGetAll(STORE_FAILED_REQUESTS);
  } catch (error) {
    console.error("Failed to read failed requests from IndexedDB:", error);
    return [];
  }
}

async function removeFailedRequest(id) {
  try {
    await idbDelete(STORE_FAILED_REQUESTS, id);
  } catch (error) {
    console.error("Failed to remove failed request:", error);
  }
}

async function getOfflineAnalytics() {
  try {
    return await idbGetAll(STORE_OFFLINE_ANALYTICS);
  } catch (error) {
    console.error("Failed to read offline analytics from IndexedDB:", error);
    return [];
  }
}

async function storeOfflineAnalytics(event) {
  try {
    await idbPut(STORE_OFFLINE_ANALYTICS, {
      ...event,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to store offline analytics:", error);
  }
}

async function removeOfflineEvent(id) {
  try {
    await idbDelete(STORE_OFFLINE_ANALYTICS, id);
  } catch (error) {
    console.error("Failed to remove offline event:", error);
  }
}

async function sendAnalyticsEvent(event) {
  // Send to GA4 via Measurement Protocol if configured
  // Falls back to logging if no GA endpoint is available
  try {
    const clientId = event.params?.client_id || "sw-offline";
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?api_secret=&measurement_id=`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: event.name, params: event.params }],
        }),
      },
    );
    if (!response.ok) {
      console.log("Analytics event logged locally (GA endpoint unavailable):", event.name);
    }
  } catch {
    // Network still unavailable — event stays in queue for next sync
    console.log("Analytics event queued for retry:", event.name);
    throw new Error("Network unavailable");
  }
}

async function updateCacheStatistics() {
  try {
    const stats = await reportCacheStats();
    console.log("Updated cache statistics:", stats);
  } catch (error) {
    console.error("Failed to update cache statistics:", error);
  }
}

async function prefetchPopularContent() {
  try {
    // Prefetch most visited pages based on analytics
    const popularRoutes = ["/", "/projects/", "/about/"];
    for (const route of popularRoutes) {
      try {
        await fetch(route, { cache: "force-cache" });
      } catch (error) {
        console.log("Failed to prefetch popular content:", route);
      }
    }
  } catch (error) {
    console.error("Failed to prefetch popular content:", error);
  }
}

async function cleanupExpiredData() {
  try {
    console.log("Cleaning up expired data...");
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ONE_WEEK_MS;

    // Clean expired analytics events
    const events = await getOfflineAnalytics();
    for (const event of events) {
      if (event.timestamp && event.timestamp < cutoff) {
        await removeOfflineEvent(event.id);
      }
    }

    // Clean expired failed requests
    const requests = await getFailedRequests();
    for (const req of requests) {
      if (req.timestamp && req.timestamp < cutoff) {
        await removeFailedRequest(req.id);
      }
    }
  } catch (error) {
    console.error("Failed to cleanup expired data:", error);
  }
}

