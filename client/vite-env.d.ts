/// <reference types="vite/client" />

// Extend JSX for @react-three/fiber
import '@react-three/fiber'

// Properly extend JSX for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements extends import('@react-three/fiber').JSXIntrinsicElements {
      mesh: any
    }
  }

  interface Window {
    webVitals?: boolean
    webVitalsMetrics?: Array<{
      name: string
      value: number
      timestamp: number
    }>
    gaEvents?: Array<{
      command: string
      eventName: string
      params?: Record<string, unknown>
    }>
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void
    trackContactFormSubmit?: () => void
    trackResumeDownload?: () => void
    trackError?: (error: string) => void
    clients?: Clients
  }
}
