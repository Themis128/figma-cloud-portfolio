#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const swPath = join(process.cwd(), "dist", "spa", "sw.js");

try {
  // Read the generated service worker
  let swContent = readFileSync(swPath, "utf8");

  // Add push notification handlers before the final closing
  const pushHandlers = `

// Push notification handlers
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

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
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options),
    );
  } catch (error) {
    console.error('Error processing push event:', error);
    event.waitUntil(
      self.registration.showNotification('Notification', {
        body: 'You have a new notification',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: 'portfolio-notification',
      }),
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click event', event);

  const notification = event.notification;
  const data = notification.data || {};

  notification.close();

  if (event.action) {
    switch (event.action) {
      case 'view':
        event.waitUntil(clients.openWindow(data.url || '/'));
        break;
      case 'dismiss':
        break;
      default:
        event.waitUntil(clients.openWindow(data.url || '/'));
    }
  } else {
    event.waitUntil(
      clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = data.url || '/';

          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        }),
    );
  }
});

self.addEventListener('message', (event) => {
  console.log('Service Worker: Message event', event);

  if (event.data?.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: '1.0.0' });
        break;
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Performing background sync...');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync event', event);
  if (event.tag === 'periodic-background-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

async function doPeriodicSync() {
  try {
    console.log('Performing periodic sync...');
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}
`;

  // Insert the push handlers before the final closing
  swContent = swContent.replace(/\}\)\);\s*$/, `${pushHandlers}\n});`);

  // Write back the modified service worker
  writeFileSync(swPath, swContent, "utf8");

  console.log("✅ Push notification handlers added to service worker");
} catch (error) {
  console.error("❌ Failed to add push notification handlers:", error);
  process.exit(1);
}
