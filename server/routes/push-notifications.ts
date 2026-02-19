import type { Request, Response } from 'express'

import webpush from 'web-push'

// HTTP status codes
const HTTP_STATUS = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const

// VAPID keys for Web Push API - loaded from environment variables or generated at startup
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@example.com'

const generated = webpush.generateVAPIDKeys()
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || generated.publicKey,
  privateKey: process.env.VAPID_PRIVATE_KEY || generated.privateKey,
}

webpush.setVapidDetails(vapidEmail, vapidKeys.publicKey, vapidKeys.privateKey)

if (!process.env.VAPID_PUBLIC_KEY) {
  console.warn(
    'VAPID_PUBLIC_KEY not set — generated ephemeral VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in production.',
  )
}

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

// In-memory storage for subscriptions (in production, use a database)
let subscriptions: PushSubscriptionData[] = []

export async function handlePushNotificationsGet(req: Request, res: Response) {
  const action = req.query.action as string

  if (action === 'vapid-public-key') {
    res.json({
      publicKey: vapidKeys.publicKey,
    })
    return
  }

  if (action === 'subscriptions') {
    res.json({
      subscriptions: subscriptions.length,
      list: subscriptions.map((sub) => ({ endpoint: sub.endpoint })),
    })
    return
  }

  // Test endpoint - send to all stored subscriptions
  try {
    if (subscriptions.length === 0) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'No subscriptions found. Subscribe first using the client.',
      })
      return
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

    res.json({
      success: true,
      message: 'Test notifications sent',
      results,
      totalSubscriptions: subscriptions.length,
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to send test notification',
      details: (error as Error).message,
    })
  }
}

export async function handlePushNotificationsPost(req: Request, res: Response) {
  try {
    const { subscriptions: subs, message } = req.body

    // Validate message
    if (!message) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Missing required field: message',
      })
      return
    }

    let subscriptionsToUse: PushSubscriptionData[] = []

    // If subscriptions provided, validate format
    if (subs !== undefined) {
      if (!Array.isArray(subs)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid subscriptions format. Must be an array.',
        })
        return
      }
      subscriptionsToUse = subs
    } else {
      // No subscriptions provided, use all stored subscriptions
      if (subscriptions.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'No subscriptions found. Subscribe first using the client.',
        })
        return
      }
      subscriptionsToUse = subscriptions
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
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: (error as Error).message,
        })
      }
    }

    res.json({
      success: true,
      results,
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to send push notification',
      details: (error as Error).message,
    })
  }
}

export function handlePushNotificationsPut(req: Request, res: Response) {
  try {
    const subscription: PushSubscriptionData = req.body

    if (!(subscription.endpoint && subscription.keys)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Invalid subscription data',
      })
      return
    }

    // Remove existing subscription with same endpoint
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== subscription.endpoint)

    // Add new subscription
    subscriptions.push(subscription)

    res.json({
      success: true,
      message: 'Subscription stored',
      totalSubscriptions: subscriptions.length,
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to store subscription',
      details: (error as Error).message,
    })
  }
}

export function handlePushNotificationsDelete(req: Request, res: Response) {
  try {
    const endpoint = req.query.endpoint as string

    if (!endpoint) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Missing endpoint parameter',
      })
      return
    }

    const initialCount = subscriptions.length
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint)

    const removed = initialCount - subscriptions.length

    res.json({
      success: true,
      message: `Removed ${removed} subscription(s)`,
      totalSubscriptions: subscriptions.length,
    })
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to remove subscription',
      details: (error as Error).message,
    })
  }
}
