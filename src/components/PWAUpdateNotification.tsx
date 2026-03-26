"use client";

import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    // Listen for update events dispatched by ServiceWorkerRegistration
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent<{
        registration: ServiceWorkerRegistration;
      }>;
      console.log("[PWA Update] Received sw-update-available event"); // eslint-disable-line no-console
      setRegistration(customEvent.detail.registration);
      setShowUpdate(true);
    };

    window.addEventListener("sw-update-available", handleUpdateAvailable);

    // Also check on mount if there's already a waiting worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.waiting) {
            console.log("[PWA Update] Found waiting worker on mount"); // eslint-disable-line no-console
            setRegistration(reg);
            setShowUpdate(true);
            break;
          }
        }
      });
    }

    return () => {
      window.removeEventListener("sw-update-available", handleUpdateAvailable);
    };
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    if (!registration?.waiting) return;

    setUpdating(true);
    setProgress(0);

    // Animate progress bar while SW activates
    let current = 0;
    progressRef.current = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 90) {
        current = 90; // Hold at 90% until controllerchange fires
        if (progressRef.current) clearInterval(progressRef.current);
      }
      setProgress(Math.min(current, 90));
    }, 150);

    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Listen for the controlling change
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      // Brief pause at 100% before reload so user sees completion
      setTimeout(() => {
        window.location.reload();
      }, 400);
    });
  }, [registration]);

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <RefreshCw
                className={`w-5 h-5 text-cyan-400 ${updating ? "animate-spin" : ""}`}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">
              {updating ? "Updating..." : "Update Available"}
            </h3>
            {updating ? (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-slate-300 text-xs">
                    Installing latest version
                  </p>
                  <span className="text-cyan-400 text-xs font-mono">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-label="Update progress"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-slate-300 text-xs mb-3">
                  A new version is ready. Update now for the latest features and
                  improvements.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-8"
                  >
                    Update Now
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-300 text-xs px-3 py-1 h-8"
                  >
                    Later
                  </Button>
                </div>
              </>
            )}
          </div>
          {!updating && (
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 text-slate-400 hover:text-slate-300 p-1"
              aria-label="Dismiss update notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
