import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

test.describe("API Keys CRUD", () => {
  test("GET /api/organizations/api_keys - should list API keys", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/organizations/api_keys`,
    );
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/organizations/api_keys/:id - should return API key details", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/organizations/api_keys/ak_1234567890`,
    );
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.id).toBe("ak_1234567890");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("status");
    expect(data).toHaveProperty("type");
    expect(data.type).toBe("api_key");
  });

  test("GET /api/organizations/api_keys/:id - should 404 for unknown key", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_BASE_URL}/api/organizations/api_keys/ak_nonexistent`,
    );
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error.code).toBe("NOT_FOUND");
  });

  test("POST /api/organizations/api_keys - should create a new API key", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_BASE_URL}/api/organizations/api_keys`,
      {
        data: { name: "Test Key", workspace_id: "ws_test" },
      },
    );
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data.id).toMatch(/^ak_/);
    expect(data.name).toBe("Test Key");
    expect(data.status).toBe("active");
    expect(data.workspace_id).toBe("ws_test");
  });

  test("POST /api/organizations/api_keys - should reject empty name", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_BASE_URL}/api/organizations/api_keys`,
      {
        data: { name: "" },
      },
    );
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_PARAMETER");
  });

  test("POST /api/organizations/api_keys/:id - should update API key", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_BASE_URL}/api/organizations/api_keys/ak_1234567890`,
      {
        data: { name: "Updated Key Name", status: "inactive" },
      },
    );
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.name).toBe("Updated Key Name");
    expect(data.status).toBe("inactive");
  });

  test("POST /api/organizations/api_keys/:id - should reject invalid status", async ({
    request,
  }) => {
    const response = await request.post(
      `${API_BASE_URL}/api/organizations/api_keys/ak_1234567890`,
      {
        data: { status: "invalid_status" },
      },
    );
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_PARAMETER");
  });

  test("DELETE /api/organizations/api_keys/:id - should delete API key", async ({
    request,
  }) => {
    // First create a key to delete
    const createResp = await request.post(
      `${API_BASE_URL}/api/organizations/api_keys`,
      {
        data: { name: "Key To Delete" },
      },
    );
    const created = await createResp.json();

    const response = await request.delete(
      `${API_BASE_URL}/api/organizations/api_keys/${created.id}`,
    );
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.id).toBe(created.id);
    expect(data.deleted).toBe(true);
  });

  test("DELETE /api/organizations/api_keys/:id - should 404 for unknown key", async ({
    request,
  }) => {
    const response = await request.delete(
      `${API_BASE_URL}/api/organizations/api_keys/ak_nonexistent`,
    );
    expect(response.status()).toBe(404);
  });
});
