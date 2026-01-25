// Defer Sentry initialization to avoid bundling it in the main chunk.
// If `VITE_SENTRY_AUTO_INIT` is set to "true", initialize at runtime.
if (import.meta.env.VITE_SENTRY_AUTO_INIT === "true") {
  import("./lib/sentry").then((m) => m.initSentry()).catch(() => { });
}

// Disable React DevTools in development to prevent React 19 compatibility issues
if (typeof window !== "undefined" && (import.meta.env.DEV || import.meta.env.VITE_DISABLE_REACT_DEVTOOLS === "true")) {
  // Prevent React DevTools from loading and causing ReactCurrentOwner errors
  (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    // Return a no-op hook to prevent DevTools from initializing
    isDisabled: true,
    supportsFiber: true,
    inject: () => undefined,
    onCommitFiberRoot: () => undefined,
    onCommitFiberUnmount: () => undefined,
  };
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
