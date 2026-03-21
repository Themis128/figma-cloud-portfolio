"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface EndpointStatus {
  state: "idle" | "checking" | "healthy" | "degraded" | "down";
  statusCode: number | null;
  responseTime: number | null;
  lastChecked: Date | null;
  error?: string;
}

export interface EndpointDef {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  service: string;
  description: string;
  requiresAuth?: boolean;
  healthCheck: {
    method: string;
    path: string;
    body?: string;
  };
}

interface Props {
  endpoint: EndpointDef;
  status: EndpointStatus;
  onRefresh: () => void;
  responseHistory?: number[] | undefined;
}

type TrendDirection = "improving" | "stable" | "degrading";

/**
 * Compute a trend direction from the last 5 data points.
 * Compares the average of the first 2 vs last 2 of the most recent 5 points.
 * A >10 % change is considered improving (faster) or degrading (slower).
 */
function computeTrend(history: number[]): TrendDirection | null {
  if (history.length < 5) return null;
  const recent5 = history.slice(-5);
  const first2 = ((recent5[0] ?? 0) + (recent5[1] ?? 0)) / 2;
  const last2 = ((recent5[3] ?? 0) + (recent5[4] ?? 0)) / 2;
  if (first2 === 0) return null;
  const change = (last2 - first2) / first2;
  if (change < -0.1) return "improving";
  if (change > 0.1) return "degrading";
  return "stable";
}

const TREND_DISPLAY: Record<TrendDirection, { symbol: string; color: string; label: string }> = {
  improving: { symbol: "\u2193", color: "text-green-400", label: "Improving" },
  stable:    { symbol: "\u2192", color: "text-foreground/40", label: "Stable" },
  degrading: { symbol: "\u2191", color: "text-red-400", label: "Degrading" },
};

const METHOD_COLORS: Record<string, string> = {
  GET: "border-green-500/40 text-green-400",
  POST: "border-blue-500/40 text-blue-400",
  PUT: "border-amber-500/40 text-amber-400",
  DELETE: "border-red-500/40 text-red-400",
};

const STATUS_DOT: Record<string, string> = {
  idle: "bg-foreground/20",
  checking: "bg-cyan-400 animate-ping",
  healthy: "bg-green-400",
  degraded: "bg-yellow-400",
  down: "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  idle: "Idle",
  checking: "Checking...",
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
};

const STATUS_TEXT_COLOR: Record<string, string> = {
  idle: "text-foreground/40",
  checking: "text-cyan-400",
  healthy: "text-green-400",
  degraded: "text-yellow-400",
  down: "text-red-400",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

/** Tiny inline SVG sparkline for response time history */
function MiniSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const width = 60;
  const height = 16;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  });

  // Color based on latest value trend
  const latest = points[points.length - 1] ?? 0;
  const avg = points.reduce((a, b) => a + b, 0) / points.length;
  const color =
    latest <= avg * 1.2
      ? "text-cyan-400/50"
      : latest <= avg * 2
        ? "text-yellow-400/50"
        : "text-red-400/50";

  return (
    <svg
      width={width}
      height={height}
      className={color}
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

const TICK_INTERVAL_MS = 10_000;

export default function ApiEndpointCard({
  endpoint,
  status,
  onRefresh,
  responseHistory,
}: Props) {
  // Re-render every 10s so the "timeAgo" label stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!status.lastChecked) return;
    const id = setInterval(() => setTick((t) => t + 1), TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status.lastChecked]);

  return (
    <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 hover:border-cyan-400/20 hover:bg-card/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${METHOD_COLORS[endpoint.method] ?? ""}`}
            >
              {endpoint.method}
            </Badge>
            <span className="font-mono text-xs text-foreground/80 truncate max-w-45">
              {endpoint.path}
            </span>
          </div>
          <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-wider">
            {endpoint.service}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded hover:bg-foreground/5 text-foreground/40 hover:text-cyan-400 transition-colors"
          title="Refresh"
          aria-label={`Refresh ${endpoint.name} endpoint`}
        >
          <RotateCcw
            className={`w-3.5 h-3.5 ${status.state === "checking" ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center gap-1 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${STATUS_DOT[status.state] ?? ""}`}
          />
          <span className="text-[10px]" aria-hidden="true">
            {status.state === "healthy" ? "\u2713" : status.state === "degraded" ? "\u26A0" : status.state === "down" ? "\u2715" : ""}
          </span>
        </span>
        <span
          className={`text-xs font-mono ${STATUS_TEXT_COLOR[status.state] ?? ""}`}
        >
          {STATUS_LABEL[status.state] ?? "Unknown"}
        </span>
        {status.statusCode !== null && (
          <span className="text-[10px] font-mono text-foreground/30">
            {status.statusCode}
          </span>
        )}
        {status.responseTime !== null && (
          <span className="text-xs font-mono text-cyan-400 ml-auto flex items-center gap-1">
            {status.responseTime}ms
            {responseHistory && (() => {
              const trend = computeTrend(responseHistory);
              if (!trend) return null;
              const display = TREND_DISPLAY[trend];
              return (
                <span
                  className={`text-xs font-bold ${display.color}`}
                  title={`Trend: ${display.label}`}
                  aria-label={`Response time trend: ${display.label}`}
                >
                  {display.symbol}
                </span>
              );
            })()}
          </span>
        )}
      </div>

      {/* Sparkline */}
      {responseHistory && responseHistory.length >= 2 && (
        <div className="mb-2">
          <MiniSparkline points={responseHistory} />
        </div>
      )}

      <p className="text-[10px] text-foreground/40">{endpoint.description}</p>
      {status.error && (
        <p className="text-[10px] text-red-400 mt-1 truncate" title={status.error}>
          {status.error}
        </p>
      )}
      {status.lastChecked && (
        <p className="text-[10px] text-foreground/20 mt-1">
          Checked {timeAgo(status.lastChecked)}
        </p>
      )}
    </Card>
  );
}
