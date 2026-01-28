// Custom service worker for push notifications
// Uses Workbox from CDN (compatible with both dev and production)

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js',
)

// Check if Workbox loaded successfully
if (workbox) {
  console.log('Workbox loaded successfully')

  // Claim all clients immediately
  workbox.core.clientsClaim()

  // Skip waiting
  workbox.core.skipWaiting()

  // Precache and route - will be populated during build
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [])

  // Handle SPA navigation routes
  workbox.routing.registerRoute(
    new workbox.NavigationRoute(
      workbox.createHandlerBoundToURL('/index.html'),
      {
        denylist: [/^\/api\//, /^\/_/, /^\/[^/?]+\.[^/]+$/],
      },
    ),
  )

  // Runtime caching for local API calls
  workbox.routing.registerRoute(
    /^\/api\//,
    new workbox.strategies.NetworkFirst({
      cacheName: 'local-api-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
      ],
    }),
  )

  // Runtime caching for Google Fonts
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'google-fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
      ],
    }),
  )

  // Runtime caching for images
  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
      ],
    }),
  )

  // Runtime caching for static resources
  workbox.routing.registerRoute(
    /^https:\/\/.*\.(js|css)$/i,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
      ],
    }),
  )
} else {
  console.log('Workbox failed to load')
}

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  event.waitUntil(self.clients.claim())
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event)

  if (!event.data) {
    console.log('Push event but no data')
    return
  }

  try {
    const data = event.data.json()
    console.log('Push data:', data)

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/logo.jpg',
      badge: data.badge || '/logo.jpg',
      image: data.image,
      tag: data.tag || 'portfolio-notification',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      actions: data.actions || [],
      data: {
        url: data.url || '/',
        ...data.data,
      },
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options),
    )
  } catch (error) {
    console.error('Error processing push event:', error)
    event.waitUntil(
      self.registration.showNotification('Notification', {
        body: 'You have a new notification',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'portfolio-notification',
      }),
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event', event)

  const notification = event.notification
  const data = notification.data || {}

  notification.close()

  if (event.action) {
    switch (event.action) {
      case 'view':
        event.waitUntil(clients.openWindow(data.url || '/'))
        break
      case 'dismiss':
        break
      default:
        event.waitUntil(clients.openWindow(data.url || '/'))
    }
  } else {
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = data.url || '/'

          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus()
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url)
          }
        }),
    )
  }
})

// Message event
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message event', event)

  if (event.data?.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: '1.0.0' })
        break
      default:
        console.log('Unknown message type:', event.data.type)
    }
  }
})

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event)
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log('Performing background sync...')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync event', event)
  if (event.tag === 'periodic-background-sync') {
    event.waitUntil(doPeriodicSync())
  }
})

async function doPeriodicSync() {
  try {
    console.log('Performing periodic sync...')
  } catch (error) {
    console.error('Periodic sync failed:', error)
  }
}

// Precache manifest placeholder for Workbox injectManifest
self.__WB_MANIFEST = []
