// Defer Sentry initialization to avoid bundling it in the main chunk.
// If `VITE_SENTRY_AUTO_INIT` is set to "true", initialize at runtime.
if (import.meta.env.VITE_SENTRY_AUTO_INIT === "true") {
  import("./lib/sentry").then((m) => m.initSentry()).catch(() => {});
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
