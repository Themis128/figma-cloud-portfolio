import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

// Check if Express backend is reachable before running API tests
let backendAvailable = false;
test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get(`${API_BASE_URL}/api/ping`, { timeout: 5000 });
    backendAvailable = res.ok();
  } catch {
    backendAvailable = false;
  }
});

test.describe("Push Notifications API", () => {
  test.beforeEach(() => {
    test.skip(!backendAvailable, "Express backend not reachable — skipping API tests");
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

    test("should return subscriptions list with count", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty("subscriptions");
      expect(data).toHaveProperty("list");
      expect(Array.isArray(data.list)).toBe(true);
      expect(typeof data.subscriptions).toBe("number");
      // Each list item should have endpoint and createdAt
      if (data.list.length > 0) {
        expect(data.list[0]).toHaveProperty("endpoint");
        expect(data.list[0]).toHaveProperty("createdAt");
        expect(typeof data.list[0].createdAt).toBe("string");
      }
    });

    test("should validate VAPID key format", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=vapid-public-key`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();

      // VAPID public key should be a valid base64url string
      expect(data.publicKey).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(data.publicKey.length).toBeGreaterThan(80);
    });
  });

  test.describe("POST /api/push-notifications", () => {
    test("should return error for missing message title and body", async ({
      request,
    }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        { data: { message: {} } },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("message.title and message.body are required");
    });

    test("should accept valid notification payload", async ({ request }) => {
      const response = await request.post(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            message: {
              title: "Test Notification",
              body: "This is a test message",
              icon: "/logo.jpg",
            },
          },
        },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("totalSubscriptions");
      expect(Array.isArray(data.results)).toBe(true);
    });
  });

  test.describe("PUT /api/push-notifications", () => {
    test("should store push subscription", async ({ request }) => {
      const subscription = {
        endpoint: `https://fcm.googleapis.com/fcm/send/test-${Date.now()}`,
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
      };

      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        { data: subscription },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("subscriptions");
      expect(typeof data.subscriptions).toBe("number");

      // Clean up
      await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(subscription.endpoint)}`,
      );
    });

    test("should return error for missing endpoint", async ({ request }) => {
      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        { data: { endpoint: "", keys: {} } },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
    });

    test("should return error for missing keys", async ({ request }) => {
      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: {
            endpoint: "https://fcm.googleapis.com/fcm/send/test",
            keys: {},
          },
        },
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("keys.p256dh");
    });

    test("should upsert subscription with same endpoint", async ({
      request,
    }) => {
      const endpoint = `https://fcm.googleapis.com/fcm/send/upsert-test-${Date.now()}`;

      // Store first subscription
      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: { endpoint, keys: { p256dh: "key-v1", auth: "auth-v1" } },
      });

      // Store second with same endpoint
      const response = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        { data: { endpoint, keys: { p256dh: "key-v2", auth: "auth-v2" } } },
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify only 1 subscription for this endpoint
      const listRes = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );
      const listData = await listRes.json();
      const matches = listData.list.filter(
        (s: { endpoint: string }) => s.endpoint === endpoint,
      );
      expect(matches.length).toBe(1);

      // Clean up
      await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      );
    });
  });

  test.describe("DELETE /api/push-notifications", () => {
    test("should remove push subscription", async ({ request }) => {
      const endpoint = `https://fcm.googleapis.com/fcm/send/delete-test-${Date.now()}`;

      // Add subscription first
      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: { endpoint, keys: { p256dh: "test-key", auth: "test-auth" } },
      });

      // Delete it
      const response = await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("subscriptions");

      // Verify it's gone
      const listRes = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );
      const listData = await listRes.json();
      const found = listData.list.find(
        (s: { endpoint: string }) => s.endpoint === endpoint,
      );
      expect(found).toBeUndefined();
    });

    test("should return error for missing endpoint parameter", async ({
      request,
    }) => {
      const response = await request.delete(
        `${API_BASE_URL}/api/push-notifications`,
      );

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("endpoint");
    });

    test("should handle non-existent endpoint gracefully", async ({
      request,
    }) => {
      const response = await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent("https://nonexistent.example.com")}`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe("Dev Poll Fallback", () => {
    test("should return empty array when no notifications queued", async ({ request }) => {
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications/poll?since=${Date.now()}`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    test("should return queued notifications after failed push send", async ({ request }) => {
      // First add a fake subscription that will fail delivery
      const endpoint = `https://wns-fake.notify.windows.com/test-${Date.now()}`;
      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: { endpoint, keys: { p256dh: "fake-key", auth: "fake-auth" } },
      });

      // Record timestamp AFTER setup to avoid picking up stale notifications
      const before = Date.now();

      // Send notification (will fail push, should queue for poll)
      const sendRes = await request.post(`${API_BASE_URL}/api/push-notifications`, {
        data: { message: { title: "Poll Test", body: "Testing poll fallback" } },
      });
      expect(sendRes.ok()).toBe(true);
      const sendData = await sendRes.json();
      expect(sendData).toHaveProperty("devPollFallback");

      // Poll for notifications since before the send
      const pollRes = await request.get(
        `${API_BASE_URL}/api/push-notifications/poll?since=${before - 1}`,
      );
      expect(pollRes.ok()).toBe(true);
      const pollData = await pollRes.json();

      if (sendData.devPollFallback) {
        expect(pollData.length).toBeGreaterThan(0);
        // Find our specific notification (queue may contain others from parallel tests)
        const ours = pollData.find((n: { title?: string }) => n.title === "Poll Test");
        expect(ours).toBeTruthy();
        expect(ours.body).toBe("Testing poll fallback");
        expect(ours.ts).toBeGreaterThanOrEqual(before - 1);
      }

      // Clean up
      await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      );
    });

    test("should filter notifications by since parameter", async ({ request }) => {
      const futureTs = Date.now() + 60000;
      const response = await request.get(
        `${API_BASE_URL}/api/push-notifications/poll?since=${futureTs}`,
      );

      expect(response.ok()).toBe(true);
      const data = await response.json();
      expect(data.length).toBe(0);
    });
  });

  test.describe("S3 Persistence", () => {
    test("should persist subscription and retrieve it", async ({ request }) => {
      const endpoint = `https://fcm.googleapis.com/fcm/send/persist-test-${Date.now()}`;

      // Store
      const putRes = await request.put(
        `${API_BASE_URL}/api/push-notifications`,
        {
          data: { endpoint, keys: { p256dh: "persist-key", auth: "persist-auth" } },
        },
      );
      expect(putRes.ok()).toBe(true);

      // Retrieve
      const getRes = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );
      expect(getRes.ok()).toBe(true);
      const data = await getRes.json();

      expect(data.subscriptions).toBeGreaterThanOrEqual(1);
      const found = data.list.find(
        (s: { endpoint: string }) => s.endpoint === endpoint,
      );
      expect(found).toBeTruthy();
      expect(found.createdAt).toBeDefined();

      // Clean up
      await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      );
    });

    test("should include ISO timestamp on new subscriptions", async ({
      request,
    }) => {
      const endpoint = `https://fcm.googleapis.com/fcm/send/ts-test-${Date.now()}`;
      const before = new Date().toISOString();

      await request.put(`${API_BASE_URL}/api/push-notifications`, {
        data: { endpoint, keys: { p256dh: "ts-key", auth: "ts-auth" } },
      });

      const res = await request.get(
        `${API_BASE_URL}/api/push-notifications?action=subscriptions`,
      );
      const data = await res.json();
      const sub = data.list.find(
        (s: { endpoint: string }) => s.endpoint === endpoint,
      );

      expect(sub).toBeTruthy();
      expect(new Date(sub.createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime() - 1000,
      );

      // Clean up
      await request.delete(
        `${API_BASE_URL}/api/push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      );
    });
  });
});
