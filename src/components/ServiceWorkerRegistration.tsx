"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // In development, unregister any stale service worker to prevent
    // Workbox from serving cached chunks that Turbopack has replaced.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check for updates every 60 minutes
          const HOUR = 60 * 60 * 1000;
          setInterval(() => {
            registration.update();
          }, HOUR);

          // Also check for updates when user returns to the tab
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update();
            }
          });
        })
        .catch((error) => {
          console.error("SW registration failed:", error); // eslint-disable-line no-console
        });
    });
  }, []);

  return null;
}
