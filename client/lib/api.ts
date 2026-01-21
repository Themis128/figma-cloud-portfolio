/**
 * API client for handling requests to AWS Lambda functions in Amplify
 * This replaces the direct /api/* routes with Lambda function URLs
 */

import type { ContactFormRequest, ResumeData } from '@shared/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Lambda function URLs - these will be set as environment variables in Amplify
 */
const LAMBDA_URLS = {
  contact: import.meta.env.VITE_LAMBDA_CONTACT_URL || `${API_BASE_URL}/contact`,
  resume: import.meta.env.VITE_LAMBDA_RESUME_URL || `${API_BASE_URL}/resume`,
  'push-notifications':
    import.meta.env.VITE_LAMBDA_PUSH_NOTIFICATIONS_URL ||
    `${API_BASE_URL}/push-notifications`,
  ping: import.meta.env.VITE_LAMBDA_PING_URL || `${API_BASE_URL}/ping`,
  demo: import.meta.env.VITE_LAMBDA_DEMO_URL || `${API_BASE_URL}/demo`,
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = LAMBDA_URLS[endpoint as keyof typeof LAMBDA_URLS] || endpoint

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      )
    }

    return response
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)
    throw error
  }
}

/**
 * Contact form submission
 */
export async function submitContactForm(
  data: ContactFormRequest,
): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest('contact', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * Resume PDF generation
 */
export async function generateResumePDF(resumeData: ResumeData): Promise<Blob> {
  const response = await apiRequest('resume', {
    method: 'POST',
    body: JSON.stringify(resumeData),
  })
  return response.blob()
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
      'push-notifications?action=vapid-public-key',
    )
    return response.json()
  },

  /**
   * Store push subscription
   */
  async storeSubscription(subscriptionData: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }): Promise<void> {
    await apiRequest('push-notifications', {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    })
  },

  /**
   * Remove push subscription
   */
  async removeSubscription(endpoint: string): Promise<void> {
    await apiRequest(
      `push-notifications?endpoint=${encodeURIComponent(endpoint)}`,
      {
        method: 'DELETE',
      },
    )
  },
}

/**
 * Ping endpoint for health checks
 */
export async function ping(): Promise<{ message: string; timestamp: string }> {
  const response = await apiRequest('ping')
  return response.json()
}

/**
 * Demo endpoint
 */
export async function getDemo(): Promise<{ message: string }> {
  const response = await apiRequest('demo')
  return response.json()
}
