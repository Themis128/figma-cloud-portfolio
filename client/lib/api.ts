/**
 * API client for handling requests to AWS Lambda functions in Amplify
 * This replaces the direct /api/* routes with Lambda function URLs
 */

import type {
  AgentExecutionRequest,
  AgentExecutionResponse,
  AnalyticsEvent,
  ClaudeRequest,
  ClaudeResponse,
  ContactFormRequest,
  ResumeData,
} from '@shared/api'

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || '/api'

/**
 * Lambda function URLs - these will be set as environment variables in Amplify
 */
const LAMBDA_URLS = {
  contact: import.meta.env['VITE_LAMBDA_CONTACT_URL'] || `${API_BASE_URL}/contact`,
  resume: import.meta.env['VITE_LAMBDA_RESUME_URL'] || `${API_BASE_URL}/resume`,
  'push-notifications':
    import.meta.env['VITE_LAMBDA_PUSH_NOTIFICATIONS_URL'] || `${API_BASE_URL}/push-notifications`,
  analytics: import.meta.env['VITE_LAMBDA_ANALYTICS_URL'] || `${API_BASE_URL}/analytics`,
  ping: import.meta.env['VITE_LAMBDA_PING_URL'] || `${API_BASE_URL}/ping`,
  demo: import.meta.env['VITE_LAMBDA_DEMO_URL'] || `${API_BASE_URL}/demo`,
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
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
      // Try to get error message from response
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.text()
        if (errorData) {
          errorMessage += ` - ${errorData}`
        }
      } catch {
        // Ignore if we can't read the response body
      }
      throw new Error(errorMessage)
    }

    return response
  } catch (error) {
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Network error: Unable to connect to API server. Please ensure the backend server is running.',
      )
    }

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
  const response = await apiRequest('resume/download', {
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
    const response = await apiRequest('push-notifications?action=vapid-public-key')
    return response.json()
  },

  /**
   * Get subscription count
   */
  async getSubscriptionCount(): Promise<{
    subscriptions: number
    list: Array<{ endpoint: string }>
  }> {
    const response = await apiRequest('push-notifications?action=subscriptions')
    return response.json()
  },

  /**
   * Send test notification to all subscriptions
   */
  async sendTestNotification(): Promise<{
    success: boolean
    message: string
    results: Array<{
      endpoint: string
      success: boolean
      statusCode?: number
      error?: string
    }>
    totalSubscriptions: number
  }> {
    const response = await apiRequest('push-notifications')
    return response.json()
  },

  /**
   * Send custom notification
   */
  async sendCustomNotification(message: {
    title: string
    body: string
    icon?: string
    badge?: string
    image?: string
    url?: string
    data?: Record<string, unknown>
  }): Promise<{
    success: boolean
    results: Array<{
      endpoint: string
      success: boolean
      statusCode?: number
      error?: string
    }>
    totalSent: number
    totalFailed: number
  }> {
    const response = await apiRequest('push-notifications', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
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
    await apiRequest(`push-notifications?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'DELETE',
    })
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

/**
 * Analytics event tracking
 */
export async function sendAnalyticsEvent(event: AnalyticsEvent): Promise<{ success: boolean }> {
  const response = await apiRequest('analytics', {
    method: 'POST',
    body: JSON.stringify(event),
  })
  return response.json()
}

/**
 * Claude AI API integration
 */
export const claudeApi = {
  /**
   * Execute Claude API call
   */
  async executeClaude(request: ClaudeRequest): Promise<ClaudeResponse> {
    const response = await apiRequest('ai/claude', {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return response.json()
  },

  /**
   * Execute AI Agent workflow
   */
  async executeAgent(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    const response = await apiRequest('ai/agent', {
      method: 'POST',
      body: JSON.stringify(request),
    })
    return response.json()
  },
}
