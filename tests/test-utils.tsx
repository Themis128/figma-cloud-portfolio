/**
 * React 19 Test Utilities
 *
 * This file provides testing utility functions for React 19.
 * Updated from React 18 patterns to support React 19's new features:
 * - useTransition with priority levels
 * - use() hook for consuming promises/context
 * - Improved concurrent features
 * - Enhanced Suspense support
 */

import { type RenderOptions, render } from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'

/**
 * Custom render function that wraps components with common providers
 * Used for testing components that depend on Router and Theme context
 *
 * React 19: Now supports rendering with concurrent features enabled
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
  disableTheme?: boolean
  disableRouter?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialRoute = '/',
    disableTheme = false,
    disableRouter = false,
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  // Update window location for browser router context
  if (initialRoute && !disableRouter && window.location.pathname !== initialRoute) {
    window.history.pushState({}, 'Test page', initialRoute)
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    let wrappedContent = children

    // Wrap with Router
    if (!disableRouter) {
      wrappedContent = <BrowserRouter>{wrappedContent}</BrowserRouter>
    }

    // Wrap with Theme Provider
    if (!disableTheme) {
      wrappedContent = <ThemeProvider>{wrappedContent}</ThemeProvider>
    }

    return <>{wrappedContent}</>
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Test utilities for React 19 concurrent features
 */

/**
 * Mock for testing useTransition hook
 * React 19: useTransition now supports priority levels (urgent/user-blocking/normal)
 */
export const mockUseTransition = (isPending = false, startTransition = vi.fn()) => ({
  isPending,
  startTransition,
})

/**
 * Mock for testing async components with use() hook
 * React 19: use() hook can consume promises in Server Components
 */
export const mockUseAsync = <T,>(value: T | Promise<T>) => {
  if (value instanceof Promise) {
    throw value
  }
  return value
}

/**
 * Helper to create a resolved promise for testing
 * React 19: Useful for testing Server Components with use() hook
 */
export function createResolvedPromise<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

/**
 * Helper to create a rejected promise for testing
 * React 19: Useful for testing error boundaries and error states
 */
export function createRejectedPromise<T = unknown>(error: unknown): Promise<T> {
  return Promise.reject(error)
}

/**
 * Helper to test Suspense boundaries
 * React 19: Better concurrent Suspense support
 */
export const SuspenseTestComponent = ({
  children,
  fallback = <div>Loading...</div>,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) => <React.Suspense fallback={fallback}>{children}</React.Suspense>

/**
 * Re-export everything from testing library for convenience
 */
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
