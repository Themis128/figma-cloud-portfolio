import { useEffect, useState } from 'react'

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null)

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      checkSubscription()
      fetchVapidPublicKey()
    }
  }, [checkSubscription, fetchVapidPublicKey])

  const fetchVapidPublicKey = async () => {
    try {
      const response = await fetch('/api/push-notifications?action=vapid-public-key')
      const data = await response.json()
      setVapidPublicKey(data.publicKey)
    } catch (error) {
      console.error('Error fetching VAPID public key:', error)
    }
  }

  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return

      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      setSubscription(existingSubscription)
      setIsSubscribed(!!existingSubscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    }
  }

  const subscribe = async () => {
    try {
      if (!isSupported) {
        throw new Error('Push notifications are not supported')
      }

      if (!vapidPublicKey) {
        throw new Error('VAPID public key not available')
      }

      // Request notification permission first
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      const registration = await navigator.serviceWorker.ready

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      setSubscription(newSubscription)
      setIsSubscribed(true)

      // Send subscription data to server
      await sendSubscriptionToServer(newSubscription)

      return { subscription: newSubscription }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      throw error
    }
  }

  const unsubscribe = async () => {
    try {
      if (!subscription) return

      const result = await subscription.unsubscribe()
      setSubscription(null)
      setIsSubscribed(false)

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription)

      return result
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      throw error
    }
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      // Get subscription keys
      const p256dhKey = subscription.getKey('p256dh')
      const authKey = subscription.getKey('auth')

      if (!p256dhKey || !authKey) {
        throw new Error('Failed to get subscription keys')
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
          auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
        },
      }

      // Store locally for demo purposes
      localStorage.setItem('push-subscription', JSON.stringify(subscriptionData))

      // Send to server
      const response = await fetch('/api/push-notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      })

      if (!response.ok) {
        throw new Error('Failed to store subscription on server')
      }

      console.log('Subscription sent to server:', subscriptionData)
    } catch (error) {
      console.error('Error sending subscription to server:', error)
      throw error
    }
  }

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      // Remove from local storage
      localStorage.removeItem('push-subscription')

      // Remove from server
      const response = await fetch(
        `/api/push-notifications?endpoint=${encodeURIComponent(subscription.endpoint)}`,
        { method: 'DELETE' },
      )

      if (!response.ok) {
        console.warn('Failed to remove subscription from server')
      }

      console.log('Subscription removed from server')
    } catch (error) {
      console.error('Error removing subscription from server:', error)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    vapidPublicKey,
    subscribe,
    unsubscribe,
    checkSubscription,
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
