"use client";

import { RotateCcw } from "lucide-react";
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
}

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

export default function ApiEndpointCard({ endpoint, status, onRefresh }: Props) {
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
        >
          <RotateCcw
            className={`w-3.5 h-3.5 ${status.state === "checking" ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status.state] ?? ""}`}
        />
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
          <span className="text-xs font-mono text-cyan-400 ml-auto">
            {status.responseTime}ms
          </span>
        )}
      </div>

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
