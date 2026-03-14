"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorEntry {
  id: string;
  timestamp: Date;
  type: "error" | "unhandled-rejection" | "network" | "console-error";
  message: string;
  source?: string | undefined;
  stack?: string | undefined;
}

const TYPE_CONFIG: Record<
  ErrorEntry["type"],
  { label: string; icon: typeof XCircle; color: string; badgeColor: string }
> = {
  error: {
    label: "Error",
    icon: XCircle,
    color: "text-red-400",
    badgeColor: "border-red-500/40 text-red-400",
  },
  "unhandled-rejection": {
    label: "Promise",
    icon: Ban,
    color: "text-orange-400",
    badgeColor: "border-orange-500/40 text-orange-400",
  },
  network: {
    label: "Network",
    icon: WifiOff,
    color: "text-yellow-400",
    badgeColor: "border-yellow-500/40 text-yellow-400",
  },
  "console-error": {
    label: "Console",
    icon: AlertTriangle,
    color: "text-amber-400",
    badgeColor: "border-amber-500/40 text-amber-400",
  },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ErrorLogViewer() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  useEffect(() => {
    if (!isCapturing) return;

    const MAX_ERRORS = 100;

    function addError(entry: Omit<ErrorEntry, "id" | "timestamp">) {
      const newEntry: ErrorEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setErrors((prev) => [newEntry, ...prev].slice(0, MAX_ERRORS));
    }

    // Capture window errors
    function handleError(event: ErrorEvent) {
      addError({
        type: "error",
        message: event.message || "Unknown error",
        source: event.filename
          ? `${event.filename}:${event.lineno}:${event.colno}`
          : undefined,
        stack: event.error?.stack,
      });
    }

    // Capture unhandled promise rejections
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      addError({
        type: "unhandled-rejection",
        message:
          reason instanceof Error
            ? reason.message
            : typeof reason === "string"
              ? reason
              : "Unhandled promise rejection",
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    }

    // Intercept console.error
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      originalConsoleError.apply(console, args);
      const message = args
        .map((a) =>
          typeof a === "string"
            ? a
            : a instanceof Error
              ? a.message
              : JSON.stringify(a),
        )
        .join(" ");
      // Skip React internal errors and our own logs
      if (!message.includes("ErrorLogViewer")) {
        addError({
          type: "console-error",
          message: message.slice(0, 500),
        });
      }
    };

    // Intercept failed fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          const url =
            typeof args[0] === "string"
              ? args[0]
              : args[0] instanceof Request
                ? args[0].url
                : String(args[0]);
          addError({
            type: "network",
            message: `${response.status} ${response.statusText}`,
            source: url,
          });
        }
        return response;
      } catch (err) {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof Request
              ? args[0].url
              : String(args[0]);
        addError({
          type: "network",
          message: err instanceof Error ? err.message : "Fetch failed",
          source: url,
        });
        throw err;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      console.error = originalConsoleError;
      window.fetch = originalFetch;
    };
  }, [isCapturing]);

  const errorsByType = errors.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-foreground">
              {errors.length}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Captured
            </p>
          </div>
          {Object.entries(errorsByType).map(([type, count]) => {
            const config = TYPE_CONFIG[type as ErrorEntry["type"]];
            if (!config) return null;
            return (
              <div key={type} className="text-center">
                <p className={`text-2xl font-mono font-bold ${config.color}`}>
                  {count}
                </p>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                  {config.label}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCapturing(!isCapturing)}
            className={`font-mono text-xs ${
              isCapturing
                ? "border-green-500/30 text-green-400"
                : "border-foreground/20 text-foreground/40"
            }`}
          >
            {isCapturing ? (
              <Wifi className="w-3 h-3 mr-1.5" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1.5" />
            )}
            {isCapturing ? "Live" : "Paused"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setErrors([])}
            disabled={errors.length === 0}
            className="border-border/30 text-foreground/40 hover:text-foreground font-mono text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Capture status */}
      {isCapturing && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 px-4 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-foreground/30">
            Capturing browser errors, unhandled rejections, console.error, and failed network requests (5xx)
          </span>
        </Card>
      )}

      {/* Error List */}
      {errors.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-8 text-center">
          <p className="text-foreground/20 font-mono text-sm">
            No errors captured yet
          </p>
          <p className="text-foreground/10 font-mono text-[10px] mt-1">
            Errors will appear here in real time
          </p>
        </Card>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {errors.map((entry) => {
            const config = TYPE_CONFIG[entry.type];
            if (!config) return null;
            const Icon = config.icon;
            const isExpanded = expandedId === entry.id;

            return (
              <Card
                key={entry.id}
                className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 hover:border-border/30 transition-colors cursor-pointer"
                onClick={() =>
                  setExpandedId(isExpanded ? null : entry.id)
                }
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono ${config.badgeColor}`}
                      >
                        {config.label}
                      </Badge>
                      <span className="text-[9px] font-mono text-foreground/20">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-foreground/70 break-all line-clamp-2">
                      {entry.message}
                    </p>
                    {entry.source && (
                      <p className="text-[10px] font-mono text-foreground/30 mt-1 truncate">
                        {entry.source}
                      </p>
                    )}

                    {/* Expanded stack trace */}
                    {isExpanded && entry.stack && (
                      <pre className="mt-2 p-2 bg-black/60 rounded border border-border/10 text-[10px] font-mono text-foreground/40 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {entry.stack}
                      </pre>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
