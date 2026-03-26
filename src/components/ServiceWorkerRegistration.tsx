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
          console.log("[SW] Registered, scope:", registration.scope); // eslint-disable-line no-console

          // Attach updatefound listener immediately on the registration
          // This fires when the browser detects a new sw.js (byte-different)
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            console.log("[SW] New worker found, state:", newWorker.state); // eslint-disable-line no-console

            newWorker.addEventListener("statechange", () => {
              console.log("[SW] Worker state changed to:", newWorker.state); // eslint-disable-line no-console

              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version is waiting — notify the app
                console.log("[SW] New version waiting — dispatching sw-update-available"); // eslint-disable-line no-console
                window.dispatchEvent(
                  new CustomEvent("sw-update-available", {
                    detail: { registration },
                  }),
                );
              }
            });
          });

          // Check if there's already a waiting worker (e.g. from a previous visit)
          if (registration.waiting && navigator.serviceWorker.controller) {
            console.log("[SW] Found waiting worker on load — dispatching sw-update-available"); // eslint-disable-line no-console
            window.dispatchEvent(
              new CustomEvent("sw-update-available", {
                detail: { registration },
              }),
            );
          }

          // Check for updates every 10 minutes
          const TEN_MINUTES = 10 * 60 * 1000;
          setInterval(() => {
            registration.update();
          }, TEN_MINUTES);

          // Also check for updates when user returns to the tab
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update();
            }
          });
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error); // eslint-disable-line no-console
        });
    });
  }, []);

  return null;
}
