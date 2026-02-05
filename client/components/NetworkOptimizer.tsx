import { useEffect, useMemo, useState } from 'react'
import { FontLoaderComponent } from './FontLoader'
import { ResourceHints } from './ResourceHints'

interface ResourceHint {
  rel: 'preconnect' | 'dns-prefetch' | 'preload' | 'prefetch' | 'prerender'
  href: string
  as?: 'font' | 'script' | 'style' | 'image' | 'fetch' | 'document'
  type?: string
  crossorigin?: boolean | 'anonymous' | 'use-credentials'
  media?: string
}

interface NetworkOptimizerProps {
  children: React.ReactNode
  enableCriticalResourceHints?: boolean
  enableFontOptimization?: boolean
  enableImagePreloading?: boolean
  enableRoutePrefetching?: boolean
}

interface NetworkMetrics {
  connectionType?: string | undefined
  effectiveType?: string | undefined
  downlink?: number | undefined
  rtt?: number | undefined
  saveData?: boolean | undefined
}

// Type definition for navigator.connection
interface NavigatorConnection {
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
}

// Constants for network thresholds
const SLOW_CONNECTION_TYPES = ['slow-2g', '2g']

// Constants for font weights
const FONT_WEIGHT_LIGHT = 300
const FONT_WEIGHT_REGULAR = 400
const FONT_WEIGHT_MEDIUM = 500
const FONT_WEIGHT_SEMIBOLD = 600
const FONT_WEIGHT_BOLD = 700

const INTER_FONT_WEIGHTS = [
  FONT_WEIGHT_LIGHT,
  FONT_WEIGHT_REGULAR,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_SEMIBOLD,
  FONT_WEIGHT_BOLD,
]
const FIRA_CODE_FONT_WEIGHTS = [FONT_WEIGHT_REGULAR, FONT_WEIGHT_MEDIUM]

// Network optimization configuration interface
interface NetworkOptimizationConfig {
  slowConnectionThreshold: number
  slowConnectionTypes: string[]
  interFontWeights: number[]
  firaCodeFontWeights: number[]
}

// Default configuration
const DEFAULT_CONFIG: NetworkOptimizationConfig = {
  slowConnectionThreshold: 1.5,
  slowConnectionTypes: SLOW_CONNECTION_TYPES,
  interFontWeights: INTER_FONT_WEIGHTS,
  firaCodeFontWeights: FIRA_CODE_FONT_WEIGHTS,
}

// Service worker registration utility
const registerServiceWorker = (isSlowConnection: boolean): void => {
  // Skip manual registration if VitePWA is handling it (development mode)
  if (process.env['NODE_ENV'] === 'development') {
    return
  }

  if ('serviceWorker' in navigator) {
    const registerSW = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js')
      } catch (error) {
        console.warn('ServiceWorker registration failed:', error)
      }
    }

    if (isSlowConnection) {
      // Delay SW registration on slow connections
      const DELAY_MS = 5000
      setTimeout(registerSW, DELAY_MS)
    } else {
      // Register immediately on fast connections
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerSW)
      } else {
        registerSW()
      }
    }
  }
}

export function NetworkOptimizer({
  children,
  enableCriticalResourceHints = true,
  enableFontOptimization = true,
  enableImagePreloading = true,
  enableRoutePrefetching = true,
  config = DEFAULT_CONFIG,
}: NetworkOptimizerProps & { config?: Partial<NetworkOptimizationConfig> }) {
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({})
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Memoized network configuration
  const networkConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  useEffect(() => {
    // Detect network conditions
    const detectNetworkConditions = () => {
      if ('connection' in navigator) {
        const connection = (navigator as { connection?: NavigatorConnection }).connection

        if (!connection) {
          setNetworkMetrics({})
          setIsSlowConnection(false)
          return
        }

        const metrics: NetworkMetrics = {
          connectionType: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }

        setNetworkMetrics(metrics)

        // Determine if connection is slow
        const isSlow =
          networkConfig.slowConnectionTypes.includes(connection.effectiveType || '') ||
          (connection.downlink ?? Infinity) < networkConfig.slowConnectionThreshold ||
          connection.saveData === true

        setIsSlowConnection(isSlow)

        // Adjust loading strategies based on connection
        if (isSlow) {
          // On slow connections, reduce preloading
          document.documentElement.classList.add('slow-connection')
        } else {
          document.documentElement.classList.remove('slow-connection')
        }
      }
    }

    detectNetworkConditions()

    // Listen for connection changes
    if ('connection' in navigator) {
      const connection = (navigator as { connection?: NavigatorConnection }).connection
      if (connection?.addEventListener) {
        connection.addEventListener('change', detectNetworkConditions)

        return () => {
          connection?.removeEventListener?.('change', detectNetworkConditions)
        }
      }
    }
    return undefined
  }, [networkConfig])

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Service worker registration
  useEffect(() => {
    registerServiceWorker(isSlowConnection)
  }, [isSlowConnection])

  // Memoized critical resource hints based on network conditions
  const getCriticalHints = useMemo((): ResourceHint[] => {
    const baseHints: ResourceHint[] = [
      // Essential third-party connections
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://www.google-analytics.com', crossorigin: true },
    ]

    // Add more hints for fast connections
    if (!isSlowConnection) {
      baseHints.push(
        {
          rel: 'preconnect',
          href: 'https://region1.google-analytics.com',
          crossorigin: true,
        },
        { rel: 'preconnect', href: 'https://www.googletagmanager.com', crossorigin: true },
        { rel: 'dns-prefetch', href: '//www.recaptcha.net' },
      )
    }

    return baseHints
  }, [isSlowConnection])

  // Memoized critical images to preload based on current route
  const getCriticalImages = useMemo(() => {
    const currentPath = window.location.pathname

    // Preload hero images and logos for homepage
    if (currentPath === '/' || currentPath === '') {
      return [
        '/logo.jpg',
        '/logo.webp',
        // Add hero background images if any
      ]
    }

    // Preload project images for projects page
    if (currentPath === '/projects') {
      return [
        '/logo.jpg',
        // Add project thumbnail images
      ]
    }

    return ['/logo.jpg'] // Always preload logo
  }, [])

  // Memoized critical routes to prefetch
  const getCriticalRoutes = useMemo(() => {
    const currentPath = window.location.pathname
    const routes: string[] = []

    // Prefetch main navigation routes
    if (currentPath === '/' || currentPath === '') {
      routes.push('/about', '/projects', '/contact')
    } else if (currentPath === '/projects') {
      routes.push('/', '/about', '/contact')
    } else if (currentPath === '/about') {
      routes.push('/', '/projects', '/contact')
    }

    // Reduce prefetching on slow connections
    return isSlowConnection ? routes.slice(0, 1) : routes
  }, [isSlowConnection])

  // Network status class name
  const getNetworkStatusClass = useMemo(() => {
    if (!isOnline) {
      return 'network-offline'
    }
    return isSlowConnection ? 'network-slow' : 'network-fast'
  }, [isOnline, isSlowConnection])

  // Network status text
  const getNetworkStatusText = useMemo(() => {
    if (!isOnline) {
      return 'Offline'
    }
    return networkMetrics.effectiveType || (isSlowConnection ? 'Slow' : 'Fast')
  }, [isOnline, networkMetrics.effectiveType, isSlowConnection])

  return (
    <>
      {/* Network-aware CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Network-aware loading strategies */
        .slow-connection {
          /* Reduce animations and effects on slow connections */
        }

        .slow-connection * {
          /* Disable heavy animations */
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }

        .slow-connection img {
          /* Load lower quality images */
          filter: none !important;
        }

        /* Connection quality indicators */
        .network-status {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          pointer-events: none;
          user-select: none;
        }

        .network-fast {
          background: #10b981;
          color: white;
        }

        .network-slow {
          background: #f59e0b;
          color: white;
        }

        .network-offline {
          background: #ef4444;
          color: white;
        }
      `}} />

      {/* Network status indicator (development only) */}
      {process.env['NODE_ENV'] === 'development' && (
        <div
          className={`network-status ${getNetworkStatusClass}`}
          aria-live='polite'
        >
          {getNetworkStatusText}
        </div>
      )}

      {/* Font optimization */}
      {enableFontOptimization ? (
        <FontLoaderComponent
          fonts={[
            {
              family: 'Inter',
              weights: networkConfig.interFontWeights,
              display: isSlowConnection ? 'optional' : 'swap',
            },
            {
              family: 'Fira Code',
              weights: networkConfig.firaCodeFontWeights,
              display: 'optional', // Code fonts can be optional
            },
          ]}
        >
          {children}
        </FontLoaderComponent>
      ) : (
        children
      )}

      {/* Resource hints */}
      {enableCriticalResourceHints && (
        <ResourceHints
          hints={getCriticalHints}
          criticalImages={enableImagePreloading ? getCriticalImages : []}
          criticalRoutes={enableRoutePrefetching ? getCriticalRoutes : []}
          enableIntersectionObserver={!isSlowConnection}
        />
      )}
    </>
  )
}

// Hook for network-aware loading
export function useNetworkAwareLoading(config?: Partial<NetworkOptimizationConfig>) {
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({})
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Memoized network configuration
  const networkConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  useEffect(() => {
    const updateNetworkMetrics = () => {
      if ('connection' in navigator) {
        const connection = (navigator as { connection?: NavigatorConnection }).connection

        if (!connection) {
          setNetworkMetrics({})
          setIsSlowConnection(false)
          return
        }

        const metrics: NetworkMetrics = {
          connectionType: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }

        setNetworkMetrics(metrics)
        setIsSlowConnection(
          networkConfig.slowConnectionTypes.includes(connection.effectiveType || '') ||
            (connection.downlink ?? Infinity) < networkConfig.slowConnectionThreshold ||
            connection.saveData === true,
        )
      }
    }

    updateNetworkMetrics()

    if ('connection' in navigator) {
      const connection = (navigator as { connection?: NavigatorConnection }).connection
      if (connection?.addEventListener) {
        connection.addEventListener('change', updateNetworkMetrics)

        return () => {
          connection?.removeEventListener?.('change', updateNetworkMetrics)
        }
      }
    }
    return undefined
  }, [networkConfig])

  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Memoized adaptive loading strategies
  const loadingStrategy = useMemo(() => {
    if (isSlowConnection) {
      return {
        preload: false,
        prefetch: false,
        lazyLoad: true,
        quality: 'low' as const,
        animations: false,
      }
    }

    return {
      preload: true,
      prefetch: true,
      lazyLoad: false,
      quality: 'high' as const,
      animations: true,
    }
  }, [isSlowConnection])

  return {
    networkMetrics,
    isSlowConnection,
    isOnline,
    loadingStrategy,
    config: networkConfig,
  }
}

export default NetworkOptimizer
