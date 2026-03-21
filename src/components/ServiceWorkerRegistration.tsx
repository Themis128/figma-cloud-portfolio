"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates every 60 minutes
            setInterval(
              () => {
                registration.update();
              },
              60 * 60 * 1000,
            );
          })
          .catch((error) => {
            console.error("SW registration failed:", error); // eslint-disable-line no-console
          });
      });
    }
  }, []);

  return null;
}
