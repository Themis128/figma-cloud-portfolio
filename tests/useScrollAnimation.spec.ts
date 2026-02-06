import { act, render, renderHook } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest'

import { useScrollAnimation } from '../client/hooks/useScrollAnimation'

const CUSTOM_INTERSECTION_THRESHOLD = 0.5
describe('useScrollAnimation', () => {
  let mockIntersectionObserver: any
  let observeMock: MockedFunction<(element: Element) => void>
  let unobserveMock: MockedFunction<(element: Element) => void>

  beforeEach(() => {
    observeMock = vi.fn()
    unobserveMock = vi.fn()

    // Mock the test environment detection
    vi.spyOn(global, 'process', 'get').mockReturnValue({
      ...global.process,
      env: { ...global.process.env, NODE_ENV: 'development' },
    })

    // Properly mock IntersectionObserver as a constructor with valid prototype
    function MockIntersectionObserver(
      this: any,
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      this.callback = callback
      this.options = options
      this.observe = observeMock
      this.unobserve = unobserveMock
      this.disconnect = vi.fn()
    }
    MockIntersectionObserver.prototype = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }

    mockIntersectionObserver = vi
      .spyOn(window, 'IntersectionObserver')
      .mockImplementation(MockIntersectionObserver as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useScrollAnimation())

    expect(result.current.isVisible).toBe(false)
    expect(result.current.ref.current).toBeNull()
  })

  it('should create IntersectionObserver with default threshold', () => {
    renderHook(() => useScrollAnimation())

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.2 })
  })

  it('should create IntersectionObserver with custom threshold', () => {
    renderHook(() => useScrollAnimation(CUSTOM_INTERSECTION_THRESHOLD))

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: CUSTOM_INTERSECTION_THRESHOLD,
    })
  })

  it('should set isVisible to true when element intersects', () => {
    const { result } = renderHook(() => useScrollAnimation())

    const callback = mockIntersectionObserver.mock.calls[0]?.[0]
    if (!callback) throw new Error('Callback not found')

    act(() => {
      callback([{ isIntersecting: true }])
    })

    expect(result.current.isVisible).toBe(true)
  })

  it('should set isVisible to false when element does not intersect', () => {
    const { result } = renderHook(() => useScrollAnimation())

    const callback = mockIntersectionObserver.mock.calls[0]?.[0]
    if (!callback) throw new Error('Callback not found')

    act(() => {
      callback([{ isIntersecting: false }])
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should observe element when ref is set', () => {
    const TestComponent = () => {
      const { ref } = useScrollAnimation()
      return React.createElement('div', { ref }, 'test')
    }

    render(React.createElement(TestComponent))

    expect(observeMock).toHaveBeenCalled()
  })

  it('should unobserve element on unmount', () => {
    const TestComponent = () => {
      const { ref } = useScrollAnimation()
      return React.createElement('div', { ref }, 'test')
    }

    const { unmount } = render(React.createElement(TestComponent))

    unmount()

    expect(unobserveMock).toHaveBeenCalled()
  })

  it('should handle multiple threshold changes', () => {
    const { rerender } = renderHook(({ threshold }) => useScrollAnimation(threshold), {
      initialProps: { threshold: 0.2 },
    })

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1)

    rerender({ threshold: CUSTOM_INTERSECTION_THRESHOLD })

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(2)
  })

  it('should immediately set visible in test environment', () => {
    // Mock test environment
    vi.spyOn(global, 'process', 'get').mockReturnValue({
      ...global.process,
      env: { ...global.process.env, NODE_ENV: 'test' },
    })

    const { result } = renderHook(() => useScrollAnimation())
    expect(result.current.isVisible).toBe(true)
  })
})
