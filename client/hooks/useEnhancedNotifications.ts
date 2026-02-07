// Enhanced Push Notification System with React 19 integration
import { useCallback, useEffect, useState } from 'react'
import type {
  NotificationData,
  NotificationPermissionState,
  PushNotificationOptions,
  PushSubscriptionJSON,
} from '../types/notifications'

// =============================================================================
// NOTIFICATION PERMISSION MANAGEMENT
// =============================================================================

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    'Notification' in window ? Notification.permission : 'unsupported',
  )

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!('Notification' in window)) {
      return 'unsupported'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      // Track permission request result
      if ('gtag' in window) {
        // @ts-expect-error
        gtag('event', 'notification_permission_request', {
          event_category: 'engagement',
          event_label: result,
          custom_parameter_1: navigator.userAgent,
        })
      }

      return result
    } catch (_error) {
      setPermission('denied')
      return 'denied'
    }
  }, [])

  useEffect(() => {
    if ('Notification' in window) {
      // Listen for permission changes
      const handlePermissionChange = () => {
        setPermission(Notification.permission)
      }

      // Some browsers support this event
      if ('permissions' in navigator) {
        navigator.permissions
          .query({ name: 'notifications' })
          .then((result) => {
            result.addEventListener('change', handlePermissionChange)
            return () => result.removeEventListener('change', handlePermissionChange)
          })
          .catch(() => {})
      }
    }
  }, [])

  return {
    permission,
    requestPermission,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
  }
}

// =============================================================================
// PUSH SUBSCRIPTION MANAGEMENT
// =============================================================================

export function usePushSubscription(vapidPublicKey?: string) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get existing subscription
  useEffect(() => {
    const getExistingSubscription = async () => {
      if (!('serviceWorker' in navigator && 'PushManager' in window)) return

      try {
        const registration = await navigator.serviceWorker.ready
        const existingSubscription = await registration.pushManager.getSubscription()

        if (existingSubscription) {
          setSubscription(existingSubscription)

          // Verify subscription is still valid
          const response = await fetch('/api/push-notifications/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: existingSubscription.toJSON(),
            }),
          })

          if (!response.ok) {
            // Subscription is invalid, unsubscribe
            await existingSubscription.unsubscribe()
            setSubscription(null)
          }
        }
      } catch (_error) {
        setError('Failed to check existing subscription')
      }
    }

    getExistingSubscription()
  }, [])

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!vapidPublicKey) {
      setError('VAPID public key is required')
      return null
    }

    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      setError('Push notifications not supported')
      return null
    }

    setIsLoading(true)
    setError(null)

    const handleSuccess = (subscription: PushSubscription) => {
      setSubscription(subscription)
      setIsLoading(false)
      if ('gtag' in window) {
        // @ts-expect-error
        gtag('event', 'push_subscription', {
          event_category: 'engagement',
          event_label: 'success',
        })
      }
      return subscription
    }

    const handleError = (error: unknown) => {
      setError(error instanceof Error ? error.message : 'Subscription failed')
      setIsLoading(false)
      if ('gtag' in window) {
        // @ts-expect-error
        gtag('event', 'push_subscription', {
          event_category: 'engagement',
          event_label: 'failed',
          custom_parameter_1: error instanceof Error ? error.message : 'unknown',
        })
      }
      return null
    }

    const sendSubscriptionToServer = async (subscription: PushSubscription) => {
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to save subscription on server')
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        return handleSuccess(existingSubscription)
      }
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })
      await sendSubscriptionToServer(newSubscription)
      return handleSuccess(newSubscription)
    } catch (error) {
      return handleError(error)
    }
  }, [vapidPublicKey])

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false

    setIsLoading(true)
    setError(null)

    try {
      // Unsubscribe from push service
      await subscription.unsubscribe()

      // Remove subscription from server
      await fetch('/api/push-notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      }).catch(() => {}) // Don't fail if server removal fails

      setSubscription(null)
      setIsLoading(false)

      // Track unsubscription
      if ('gtag' in window) {
        // @ts-expect-error
        gtag('event', 'push_unsubscription', {
          event_category: 'engagement',
        })
      }

      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unsubscription failed')
      setIsLoading(false)
      return false
    }
  }, [subscription])

  return {
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    subscriptionJSON: subscription?.toJSON() || null,
  }
}

// =============================================================================
// Vibration pattern constants
const VIBRATE_SHORT = 125
const VIBRATE_PAUSE = 75
const VIBRATE_MEDIUM = 275
const VIBRATE_LONG = 200
const VIBRATE_EXTRA_LONG = 600
const LOCAL_NOTIFICATION_VIBRATE_PATTERN = [
  VIBRATE_SHORT, VIBRATE_PAUSE, VIBRATE_SHORT, VIBRATE_MEDIUM,
  VIBRATE_LONG, VIBRATE_MEDIUM, VIBRATE_SHORT, VIBRATE_PAUSE,
  VIBRATE_SHORT, VIBRATE_MEDIUM, VIBRATE_LONG, VIBRATE_EXTRA_LONG
]

// Resume notification vibration pattern constant
const RESUME_READY_VIBRATE_PATTERN = [VIBRATE_LONG, VIBRATE_PAUSE, VIBRATE_LONG]

export function useLocalNotifications() {
  const { isGranted } = useNotificationPermission()

  const createNotification = useCallback(
    (title: string, options: PushNotificationOptions = {}): Notification => {
      return new Notification(title, {
        badge: '/logo.jpg',
        icon: '/logo.jpg',
        dir: 'ltr',
        lang: 'en-US',
        renotify: false,
        requireInteraction: false,
        silent: false,
        tag: 'portfolio-local',
        timestamp: Date.now(),
        vibrate: LOCAL_NOTIFICATION_VIBRATE_PATTERN,
        ...options,
        data: {
          source: 'local',
          timestamp: Date.now(),
          ...options.data,
        },
      })
    },
    []
  )

  // Helper for navigation logic
  const handleNotificationNavigation = useCallback((url?: string) => {
    if ('clients' in window && 'openWindow' in (window as Window & { clients: { openWindow: (url: string) => void } })) {
      (window as Window & { clients: { openWindow: (url: string) => void } }).clients.openWindow(url || '/')
    } else {
      window.focus()
      if (url && url !== window.location.pathname) {
        window.location.href = url
      }
    }
  }, [])

  const showNotification = useCallback(
    (title: string, options: PushNotificationOptions = {}): Promise<Notification | null> => {
      return new Promise((resolve, reject) => {
        if (!isGranted) {
          reject(new Error('Notification permission not granted'))
          return
        }

        let notification: Notification
        try {
          notification = createNotification(title, options)
        } catch (error) {
          reject(error)
          return
        }

        notification.onclick = (event) => {
          event.preventDefault()
          handleNotificationNavigation(options.data?.url)
          notification.close()
          if ('gtag' in window) {
            // @ts-expect-error
            gtag('event', 'notification_click', {
              event_category: 'engagement',
              event_label: 'local',
              custom_parameter_1: options.data?.url,
            })
          }
        }

        notification.onerror = (error) => {
          reject(error)
        }

        notification.onshow = () => {
          resolve(notification)
          if ('gtag' in window) {
            // @ts-expect-error
            gtag('event', 'notification_show', {
              event_category: 'engagement',
              event_label: 'local',
            })
          }
        }

        notification.onclose = () => {
          // Track close if relevant
        }

        if (options.autoClose) {
          setTimeout(() => {
            notification.close()
          }, options.autoClose)
        }
      })
    },
    [isGranted, handleNotificationNavigation, createNotification],
  )

  return {
    showNotification,
    canShowNotifications: isGranted,
  }
}

// =============================================================================
// NOTIFICATION TEMPLATES
// =============================================================================

export const NotificationTemplates = {
  welcome: (): PushNotificationOptions => ({
    body: 'Welcome to Themistoklis Baltzakis Portfolio! Explore my projects and AI agents.',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'welcome',
    requireInteraction: true,
    actions: [
      { action: 'explore', title: 'Explore Projects', icon: '/logo.jpg' },
      { action: 'dismiss', title: 'Dismiss', icon: '/logo.jpg' },
    ],
    data: { url: '/projects' },
  }),

  projectUpdate: (projectName: string): PushNotificationOptions => ({
    body: `New updates available for ${projectName}`,
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'project-update',
    actions: [
      { action: 'view', title: 'View Project', icon: '/logo.jpg' },
      { action: 'dismiss', title: 'Later', icon: '/logo.jpg' },
    ],
    data: { url: '/projects', projectName },
  }),

  contactResponse: (): PushNotificationOptions => ({
    body: 'Thank you for your message! I will get back to you soon.',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'contact-response',
    requireInteraction: false,
    autoClose: 5000,
    data: { url: '/' },
  }),

  agentUpdate: (): PushNotificationOptions => ({
    body: 'New AI agent templates are now available!',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'agent-update',
    requireInteraction: true,
    actions: [
      { action: 'explore', title: 'Explore Agents', icon: '/logo.jpg' },
      { action: 'dismiss', title: 'Dismiss', icon: '/logo.jpg' },
    ],
    data: { url: '/agents' },
  }),

  resumeReady: (): PushNotificationOptions => ({
    body: 'Your resume download is ready!',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    tag: 'resume-ready',
    requireInteraction: false,
    autoClose: 8000,
    vibrate: RESUME_READY_VIBRATE_PATTERN,
    data: { url: '/resume' },
  }),
}

// =============================================================================
// ENHANCED NOTIFICATION MANAGER
// =============================================================================

export class NotificationManager {
  private static instance: NotificationManager | null = null
  private subscription: PushSubscription | null = null
  // Removed unused vapidPublicKey member

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        this.subscription = await registration.pushManager.getSubscription()

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener(
          'message',
          this.handleServiceWorkerMessage.bind(this),
        )
      } catch (_error) {}
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event

    if (data?.type === 'NOTIFICATION_CLICKED') {
      this.handleNotificationClick(data.notificationData)
    } else if (data?.type === 'NOTIFICATION_CLOSED') {
      this.handleNotificationClose(data.notificationData)
    }
  }

  private handleNotificationClick(data: NotificationData): void {
    // Track notification interaction
    if ('gtag' in window) {
      // @ts-expect-error
      gtag('event', 'notification_interaction', {
        event_category: 'engagement',
        event_label: data.tag,
        custom_parameter_1: data.action,
      })
    }

    // Handle navigation
    if (data.url && data.url !== window.location.pathname) {
      window.location.href = data.url
    }
  }

  private handleNotificationClose(data: NotificationData): void {
    // Track notification dismissal
    if ('gtag' in window) {
      // @ts-expect-error
      gtag('event', 'notification_dismiss', {
        event_category: 'engagement',
        event_label: data.tag,
      })
    }
  }

  async sendTestNotification(): Promise<boolean> {
    if (!this.subscription) {
      return false
    }

    try {
      const response = await fetch('/api/push-notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: this.subscription.toJSON(),
          notification: {
            title: 'Test Notification',
            ...NotificationTemplates.welcome(),
          },
        }),
      })

      return response.ok
    } catch (_error) {
      return false
    }
  }

  getSubscriptionInfo(): PushSubscriptionJSON | null {
    return this.subscription?.toJSON() as PushSubscriptionJSON | null
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const BASE64_PAD_LENGTH = 4
  const padding = '='.repeat((BASE64_PAD_LENGTH - (base64String.length % BASE64_PAD_LENGTH)) % BASE64_PAD_LENGTH)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance()

// =============================================================================
// MAIN HOOK FOR COMPLETE NOTIFICATION SYSTEM
// =============================================================================

export function useEnhancedNotifications(vapidPublicKey?: string) {
  const permission = useNotificationPermission()
  const pushSubscription = usePushSubscription(vapidPublicKey)
  const localNotifications = useLocalNotifications()

  // Initialize notification manager
  useEffect(() => {
    if (vapidPublicKey) {
      notificationManager.initialize()
    }
  }, [vapidPublicKey])

  return {
    // Permission management
    ...permission,

    // Push subscription management
    subscription: pushSubscription.subscription,
    isSubscribed: pushSubscription.isSubscribed,
    subscribe: pushSubscription.subscribe,
    unsubscribe: pushSubscription.unsubscribe,
    subscriptionLoading: pushSubscription.isLoading,
    subscriptionError: pushSubscription.error,

    // Local notifications
    showLocalNotification: localNotifications.showNotification,

    // Notification templates
    templates: NotificationTemplates,

    // Manager instance
    manager: notificationManager,
  }
}

export default useEnhancedNotifications
