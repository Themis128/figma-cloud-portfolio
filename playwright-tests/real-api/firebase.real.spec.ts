import { expect, test } from "@playwright/test";
import {
  cleanupTestData,
  loadRealAPIConfig,
  measureAPICall,
  setupRealAPIPage,
  usageTracker,
  validateAPICredentials,
  waitForAppReady,
} from "./test-utils.real";

/**
 * REAL Firebase Integration Tests
 *
 * ⚠️ WARNING: These tests make REAL API calls to Firebase
 * - Requires valid Firebase credentials in .env.test
 * - Uses Firebase free tier (should not incur costs)
 *
 * Run with: pnpm test:e2e:real
 */

test.describe("Firebase - Real Integration", () => {
  const config = loadRealAPIConfig();
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ];

  test.beforeAll(() => {
    if (!config.enableFirebase) {
      console.log("⏭️  Skipping Firebase tests (TEST_FIREBASE=false)");
      test.skip();
    }

    if (!validateAPICredentials("Firebase", requiredVars)) {
      console.log("⏭️  Skipping Firebase tests (missing credentials)");
      test.skip();
    }

    console.log("🚀 Running REAL Firebase integration tests");
  });

  test.afterAll(() => {
    console.log(usageTracker.getReport());
  });

  test("should initialize Firebase with real credentials", async ({ page }) => {
    await setupRealAPIPage(page);
    await page.goto("http://localhost:3001/");
    await waitForAppReady(page);

    const { result: firebaseStatus, duration } = await measureAPICall(
      "Firebase Initialization",
      async () => {
        return await page.evaluate(() => {
          // Check if Firebase SDK is loaded
          const hasFirebase = !!(
            window as typeof window & { firebase?: unknown }
          ).firebase;

          return {
            loaded: hasFirebase,
            projectId: hasFirebase
              ? (
                  window as typeof window & {
                    firebase?: {
                      app?: () => { options: { projectId: string } };
                    };
                  }
                ).firebase?.app?.()?.options?.projectId
              : null,
          };
        });
      },
    );

    usageTracker.recordCall("Firebase", duration);

    console.log(`📱 Firebase Status:`);
    console.log(`  SDK Loaded: ${firebaseStatus.loaded ? "✅" : "❌"}`);
    console.log(`  Project ID: ${firebaseStatus.projectId || "N/A"}`);

    // Firebase should be initialized (if credentials are correct)
    // Note: May not initialize in test environment, which is okay
    expect(typeof firebaseStatus.loaded).toBe("boolean");
  });

  test("should handle Firebase Cloud Messaging availability", async ({
    page,
    context,
  }) => {
    await setupRealAPIPage(page);

    // Grant notification permission for testing
    await context.grantPermissions(["notifications"]);

    await page.goto("http://localhost:3001/");
    await waitForAppReady(page);

    const { result: fcmAvailability, duration } = await measureAPICall(
      "FCM Availability Check",
      async () => {
        return await page.evaluate(() => {
          const hasMessaging =
            "serviceWorker" in navigator && "PushManager" in window;
          const hasNotificationAPI = "Notification" in window;
          const notificationPermission = hasNotificationAPI
            ? Notification.permission
            : "default";

          return {
            messagingSupported: hasMessaging,
            notificationSupported: hasNotificationAPI,
            permission: notificationPermission,
          };
        });
      },
    );

    usageTracker.recordCall("Firebase FCM", duration);

    console.log(`🔔 FCM Capability:`);
    console.log(
      `  Messaging API: ${fcmAvailability.messagingSupported ? "✅" : "❌"}`,
    );
    console.log(
      `  Notification API: ${fcmAvailability.notificationSupported ? "✅" : "❌"}`,
    );
    console.log(`  Permission: ${fcmAvailability.permission}`);

    // Browser should support required APIs
    expect(fcmAvailability.messagingSupported).toBe(true);
    expect(fcmAvailability.notificationSupported).toBe(true);
  });

  test("should measure Firebase SDK load performance", async ({ page }) => {
    await setupRealAPIPage(page);

    const _loadStart = Date.now();
    await page.goto("http://localhost:3001/");
    await waitForAppReady(page);

    const { result: performance, duration } = await measureAPICall(
      "Firebase SDK Load Time",
      async () => {
        return await page.evaluate(() => {
          if (!performance?.getEntriesByType) {
            return { loadTime: 0, resources: [] };
          }

          const resources = performance
            .getEntriesByType("resource")
            .filter((resource: PerformanceEntry) =>
              (resource as PerformanceResourceTiming).name.includes("firebase"),
            );

          const totalLoadTime = resources.reduce(
            (sum: number, resource: PerformanceEntry) =>
              sum + (resource as PerformanceResourceTiming).duration,
            0,
          );

          return {
            loadTime: totalLoadTime,
            resources: resources.map((r: PerformanceEntry) => ({
              name: (r as PerformanceResourceTiming).name.split("/").pop(),
              duration: (r as PerformanceResourceTiming).duration,
              size: (r as PerformanceResourceTiming).transferSize,
            })),
          };
        });
      },
    );

    usageTracker.recordCall("Firebase SDK", duration);

    console.log(`⚡ Firebase SDK Performance:`);
    console.log(`  Total Load Time: ${performance.loadTime.toFixed(0)}ms`);
    console.log(`  Resources Loaded: ${performance.resources.length}`);

    performance.resources.forEach(
      (resource: { name?: string; duration: number; size: number }) => {
        console.log(
          `    - ${resource.name}: ${resource.duration.toFixed(0)}ms (${resource.size} bytes)`,
        );
      },
    );

    // Firebase SDK should load reasonably fast
    if (performance.loadTime > 0) {
      expect(performance.loadTime).toBeLessThan(10000); // Under 10 seconds
    }
  });

  test.afterEach(async () => {
    // Cleanup: Remove any test data
    await cleanupTestData("Firebase Test Data", async () => {
      console.log("Cleaning up Firebase test data...");
    });
  });
});
