import '@testing-library/jest-dom'
import { vi } from 'vitest'

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

// Mock IntersectionObserver as a proper constructor
class MockIntersectionObserver {
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options || {}
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock Blob as a proper class constructor
global.Blob = class MockBlob {
  content: string
  options: BlobPropertyBag
  size: number
  type: string

  constructor(content?: BlobPart[] | BlobPart, options?: BlobPropertyBag) {
    const blobContent = Array.isArray(content) ? content.join('') : (content as string) || ''
    this.content = blobContent
    this.options = options || {}
    this.size = blobContent.length
    this.type = options?.type || ''
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.content.length))
  }

  slice(): Blob {
    return new MockBlob(this.content, this.options) as Blob
  }

  stream(): ReadableStream {
    return new ReadableStream()
  }

  text(): Promise<string> {
    return Promise.resolve(this.content)
  }

  bytes(): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(this.content.length))
  }
} as typeof Blob

// Performance timing constants
const LOAD_EVENT_DELAY_MS = 1000
const DOM_CONTENT_LOADED_DELAY_MS = 500

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
    loadEventEnd: Date.now() + LOAD_EVENT_DELAY_MS,
    domContentLoadedEventEnd: Date.now() + DOM_CONTENT_LOADED_DELAY_MS,
  } as any,
  navigation: {
    type: 0,
    redirectCount: 0,
  } as any,
} as any

global.cancelIdleCallback = vi.fn().mockImplementation((id) => {
  clearTimeout(id)
})

// React 19 new features support
// Mock for React 19's new useTransition hook
;(global as any).startTransition = vi.fn((callback) => {
  callback()
})

// Mock for React 19's new use hook for promises
;(global as any).use = vi.fn((promise) => {
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
