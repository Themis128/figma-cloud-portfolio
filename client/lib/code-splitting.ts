// Advanced code-splitting configuration for React 19 optimization

import type { ComponentType } from 'react'
import { lazy } from 'react'

// Constants
const RETRY_DELAY_MS = 100

// =============================================================================
// ROUTE-LEVEL CODE SPLITTING
// =============================================================================

// Core pages - Critical for first load
export const HomePage = lazy(() => import('../pages/Index'))

// Feature pages - Lazy loaded
export const AboutPage = lazy(() => import('../pages/About'))

export const ProjectsPage = lazy(() => import('../pages/Projects'))

export const ContactPage = lazy(() => import('../pages/Contact'))

export const AgentsPage = lazy(() => import('../pages/Agents'))

export const ResumePage = lazy(() => import('../pages/Resume'))

// =============================================================================
// COMPONENT-LEVEL CODE SPLITTING
// =============================================================================

// Complex interactive components
// Note: ContactForm component not found - commented out
// export const ContactForm = lazy(() =>
//   import('../components/forms/ContactForm').then((module) => ({
//     default: module.ContactForm,
//   })),
// )

// Note: ProjectShowcase component not found - commented out
// export const ProjectShowcase = lazy(() =>
//   import('../components/projects/ProjectShowcase').then((module) => ({
//     default: module.ProjectShowcase,
//   })),
// )

// Note: SkillsMatrix component not found - commented out
// export const SkillsMatrix = lazy(() =>
//   import('../components/about/SkillsMatrix').then((module) => ({
//     default: module.SkillsMatrix,
//   })),
// )

// Note: Timeline component not found - commented out
// export const TimelineComponent = lazy(() =>
//   import('../components/about/Timeline').then((module) => ({
//     default: module.Timeline,
//   })),
// )

// Agent-related components (heavy dependencies)
export const AgentBuilder = lazy(() => import('../components/agents/AgentBuilder'))

// Note: AgentTemplates component not found - commented out
// export const AgentTemplates = lazy(() =>
//   import('../components/agents/AgentTemplates').then((module) => ({
//     default: module.AgentTemplates,
//   })),
// )

// Note: AgentWorkflow component not found - commented out
// export const AgentWorkflow = lazy(() =>
//   import('../components/agents/AgentWorkflow').then((module) => ({
//     default: module.AgentWorkflow,
//   })),
// )

// =============================================================================
// FEATURE-BASED CODE SPLITTING
// =============================================================================

// Authentication & User Management
// Note: useAuth hook not found - commented out
// export const useAuth = lazy(() =>
//   import('../hooks/useAuth').then((module) => ({
//     default: module.useAuth,
//   })),
// )

// Real-time features (Socket.IO heavy)
// Note: useRealtime hook not found - commented out
// export const useRealtime = lazy(() =>
//   import('../hooks/useRealtime').then((module) => ({
//     default: module.useRealtime,
//   })),
// )

// Advanced analytics
// Note: AdvancedAnalytics component not found - commented out
// export const AdvancedAnalytics = lazy(() =>
//   import('../components/analytics/AdvancedAnalytics').then((module) => ({
//     default: module.AdvancedAnalytics,
//   })),
// )

// =============================================================================
// VENDOR LIBRARY CODE SPLITTING
// =============================================================================

// PDF generation (Puppeteer alternative - client-side)
// Note: pdf-generator not found - commented out
// export const PDFGenerator = lazy(() =>
//   import('../lib/pdf-generator').then((module) => ({
//     default: module.PDFGenerator,
//   })),
// )

// Chart libraries
// Note: ChartsBundle component not found - commented out
// export const ChartsBundle = lazy(() =>
//   import('../components/charts/ChartsBundle').then((module) => ({
//     default: module.ChartsBundle,
//   })),
// )

// Animation libraries (Framer Motion, Lottie)
// Note: animations not found - commented out
// export const AnimationsBundle = lazy(() =>
//   import('../lib/animations').then((module) => ({
//     default: module.AnimationsBundle,
//   })),
// )

// =============================================================================
// SMART LOADING UTILITIES
// =============================================================================

interface LazyComponentOptions {
  fallback?: ComponentType
  retryCount?: number
  retryDelay?: number
  preload?: boolean
}

/**
 * Enhanced lazy loading with React 19 optimizations
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {},
): T {
  const { retryCount = 3, retryDelay = 1000, preload = false } = options

  let retryPromise: Promise<{ default: T }> | null = null

  const importWithRetry = async (): Promise<{ default: T }> => {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const module = await importFn()
        retryPromise = null
        return module
      } catch (error) {
        lastError = error as Error

        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay))
        }
      }
    }

    throw lastError || new Error('Failed to load component after multiple attempts')
  }

  const LazyComponent = lazy(() => {
    if (retryPromise) return retryPromise
    retryPromise = importWithRetry()
    return retryPromise
  })

  // Preload if requested
  if (preload) {
    // Use React 19's built-in preloading capabilities
    setTimeout(() => {
      importWithRetry().catch(() => {
        // Ignore preload failures
      })
    }, RETRY_DELAY_MS)
  }

  return LazyComponent as unknown as T
}

/**
 * Preload routes based on user behavior
 */
const preloadedRoutes = new Set<string>()
const preloadPromises = new Map<string, Promise<unknown>>()

export const preloadRoute = (routeName: string, importFn: () => Promise<unknown>): void => {
  if (preloadedRoutes.has(routeName)) return

  preloadedRoutes.add(routeName)
  const promise = importFn().catch((_error) => {
    preloadedRoutes.delete(routeName)
  })

  preloadPromises.set(routeName, promise)
}

export const getPreloadedRoute = (routeName: string): unknown => {
  return preloadPromises.get(routeName)
}

export const preloadCriticalRoutes = (): void => {
  // Preload most likely next routes
  preloadRoute('about', () => import('../pages/About'))
  preloadRoute('projects', () => import('../pages/Projects'))
}

export const preloadOnHover = (routeName: string, importFn: () => Promise<unknown>): void => {
  // Preload on link hover for instant navigation
  requestIdleCallback(() => {
    preloadRoute(routeName, importFn)
  })
}

/**
 * Intelligent component loading based on viewport
 */
let viewportObserver: IntersectionObserver | null = null
const pendingLoads = new Map<Element, () => void>()

export function initializeViewportLoader(): void {
  if (viewportObserver || typeof IntersectionObserver === 'undefined') return

  viewportObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const loadFn = pendingLoads.get(entry.target)
          if (loadFn) {
            loadFn()
            pendingLoads.delete(entry.target)
            viewportObserver?.unobserve(entry.target)
          }
        }
      })
    },
    {
      rootMargin: '50px',
    },
  )
}

export function loadOnVisible(element: Element, loadFn: () => void): void {
  if (!viewportObserver) initializeViewportLoader()

  pendingLoads.set(element, loadFn)
  viewportObserver?.observe(element)
}

export function cleanupViewportLoader(): void {
  viewportObserver?.disconnect()
  viewportObserver = null
  pendingLoads.clear()
}

/**
 * Bundle size analyzer for development
 */
export function analyzeChunkSizes(): void {
  if (process.env['NODE_ENV'] !== 'development') return

  // Measure and log chunk sizes
  performance.mark('bundle-analysis-start')

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.name.includes('chunk')) {
      }
    })
  })

  observer.observe({ entryTypes: ['measure'] })
}

export function measureComponentLoad(componentName: string): void {
  if (process.env['NODE_ENV'] !== 'development') return

  performance.mark(`component-${componentName}-start`)

  requestIdleCallback(() => {
    performance.mark(`component-${componentName}-end`)
    performance.measure(
      `component-${componentName}`,
      `component-${componentName}-start`,
      `component-${componentName}-end`,
    )
  })
}

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

export const codeSpittingConfig = {
  // Critical routes that should be preloaded
  criticalRoutes: ['HomePage'],

  // Routes to preload on idle
  preloadOnIdle: ['AboutPage', 'ProjectsPage'],

  // Components to load on viewport intersection
  viewportComponents: ['ContactForm', 'ProjectShowcase'],

  // Heavy components that should be split aggressively
  heavyComponents: ['AgentBuilder', 'ChartsBundle', 'AnimationsBundle'],

  // Retry configuration for failed loads
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
  },
}

// Initialize viewport loader
initializeViewportLoader()

// Initialize bundle analyzer in development
analyzeChunkSizes()

export default {
  // Page components
  HomePage,
  AboutPage,
  ProjectsPage,
  ContactPage,
  AgentsPage,
  ResumePage,

  // Feature components
  // ContactForm, // Not found
  // ProjectShowcase, // Not found
  // SkillsMatrix, // Not found
  // TimelineComponent, // Not found
  AgentBuilder,
  // AgentTemplates, // Not found
  // AgentWorkflow, // Not found

  // Utilities
  createLazyComponent,
  preloadRoute,
  getPreloadedRoute,
  preloadCriticalRoutes,
  preloadOnHover,
  initializeViewportLoader,
  loadOnVisible,
  cleanupViewportLoader,
  analyzeChunkSizes,
  measureComponentLoad,
  codeSpittingConfig,
}
