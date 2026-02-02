import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeviceType, useOptimizedAnimation } from '../client/hooks/useDeviceType'
import { usePWA } from '../client/hooks/usePWA'

// Local type declaration for the test
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Test constants for device breakpoints
const MOBILE_BREAKPOINT = 375
const TABLET_BREAKPOINT = 800
const DESKTOP_BREAKPOINT = 1024

// Mock navigator
const mockNavigator = {
  standalone: false,
}

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation((_query) => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))

// Mock window
const mockWindow = {
  matchMedia: mockMatchMedia,
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  navigator: mockNavigator,
  document: {
    documentElement: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    },
    querySelector: vi.fn(),
  },
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: mockWindow.localStorage,
})

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial PWA state', () => {
    const { result } = renderHook(() => usePWA())

    expect(result.current).toEqual({
      isInstallable: false,
      isInstalled: false,
      installPWA: expect.any(Function),
    })
  })

  it('should detect when app is installed (standalone mode)', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => usePWA())

    expect(result.current.isInstalled).toBe(true)
  })

  it('should handle beforeinstallprompt event', () => {
    const mockEvent = {
      platforms: ['web'],
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      prompt: vi.fn().mockResolvedValue(undefined),
      preventDefault: vi.fn(),
    }

    const { result } = renderHook(() => usePWA())

    // Simulate beforeinstallprompt event
    act(() => {
      window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockEvent }))
    })

    expect(result.current.isInstallable).toBe(true)
  })

  it('should install PWA when installPWA is called', async () => {
    // Mock the beforeinstallprompt event
    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    const mockUserChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
    const mockEvent = {
      platforms: ['web'],
      prompt: mockPrompt,
      userChoice: mockUserChoice,
      preventDefault: vi.fn(),
    } as unknown as BeforeInstallPromptEvent

    // Simulate the beforeinstallprompt event
    const { result } = renderHook(() => usePWA())

    // Manually trigger the beforeinstallprompt event
    act(() => {
      // Create a proper event that mimics the browser's beforeinstallprompt event
      const event = Object.assign(new Event('beforeinstallprompt'), mockEvent)
      window.dispatchEvent(event)
    })

    // Wait for state update
    await waitFor(() => {
      expect(result.current.isInstallable).toBe(true)
    })

    // Call installPWA
    await act(async () => {
      result.current.installPWA()
    })

    expect(mockPrompt).toHaveBeenCalled()
  })
})

describe('useDeviceType', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })
  })

  it('should return desktop device type by default', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    // Mock prefers-reduced-motion to return false
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDeviceType())

    expect(result.current).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
      prefersReducedMotion: false,
    })
  })

  it('should detect mobile device', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: MOBILE_BREAKPOINT,
    })

    const { result } = renderHook(() => useDeviceType())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.screenWidth).toBe(MOBILE_BREAKPOINT)
  })

  it('should detect tablet device', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: TABLET_BREAKPOINT,
    })

    const { result } = renderHook(() => useDeviceType())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.screenWidth).toBe(TABLET_BREAKPOINT)
  })

  it('should handle prefers-reduced-motion', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useDeviceType())

    expect(result.current.prefersReducedMotion).toBe(true)
  })

  it('should handle window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: DESKTOP_BREAKPOINT,
    })

    const { result } = renderHook(() => useDeviceType())

    // Change window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: MOBILE_BREAKPOINT,
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isMobile).toBe(true)
    expect(result.current.screenWidth).toBe(MOBILE_BREAKPOINT)
  })
})

describe('useOptimizedAnimation', () => {
  it('should return optimized animation settings for desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: DESKTOP_BREAKPOINT,
    })

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useOptimizedAnimation())

    expect(result.current).toEqual({
      duration: 0.5,
      stiffness: 100,
      damping: 15,
      threshold: 0.2,
      disabled: false,
    })
  })

  it('should return reduced animation settings for mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: MOBILE_BREAKPOINT,
    })

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useOptimizedAnimation())

    expect(result.current).toEqual({
      duration: 0.3,
      stiffness: 120,
      damping: 20,
      threshold: 0.3,
      disabled: false,
    })
  })

  it('should disable animations when prefers-reduced-motion', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: DESKTOP_BREAKPOINT,
    })

    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useOptimizedAnimation())

    expect(result.current.disabled).toBe(true)
  })
})
