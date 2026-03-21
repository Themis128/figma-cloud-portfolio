"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { Download, Keyboard, Pause, Play, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_ORIGIN, API_TIMEOUT_MS, AUTO_REFRESH_INTERVAL_MS, MAX_HISTORY_POINTS } from "@/lib/admin-constants";
import ApiEndpointCard, {
  type EndpointDef,
  type EndpointStatus,
} from "./ApiEndpointCard";

const ENDPOINTS: EndpointDef[] = [
  {
    id: "ping",
    name: "Ping",
    method: "GET",
    path: "/api/ping",
    service: "Lambda",
    description: "Basic health check",
    healthCheck: { method: "GET", path: "/api/ping" },
  },
  {
    id: "health",
    name: "Health",
    method: "GET",
    path: "/api/health",
    service: "Lambda",
    description: "Detailed health status with uptime and memory",
    healthCheck: { method: "GET", path: "/api/health" },
  },
  {
    id: "booking-slots",
    name: "Booking Slots",
    method: "GET",
    path: "/api/booking/slots",
    service: "Cal.com",
    description: "Fetch available booking slots (next 7 days)",
    healthCheck: { method: "GET", path: "/api/booking/slots" },
  },
  {
    id: "booking-create",
    name: "Booking Create",
    method: "POST",
    path: "/api/booking/create",
    service: "Cal.com",
    description: "Create a new booking with Google Meet link",
    healthCheck: {
      method: "POST",
      path: "/api/booking/create",
      body: JSON.stringify({}),
    },
  },
  {
    id: "chat",
    name: "AI Chat",
    method: "POST",
    path: "/api/chat",
    service: "AWS Bedrock",
    description: "AI assistant powered by Claude 3.5 Haiku",
    healthCheck: {
      method: "POST",
      path: "/api/chat",
      body: JSON.stringify({ message: "ping", history: [] }),
    },
  },
  {
    id: "resume",
    name: "Resume Download",
    method: "GET",
    path: "/api/resume/download",
    service: "Lambda",
    description: "PDF resume (302 redirect)",
    healthCheck: { method: "GET", path: "/api/resume/download" },
  },
  {
    id: "api-keys",
    name: "API Keys",
    method: "GET",
    path: "/api/organizations/api_keys",
    service: "Lambda",
    description: "API key management (CRUD)",
    requiresAuth: true,
    healthCheck: { method: "GET", path: "/api/organizations/api_keys" },
  },
  {
    id: "contact",
    name: "Contact Form",
    method: "POST",
    path: "/api/contact",
    service: "reCAPTCHA + SES",
    description: "Contact form submission with reCAPTCHA validation",
    healthCheck: {
      method: "POST",
      path: "/api/contact",
      body: JSON.stringify({
        name: "healthcheck",
        email: "hc@test.com",
        message: "healthcheck",
      }),
    },
  },
  {
    id: "push-notifications",
    name: "Push Notifications",
    method: "GET",
    path: "/api/push-notifications",
    service: "Web Push",
    description: "Push notification management (VAPID, subscriptions)",
    healthCheck: {
      method: "GET",
      path: "/api/push-notifications?action=subscriptions",
    },
  },
];

const defaultStatus = (): EndpointStatus => ({
  state: "idle",
  statusCode: null,
  responseTime: null,
  lastChecked: null,
});

/** Tiny inline SVG sparkline */
function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2) return null;
  const width = 80;
  const height = 20;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Shimmer skeleton matching the ApiEndpointCard layout, shown before first load. */
function SkeletonEndpointCard() {
  return (
    <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-10 rounded bg-foreground/5 animate-pulse" />
            <div className="h-3 w-28 rounded bg-foreground/5 animate-pulse" />
          </div>
          <div className="h-2.5 w-16 rounded bg-foreground/5 animate-pulse" />
        </div>
        <div className="h-6 w-6 rounded bg-foreground/5 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-foreground/5 animate-pulse" />
        <div className="h-3 w-14 rounded bg-foreground/5 animate-pulse" />
        <div className="h-3 w-10 rounded bg-foreground/5 animate-pulse ml-auto" />
      </div>
      <div className="h-4 w-full rounded bg-foreground/5 animate-pulse mb-2" />
      <div className="h-2.5 w-3/4 rounded bg-foreground/5 animate-pulse" />
    </Card>
  );
}

export default function ApiHealthDashboard() {
  const [statuses, setStatuses] = useState<Record<string, EndpointStatus>>(
    () => {
      const s: Record<string, EndpointStatus> = {};
      for (const ep of ENDPOINTS) s[ep.id] = defaultStatus();
      return s;
    },
  );

  // Response time history per endpoint
  const [history, setHistory] = useState<Record<string, number[]>>(() => {
    const h: Record<string, number[]> = {};
    for (const ep of ENDPOINTS) h[ep.id] = [];
    return h;
  });

  // Average response time history (overall)
  const [avgHistory, setAvgHistory] = useState<number[]>([]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const checkEndpoint = useCallback(async (ep: EndpointDef) => {
    setStatuses((prev) => {
      const current = prev[ep.id] ?? defaultStatus();
      const { error: _e, ...rest } = current;
      return { ...prev, [ep.id]: { ...rest, state: "checking" as const } };
    });

    const start = performance.now();
    try {
      const headers: Record<string, string> = {};
      if (ep.healthCheck.body) {
        headers["Content-Type"] = "application/json";
      }
      if (ep.requiresAuth) {
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        } catch {
          // Not authenticated
        }
      }
      const opts: RequestInit = {
        method: ep.healthCheck.method,
        redirect: "follow",
        headers,
      };
      if (ep.healthCheck.body) {
        opts.body = ep.healthCheck.body;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      try {
        const res = await fetch(`${API_ORIGIN}${ep.healthCheck.path}`, { ...opts, signal: controller.signal });
        const time = Math.round(performance.now() - start);

        setStatuses((prev) => ({
          ...prev,
          [ep.id]: {
            state: res.ok || res.status === 302 || res.status === 400 || (ep.requiresAuth && res.status === 401) ? "healthy" : "degraded",
            statusCode: res.status,
            responseTime: time,
            lastChecked: new Date(),
          },
        }));

        // Record history
        setHistory((prev) => ({
          ...prev,
          [ep.id]: [...(prev[ep.id] ?? []).slice(-(MAX_HISTORY_POINTS - 1)), time],
        }));
        setHasLoadedOnce(true);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      const time = Math.round(performance.now() - start);
      setStatuses((prev) => ({
        ...prev,
        [ep.id]: {
          state: "down",
          statusCode: null,
          responseTime: time,
          lastChecked: new Date(),
          error: err instanceof Error
            ? (err.name === "AbortError" ? "Request timed out (10s)" : err.message)
            : "Network error",
        },
      }));

      setHistory((prev) => ({
        ...prev,
        [ep.id]: [...(prev[ep.id] ?? []).slice(-(MAX_HISTORY_POINTS - 1)), time],
      }));
      setHasLoadedOnce(true);
    }
  }, []);

  const refreshAll = useCallback(() => {
    setRefreshCount((c) => c + 1);
    for (const ep of ENDPOINTS) void checkEndpoint(ep);
  }, [checkEndpoint]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refreshAll, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoRefresh, refreshAll]);

  // Update average history when statuses change
  useEffect(() => {
    const times = Object.values(statuses)
      .map((s) => s.responseTime)
      .filter((t): t is number => t !== null);
    if (times.length > 0) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      setAvgHistory((prev) => [...prev.slice(-(MAX_HISTORY_POINTS - 1)), avg]);
    }
  }, [statuses]);

  // Keyboard shortcut: R to refresh all (when not typing in an input)
  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return;
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        refreshAllRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const statusValues = Object.values(statuses);
  const healthy = statusValues.filter((s) => s.state === "healthy").length;
  const degraded = statusValues.filter((s) => s.state === "degraded").length;
  const down = statusValues.filter((s) => s.state === "down").length;
  const times = statusValues
    .map((s) => s.responseTime)
    .filter((t): t is number => t !== null);
  const avgTime =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 sm:pb-0" role="status" aria-live="polite" aria-label="Endpoint health summary">
          <div className="text-center shrink-0">
            <p className="text-xl sm:text-2xl font-mono font-bold text-foreground">
              {ENDPOINTS.length}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Total
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-xl sm:text-2xl font-mono font-bold text-green-400">
              {healthy}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Healthy
            </p>
          </div>
          {degraded > 0 && (
            <div className="text-center shrink-0">
              <p className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">
                {degraded}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Degraded
              </p>
            </div>
          )}
          {down > 0 && (
            <div className="text-center shrink-0">
              <p className="text-xl sm:text-2xl font-mono font-bold text-red-400">
                {down}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Down
              </p>
            </div>
          )}
          {avgTime > 0 && (
            <div className="text-center shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-xl sm:text-2xl font-mono font-bold text-cyan-400">
                  {avgTime}
                  <span className="text-xs sm:text-sm text-foreground/40">ms</span>
                </p>
                <Sparkline points={avgHistory} className="text-cyan-400/60 hidden sm:block" />
              </div>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Avg
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            aria-label={autoRefresh ? "Pause auto-refresh" : "Resume auto-refresh"}
            className={`border-border/30 font-mono text-xs ${
              autoRefresh
                ? "text-green-400 border-green-500/30"
                : "text-foreground/40 border-border/20"
            }`}
          >
            {autoRefresh ? (
              <Pause className="w-3 h-3 mr-1.5" />
            ) : (
              <Play className="w-3 h-3 mr-1.5" />
            )}
            <span className="hidden sm:inline">{autoRefresh ? "Auto" : "Paused"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            aria-label="Refresh all endpoints"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCcw className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh All</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const exportData = ENDPOINTS.map((ep) => {
                const s = statuses[ep.id] ?? defaultStatus();
                return {
                  id: ep.id,
                  name: ep.name,
                  path: ep.path,
                  service: ep.service,
                  state: s.state,
                  statusCode: s.statusCode,
                  responseTime: s.responseTime,
                  lastChecked: s.lastChecked?.toISOString() ?? null,
                  ...(s.error !== undefined && { error: s.error }),
                  responseHistory: history[ep.id] ?? [],
                };
              });
              const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `health-check-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            aria-label="Export health check data as JSON"
            className="border-border/30 text-foreground/40 hover:text-foreground font-mono text-xs"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
          <span className="hidden sm:flex items-center gap-1 text-[9px] text-foreground/20 font-mono">
            <Keyboard className="w-3 h-3" />
            R
          </span>
        </div>
      </div>

      {/* Auto-refresh status line */}
      {autoRefresh && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-foreground/30">
              Auto-refreshing every {AUTO_REFRESH_INTERVAL_MS / 1000}s
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-foreground/20">
              Polls: {refreshCount}
            </span>
            <Badge
              variant="outline"
              className="border-foreground/10 text-foreground/20 text-[9px] font-mono"
            >
              {ENDPOINTS.length} endpoints
            </Badge>
          </div>
        </Card>
      )}

      {/* Endpoint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!hasLoadedOnce
          ? ENDPOINTS.map((ep) => <SkeletonEndpointCard key={ep.id} />)
          : ENDPOINTS.map((ep) => (
              <ApiEndpointCard
                key={ep.id}
                endpoint={ep}
                status={statuses[ep.id] ?? defaultStatus()}
                onRefresh={() => void checkEndpoint(ep)}
                {...(history[ep.id] !== undefined && { responseHistory: history[ep.id] })}
              />
            ))}
      </div>
    </div>
  );
}
