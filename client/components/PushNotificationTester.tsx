import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function PushNotificationTester() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)

  const checkSubscriptions = async () => {
    try {
      const response = await fetch('/api/push-notifications?action=subscriptions')
      const data = await response.json()
      setSubscriptionCount(data.subscriptions)
    } catch (error) {
      console.error('Error checking subscriptions:', error)
    }
  }

  const sendTestNotification = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/push-notifications', {
        method: 'GET',
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Test notification sent to ${data.totalSubscriptions} subscription(s)!`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Network error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const sendCustomNotification = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // First get all subscriptions
      const subsResponse = await fetch('/api/push-notifications?action=subscriptions')
      const subsData = await subsResponse.json()

      if (!subsData.subscriptions || subsData.subscriptions === 0) {
        setResult('❌ No subscriptions found. Subscribe first using the Notification Button.')
        setIsLoading(false)
        return
      }

      // Send to all subscriptions
      const response = await fetch('/api/push-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions: subsData.list.map((sub: any) => ({
            endpoint: sub.endpoint,
            keys: {
              p256dh: localStorage.getItem('push-subscription')
                ? JSON.parse(localStorage.getItem('push-subscription')!).keys.p256dh
                : '',
              auth: localStorage.getItem('push-subscription')
                ? JSON.parse(localStorage.getItem('push-subscription')!).keys.auth
                : '',
            },
          })),
          message: {
            title: 'Custom Test Notification',
            body: 'This is a custom push notification using Web Push API!',
            icon: '/logo.jpg',
            badge: '/logo.jpg',
            url: '/about',
            data: {
              custom: true,
              timestamp: new Date().toISOString(),
            },
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(
          `✅ Custom notification sent! ${data.totalSent} successful, ${data.totalFailed} failed.`,
        )
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Network error: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
      <h3 className="text-lg font-semibold">Web Push API Tester</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Test push notifications using native Web Push API with VAPID keys.
      </p>

      <div className="flex gap-2">
        <Button onClick={checkSubscriptions} variant="outline" size="sm">
          Check Subscriptions
        </Button>

        <Button onClick={sendTestNotification} disabled={isLoading} variant="outline" size="sm">
          {isLoading ? 'Sending...' : 'Send Test Notification'}
        </Button>

        <Button onClick={sendCustomNotification} disabled={isLoading} variant="outline" size="sm">
          {isLoading ? 'Sending...' : 'Send Custom Notification'}
        </Button>
      </div>

      {subscriptionCount !== null && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
          📊 Current subscriptions: {subscriptionCount}
        </div>
      )}

      {result && (
        <div className="p-3 bg-white dark:bg-slate-700 rounded border text-sm">{result}</div>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400">
        <p>
          <strong>Note:</strong> Notifications will only appear if:
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>You've granted notification permission</li>
          <li>The app is running in the background or another tab</li>
          <li>You've subscribed using the Notification Button</li>
          <li>Web Push API is properly configured with VAPID keys</li>
        </ul>
      </div>
    </div>
  )
}
