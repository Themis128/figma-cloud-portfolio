import { act, render, renderHook } from "@testing-library/react";
import React from "react";
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
    const TestComponent = () => {
      const { imgRef } = useLazyImage();
      return React.createElement("img", { ref: imgRef, src: "test.jpg", alt: "test" });
    };

    render(React.createElement(TestComponent));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "50px",
      threshold: 0.1,
    });
  });

  it("should create IntersectionObserver with custom options", () => {
    const TestComponent = () => {
      const { imgRef } = useLazyImage({ rootMargin: "100px", threshold: 0.5 });
      return React.createElement("img", { ref: imgRef, src: "test.jpg", alt: "test" });
    };

    render(React.createElement(TestComponent));

    expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "100px",
      threshold: 0.5,
    });
  });

  it("should handle intersection callback", () => {
    const TestComponent = () => {
      const { isIntersecting } = useLazyImage();
      return React.createElement("div", {}, `Intersecting: ${isIntersecting}`);
    };

    render(React.createElement(TestComponent));

    // Get the callback passed to IntersectionObserver
    const calls = mockIntersectionObserver.mock.calls;
    const lastCall = calls[calls.length - 1];
    if (lastCall?.[0]) {
      const callback = lastCall[0];

      // Simulate intersection
      act(() => {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });
    }
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
    const TestComponent = () => {
      const { imgRef } = useLazyImage();
      return React.createElement("img", { ref: imgRef, src: "test.jpg", alt: "test" });
    };

    const { unmount } = render(React.createElement(TestComponent));

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it("should observe img element when ref is set", () => {
    const TestComponent = () => {
      const { imgRef } = useLazyImage();
      return React.createElement("img", { ref: imgRef, src: "test.jpg", alt: "test" });
    };

    render(React.createElement(TestComponent));

    expect(observeMock).toHaveBeenCalled();
  });
});
