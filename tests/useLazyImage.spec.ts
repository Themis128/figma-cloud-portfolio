import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from "vitest";

import { useLazyImage } from "../client/hooks/useLazyImage";

describe("useLazyImage", () => {
  let mockIntersectionObserver: ReturnType<typeof vi.fn>;
  let observeMock: MockedFunction<(element: Element) => void>;
  let disconnectMock: MockedFunction<() => void>;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    // Mock IntersectionObserver globally
    const mockObserver = {
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: vi.fn(),
    };

    mockIntersectionObserver = vi.fn().mockImplementation(() => mockObserver);
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useLazyImage());

    expect(result.current.isIntersecting).toBe(false);
    expect(result.current.hasLoaded).toBe(false);
    expect(result.current.imgRef.current).toBeNull();
  });

  it("should create IntersectionObserver with default options", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage();

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return null;
    };

    renderHook(() => TestComponent());

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "50px",
      threshold: 0.1,
    });
  });

  it("should create IntersectionObserver with custom options", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage({ rootMargin: "100px", threshold: 0.5 });

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return null;
    };

    renderHook(() => TestComponent());

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "100px",
      threshold: 0.5,
    });
  });

  it("should set isIntersecting to true when element intersects", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage();

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return hookResult;
    };

    const { result } = renderHook(() => TestComponent());

    // Get the callback passed to IntersectionObserver
    const callback = mockIntersectionObserver.mock.calls[0][0];

    // Simulate intersection
    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });

    expect(result.current.isIntersecting).toBe(true);
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("should not set isIntersecting when element is not intersecting", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage();

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return hookResult;
    };

    const { result } = renderHook(() => TestComponent());

    const callback = mockIntersectionObserver.mock.calls[0][0];

    act(() => {
      callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current.isIntersecting).toBe(false);
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  it("should set hasLoaded to true on load", () => {
    const { result } = renderHook(() => useLazyImage());

    act(() => {
      result.current.handleLoad();
    });

    expect(result.current.hasLoaded).toBe(true);
  });

  it("should set hasLoaded to true on error", () => {
    const { result } = renderHook(() => useLazyImage());

    act(() => {
      result.current.handleError();
    });

    expect(result.current.hasLoaded).toBe(true);
  });

  it("should disconnect observer on unmount", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage();

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return null;
    };

    const { unmount } = renderHook(() => TestComponent());

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it("should observe img element when ref is set", () => {
    // Create a test component that sets the ref immediately
    const TestComponent = () => {
      const hookResult = useLazyImage();

      // Set ref immediately in render
      if (hookResult.imgRef.current === null) {
        hookResult.imgRef.current = document.createElement("img");
      }

      return hookResult;
    };

    const { result } = renderHook(() => TestComponent());

    expect(observeMock).toHaveBeenCalledWith(result.current.imgRef.current);
  });
});
