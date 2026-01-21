import type { Handler } from 'aws-lambda'
import webpush from 'web-push'

// VAPID keys for Web Push API
const vapidKeys = {
  publicKey:
    'BIYhxDOAqmZg6VijBF03tQjjLDBGnZO6plp45i4XQJbgY8EjudgnVYip5_pdbnHCZAmMXo74dstdV01n1DH0Oqk',
  privateKey: 'CQ-R-YQ_453n-_he_1HCxn5b2P68xgahZK8ovVDWQZI',
}

// Set VAPID details
webpush.setVapidDetails(
  'mailto:noreply@cloudles.gr', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey,
)

interface PushMessage {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  data?: Record<string, unknown>
}

interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// In-memory storage for subscriptions (in production, use DynamoDB or similar)
let subscriptions: PushSubscriptionData[] = []

export const handler: Handler = async (event) => {
  const { httpMethod, queryStringParameters, body } = event

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    }
  }

  try {
    const action = queryStringParameters?.action

    // GET /api/push-notifications?action=vapid-public-key
    if (httpMethod === 'GET' && action === 'vapid-public-key') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: vapidKeys.publicKey,
        }),
      }
    }

    // GET /api/push-notifications?action=subscriptions
    if (httpMethod === 'GET' && action === 'subscriptions') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions: subscriptions.length,
          list: subscriptions.map((sub) => ({ endpoint: sub.endpoint })),
        }),
      }
    }

    // GET /api/push-notifications (test endpoint)
    if (httpMethod === 'GET') {
      if (subscriptions.length === 0) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'No subscriptions found. Subscribe first using the client.',
          }),
        }
      }

      const testMessage: PushMessage = {
        title: 'Test Notification',
        body: 'This is a test push notification using Web Push API!',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        url: '/',
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      }

      const payload = JSON.stringify({
        title: testMessage.title,
        body: testMessage.body,
        icon: testMessage.icon,
        badge: testMessage.badge,
        url: testMessage.url,
        data: testMessage.data,
      })

      interface NotificationResult {
        endpoint: string
        success: boolean
        statusCode?: number
        error?: string
      }

      const results: NotificationResult[] = []
      for (const subscription of subscriptions) {
        try {
          const result = await webpush.sendNotification(subscription, payload)
          results.push({
            endpoint: subscription.endpoint,
            success: true,
            statusCode: result.statusCode,
          })
        } catch (error) {
          results.push({
            endpoint: subscription.endpoint,
            success: false,
            error: (error as Error).message,
          })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Test notifications sent',
          results,
          totalSubscriptions: subscriptions.length,
        }),
      }
    }

    // POST /api/push-notifications
    if (httpMethod === 'POST') {
      const { subscriptions: subs, message } = JSON.parse(body || '{}')

      let subscriptionsToUse: PushSubscriptionData[] = []

      // If no subscriptions provided, use all stored subscriptions
      if (!subs || !Array.isArray(subs) || subs.length === 0) {
        if (subscriptions.length === 0) {
          return {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              error:
                'No subscriptions found. Subscribe first using the client.',
            }),
          }
        }
        subscriptionsToUse = subscriptions
      } else {
        subscriptionsToUse = subs
      }

      if (!message) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Missing required field: message',
          }),
        }
      }

      const pushMessage: PushMessage = message
      interface NotificationResult {
        endpoint: string
        success: boolean
        statusCode?: number
        error?: string
      }
      const results: NotificationResult[] = []

      // Send push notification to each subscription
      for (const subscription of subscriptionsToUse) {
        try {
          const payload = JSON.stringify({
            title: pushMessage.title,
            body: pushMessage.body,
            icon: pushMessage.icon || '/logo.jpg',
            badge: pushMessage.badge || '/logo.jpg',
            image: pushMessage.image,
            url: pushMessage.url || '/',
            data: pushMessage.data || {},
          })

          const result = await webpush.sendNotification(subscription, payload)
          results.push({
            endpoint: subscription.endpoint,
            success: true,
            statusCode: result.statusCode,
          })
        } catch (error) {
          console.error(
            'Error sending to subscription:',
            subscription.endpoint,
            error,
          )
          results.push({
            endpoint: subscription.endpoint,
            success: false,
            error: (error as Error).message,
          })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          results,
          totalSent: results.filter((r) => r.success).length,
          totalFailed: results.filter((r) => !r.success).length,
        }),
      }
    }

    // PUT /api/push-notifications
    if (httpMethod === 'PUT') {
      const subscription: PushSubscriptionData = JSON.parse(body || '{}')

      if (!subscription.endpoint || !subscription.keys) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Invalid subscription data',
          }),
        }
      }

      // Remove existing subscription with same endpoint
      subscriptions = subscriptions.filter(
        (sub) => sub.endpoint !== subscription.endpoint,
      )

      // Add new subscription
      subscriptions.push(subscription)

      console.log('Subscription stored:', subscription.endpoint)

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'Subscription stored',
          totalSubscriptions: subscriptions.length,
        }),
      }
    }

    // DELETE /api/push-notifications
    if (httpMethod === 'DELETE') {
      const endpoint = queryStringParameters?.endpoint

      if (!endpoint) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Missing endpoint parameter',
          }),
        }
      }

      const initialCount = subscriptions.length
      subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint)

      const removed = initialCount - subscriptions.length

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: `Removed ${removed} subscription(s)`,
          totalSubscriptions: subscriptions.length,
        }),
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Method not allowed',
      }),
    }
  } catch (error) {
    console.error('Error in push notifications handler:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: (error as Error).message,
      }),
    }
  }
}
