"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { Clock, LogOut, RefreshCcw, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userEmail?: string | undefined;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export default function AdminLayout({
  children,
  onLogout,
  userEmail,
}: AdminLayoutProps) {
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Offline detection
  useEffect(() => {
    // Set initial state from navigator (safe for SSR since this is "use client")
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkTokenExpiry = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      if (idToken) {
        const exp = idToken.payload.exp;
        if (typeof exp === "number") {
          const expiresAt = exp * 1000;
          const remaining = expiresAt - Date.now();
          setSessionTimeRemaining(remaining);
        }
      }
    } catch {
      // Session may not be available
      setSessionTimeRemaining(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchAuthSession({ forceRefresh: true });
      await checkTokenExpiry();
    } catch {
      // Refresh failed
    } finally {
      setIsRefreshing(false);
    }
  }, [checkTokenExpiry]);

  // Check token expiry on mount and every 30 seconds
  useEffect(() => {
    void checkTokenExpiry();
    const interval = setInterval(() => {
      void checkTokenExpiry();
    }, 30_000);
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  const isWarning = sessionTimeRemaining !== null && sessionTimeRemaining < 5 * 60 * 1000 && sessionTimeRemaining > 60 * 1000;
  const isCritical = sessionTimeRemaining !== null && sessionTimeRemaining <= 60 * 1000;

  return (
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-20">
      {/* Header: stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-foreground">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {userEmail && (
            <span className="hidden sm:inline text-foreground/40 font-mono text-xs truncate max-w-40 lg:max-w-none">
              {userEmail}
            </span>
          )}

          {/* Session timeout indicator */}
          {sessionTimeRemaining !== null && (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono uppercase tracking-wider shrink-0 ${
                isCritical
                  ? "border-red-500/40 text-red-400 animate-pulse"
                  : isWarning
                    ? "border-yellow-500/40 text-yellow-400"
                    : "border-foreground/10 text-foreground/30"
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              {formatTimeRemaining(sessionTimeRemaining)}
            </Badge>
          )}

          {/* Refresh session button (shown when warning or critical) */}
          {(isWarning || isCritical) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refreshSession()}
              disabled={isRefreshing}
              className={`h-7 px-2 text-[10px] font-mono ${
                isCritical
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              }`}
            >
              <RefreshCcw className={`w-3 h-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}

          <ThemeToggle />
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wider shrink-0 ${
              isOnline
                ? "border-green-500/40 text-green-400"
                : "border-red-500/40 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isOnline ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-border/30 text-foreground/60 hover:text-foreground hover:border-border/50 shrink-0"
          >
            <LogOut className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      {/* Offline banner */}
      {!isOnline && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          You are offline, data may be stale
        </div>
      )}

      <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mb-2" />
      <p className="text-foreground/50 text-xs sm:text-sm mb-6 sm:mb-8">
        Monitoring & management console
      </p>
      {children}
    </div>
  );
}
