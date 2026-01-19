// Custom service worker for push notifications
// This extends the auto-generated PWA service worker

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  // Claim all clients so that the service worker starts controlling them immediately
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
      body: data.body || 'You have a new notification from Fusion Starter',
      icon: data.icon || '/logo.jpg',
      badge: data.badge || '/logo.jpg',
      image: data.image,
      tag: data.tag || 'fusion-starter-notification',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      actions: data.actions || [],
      data: {
        url: data.url || '/',
        ...data.data,
      },
    }

    event.waitUntil(self.registration.showNotification(data.title || 'Fusion Starter', options))
  } catch (error) {
    console.error('Error processing push event:', error)
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Fusion Starter', {
        body: 'You have a new notification',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'fusion-starter-notification',
      }),
    )
  }
})

// Notification click event - handle when user clicks on notification
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event', event)

  const notification = event.notification
  const data = notification.data || {}

  notification.close()

  // Handle action clicks
  if (event.action) {
    console.log('Action clicked:', event.action)

    // You can handle different actions here
    switch (event.action) {
      case 'view':
        event.waitUntil(clients.openWindow(data.url || '/'))
        break
      case 'dismiss':
        // Just close the notification (already done above)
        break
      default:
        event.waitUntil(clients.openWindow(data.url || '/'))
    }
  } else {
    // Default action when notification is clicked (not an action button)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const url = data.url || '/'

        // Check if there's already a window open with this URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
    )
  }
})

// Message event - handle messages from the main thread
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

// Background sync (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync event', event)

    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync())
    }
  })
}

async function doBackgroundSync() {
  try {
    // Implement background sync logic here
    console.log('Performing background sync...')

    // For example, retry failed API calls, sync offline data, etc.
    // This is where you would implement the actual sync logic
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync event', event)

    if (event.tag === 'periodic-background-sync') {
      event.waitUntil(doPeriodicSync())
    }
  })
}

async function doPeriodicSync() {
  try {
    console.log('Performing periodic sync...')

    // Implement periodic sync logic here
    // For example, fetch latest news, update cache, etc.
  } catch (error) {
    console.error('Periodic sync failed:', error)
  }
}

// This is required for Workbox injectManifest to work
// It will be replaced with the actual precache manifest during build
self.__WB_MANIFEST = []
