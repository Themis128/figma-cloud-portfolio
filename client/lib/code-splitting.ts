// Advanced code-splitting configuration for React 19 optimization

import type { ComponentType } from 'react'
import { lazy } from 'react'

// =============================================================================
// ROUTE-LEVEL CODE SPLITTING
// =============================================================================

// Core pages - Critical for first load
export const HomePage = lazy(() =>
  import('../pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)

// Feature pages - Lazy loaded
export const AboutPage = lazy(() =>
  import('../pages/AboutPage').then((module) => ({
    default: module.AboutPage,
  })),
)

export const ProjectsPage = lazy(() =>
  import('../pages/ProjectsPage').then((module) => ({
    default: module.ProjectsPage,
  })),
)

export const ContactPage = lazy(() =>
  import('../pages/ContactPage').then((module) => ({
    default: module.ContactPage,
  })),
)

export const AgentsPage = lazy(() =>
  import('../pages/AgentsPage').then((module) => ({
    default: module.AgentsPage,
  })),
)

export const ResumePage = lazy(() =>
  import('../pages/ResumePage').then((module) => ({
    default: module.ResumePage,
  })),
)

// =============================================================================
// COMPONENT-LEVEL CODE SPLITTING
// =============================================================================

// Complex interactive components
export const ContactForm = lazy(() =>
  import('../components/forms/ContactForm').then((module) => ({
    default: module.ContactForm,
  })),
)

export const ProjectShowcase = lazy(() =>
  import('../components/projects/ProjectShowcase').then((module) => ({
    default: module.ProjectShowcase,
  })),
)

export const SkillsMatrix = lazy(() =>
  import('../components/about/SkillsMatrix').then((module) => ({
    default: module.SkillsMatrix,
  })),
)

export const TimelineComponent = lazy(() =>
  import('../components/about/Timeline').then((module) => ({
    default: module.Timeline,
  })),
)

// Agent-related components (heavy dependencies)
export const AgentBuilder = lazy(() =>
  import('../components/agents/AgentBuilder').then((module) => ({
    default: module.AgentBuilder,
  })),
)

export const AgentTemplates = lazy(() =>
  import('../components/agents/AgentTemplates').then((module) => ({
    default: module.AgentTemplates,
  })),
)

export const AgentWorkflow = lazy(() =>
  import('../components/agents/AgentWorkflow').then((module) => ({
    default: module.AgentWorkflow,
  })),
)

// =============================================================================
// FEATURE-BASED CODE SPLITTING
// =============================================================================

// Authentication & User Management
export const useAuth = lazy(() =>
  import('../hooks/useAuth').then((module) => ({
    default: module.useAuth,
  })),
)

// Real-time features (Socket.IO heavy)
export const useRealtime = lazy(() =>
  import('../hooks/useRealtime').then((module) => ({
    default: module.useRealtime,
  })),
)

// Advanced analytics
export const AdvancedAnalytics = lazy(() =>
  import('../components/analytics/AdvancedAnalytics').then((module) => ({
    default: module.AdvancedAnalytics,
  })),
)

// =============================================================================
// VENDOR LIBRARY CODE SPLITTING
// =============================================================================

// PDF generation (Puppeteer alternative - client-side)
export const PDFGenerator = lazy(() =>
  import('../lib/pdf-generator').then((module) => ({
    default: module.PDFGenerator,
  })),
)

// Chart libraries
export const ChartsBundle = lazy(() =>
  import('../components/charts/ChartsBundle').then((module) => ({
    default: module.ChartsBundle,
  })),
)

// Animation libraries (Framer Motion, Lottie)
export const AnimationsBundle = lazy(() =>
  import('../lib/animations').then((module) => ({
    default: module.AnimationsBundle,
  })),
)

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
export function createLazyComponent<T extends ComponentType<any>>(
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
      importWithRetry().catch(console.error)
    }, 100)
  }

  return LazyComponent as T
}

/**
 * Preload routes based on user behavior
 */
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>()
  private static preloadPromises = new Map<string, Promise<any>>()

  static preloadRoute(routeName: string, importFn: () => Promise<any>): void {
    if (RoutePreloader.preloadedRoutes.has(routeName)) return

    RoutePreloader.preloadedRoutes.add(routeName)
    const promise = importFn().catch((_error) => {
      RoutePreloader.preloadedRoutes.delete(routeName)
    })

    RoutePreloader.preloadPromises.set(routeName, promise)
  }

  static async getPreloadedRoute(routeName: string): Promise<any> {
    return RoutePreloader.preloadPromises.get(routeName)
  }

  static preloadCriticalRoutes(): void {
    // Preload most likely next routes
    RoutePreloader.preloadRoute('about', () => import('../pages/AboutPage'))
    RoutePreloader.preloadRoute('projects', () => import('../pages/ProjectsPage'))
  }

  static preloadOnHover(routeName: string, importFn: () => Promise<any>): void {
    // Preload on link hover for instant navigation
    requestIdleCallback(() => {
      RoutePreloader.preloadRoute(routeName, importFn)
    })
  }
}

/**
 * Intelligent component loading based on viewport
 */
export class ViewportLoader {
  private static observer: IntersectionObserver | null = null
  private static pendingLoads = new Map<Element, () => void>()

  static initialize(): void {
    if (ViewportLoader.observer || typeof IntersectionObserver === 'undefined') return

    ViewportLoader.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const loadFn = ViewportLoader.pendingLoads.get(entry.target)
            if (loadFn) {
              loadFn()
              ViewportLoader.pendingLoads.delete(entry.target)
              ViewportLoader.observer?.unobserve(entry.target)
            }
          }
        })
      },
      {
        rootMargin: '50px',
      },
    )
  }

  static loadOnVisible(element: Element, loadFn: () => void): void {
    if (!ViewportLoader.observer) ViewportLoader.initialize()

    ViewportLoader.pendingLoads.set(element, loadFn)
    ViewportLoader.observer?.observe(element)
  }

  static cleanup(): void {
    ViewportLoader.observer?.disconnect()
    ViewportLoader.observer = null
    ViewportLoader.pendingLoads.clear()
  }
}

/**
 * Bundle size analyzer for development
 */
export class BundleAnalyzer {
  static analyzeChunkSizes(): void {
    if (process.env.NODE_ENV !== 'development') return

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

  static measureComponentLoad(componentName: string): void {
    if (process.env.NODE_ENV !== 'development') return

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
ViewportLoader.initialize()

// Initialize bundle analyzer in development
BundleAnalyzer.analyzeChunkSizes()

export default {
  // Page components
  HomePage,
  AboutPage,
  ProjectsPage,
  ContactPage,
  AgentsPage,
  ResumePage,

  // Feature components
  ContactForm,
  ProjectShowcase,
  SkillsMatrix,
  TimelineComponent,
  AgentBuilder,
  AgentTemplates,
  AgentWorkflow,

  // Utilities
  createLazyComponent,
  RoutePreloader,
  ViewportLoader,
  BundleAnalyzer,
  codeSpittingConfig,
}
