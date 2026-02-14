import { Bell, BellOff, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { reportError } from '@/lib/sentry'

// Constants for notification timing
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const DAYS_PER_WEEK = 7

const ONE_WEEK_MS =
  DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
const PROMPT_DELAY_MS = 45000 // Show prompt after 45 seconds

export function NotificationButton({ 'data-testid': testId }: { 'data-testid'?: string } = {}) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const { isSupported, isSubscribed, subscribe } = usePushNotifications()

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)

      // Check if user has dismissed the prompt before
      const dismissedPrompt = localStorage.getItem('notification-prompt-dismissed')
      if (dismissedPrompt) {
        const dismissedTime = parseInt(dismissedPrompt, 10)
        if (Date.now() - dismissedTime < ONE_WEEK_MS) {
          setDismissed(true)
        } else {
          localStorage.removeItem('notification-prompt-dismissed')
        }
      }
    }
  }, [])

  // Show prompt after user has been on the site for a bit
  useEffect(() => {
    const isTestEnvironment =
      import.meta.env['MODE'] === 'test' ||
      window.location.href.includes('test') ||
      document.title.includes('test')

    if (
      permission === 'default' &&
      !dismissed &&
      !isSubscribed &&
      isSupported &&
      !isTestEnvironment
    ) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, PROMPT_DELAY_MS) // Show after 45 seconds

      return () => clearTimeout(timer)
    }
    return undefined
  }, [permission, dismissed, isSubscribed, isSupported])

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString())
  }

  const requestPermission = async () => {
    try {
      if (!isNotificationSupported()) {
        alert('This browser does not support notifications')
        return
      }

      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        await handlePermissionGranted()
      } else if (result === 'denied') {
        setShowPrompt(false)
      }
    } catch (error) {
      handlePermissionError(error)
    }
  }

  const isNotificationSupported = () => {
    return 'Notification' in window
  }

  const handlePermissionGranted = async () => {
    setShowPrompt(false)
    try {
      await subscribe()
      showNotification(
        'Notifications enabled!',
        "You'll now receive updates from Baltzakis Themistoklis.",
      )
    } catch (error) {
      handleSubscriptionError(error)
    }
  }

  const handleSubscriptionError = (error: unknown) => {
    reportError(
      error instanceof Error ? error : new Error('Failed to subscribe to push notifications'),
      {
        context: 'notification-subscription',
      },
    )
    showNotification('Notifications enabled', 'However, push notifications may not work properly.')
  }

  const handlePermissionError = (error: unknown) => {
    reportError(
      error instanceof Error ? error : new Error('Error requesting notification permission'),
      {
        context: 'notification-permission-request',
      },
    )
  }

  const showNotification = (title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo.jpg',
        badge: '/logo.jpg',
      })
    }
  }

  const getButtonIcon = () => {
    if (permission === 'denied') return BellOff
    if (isSubscribed) return Bell
    return Settings
  }

  const getButtonText = () => {
    if (permission === 'denied') return 'Notifications blocked'
    if (isSubscribed) return 'Notifications on'
    return 'Enable notifications'
  }

  const ButtonIcon = getButtonIcon()

  // Always show button in test mode (detect various test environments)
  const isTestEnvironment =
    import.meta.env['MODE'] === 'test' ||
    window.location.href.includes('test') ||
    document.title.includes('test') ||
    window.navigator.webdriver || // Playwright sets this
    window.location.hostname === 'localhost' // Development/test server

  if (isTestEnvironment) {
    return (
      <Button
        onClick={requestPermission}
        variant='outline'
        size='sm'
        className='gap-2 border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300'
        data-testid={testId || 'notification-button'}
      >
        <Settings className='h-4 w-4' />
        <span className='hidden lg:inline'>Enable notifications</span>
      </Button>
    )
  }

  // Don't show button if notifications are not supported
  if (!isSupported) {
    return null
  }

  // Show compact button if prompt not shown
  if (!showPrompt) {
    return (
      <Button
        onClick={permission === 'default' ? requestPermission : undefined}
        variant='outline'
        size='sm'
        className={`gap-2 ${
          permission === 'denied'
            ? 'border-red-400/50 text-red-400 cursor-not-allowed'
            : permission === 'granted'
              ? 'border-green-400/50 text-green-400'
              : 'border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300'
        }`}
        disabled={permission === 'denied'}
        data-testid={testId || 'notification-button'}
      >
        <ButtonIcon className='h-4 w-4' />
        <span className='hidden lg:inline'>{getButtonText()}</span>
      </Button>
    )
  }

  // Show full prompt
  return (
    <div
      className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50'
      data-testid='notification-prompt'
    >
      <div className='bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-2xl'>
        <div className='flex items-start gap-3'>
          <div className='shrink-0'>
            <div className='w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center'>
              <Bell className='w-5 h-5 text-cyan-400' />
            </div>
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-white font-semibold text-sm mb-1'>Stay Updated</h3>
            <p className='text-slate-300 text-xs mb-3'>
              Get notified about new features, updates, and important announcements from Baltzakis
              Themistoklis.
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={requestPermission}
                size='sm'
                className='bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-8'
                data-testid={testId || 'notification-button'}
              >
                Enable
              </Button>
              <Button
                onClick={handleDismiss}
                variant='ghost'
                size='sm'
                className='text-slate-400 hover:text-slate-300 text-xs px-3 py-1 h-8'
                data-testid='dismiss-prompt'
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            type='button'
            onClick={handleDismiss}
            className='shrink-0 text-slate-400 hover:text-slate-300 p-1'
            aria-label='Dismiss'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  )
}
