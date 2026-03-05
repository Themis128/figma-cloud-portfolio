/**
 * API client for handling requests to AWS Lambda functions in Amplify
 * This replaces the direct /api/* routes with Lambda function URLs
 */

import type { ContactFormRequest, ResumeData, APIKey } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Lambda function URLs - these will be set as environment variables in Amplify
 */
const LAMBDA_URLS = {
  contact:
    process.env.NEXT_PUBLIC_LAMBDA_CONTACT_URL || `${API_BASE_URL}/contact`,
  resume: process.env.NEXT_PUBLIC_LAMBDA_RESUME_URL || `${API_BASE_URL}/resume`,
  "push-notifications":
    process.env.NEXT_PUBLIC_LAMBDA_PUSH_NOTIFICATIONS_URL ||
    `${API_BASE_URL}/push-notifications`,
  ping: process.env.NEXT_PUBLIC_LAMBDA_PING_URL || `${API_BASE_URL}/ping`,
  demo: process.env.NEXT_PUBLIC_LAMBDA_DEMO_URL || `${API_BASE_URL}/demo`,
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = LAMBDA_URLS[endpoint as keyof typeof LAMBDA_URLS] || endpoint;
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

/**
 * Resume PDF generation
 */
export async function generateResumePDF(resumeData: ResumeData): Promise<Blob> {
  const response = await apiRequest("resume", {
    method: "POST",
    body: JSON.stringify(resumeData),
  });
  return response.blob();
}

/**
 * Push notifications API
 */
export const pushNotificationsApi = {
  /**
   * Get VAPID public key
   */
  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    const response = await apiRequest(
      "push-notifications?action=vapid-public-key",
    );
    return response.json();
  },

  /**
   * Get subscription count
   */
  async getSubscriptionCount(): Promise<{
    subscriptions: number;
    list: Array<{ endpoint: string }>;
  }> {
    const response = await apiRequest(
      "push-notifications?action=subscriptions",
    );
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
    await apiRequest("push-notifications", {
      method: "PUT",
      body: JSON.stringify(subscriptionData),
    });
  },

  /**
   * Remove push subscription
   */
  async removeSubscription(endpoint: string): Promise<void> {
    await apiRequest(
      `push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      {
        method: "DELETE",
      },
    );
  },
};

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
 * List all API keys
 */
export async function listAPIKeys(): Promise<APIKey[]> {
  const response = await apiRequest(
    `${API_BASE_URL}/organizations/api_keys`,
  );
  return response.json();
}

/**
 * Get an API key by ID
 */
export async function getAPIKey(apiKeyId: string): Promise<APIKey> {
  const response = await apiRequest(
    `${API_BASE_URL}/organizations/api_keys/${apiKeyId}`,
  );
  return response.json();
}

/**
 * Create a new API key
 */
export async function createAPIKey(
  data: { name: string; workspace_id?: string | null },
): Promise<APIKey> {
  const response = await apiRequest(
    `${API_BASE_URL}/organizations/api_keys`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

/**
 * Update an API key
 */
export async function updateAPIKey(
  apiKeyId: string,
  data: { name?: string; status?: "active" | "inactive" | "archived" },
): Promise<APIKey> {
  const response = await apiRequest(
    `${API_BASE_URL}/organizations/api_keys/${apiKeyId}`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(
  apiKeyId: string,
): Promise<{ id: string; deleted: boolean }> {
  const response = await apiRequest(
    `${API_BASE_URL}/organizations/api_keys/${apiKeyId}`,
    {
      method: "DELETE",
    },
  );
  return response.json();
}
