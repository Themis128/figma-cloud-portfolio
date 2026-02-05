import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Constants for mock implementations
const _MOCK_TIME_REMAINING_MS = 50

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => {
  const mockObserver = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }
  // Store callback for potential manual triggering in tests
  mockObserver.callback = callback
  mockObserver.options = options
  return mockObserver
})

// Mock Blob
global.Blob = vi.fn().mockImplementation((content, options) => {
  const blobContent = Array.isArray(content) ? content.join('') : content || ''
  return {
    content: blobContent,
    options: options || {},
    size: blobContent.length,
    type: options?.type || '',
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(blobContent.length)),
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn().mockResolvedValue(blobContent),
  }
})

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  timing: {
    navigationStart: Date.now(),
    loadEventEnd: Date.now() + 1000,
    domContentLoadedEventEnd: Date.now() + 500,
  },
  navigation: {
    type: 0,
    redirectCount: 0,
  },
}

global.cancelIdleCallback = vi.fn().mockImplementation((id) => {
  clearTimeout(id)
})

// React 19 new features support
// Mock for React 19's new useTransition hook
global.startTransition = vi.fn((callback) => {
  callback()
})

// Mock for React 19's new use hook for promises
global.use = vi.fn((promise) => {
  if (promise instanceof Promise) {
    return undefined
  }
  return promise
})

// Mock document.documentElement for ThemeProvider
Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    classList: {
      remove: vi.fn(),
      add: vi.fn(),
      contains: vi.fn().mockReturnValue(false),
      toggle: vi.fn(),
    },
  },
})

// NOTE: Do NOT mock React hooks like useState, useMemo, useEffect, useContext, or useTransition
// as they break the React rendering process. Vitest provides sufficient mocking
// capabilities without needing to mock core React functionality.
//
// React 19 changes:
// - useTransition hook now supports priority levels
// - New use() hook for consuming promises/context values
// - Improved Suspense behavior with Server Components
// These all require actual React implementations to work correctly in tests.

// Mock meta theme-color for ThemeProvider
const mockMetaThemeColor = {
  setAttribute: vi.fn(),
}
Object.defineProperty(document, 'querySelector', {
  writable: true,
  value: vi.fn().mockImplementation((selector) => {
    if (selector === 'meta[name="theme-color"]') {
      return mockMetaThemeColor
    }
    return null
  }),
})
