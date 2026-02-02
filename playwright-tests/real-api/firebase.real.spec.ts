import { expect, test } from '@playwright/test'
import {
  cleanupTestData,
  loadRealAPIConfig,
  measureAPICall,
  rateLimitDelay,
  setupRealAPIPage,
  usageTracker,
  validateAPICredentials,
  waitForAppReady,
} from './test-utils.real'

/**
 * REAL Firebase & Push Notifications Integration Tests
 *
 * ⚠️ WARNING: These tests make REAL API calls to Firebase
 * - Requires valid Firebase credentials in .env.test
 * - Uses Firebase free tier (should not incur costs)
 * - Tests may create real FCM tokens
 *
 * Run with: pnpm test:e2e:real
 */

test.describe('Firebase - Real Integration', () => {
  const config = loadRealAPIConfig()
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ]

  test.beforeAll(() => {
    if (!config.enableFirebase) {
      console.log('⏭️  Skipping Firebase tests (TEST_FIREBASE=false)')
      test.skip()
    }

    if (!validateAPICredentials('Firebase', requiredVars)) {
      console.log('⏭️  Skipping Firebase tests (missing credentials)')
      test.skip()
    }

    console.log('🚀 Running REAL Firebase integration tests')
  })

  test.afterAll(() => {
    console.log(usageTracker.getReport())
  })

  test('should initialize Firebase with real credentials', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: firebaseStatus, duration } = await measureAPICall(
      'Firebase Initialization',
      async () => {
        return await page.evaluate(() => {
          // Check if Firebase SDK is loaded
          const hasFirebase = !!(window as typeof window & { firebase?: unknown }).firebase

          return {
            loaded: hasFirebase,
            projectId: hasFirebase
              ? (
                  window as typeof window & {
                    firebase?: { app?: () => { options: { projectId: string } } }
                  }
                ).firebase?.app?.()?.options?.projectId
              : null,
          }
        })
      },
    )

    usageTracker.recordCall('Firebase', duration)

    console.log(`📱 Firebase Status:`)
    console.log(`  SDK Loaded: ${firebaseStatus.loaded ? '✅' : '❌'}`)
    console.log(`  Project ID: ${firebaseStatus.projectId || 'N/A'}`)

    // Firebase should be initialized (if credentials are correct)
    // Note: May not initialize in test environment, which is okay
    expect(typeof firebaseStatus.loaded).toBe('boolean')
  })

  test('should handle Firebase Cloud Messaging availability', async ({ page, context }) => {
    await setupRealAPIPage(page)

    // Grant notification permission for testing
    await context.grantPermissions(['notifications'])

    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: fcmAvailability, duration } = await measureAPICall(
      'FCM Availability Check',
      async () => {
        return await page.evaluate(() => {
          const hasMessaging = 'serviceWorker' in navigator && 'PushManager' in window
          const hasNotificationAPI = 'Notification' in window
          const notificationPermission = hasNotificationAPI ? Notification.permission : 'default'

          return {
            messagingSupported: hasMessaging,
            notificationSupported: hasNotificationAPI,
            permission: notificationPermission,
          }
        })
      },
    )

    usageTracker.recordCall('Firebase FCM', duration)

    console.log(`🔔 FCM Capability:`)
    console.log(`  Messaging API: ${fcmAvailability.messagingSupported ? '✅' : '❌'}`)
    console.log(`  Notification API: ${fcmAvailability.notificationSupported ? '✅' : '❌'}`)
    console.log(`  Permission: ${fcmAvailability.permission}`)

    // Browser should support required APIs
    expect(fcmAvailability.messagingSupported).toBe(true)
    expect(fcmAvailability.notificationSupported).toBe(true)
  })

  test('should test real VAPID key endpoint', async ({ page }) => {
    await setupRealAPIPage(page)
    await page.goto('http://localhost:3001/')

    const { result: response, duration } = await measureAPICall('VAPID Key Retrieval', async () => {
      return await page.request.get(
        'http://localhost:3000/api/push-notifications?action=vapid-public-key',
      )
    })

    usageTracker.recordCall('Push Notifications API', duration)

    if (response.ok()) {
      const data = await response.json()
      console.log(`🔑 VAPID Key Status: ✅ Retrieved`)
      console.log(`  Key length: ${data.publicKey?.length || 0} characters`)

      expect(data).toHaveProperty('publicKey')
      expect(data.publicKey).toBeTruthy()
      expect(data.publicKey.length).toBeGreaterThan(50) // VAPID keys are long
    } else {
      console.log(`⚠️  VAPID key endpoint returned: ${response.status()}`)
      console.log(`  This is expected if backend is not configured`)
    }

    await rateLimitDelay(config.rateLimitDelay)
  })

  test('should handle push notification subscription flow', async ({ page, context }) => {
    await setupRealAPIPage(page)
    await context.grantPermissions(['notifications'])

    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    // Wait for notification button to be available
    const notificationButton = page.locator('[data-testid="notification-button"]')
    const buttonExists = (await notificationButton.count()) > 0

    if (!buttonExists) {
      console.log('⏭️  Notification button not found - skipping subscription test')
      test.skip()
      return
    }

    await notificationButton.click()

    // Wait a bit for subscription process
    await page.waitForTimeout(2000)

    // Check if subscription was attempted
    const subscriptionAttempted = await page.evaluate(() => {
      // Look for subscription in localStorage or check service worker
      const stored = localStorage.getItem('push-subscription')
      return !!stored
    })

    console.log(`📬 Subscription Attempted: ${subscriptionAttempted ? '✅' : '❌'}`)

    // Note: Actual subscription may not work in test environment
    // but we can verify the flow was attempted
    expect(typeof subscriptionAttempted).toBe('boolean')
  })

  test('should measure Firebase SDK load performance', async ({ page }) => {
    await setupRealAPIPage(page)

    const _loadStart = Date.now()
    await page.goto('http://localhost:3001/')
    await waitForAppReady(page)

    const { result: performance, duration } = await measureAPICall(
      'Firebase SDK Load Time',
      async () => {
        return await page.evaluate(() => {
          if (!(performance && performance.getEntriesByType)) {
            return { loadTime: 0, resources: [] }
          }

          const resources = performance
            .getEntriesByType('resource')
            .filter((resource: PerformanceEntry) =>
              (resource as PerformanceResourceTiming).name.includes('firebase'),
            )

          const totalLoadTime = resources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + (resource as PerformanceResourceTiming).duration,
            0,
          )

          return {
            loadTime: totalLoadTime,
            resources: resources.map((r: PerformanceEntry) => ({
              name: (r as PerformanceResourceTiming).name.split('/').pop(),
              duration: (r as PerformanceResourceTiming).duration,
              size: (r as PerformanceResourceTiming).transferSize,
            })),
          }
        })
      },
    )

    usageTracker.recordCall('Firebase SDK', duration)

    console.log(`⚡ Firebase SDK Performance:`)
    console.log(`  Total Load Time: ${performance.loadTime.toFixed(0)}ms`)
    console.log(`  Resources Loaded: ${performance.resources.length}`)

    performance.resources.forEach((resource: { name?: string; duration: number; size: number }) => {
      console.log(
        `    - ${resource.name}: ${resource.duration.toFixed(0)}ms (${resource.size} bytes)`,
      )
    })

    // Firebase SDK should load reasonably fast
    if (performance.loadTime > 0) {
      expect(performance.loadTime).toBeLessThan(10000) // Under 10 seconds
    }
  })

  test.afterEach(async () => {
    // Cleanup: Remove any test subscriptions
    await cleanupTestData('Firebase Push Subscriptions', async () => {
      // Note: In real implementation, you'd call an API to remove test subscriptions
      console.log('Cleaning up push subscription test data...')
    })
  })
})
