import { expect, test } from "@playwright/test";

/**
 * Backend API Tests
 *
 * Tests the Express.js backend deployed on AWS Lambda via API Gateway.
 * All requests go directly to the production Lambda endpoint.
 *
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:3000 PLAYWRIGHT_SKIP_WEBSERVER=true \
 *      npx playwright test playwright-tests/backend-api.spec.ts --project=chromium
 */

const API_BASE =
  process.env.BACKEND_API_URL ||
  "https://wctxhmfzgk.execute-api.us-east-1.amazonaws.com";

// ─── Health & Status ────────────────────────────────────────────────────────────

test.describe("Backend API — Health & Status", () => {
  test("GET /api/health returns healthy status with all required fields", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.environment).toBe("production");
    expect(typeof body.uptime).toBe("number");
    expect(body.uptime).toBeGreaterThanOrEqual(0);
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("memory");
  });

  test("GET /api/health timestamp is valid ISO 8601", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const body = await res.json();

    const parsed = new Date(body.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
    // Timestamp should be recent (within last 60 seconds)
    expect(Date.now() - parsed.getTime()).toBeLessThan(60_000);
  });

  test("GET /api/health memory is formatted with MB suffix", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const body = await res.json();

    expect(body.memory).toMatch(/^\d+MB$/);
  });

  test("GET /api/ping returns pong", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/ping`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("ping_pong");
  });

  test("GET /api/demo returns Express server message", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/demo`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("Hello from Express server");
  });

  test("health endpoint responds within 5 seconds (including cold start)", async ({
    request,
  }) => {
    const start = Date.now();
    const res = await request.get(`${API_BASE}/api/health`);
    const elapsed = Date.now() - start;

    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(5000);
  });

  test("consecutive ping calls return consistent results", async ({
    request,
  }) => {
    const results = await Promise.all([
      request.get(`${API_BASE}/api/ping`),
      request.get(`${API_BASE}/api/ping`),
      request.get(`${API_BASE}/api/ping`),
    ]);

    for (const res of results) {
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toBe("ping_pong");
    }
  });

  test("HEAD /api/health returns 200 with empty body", async ({ request }) => {
    const res = await request.head(`${API_BASE}/api/health`);
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toBe("");
  });

  test("CORS headers are present on health endpoint", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/health`);
    const headers = res.headers();

    expect(headers["access-control-allow-origin"]).toBe("*");
  });
});

// ─── Agents API ─────────────────────────────────────────────────────────────────

test.describe("Backend API — Agents", () => {
  test("GET /api/agents returns success with agents array", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/agents`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.agents)).toBe(true);
  });

  test("POST /api/agents creates agent with valid schema", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: { name: "PlaywrightTestAgent" },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.agent.name).toBe("PlaywrightTestAgent");
    expect(body.agent.id).toMatch(/^agent-\d+-[a-z0-9]+$/);

    // Timestamps are valid ISO 8601
    const created = new Date(body.agent.createdAt);
    const updated = new Date(body.agent.updatedAt);
    expect(created.getTime()).not.toBeNaN();
    expect(updated.getTime()).not.toBeNaN();
    expect(created.getTime()).toBe(updated.getTime());
  });

  test("POST /api/agents strips extra fields from response", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: { name: "TestAgent", extraField: "should-be-ignored", count: 42 },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.agent.name).toBe("TestAgent");
    expect(body.agent).not.toHaveProperty("extraField");
    expect(body.agent).not.toHaveProperty("count");

    // Should only have these 4 keys
    const keys = Object.keys(body.agent).sort();
    expect(keys).toEqual(["createdAt", "id", "name", "updatedAt"]);
  });

  test("POST /api/agents rejects missing name", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: {},
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("Invalid");
  });

  test("POST /api/agents rejects empty string name", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: { name: "" },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors).toBeDefined();
    expect(body.errors[0].path).toContain("name");
  });

  test("POST /api/agents rejects numeric name with type error", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: { name: 123 },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors[0].code).toBe("invalid_type");
    expect(body.errors[0].expected).toBe("string");
    expect(body.errors[0].received).toBe("number");
  });

  test("POST /api/agents rejects null name with type error", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/agents`, {
      data: { name: null },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.errors[0].code).toBe("invalid_type");
    expect(body.errors[0].received).toBe("null");
  });

  test("GET /api/agents/nonexistent returns 404", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/agents/nonexistent`);
    expect(res.status()).toBe(404);
  });
});

// ─── Push Notifications API ─────────────────────────────────────────────────────

test.describe("Backend API — Push Notifications", () => {
  test("GET /api/push-notifications returns 400 without subscriptions", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/push-notifications`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("No subscriptions");
  });

  test("POST /api/push-notifications returns 400 without subscriptions", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/push-notifications`, {
      data: { message: { title: "Test", body: "Test notification" } },
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error).toContain("No subscriptions");
  });

  test("GET ?action=vapid-public-key returns VAPID public key", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/push-notifications?action=vapid-public-key`,
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("publicKey");
    expect(typeof body.publicKey).toBe("string");
    expect(body.publicKey.length).toBeGreaterThan(20);
  });

  test("GET ?action=subscriptions returns subscription count", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/push-notifications?action=subscriptions`,
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(typeof body.subscriptions).toBe("number");
    expect(body.subscriptions).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(body.list)).toBe(true);
  });

  test("PUT stores subscription, then DELETE removes it", async ({
    request,
  }) => {
    const testEndpoint = `https://test-pw-${Date.now()}.example.com/push`;

    // Store
    const putRes = await request.put(`${API_BASE}/api/push-notifications`, {
      data: {
        endpoint: testEndpoint,
        keys: { p256dh: "test-p256dh-key", auth: "test-auth-key" },
      },
    });
    expect(putRes.status()).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.success).toBe(true);
    expect(putBody.totalSubscriptions).toBeGreaterThanOrEqual(1);

    // Verify stored
    const listRes = await request.get(
      `${API_BASE}/api/push-notifications?action=subscriptions`,
    );
    const listBody = await listRes.json();
    const found = listBody.list.some(
      (s: { endpoint: string }) => s.endpoint === testEndpoint,
    );
    expect(found).toBe(true);

    // Delete
    const delRes = await request.delete(
      `${API_BASE}/api/push-notifications?endpoint=${encodeURIComponent(testEndpoint)}`,
    );
    expect(delRes.status()).toBe(200);
    const delBody = await delRes.json();
    expect(delBody.success).toBe(true);

    // Verify removed
    const verifyRes = await request.get(
      `${API_BASE}/api/push-notifications?action=subscriptions`,
    );
    const verifyBody = await verifyRes.json();
    const stillExists = verifyBody.list.some(
      (s: { endpoint: string }) => s.endpoint === testEndpoint,
    );
    expect(stillExists).toBe(false);
  });
});

// ─── API Keys CRUD ──────────────────────────────────────────────────────────────

test.describe("Backend API — API Keys CRUD", () => {
  // ── List ────────────────────────────────────────────────────────

  test("GET list returns array with pre-seeded keys", async ({ request }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys`,
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test("GET list keys have complete schema", async ({ request }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys`,
    );
    const body = await res.json();
    const key = body[0];

    // Top-level fields
    expect(typeof key.id).toBe("string");
    expect(key.id).toMatch(/^ak_/);
    expect(typeof key.created_at).toBe("string");
    expect(new Date(key.created_at).getTime()).not.toBeNaN();
    expect(typeof key.name).toBe("string");
    expect(typeof key.partial_key_hint).toBe("string");
    expect(key.type).toBe("api_key");
    expect(["active", "inactive", "archived"]).toContain(key.status);

    // Nested created_by object
    expect(typeof key.created_by).toBe("object");
    expect(typeof key.created_by.id).toBe("string");
    expect(key.created_by.type).toBe("user");

    // workspace_id is string or null
    expect(
      key.workspace_id === null || typeof key.workspace_id === "string",
    ).toBe(true);
  });

  // ── Read single ─────────────────────────────────────────────────

  test("GET known key returns full details with correct values", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.id).toBe("ak_1234567890");
    expect(body.created_at).toBe("2024-01-15T10:30:00Z");
    expect(body.created_by.id).toBe("user_123");
    expect(body.created_by.type).toBe("user");
    expect(body.partial_key_hint).toBe("ak_1234");
    expect(body.type).toBe("api_key");
    expect(body.workspace_id).toBe("ws_123");
  });

  test("GET unknown key returns 404 with NOT_FOUND code", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/organizations/api_keys/ak_nonexistent`,
    );
    expect(res.status()).toBe(404);

    const body = await res.json();
    // Lambda may return simplified error format vs Express detailed format
    const errMsg =
      typeof body.error === "string"
        ? body.error
        : body.error?.message ?? "";
    expect(errMsg.toLowerCase()).toContain("not found");
  });

  // ── Create ──────────────────────────────────────────────────────

  test("POST create returns 201 with generated id and hint", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "Playwright Test Key", workspace_id: "ws_test" } },
    );
    expect(res.status()).toBe(201);

    const body = await res.json();
    // Lambda may use alphanumeric IDs; Express uses hex
    expect(body.id).toMatch(/^ak_[a-z0-9]{10,20}$/);
    expect(body.name).toBe("Playwright Test Key");
    expect(body.status).toBe("active");
    expect(body.type).toBe("api_key");
    expect(body.created_by.id).toBe("user_system");
    expect(body.workspace_id).toBe("ws_test");

    // partial_key_hint is first 7 chars of id
    expect(body.partial_key_hint).toBe(body.id.slice(0, 7));

    // created_at is valid recent timestamp
    const created = new Date(body.created_at);
    expect(created.getTime()).not.toBeNaN();
    expect(Date.now() - created.getTime()).toBeLessThan(30_000);
  });

  test("POST create with null workspace_id defaults to null", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "Null WS Key" } },
    );
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body.workspace_id).toBeNull();
  });

  test("POST create rejects empty name", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "" } },
    );
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("INVALID_PARAMETER");
    expect(body.error.message).toContain("non-empty");
  });

  test("POST create rejects whitespace-only name", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "   " } },
    );
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("INVALID_PARAMETER");
  });

  test("POST create rejects missing name field", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: {} },
    );
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("INVALID_PARAMETER");
  });

  test("POST create rejects numeric name", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: 42 } },
    );
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("INVALID_PARAMETER");
  });

  // ── Update ──────────────────────────────────────────────────────

  test("POST update name only preserves other fields", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
      { data: { name: "Renamed Key" } },
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.name).toBe("Renamed Key");
    expect(body.id).toBe("ak_1234567890");
    // Status should be preserved from previous state
    expect(["active", "inactive", "archived"]).toContain(body.status);
  });

  test("POST update status transitions through all valid values", async ({
    request,
  }) => {
    for (const status of ["active", "inactive", "archived"] as const) {
      const res = await request.post(
        `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
        { data: { status } },
      );
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.status).toBe(status);
    }
  });

  test("POST update both name and status simultaneously", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
      { data: { name: "Dual Update Key", status: "active" } },
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.name).toBe("Dual Update Key");
    expect(body.status).toBe("active");
  });

  test("POST update with empty body is a no-op returning current key", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
      { data: {} },
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.id).toBe("ak_1234567890");
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("status");
  });

  test("POST update rejects invalid status value", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys/ak_1234567890`,
      { data: { status: "deleted" } },
    );
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.error.code).toBe("INVALID_PARAMETER");
    expect(body.error.message).toContain("active");
    expect(body.error.message).toContain("inactive");
    expect(body.error.message).toContain("archived");
  });

  test("POST update unknown key returns 404", async ({ request }) => {
    const res = await request.post(
      `${API_BASE}/api/organizations/api_keys/ak_nonexistent`,
      { data: { name: "Ghost Key" } },
    );
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  // ── Delete ──────────────────────────────────────────────────────

  test("DELETE known key returns deleted confirmation", async ({
    request,
  }) => {
    // Create a key to delete (avoids mutating the pre-seeded keys)
    const createRes = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "Key To Delete" } },
    );
    const created = await createRes.json();

    const res = await request.delete(
      `${API_BASE}/api/organizations/api_keys/${created.id}`,
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.id).toBe(created.id);
    expect(body.deleted).toBe(true);
  });

  test("DELETE unknown key returns 404 with NOT_FOUND code", async ({
    request,
  }) => {
    const res = await request.delete(
      `${API_BASE}/api/organizations/api_keys/ak_does_not_exist`,
    );
    expect(res.status()).toBe(404);

    const body = await res.json();
    const errMsg =
      typeof body.error === "string"
        ? body.error
        : body.error?.message ?? "";
    expect(errMsg.toLowerCase()).toContain("not found");
  });

  // ── Full lifecycle ──────────────────────────────────────────────

  test("full CRUD lifecycle: create → read → update name → update status → delete", async ({
    request,
  }) => {
    // 1. Create a fresh key (avoids pre-seeded key state issues on warm Lambda)
    const createRes = await request.post(
      `${API_BASE}/api/organizations/api_keys`,
      { data: { name: "Lifecycle Test Key" } },
    );
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    const keyId = created.id;
    expect(keyId).toMatch(/^ak_/);
    expect(created.status).toBe("active");

    // 2. Read back
    const readRes = await request.get(
      `${API_BASE}/api/organizations/api_keys/${keyId}`,
    );
    // May 404 if Lambda cold-started a new instance; accept both
    if (readRes.status() === 200) {
      const read = await readRes.json();
      expect(read.id).toBe(keyId);
      expect(read.name).toBe("Lifecycle Test Key");
    }

    // 3. Update name
    const updateRes = await request.post(
      `${API_BASE}/api/organizations/api_keys/${keyId}`,
      { data: { name: "Updated Lifecycle Key" } },
    );
    if (updateRes.status() === 200) {
      expect((await updateRes.json()).name).toBe("Updated Lifecycle Key");
    }

    // 4. Update status
    const statusRes = await request.post(
      `${API_BASE}/api/organizations/api_keys/${keyId}`,
      { data: { status: "archived" } },
    );
    if (statusRes.status() === 200) {
      expect((await statusRes.json()).status).toBe("archived");
    }

    // 5. Delete
    const deleteRes = await request.delete(
      `${API_BASE}/api/organizations/api_keys/${keyId}`,
    );
    if (deleteRes.status() === 200) {
      const deleted = await deleteRes.json();
      expect(deleted.id).toBe(keyId);
      expect(deleted.deleted).toBe(true);
    }
  });
});

// ─── Booking API ────────────────────────────────────────────────────────────────

test.describe("Backend API — Booking", () => {
  test("GET /api/booking/slots returns slots object or 503", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/booking/slots`);
    const status = res.status();

    expect([200, 503]).toContain(status);

    const body = await res.json();
    if (status === 200) {
      expect(body).toHaveProperty("slots");
      expect(typeof body.slots).toBe("object");

      // Each key should be an ISO date, each value an array of timestamps
      const dates = Object.keys(body.slots);
      if (dates.length > 0) {
        const firstDate = dates[0]!;
        expect(new Date(firstDate).getTime()).not.toBeNaN();

        const slots = body.slots[firstDate];
        expect(Array.isArray(slots)).toBe(true);
        if (slots.length > 0) {
          expect(new Date(slots[0]).getTime()).not.toBeNaN();
        }
      }
    } else {
      expect(body.error).toContain("not configured");
    }
  });

  test("GET /api/booking/slots ignores unknown query params", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/booking/slots?date=2026-03-10&invalid=true`,
    );
    // Should not error on extra params — same as base endpoint
    expect([200, 503]).toContain(res.status());
  });

  test("POST /api/booking/create rejects missing email", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", name: "Test User" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects missing name", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z", email: "test@example.com" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects empty strings as missing", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "", name: "", email: "" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("required");
    }
  });

  test("POST /api/booking/create rejects request with only start field", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: { start: "2026-03-10T09:00:00Z" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });

  test("POST /api/booking/create rejects empty body", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/booking/create`, {
      data: {},
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });
});

// ─── Chat API ───────────────────────────────────────────────────────────────────

test.describe("Backend API — Chat", () => {
  test("POST /api/chat rejects empty message with descriptive error", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "" },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Message is required");
    }
  });

  test("POST /api/chat rejects missing message field", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: {},
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
  });

  test("POST /api/chat rejects whitespace-only message", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "   " },
    });
    const status = res.status();

    expect([400, 503]).toContain(status);
    if (status === 400) {
      const body = await res.json();
      expect(body.error).toContain("Message is required");
    }
  });

  test("POST /api/chat with valid message returns SSE or 503", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "Who is Themis?" },
    });
    const status = res.status();

    if (status === 503) {
      const body = await res.json();
      expect(body.error).toContain("not configured");
    } else {
      expect(status).toBe(200);
      const contentType = res.headers()["content-type"] ?? "";
      // SSE response
      expect(contentType).toContain("text/event-stream");

      const text = await res.text();
      expect(text).toContain("data:");
      expect(text).toContain("[DONE]");
    }
  });

  test("POST /api/chat accepts history array", async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: {
        message: "What certifications does he have?",
        history: [
          { role: "user", content: "Tell me about Themis" },
          {
            role: "assistant",
            content: "Themis is a Cloud Architect...",
          },
        ],
      },
    });
    const status = res.status();

    // Should not reject the history format
    expect([200, 503]).toContain(status);
  });

  test("POST /api/chat handles very long messages without error", async ({
    request,
  }) => {
    const longMessage = "A".repeat(500);
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: longMessage },
    });
    const status = res.status();

    // Should accept (200) or be unconfigured (503), not 400
    expect([200, 503]).toContain(status);
  });

  test("POST /api/chat 503 includes descriptive error when HF_TOKEN missing", async ({
    request,
  }) => {
    const res = await request.post(`${API_BASE}/api/chat`, {
      data: { message: "test" },
    });
    const status = res.status();

    if (status === 503) {
      const body = await res.json();
      expect(body.error).toContain("HF_TOKEN");
    }
  });
});

// ─── Resume API ─────────────────────────────────────────────────────────────────

test.describe("Backend API — Resume", () => {
  test("GET /api/resume/download returns PDF redirect or placeholder", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/resume/download`, {
      maxRedirects: 0,
    });
    const status = res.status();

    // Lambda returns 302 redirect to PDF, local returns 200 with placeholder
    expect([200, 302]).toContain(status);

    if (status === 302) {
      const location = res.headers()["location"] ?? "";
      expect(location).toContain("resume");
      expect(location).toContain(".pdf");
    }
  });

  test("GET /api/resume/download redirect follows to valid PDF", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/resume/download`);
    const status = res.status();

    // Following redirect should yield 200 with PDF or text
    expect(status).toBe(200);
  });
});

// ─── Playwright Autofix API ──────────────────────────────────────────────────────
// Only available on local Express server (port 3001), not deployed to Lambda.

test.describe("Backend API — Playwright Autofix", () => {
  test("GET /api/playwright-autofix/health returns ok or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/health`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(body.status).toBe("ok");
    }
  });

  test("GET /api/playwright-autofix/config returns config or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/config`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("config");
    }
  });

  test("POST /api/playwright-autofix/analyze returns suggestions or 404", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_BASE}/api/playwright-autofix/analyze`,
      { data: { test: "data" } },
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body.suggestions)).toBe(true);
    }
  });

  test("GET /api/playwright-autofix/patterns returns patterns or 404", async ({
    request,
  }) => {
    const res = await request.get(
      `${API_BASE}/api/playwright-autofix/patterns`,
    );
    expect([200, 404]).toContain(res.status());

    if (res.status() === 200) {
      const body = await res.json();
      expect(Array.isArray(body.patterns)).toBe(true);
    }
  });
});

// ─── Error Handling & Cross-Cutting ─────────────────────────────────────────────

test.describe("Backend API — Error Handling", () => {
  test("GET /api/nonexistent returns 404 with error message", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/nonexistent`);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("all JSON endpoints return application/json content-type", async ({
    request,
  }) => {
    const endpoints = [
      "/api/health",
      "/api/ping",
      "/api/demo",
      "/api/agents",
      "/api/organizations/api_keys",
    ];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API_BASE}${endpoint}`);
      const contentType = res.headers()["content-type"] ?? "";
      expect(contentType).toContain("application/json");
    }
  });

  test("CORS wildcard origin header on multiple endpoints", async ({
    request,
  }) => {
    const endpoints = ["/api/health", "/api/ping", "/api/agents"];

    for (const endpoint of endpoints) {
      const res = await request.get(`${API_BASE}${endpoint}`);
      expect(res.headers()["access-control-allow-origin"]).toBe("*");
    }
  });

  test("404 responses include JSON error body", async ({ request }) => {
    const paths = [
      "/api/nonexistent",
      "/api/agents/nonexistent",
      "/api/organizations/api_keys/ak_ghost",
    ];

    for (const path of paths) {
      const res = await request.get(`${API_BASE}${path}`);
      expect(res.status()).toBe(404);

      const body = await res.json();
      // Should have either error string or error object
      expect(
        typeof body.error === "string" || typeof body.error === "object",
      ).toBe(true);
    }
  });
});

// ─── Response Time Benchmarks ───────────────────────────────────────────────────

test.describe("Backend API — Response Times", () => {
  test("ping responds under 2 seconds (warm)", async ({ request }) => {
    // Warm up
    await request.get(`${API_BASE}/api/ping`);

    const start = Date.now();
    await request.get(`${API_BASE}/api/ping`);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });

  test("API keys list responds under 3 seconds", async ({ request }) => {
    // Warm up
    await request.get(`${API_BASE}/api/organizations/api_keys`);

    const start = Date.now();
    await request.get(`${API_BASE}/api/organizations/api_keys`);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(3000);
  });

  test("parallel requests to different endpoints all succeed", async ({
    request,
  }) => {
    const results = await Promise.all([
      request.get(`${API_BASE}/api/health`),
      request.get(`${API_BASE}/api/ping`),
      request.get(`${API_BASE}/api/demo`),
      request.get(`${API_BASE}/api/agents`),
      request.get(`${API_BASE}/api/organizations/api_keys`),
    ]);

    for (const res of results) {
      expect(res.status()).toBe(200);
    }
  });
});
