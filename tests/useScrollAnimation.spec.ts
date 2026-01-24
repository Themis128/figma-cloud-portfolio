import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";

import { useScrollAnimation } from "../client/hooks/useScrollAnimation";

describe("useScrollAnimation", () => {
  let mockIntersectionObserver: ReturnType<typeof vi.fn>;
  let observeMock: MockedFunction<(element: Element) => void>;
  let unobserveMock: MockedFunction<(element: Element) => void>;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();

    mockIntersectionObserver = vi
      .fn()
      .mockImplementation(
        (_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) => {
          return {
            observe: observeMock,
            unobserve: unobserveMock,
            disconnect: vi.fn(),
          };
        },
      );

    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.ref.current).toBeNull();
  });

  it("should create IntersectionObserver with default threshold", () => {
    renderHook(() => useScrollAnimation());

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.2 });
  });

  it("should create IntersectionObserver with custom threshold", () => {
    renderHook(() => useScrollAnimation(0.5));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.5 });
  });

  it("should set isVisible to true when element intersects", () => {
    const { result } = renderHook(() => useScrollAnimation());

    const callback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      callback([{ isIntersecting: true }]);
    });

    expect(result.current.isVisible).toBe(true);
  });

  it("should set isVisible to false when element does not intersect", () => {
    const { result } = renderHook(() => useScrollAnimation());

    const callback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      callback([{ isIntersecting: false }]);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it("should observe element when ref is set", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useScrollAnimation();

      // Set ref immediately in render
      if (hookResult.ref.current === null) {
        hookResult.ref.current = document.createElement("div");
      }

      return hookResult;
    };

    const { result } = renderHook(() => TestComponent());

    expect(observeMock).toHaveBeenCalledWith(result.current.ref.current);
  });

  it("should unobserve element on unmount", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useScrollAnimation();

      // Set ref immediately in render
      if (hookResult.ref.current === null) {
        hookResult.ref.current = document.createElement("div");
      }

      return null;
    };

    const { unmount } = renderHook(() => TestComponent());

    unmount();

    expect(unobserveMock).toHaveBeenCalled();
  });

  it("should handle multiple threshold changes", () => {
    const { rerender } = renderHook(({ threshold }) => useScrollAnimation(threshold), {
      initialProps: { threshold: 0.2 },
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);

    rerender({ threshold: 0.5 });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(2);
  });
});
