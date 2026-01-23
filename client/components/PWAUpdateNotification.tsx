import { RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setShowUpdate(true)
              }
            })
          }
        })
      })

      // Also check for waiting service worker on load
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.waiting) {
            setRegistration(reg)
            setShowUpdate(true)
            break
          }
        }
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })

      // Listen for the controlling change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to get the new version
        window.location.reload()
      })
    }
    setShowUpdate(false)
  }

  const handleDismiss = () => {
    setShowUpdate(false)
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true')
  }

  // Don't show if dismissed in this session
  if (!showUpdate || sessionStorage.getItem('pwa-update-dismissed')) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">Update Available</h3>
            <p className="text-slate-300 text-xs mb-3">
              A new version is ready. Update now for the latest features and improvements.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-8"
              >
                Update Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-300 text-xs px-3 py-1 h-8"
              >
                Later
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-300 p-1"
            aria-label="Dismiss update notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
