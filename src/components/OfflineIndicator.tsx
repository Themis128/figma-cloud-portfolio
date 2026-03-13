"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      data-testid="offline-indicator"
      role="status"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/90 backdrop-blur-sm text-black text-center text-sm font-medium py-2 px-4 flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  );
}
