/**
 * API client for handling requests to AWS Lambda functions in Amplify
 * This replaces the direct /api/* routes with Lambda function URLs
 */

import { fetchAuthSession } from "aws-amplify/auth";
import type {
  ContactFormRequest,
  ResumeData,
  APIKey,
  BookingSlotsResponse,
  BookingCreateRequest,
  BookingCreateResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Lambda function URLs - these will be set as environment variables in Amplify.
 * In development, the Next.js rewrite rule proxies /api/* to Express on port 3001.
 * In production, Amplify CloudFront rewrites proxy /api/* to Lambda.
 */
const LAMBDA_URLS = {
  contact:
    process.env.NEXT_PUBLIC_LAMBDA_CONTACT_URL || `${API_BASE_URL}/contact`,
  resume:
    process.env.NEXT_PUBLIC_LAMBDA_RESUME_URL || `${API_BASE_URL}/resume`,
  "push-notifications":
    process.env.NEXT_PUBLIC_LAMBDA_PUSH_NOTIFICATIONS_URL ||
    `${API_BASE_URL}/push-notifications`,
  ping: process.env.NEXT_PUBLIC_LAMBDA_PING_URL || `${API_BASE_URL}/ping`,
  demo: process.env.NEXT_PUBLIC_LAMBDA_DEMO_URL || `${API_BASE_URL}/demo`,
  chat: process.env.NEXT_PUBLIC_LAMBDA_CHAT_URL || `${API_BASE_URL}/chat`,
  "booking-slots": process.env.NEXT_PUBLIC_LAMBDA_BOOKING_URL
    ? `${process.env.NEXT_PUBLIC_LAMBDA_BOOKING_URL}/slots`
    : `${API_BASE_URL}/booking/slots`,
  "booking-create": process.env.NEXT_PUBLIC_LAMBDA_BOOKING_URL
    ? `${process.env.NEXT_PUBLIC_LAMBDA_BOOKING_URL}/create`
    : `${API_BASE_URL}/booking/create`,
  health:
    process.env.NEXT_PUBLIC_LAMBDA_HEALTH_URL || `${API_BASE_URL}/health`,
  agents:
    process.env.NEXT_PUBLIC_LAMBDA_AGENTS_URL || `${API_BASE_URL}/agents`,
  "api-keys":
    process.env.NEXT_PUBLIC_LAMBDA_API_KEYS_URL ||
    `${API_BASE_URL}/organizations/api_keys`,
};

type EndpointKey = keyof typeof LAMBDA_URLS;

/**
 * Resolve a LAMBDA_URLS key to its fully-qualified URL.
 */
export function resolveApiUrl(endpoint: EndpointKey): string {
  return LAMBDA_URLS[endpoint];
}

/**
 * Get Authorization header with Cognito access token for the current user.
 * Returns empty object if no user is signed in.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

/**
 * Generic fetch wrapper with error handling.
 * Throws on non-2xx responses.
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = LAMBDA_URLS[endpoint as EndpointKey] || endpoint;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response;
}

/**
 * Low-level streaming fetch — returns the raw Response so callers
 * can read response.body as a ReadableStream (e.g. for SSE).
 * Does NOT check response.ok; the caller handles errors.
 */
export async function apiStreamRequest(
  endpoint: EndpointKey,
  options: RequestInit = {},
): Promise<Response> {
  const url = LAMBDA_URLS[endpoint];
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

/**
 * Contact form submission
 */
export async function submitContactForm(
  data: ContactFormRequest,
): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest("contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.json();
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

/**
 * Resume PDF generation
 */
export async function generateResumePDF(
  resumeData: ResumeData,
): Promise<Blob> {
  const response = await apiRequest("resume", {
    method: "POST",
    body: JSON.stringify(resumeData),
  });
  return response.blob();
}

// ---------------------------------------------------------------------------
// Push Notifications
// ---------------------------------------------------------------------------

export const pushNotificationsApi = {
  /**
   * Get VAPID public key
   */
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    const url = `${LAMBDA_URLS["push-notifications"]}?action=vapid-public-key`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.json();
  },

  /**
   * Get subscription count
   */
  async getSubscriptionCount(): Promise<{
    subscriptions: number;
    list: Array<{ endpoint: string; createdAt?: string }>;
  }> {
    const url = `${LAMBDA_URLS["push-notifications"]}?action=subscriptions`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.json();
  },

  /**
   * Send test notification to all subscriptions
   */
  async sendTestNotification(): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      endpoint: string;
      success: boolean;
      statusCode?: number;
      error?: string;
    }>;
    totalSubscriptions: number;
  }> {
    const response = await apiRequest("push-notifications");
    return response.json();
  },

  /**
   * Send custom notification
   */
  async sendCustomNotification(message: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    url?: string;
    data?: Record<string, unknown>;
  }): Promise<{
    success: boolean;
    results: Array<{
      endpoint: string;
      success: boolean;
      statusCode?: number;
      error?: string;
    }>;
    totalSent: number;
    totalFailed: number;
  }> {
    const response = await apiRequest("push-notifications", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return response.json();
  },

  /**
   * Store push subscription
   */
  async storeSubscription(subscriptionData: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<void> {
    const url = LAMBDA_URLS["push-notifications"];
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionData),
    });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
  },

  /**
   * Remove push subscription
   */
  async removeSubscription(endpoint: string): Promise<void> {
    const url = `${LAMBDA_URLS["push-notifications"]}?endpoint=${encodeURIComponent(endpoint)}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }
  },
};

// ---------------------------------------------------------------------------
// Health & Status
// ---------------------------------------------------------------------------

/**
 * Ping endpoint for health checks
 */
export async function ping(): Promise<{ message: string; timestamp: string }> {
  const response = await apiRequest("ping");
  return response.json();
}

/**
 * Demo endpoint
 */
export async function getDemo(): Promise<{ message: string }> {
  const response = await apiRequest("demo");
  return response.json();
}

/**
 * Health endpoint — detailed health status
 */
export async function getHealth(): Promise<{
  status: string;
  uptime: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  environment: string;
}> {
  const response = await apiRequest("health");
  return response.json();
}

// ---------------------------------------------------------------------------
// Chat (SSE streaming)
// ---------------------------------------------------------------------------

/**
 * Send a chat message — returns the raw Response for SSE streaming.
 * The response body is a text/event-stream with data events.
 */
export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
): Promise<Response> {
  return apiStreamRequest("chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ---------------------------------------------------------------------------
// Booking (Cal.com)
// ---------------------------------------------------------------------------

/**
 * Fetch available booking slots for the next 7 days
 */
export async function getBookingSlots(): Promise<BookingSlotsResponse> {
  const response = await apiRequest("booking-slots");
  return response.json();
}

/**
 * Create a new booking.
 * Returns the parsed response including potential error fields.
 * Does NOT throw on non-2xx so callers can inspect structured errors.
 */
export async function createBooking(
  data: BookingCreateRequest,
): Promise<BookingCreateResponse> {
  const url = LAMBDA_URLS["booking-create"];
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = (await response.json()) as BookingCreateResponse;
  if (!response.ok) {
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  return body;
}

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------

/**
 * List all API keys (requires auth)
 */
export async function listAPIKeys(): Promise<APIKey[]> {
  const headers = await getAuthHeaders();
  const response = await apiRequest("api-keys", { headers });
  return response.json();
}

/**
 * Get an API key by ID (requires auth)
 */
export async function getAPIKey(apiKeyId: string): Promise<APIKey> {
  const headers = await getAuthHeaders();
  const response = await apiRequest(
    `${LAMBDA_URLS["api-keys"]}/${apiKeyId}`,
    { headers },
  );
  return response.json();
}

/**
 * Create a new API key (requires auth)
 */
export async function createAPIKey(
  data: { name: string; workspace_id?: string | null },
): Promise<APIKey> {
  const headers = await getAuthHeaders();
  const response = await apiRequest(LAMBDA_URLS["api-keys"], {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Update an API key (requires auth)
 */
export async function updateAPIKey(
  apiKeyId: string,
  data: { name?: string; status?: "active" | "inactive" | "archived" },
): Promise<APIKey> {
  const headers = await getAuthHeaders();
  const response = await apiRequest(
    `${LAMBDA_URLS["api-keys"]}/${apiKeyId}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

/**
 * Delete an API key (requires auth)
 */
export async function deleteAPIKey(
  apiKeyId: string,
): Promise<{ id: string; deleted: boolean }> {
  const headers = await getAuthHeaders();
  const response = await apiRequest(
    `${LAMBDA_URLS["api-keys"]}/${apiKeyId}`,
    {
      method: "DELETE",
      headers,
    },
  );
  return response.json();
}
