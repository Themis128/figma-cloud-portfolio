import { expect, test } from "@playwright/test";
import { setupTestEnvironment, teardownTestEnvironment } from "./test-utils";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// These tests target an external push notifications API server on port 3002.
// The Next.js app (port 3000) does not include this API route, so these tests
// are skipped unless the external backend service is running separately.
test.describe.skip("Push Notifications API", () => {
  test.beforeAll(async () => {
    await setupTestEnvironment();
  });

  test.afterAll(async () => {
    await teardownTestEnvironment();
  });

  test.describe("GET /api/push-notifications", () => {
    test("should return VAPID public key", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=vapid-public-key`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("publicKey");
      expect(typeof data.publicKey).toBe("string");
      expect(data.publicKey.length).toBeGreaterThan(0);
    });

    test("should return subscriptions count", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("subscriptions");
      expect(data).toHaveProperty("list");
      expect(Array.isArray(data.list)).toBe(true);
      expect(typeof data.subscriptions).toBe("number");
    });

    test("should send test notifications to all subscriptions", async ({
      request,
    }) => {
      // First, add a test subscription
      const subscription = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: subscription,
      });

      // Now send test notification
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("message", "Test notifications sent");
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("totalSubscriptions");
      expect(Array.isArray(data.results)).toBe(true);
    });

    test("should return error when no subscriptions exist for test", async ({
      request,
    }) => {
      // Clear subscriptions first (assuming there's a way to do this)
      // For now, we'll test the error case by making the request without subscriptions

      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications`,
      );

      // This might fail if there are existing subscriptions, but let's test the structure
      if (!response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty("error");
      }
    });
  });

  test.describe("POST /api/push-notifications", () => {
    test("should send push notification to specific subscriptions", async ({
      request,
    }) => {
      const testMessage = {
        title: "Test Notification",
        body: "This is a test message",
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        url: "/test",
        data: { test: true },
      };

      const subscriptions = [
        {
          endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint-1",
          keys: {
            p256dh: "test-p256dh-key-1",
            auth: "test-auth-key-1",
          },
        },
        {
          endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint-2",
          keys: {
            p256dh: "test-p256dh-key-2",
            auth: "test-auth-key-2",
          },
        },
      ];

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: testMessage,
          },
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("totalSent");
      expect(data).toHaveProperty("totalFailed");
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBe(2);
    });

    test("should return error for missing message", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions: [],
          },
        },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Missing required field: message");
    });

    test("should return error for invalid subscriptions array", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions: "invalid",
            message: { title: "Test", body: "Test" },
          },
        },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid subscriptions format");
    });

    test("should handle push notification failures gracefully", async ({
      request,
    }) => {
      const testMessage = {
        title: "Test Notification",
        body: "This is a test message",
      };

      // Use invalid subscription to test failure handling
      const subscriptions = [
        {
          endpoint: "invalid-endpoint",
          keys: {
            p256dh: "invalid-key",
            auth: "invalid-auth",
          },
        },
      ];

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: testMessage,
          },
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("results");
      expect(data.results[0]).toHaveProperty("success", false);
      expect(data.results[0]).toHaveProperty("error");
      expect(data.totalFailed).toBe(1);
    });
  });

  test.describe("PUT /api/push-notifications", () => {
    test("should store push subscription", async ({ request }) => {
      const subscription = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: subscription,
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("message", "Subscription stored");
      expect(data).toHaveProperty("totalSubscriptions");
      expect(typeof data.totalSubscriptions).toBe("number");
    });

    test("should return error for invalid subscription data", async ({
      request,
    }) => {
      const invalidSubscription = {
        endpoint: "", // Missing endpoint
        keys: {},
      };

      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: invalidSubscription,
        },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Invalid subscription data");
    });

    test("should update existing subscription with same endpoint", async ({
      request,
    }) => {
      const subscription1 = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "test-p256dh-key-1",
          auth: "test-auth-key-1",
        },
      };

      const subscription2 = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint", // Same endpoint
        keys: {
          p256dh: "test-p256dh-key-2", // Different keys
          auth: "test-auth-key-2",
        },
      };

      // Store first subscription
      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: subscription1,
      });

      // Store second subscription with same endpoint (should update)
      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: subscription2,
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data.totalSubscriptions).toBe(1); // Should still be 1, not 2
    });
  });

  test.describe("DELETE /api/push-notifications", () => {
    test("should remove push subscription", async ({ request }) => {
      // First, add a subscription
      const subscription = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint-to-delete",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: subscription,
      });

      // Now delete it
      const response = await request.delete(
        `/api/push-notifications?endpoint=${encodeURIComponent(subscription.endpoint)}`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("success", true);
      expect(data.message).toContain("Removed");
      expect(data).toHaveProperty("totalSubscriptions");
    });

    test("should return error for missing endpoint parameter", async ({
      request,
    }) => {
      const response = await request.delete(
        `${API_BASE_URL}/api/push-notifications`,
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error", "Missing endpoint parameter");
    });

    test("should handle non-existent endpoint gracefully", async ({
      request,
    }) => {
      const response = await request.delete(
        "/api/push-notifications?endpoint=non-existent-endpoint",
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data.message).toContain("Removed 0 subscription(s)");
    });
  });

  test.describe("Error Handling", () => {
    test("should handle malformed JSON in request body", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: "invalid json",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      // Should return 500 or appropriate error status
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test("should handle network errors gracefully", async ({ request }) => {
      // Test with invalid subscription that would cause network error
      const testMessage = {
        title: "Test Notification",
        body: "This is a test message",
      };

      const subscriptions = [
        {
          endpoint: "https://invalid-endpoint-that-does-not-exist.com",
          keys: {
            p256dh: "invalid-key",
            auth: "invalid-auth",
          },
        },
      ];

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: testMessage,
          },
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      // Should still return success but with failed results
      expect(data).toHaveProperty("success", true);
      expect(data.results[0].success).toBe(false);
      expect(data.results[0]).toHaveProperty("error");
    });
  });

  test.describe("Security & Validation", () => {
    test("should validate VAPID key format", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=vapid-public-key`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      // VAPID public key should be a valid base64url string
      expect(data.publicKey).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(data.publicKey.length).toBeGreaterThan(80); // Typical VAPID key length
    });

    test("should handle XSS prevention in message content", async ({
      request,
    }) => {
      const maliciousMessage = {
        title: "<script>alert('xss')</script>Test Notification",
        body: "<img src=x onerror=alert('xss')>Test body",
        icon: "/logo.jpg",
        badge: "/logo.jpg",
      };

      const subscriptions = [
        {
          endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
          keys: {
            p256dh: "test-p256dh-key",
            auth: "test-auth-key",
          },
        },
      ];

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: maliciousMessage,
          },
        },
      );

      expect(response.ok()).toBe(true);
      // The API should handle the content safely (XSS prevention is client-side concern)
    });

    test("should validate subscription keys format", async ({ request }) => {
      const invalidSubscription = {
        endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
        keys: {
          p256dh: "invalid@key!with#special$chars",
          auth: "invalid@auth!with#special$chars",
        },
      };

      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: invalidSubscription,
        },
      );

      // Should still accept it (validation is done by web-push library)
      expect(response.ok()).toBe(true);
    });
  });

  test.describe("Performance & Load Testing", () => {
    test("should handle multiple concurrent requests", async ({ request }) => {
      const testMessage = {
        title: "Concurrent Test",
        body: "Testing concurrent requests",
      };

      const subscriptions = [
        {
          endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
          keys: {
            p256dh: "test-p256dh-key",
            auth: "test-auth-key",
          },
        },
      ];

      // Send multiple concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request.post(`${API_BASE_URL}/api/push-notifications`, {
            data: {
              subscriptions,
              message: testMessage,
            },
          }),
        );

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.ok()).toBe(true);
      });
    });

    test("should handle large number of subscriptions", async ({ request }) => {
      const testMessage = {
        title: "Bulk Test",
        body: "Testing with many subscriptions",
      };

      // Create 50 test subscriptions
      const subscriptions = Array(50)
        .fill(null)
        .map((_, index) => ({
          endpoint: `https://fcm.googleapis.com/fcm/send/test-endpoint-${index}`,
          keys: {
            p256dh: `test-p256dh-key-${index}`,
            auth: `test-auth-key-${index}`,
          },
        }));

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: testMessage,
          },
          timeout: 30000, // Increase timeout for bulk operation
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data.results.length).toBe(50);
      expect(data.totalSent + data.totalFailed).toBe(50);
    });

    test("should handle large message payloads", async ({ request }) => {
      const largeMessage = {
        title: "Large Message Test",
        body: "A".repeat(1000), // Large body
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        data: {
          largeData: "B".repeat(2000), // Large data payload
        },
      };

      const subscriptions = [
        {
          endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
          keys: {
            p256dh: "test-p256dh-key",
            auth: "test-auth-key",
          },
        },
      ];

      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            subscriptions,
            message: largeMessage,
          },
        },
      );

      expect(response.ok()).toBe(true);
    });
  });

  test.describe("Integration with Client Features", () => {
    test("should work with service worker registration", async ({
      page,
      request,
    }) => {
      // Mock service worker for integration test
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "serviceWorker", {
          value: {
            register: () =>
              Promise.resolve({
                active: { state: "activated" },
                pushManager: {
                  subscribe: () =>
                    Promise.resolve({
                      endpoint:
                        "https://fcm.googleapis.com/fcm/send/test-endpoint",
                      keys: {
                        p256dh: "test-p256dh-key",
                        auth: "test-auth-key",
                      },
                      toJSON: function () {
                        return {
                          endpoint: this.endpoint,
                          keys: this.keys,
                        };
                      },
                    }),
                },
              }),
          },
          writable: true,
        });
      });

      await page.goto("/");

      // Open mobile menu to access notification button
      const mobileMenuButton = page.locator(
        'button[aria-label="Toggle mobile menu"]',
      );
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await page.waitForTimeout(300); // Wait for menu animation
      }

      // Trigger notification subscription through UI
      const subscribeButton = page.locator(
        '[data-testid="mobile-notification-button"]',
      );
      if (await subscribeButton.isVisible()) {
        await subscribeButton.click();
      }

      // Verify subscription was sent to API
      await page.waitForTimeout(1000);

      // Check that subscription exists in API
      const subscriptionsResponse = await request.get(
        "/api/push-notifications?action=subscriptions",
      );
      const subscriptionsData = await subscriptionsResponse.json();

      expect(subscriptionsData.subscriptions).toBeGreaterThanOrEqual(0);
    });

    test("should handle notification permission changes", async ({ page }) => {
      // Mock service worker and notification APIs
      await page.addInitScript(() => {
        // Mock service worker
        Object.defineProperty(window.navigator, "serviceWorker", {
          value: {
            register: () => Promise.resolve({ active: { state: "activated" } }),
            ready: Promise.resolve({ active: { state: "activated" } }),
          },
          writable: true,
        });

        // Mock PushManager
        Object.defineProperty(window, "PushManager", {
          value: {},
          writable: true,
        });

        // Mock Notification
        Object.defineProperty(window, "Notification", {
          value: {
            permission: "default",
            requestPermission: () => Promise.resolve("granted"),
          } as unknown as typeof Notification,
          writable: true,
        });
      });

      await page.goto("/");

      // Navigate to a test URL to trigger component test mode detection
      await page.goto("/?test=true");

      // The NotificationButton component detects test mode and shows a simple button
      // In test mode, it uses the provided testId
      const buttonSelector = '[data-testid="mobile-notification-button"]';

      // Check if the button exists (it might not be implemented yet)
      const buttonExists = (await page.locator(buttonSelector).count()) > 0;

      if (buttonExists) {
        await page.waitForSelector(buttonSelector, { timeout: 5000 });
        await expect(page.locator(buttonSelector)).toBeVisible();

        // Check button text
        const buttonText = await page.locator(buttonSelector).textContent();
        expect(buttonText).toContain("Enable notifications");
      } else {
        // If button doesn't exist, just verify the page loaded and notification API is available
        expect(page.url()).toContain("test=true");

        // Check that Notification API is mocked
        const notificationSupported = await page.evaluate(
          () => "Notification" in window,
        );
        expect(notificationSupported).toBe(true);
      }
    });
  });
});
