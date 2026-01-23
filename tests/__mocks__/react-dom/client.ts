// Mock createRoot to work in test environment
import { vi } from "vitest";

const mockCreateRoot = (_container: Element | DocumentFragment) => ({
  render: vi.fn(),
  unmount: vi.fn(),
});

export { mockCreateRoot as createRoot };

// Re-export everything else from React DOM
export * from "react-dom/client";