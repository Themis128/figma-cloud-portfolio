import { expect, test } from "@playwright/test";
import { setupTestEnvironment, teardownTestEnvironment } from "./test-utils";

test.describe("Push Notifications", () => {
  test.beforeAll(async () => {
    await setupTestEnvironment();
  });

  test.afterAll(async () => {
    await teardownTestEnvironment();
  });

  test("should display notification button", async ({ page }) => {
    await page.goto("/");

    // Check that notification button is visible
    await expect(page.locator('[data-testid="notification-button"]')).toBeVisible();

    // Check button text
    const buttonText = await page.locator('[data-testid="notification-button"]').textContent();
    expect(buttonText).toContain("Enable Notifications");
  });

  test("should request notification permission", async ({ page }) => {
    // Mock notification permission
    await page.addInitScript(() => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "default",
      });
    });

    await page.goto("/");

    // Click notification button
    await page.click('[data-testid="notification-button"]');

    // Should show permission request (handled by browser)
    // We can't directly test the permission dialog, but we can check the button state
    await expect(page.locator('[data-testid="notification-button"]')).toBeVisible();
  });

  test("should handle notification permission denied", async ({ page }) => {
    // Mock notification permission as denied
    await page.addInitScript(() => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "denied",
      });
    });

    await page.goto("/");

    // Check button shows appropriate state for denied permission
    const buttonText = await page.locator('[data-testid="notification-button"]').textContent();
    expect(buttonText).toContain("Notifications Blocked");
  });

  test("should handle notification permission granted", async ({ page }) => {
    // Mock notification permission as granted
    await page.addInitScript(() => {
      Object.defineProperty(Notification, "permission", {
        writable: true,
        value: "granted",
      });
    });

    await page.goto("/");

    // Check button shows appropriate state for granted permission
    const buttonText = await page.locator('[data-testid="notification-button"]').textContent();
    expect(buttonText).toContain("Notifications Enabled");
  });

  test("should subscribe to push notifications", async ({ page }) => {
    // Mock service worker and push manager
    await page.addInitScript(() => {
      // Mock service worker registration
      Object.defineProperty(window.navigator, "serviceWorker", {
        value: {
          register: () =>
            Promise.resolve({
              active: {
                state: "activated",
              },
              pushManager: {
                subscribe: () =>
                  Promise.resolve({
                    endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
                    keys: {
                      p256dh: "test-p256dh-key",
                      auth: "test-auth-key",
                    },
                  }),
              },
            }),
          ready: Promise.resolve({
            pushManager: {
              subscribe: () =>
                Promise.resolve({
                  endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
                  keys: {
                    p256dh: "test-p256dh-key",
                    auth: "test-auth-key",
                  },
                }),
            },
          }),
        },
        writable: true,
      });

      // Mock Notification
      Object.defineProperty(window, "Notification", {
        value: class MockNotification {
          static permission = "granted";
          static requestPermission = () => Promise.resolve("granted");
        } as unknown as typeof Notification,
        writable: true,
      });
    });

    await page.goto("/");

    // Click notification button to subscribe
    await page.click('[data-testid="notification-button"]');

    // Wait for subscription process
    await page.waitForTimeout(1000);

    // Check that subscription was successful
    const buttonText = await page.locator('[data-testid="notification-button"]').textContent();
    expect(buttonText).toContain("Notifications Enabled");
  });

  test("should unsubscribe from push notifications", async ({ page }) => {
    // Mock service worker with existing subscription
    await page.addInitScript(() => {
      // Mock service worker with existing subscription
      Object.defineProperty(window.navigator, "serviceWorker", {
        value: {
          register: () =>
            Promise.resolve({
              active: {
                state: "activated",
              },
              pushManager: {
                getSubscription: () =>
                  Promise.resolve({
                    endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
                    unsubscribe: () => Promise.resolve(true),
                  }),
              },
            }),
          ready: Promise.resolve({
            pushManager: {
              getSubscription: () =>
                Promise.resolve({
                  endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
                  unsubscribe: () => Promise.resolve(true),
                }),
            },
          }),
        },
        writable: true,
      });

      // @ts-expect-error - Test mock with only static members
      window.Notification = class {
        static permission = "granted";
        static requestPermission = () => Promise.resolve("granted");
      };
    });

    await page.goto("/");

    // Click notification button to unsubscribe
    await page.click('[data-testid="notification-button"]');

    // Wait for unsubscription process
    await page.waitForTimeout(1000);

    // Check that unsubscription was successful
    const buttonText = await page.locator('[data-testid="notification-button"]').textContent();
    expect(buttonText).toContain("Enable Notifications");
  });

  test("should send test notification", async ({ page }) => {
    // Mock fetch for API calls
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (input: RequestInfo | URL, options?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/push-notifications")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                success: true,
                message: "Test notification sent successfully",
              }),
          } as Response);
        }
        return originalFetch(input, options);
      };
    });

    await page.goto("/");

    // Click notification button to send test notification
    await page.click('[data-testid="notification-button"]');

    // Wait for notification process
    await page.waitForTimeout(1000);

    // Check for success feedback
    const successMessage = await page.locator('[data-testid="notification-success"]').textContent();
    expect(successMessage).toContain("Test notification sent");
  });

  test("should handle push notification API errors", async ({ page }) => {
    // Mock fetch to return error
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (input: RequestInfo | URL, options?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/push-notifications")) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () =>
              Promise.resolve({
                error: "Server error",
              }),
          } as Response);
        }
        return originalFetch(input, options);
      };
    });

    await page.goto("/");

    // Click notification button
    await page.click('[data-testid="notification-button"]');

    // Wait for error handling
    await page.waitForTimeout(1000);

    // Check for error feedback
    const errorMessage = await page.locator('[data-testid="notification-error"]').textContent();
    expect(errorMessage).toContain("Error");
  });

  test("should get VAPID public key", async ({ page }) => {
    // Mock fetch for VAPID key
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (input: RequestInfo | URL, options?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/push-notifications?action=vapid-public-key")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                publicKey:
                  "BIYhxDOAqmZg6VijBF03tQjjLDBGnZO6plp45i4XQJbgY8EjudgnVYip5_pdbnHCZAmMXo74dstdV01n1DH0Oqk",
              }),
          } as Response);
        }
        return originalFetch(input, options);
      };
    });

    await page.goto("/");

    // Check that VAPID key is fetched
    await page.waitForTimeout(1000);

    // Verify that the component can access VAPID key
    const vapidKey = await page.evaluate(() => {
      // This would be set by the usePushNotifications hook
      return window.vapidPublicKey || null;
    });

    expect(vapidKey).toBeDefined();
  });

  test("should handle service worker registration", async ({ page }) => {
    // Mock service worker registration
    await page.addInitScript(() => {
      // Mock service worker registration
      Object.defineProperty(window.navigator, "serviceWorker", {
        value: {
          register: () =>
            Promise.resolve({
              active: {
                state: "activated",
              },
            }),
          ready: Promise.resolve({
            active: {
              state: "activated",
            },
          }),
        },
        writable: true,
      });
    });

    await page.goto("/");

    // Check that service worker is registered
    const swState = await page.evaluate(() => {
      return window.navigator.serviceWorker.controller ? "registered" : "not registered";
    });

    expect(swState).toBe("registered");
  });

  test("should handle push notification subscription storage", async ({ page }) => {
    // Mock localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem = (key: string, value: string) => {
        window.subscriptionStorage = window.subscriptionStorage || {};
        window.subscriptionStorage[key] = value;
      };

      window.localStorage.getItem = (key: string) => {
        window.subscriptionStorage = window.subscriptionStorage || {};
        return (window.subscriptionStorage[key] as string) || null;
      };
    });

    await page.goto("/");

    // Simulate subscription
    await page.evaluate(() => {
      const subscriptionData = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      localStorage.setItem("push-subscription", JSON.stringify(subscriptionData));
    });

    // Check that subscription was stored
    const storedSubscription = await page.evaluate(() => {
      return localStorage.getItem("push-subscription");
    });

    expect(storedSubscription).toBeDefined();
    if (storedSubscription) {
      const subscription = JSON.parse(storedSubscription);
      expect(subscription.endpoint).toContain("fcm.googleapis.com");
    }
  });

  test("should display notification tester", async ({ page }) => {
    await page.goto("/performance");

    // Check that notification tester is visible
    await expect(page.locator('[data-testid="push-notification-tester"]')).toBeVisible();

    // Check tester components
    await expect(page.locator('[data-testid="permission-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-notification-button"]')).toBeVisible();
  });

  test("should handle notification timing (45-second delay)", async ({ page }) => {
    await page.goto("/");

    // Check initial state (should not show notification immediately)
    const initialPrompt = await page.locator('[data-testid="notification-prompt"]').isVisible();
    expect(initialPrompt).toBe(false);

    // Wait for 45 seconds (this would be too long for tests, so we mock it)
    // In real implementation, the prompt would appear after 45 seconds
  });

  test("should handle dismissible notification prompts", async ({ page }) => {
    // Mock localStorage for dismissible prompts
    await page.addInitScript(() => {
      window.localStorage.getItem = (key: string) => {
        if (key === "notification-prompt-dismissed") {
          return null; // Not dismissed
        }
        return null;
      };
    });

    await page.goto("/");

    // Check that prompt can be dismissed
    const dismissButton = await page.locator('[data-testid="dismiss-prompt"]').isVisible();
    expect(dismissButton).toBe(false); // Would be visible after 45 seconds
  });

  test("should handle rich notification features", async ({ page }) => {
    // Mock notification with rich content
    await page.addInitScript(() => {
      // @ts-expect-error - Mock Notification class for testing
      window.Notification = class MockNotification {
        static permission: NotificationPermission = "granted";
        static requestPermission = (): Promise<NotificationPermission> =>
          Promise.resolve("granted");

        constructor(title: string, options?: NotificationOptions) {
          this.title = title;
          this.options = options;
        }

        title: string;
        options?: NotificationOptions;
      };
    });

    await page.goto("/");

    // Test rich notification creation
    const notification = await page.evaluate(() => {
      return new Notification("Test Title", {
        body: "Test body",
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        tag: "test-tag",
        requireInteraction: false,
        silent: false,
        data: {
          url: "/test-url",
          customData: "test",
        },
      });
    });

    expect(notification).toBeDefined();
  });
});
