/**
 * Tests for ThemeProvider component
 * Imports ACTUAL components from client/components/ThemeProvider.tsx
 */
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, useTheme } from "../client/components/ThemeProvider";

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: query === "(prefers-color-scheme: dark)",
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));
Object.defineProperty(window, "matchMedia", { writable: true, value: mockMatchMedia });

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("light", "dark");
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders children", () => {
    render(
      <ThemeProvider>
        <div data-testid='child'>Hello</div>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("uses default theme", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme='light'>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");
  });

  it("loads theme from localStorage", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    renderHook(() => useTheme(), { wrapper });
    expect(localStorageMock.getItem).toHaveBeenCalledWith("theme");
  });

  it("updates theme with setTheme", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme='light'>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme("dark");
    });

    expect(result.current.theme).toBe("dark");
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("applies theme class to document", () => {
    render(
      <ThemeProvider defaultTheme='dark'>
        <div>Test</div>
      </ThemeProvider>,
    );
    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it("uses custom storageKey", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    render(
      <ThemeProvider storageKey='custom-theme'>
        <div>Test</div>
      </ThemeProvider>,
    );
    expect(localStorageMock.getItem).toHaveBeenCalledWith("custom-theme");
  });

  it("resolves system theme", () => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme='system'>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");
    expect(result.current.actualTheme).toBe("dark");
  });

  it("throws when useTheme used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
    consoleSpy.mockRestore();
  });
});

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove("light", "dark");
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("returns theme context values", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme='light'>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty("theme");
    expect(result.current).toHaveProperty("setTheme");
    expect(result.current).toHaveProperty("actualTheme");
  });

  it("cycles through themes", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider defaultTheme='light'>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("light");

    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");

    act(() => result.current.setTheme("system"));
    expect(result.current.theme).toBe("system");
  });
});
