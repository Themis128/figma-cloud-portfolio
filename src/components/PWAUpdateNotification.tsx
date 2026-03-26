"use client";

import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const initialCommitRef = useRef<string | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    async function checkForUpdate() {
      try {
        // Cache-bust to always get fresh version.json from origin
        const res = await fetch(`/version.json?_=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = (await res.json()) as { commit: string };
        const serverCommit = data.commit;

        if (!initialCommitRef.current) {
          // First check — store the current version
          initialCommitRef.current = serverCommit;
          return;
        }

        if (serverCommit !== initialCommitRef.current) {
          console.log( // eslint-disable-line no-console
            `[Update] New version detected: ${initialCommitRef.current} → ${serverCommit}`,
          );
          setShowUpdate(true);
        }
      } catch {
        // Network error — silently ignore
      }
    }

    // Check on load, then periodically
    checkForUpdate();
    intervalId = setInterval(checkForUpdate, CHECK_INTERVAL);

    // Also check when user returns to the tab
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // Also listen for SW-based update events (bonus, not primary)
    function handleSWUpdate() {
      console.log("[Update] SW update event received"); // eslint-disable-line no-console
      setShowUpdate(true);
    }
    window.addEventListener("sw-update-available", handleSWUpdate);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("sw-update-available", handleSWUpdate);
    };
  }, []);

  // Clean up progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const handleUpdate = useCallback(() => {
    setUpdating(true);
    setProgress(0);

    // Animate progress bar then reload
    let current = 0;
    progressRef.current = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        if (progressRef.current) clearInterval(progressRef.current);
        setProgress(100);
        setTimeout(() => {
          window.location.reload();
        }, 300);
        return;
      }
      setProgress(current);
    }, 120);
  }, []);

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
                    Loading latest version
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
