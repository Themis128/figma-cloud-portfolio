/**
 * Tests for API client functions
 * Imports ACTUAL functions from client/lib/api.ts
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDemo, ping, pushNotificationsApi, submitContactForm } from "../client/lib/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("submitContactForm", () => {
    it("submits contact form data", async () => {
      const mockResponse = { success: true, message: "Email sent" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const formData = {
        name: "John",
        email: "john@test.com",
        subject: "Test Subject",
        message: "Hi",
        recaptchaToken: "test-token",
      };
      const result = await submitContactForm(formData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: JSON.stringify(formData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("throws on failed request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(
        submitContactForm({
          name: "Test",
          email: "test@test.com",
          subject: "Test",
          message: "Test",
          recaptchaToken: "test",
        }),
      ).rejects.toThrow("API request failed: 500 Internal Server Error");
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(
        submitContactForm({
          name: "Test",
          email: "test@test.com",
          subject: "Test",
          message: "Test",
          recaptchaToken: "test",
        }),
      ).rejects.toThrow("Network error");
    });
  });

  describe("ping", () => {
    it("returns ping response", async () => {
      const mockResponse = { message: "pong", timestamp: "2025-01-23T12:00:00Z" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await ping();
      expect(result).toEqual(mockResponse);
    });

    it("throws on failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503, statusText: "Unavailable" });
      await expect(ping()).rejects.toThrow("API request failed");
    });
  });

  describe("getDemo", () => {
    it("returns demo response", async () => {
      const mockResponse = { message: "Demo working" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getDemo();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("pushNotificationsApi", () => {
    it("getVapidPublicKey fetches key", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ publicKey: "test-key" }),
      });

      const result = await pushNotificationsApi.getVapidPublicKey();
      expect(result.publicKey).toBe("test-key");
    });

    it("getSubscriptionCount fetches count", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ subscriptions: 5, list: [] }),
      });

      const result = await pushNotificationsApi.getSubscriptionCount();
      expect(result.subscriptions).toBe(5);
    });

    it("sendTestNotification sends notification", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, results: [], totalSubscriptions: 1 }),
      });

      const result = await pushNotificationsApi.sendTestNotification();
      expect(result.success).toBe(true);
    });

    it("sendCustomNotification sends with message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, results: [], totalSent: 1, totalFailed: 0 }),
      });

      const result = await pushNotificationsApi.sendCustomNotification({
        title: "Test",
        body: "Test body",
      });
      expect(result.success).toBe(true);
    });

    it("storeSubscription stores data", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      await pushNotificationsApi.storeSubscription({
        endpoint: "https://test.com",
        keys: { p256dh: "key1", auth: "key2" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("removeSubscription removes endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

      await pushNotificationsApi.removeSubscription("https://test.com");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent("https://test.com")),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
