"use client";

import {
  AlertTriangle,
  Ban,
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Download,
  Search,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/* ─── Types ─── */

type ErrorType = "error" | "unhandled-rejection" | "network" | "console-error";
type Severity = "critical" | "error" | "warning" | "info";

interface ErrorEntry {
  id: string;
  timestamp: Date;
  type: ErrorType;
  severity: Severity;
  message: string;
  source?: string | undefined;
  stack?: string | undefined;
}

interface GroupedError {
  key: string;
  latest: ErrorEntry;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  entries: ErrorEntry[];
}

/* ─── Constants ─── */

const SESSION_KEY = "admin-error-log";
const MAX_ERRORS = 200;
const SPARKLINE_BUCKETS = 30;
const SPARKLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const SEVERITY_MAP: Record<ErrorType, Severity> = {
  "unhandled-rejection": "critical",
  error: "error",
  "console-error": "warning",
  network: "info",
};

const TYPE_CONFIG: Record<
  ErrorType,
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

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-500" },
  error: { label: "Error", color: "text-red-400" },
  warning: { label: "Warning", color: "text-amber-400" },
  info: { label: "Info", color: "text-yellow-400" },
};

/* ─── Helpers ─── */

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function sanitizeSensitiveData(text: string): string {
  return text
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[REDACTED]")
    .replace(/(?:Authorization|Bearer)\s*[:=]\s*\S+/gi, "Authorization: [REDACTED]")
    .replace(/\b(?:sk-|key_|tok_)[A-Za-z0-9_-]{8,}/g, "[REDACTED]")
    .replace(/token=[A-Za-z0-9_.-]{8,}/gi, "token=[REDACTED]")
    .replace(/(?:api_?key|apikey|secret)=[A-Za-z0-9_.-]{8,}/gi, "$<key>=[REDACTED]")
    .replace(/(?:password|secret|credential|token)\s*[:=]\s*["']?[A-Za-z0-9_/+=.-]{12,}["']?/gi, "[REDACTED]");
}

/** Create a grouping key from an error entry */
function groupKey(entry: ErrorEntry): string {
  return `${entry.type}::${entry.message.slice(0, 200)}::${entry.source ?? ""}`;
}

/** Load errors from sessionStorage */
function loadFromSession(): ErrorEntry[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
    return parsed.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp as string),
    })) as ErrorEntry[];
  } catch {
    return [];
  }
}

/** Save errors to sessionStorage */
function saveToSession(errors: ErrorEntry[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(errors.slice(0, MAX_ERRORS)));
  } catch {
    // quota exceeded — silently fail
  }
}

/** Play a short beep sound for error alerts */
function playAlertSound(): void {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gain.gain.value = 0.1;
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // AudioContext not available
  }
}

/* ─── Sparkline Component ─── */

function ErrorRateSparkline({ errors }: { errors: ErrorEntry[] }) {
  const now = Date.now();
  const bucketSize = SPARKLINE_WINDOW_MS / SPARKLINE_BUCKETS;
  const buckets = new Array<number>(SPARKLINE_BUCKETS).fill(0);

  for (const e of errors) {
    const age = now - e.timestamp.getTime();
    if (age < SPARKLINE_WINDOW_MS) {
      const idx = SPARKLINE_BUCKETS - 1 - Math.floor(age / bucketSize);
      if (idx >= 0 && idx < SPARKLINE_BUCKETS && buckets[idx] !== undefined) {
        buckets[idx]++;
      }
    }
  }

  const max = Math.max(...buckets, 1);
  const svgW = 120;
  const svgH = 24;
  const barW = svgW / SPARKLINE_BUCKETS;

  return (
    <div className="flex items-center gap-2">
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="block"
        aria-label={`Error rate: ${errors.length} errors in the last 5 minutes`}
        role="img"
      >
        {buckets.map((count, i) => {
          const h = (count / max) * svgH;
          return (
            <rect
              key={i}
              x={i * barW}
              y={svgH - h}
              width={barW - 0.5}
              height={h}
              className={count > 0 ? "fill-red-400/60" : "fill-foreground/5"}
              rx={0.5}
            />
          );
        })}
      </svg>
      <span className="text-[9px] font-mono text-foreground/30">5m</span>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ErrorLogViewer() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<ErrorType>>(
    new Set(["error", "unhandled-rejection", "network", "console-error"]),
  );
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState(true);

  const errorsRef = useRef(errors);
  const listRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef(soundEnabled);

  // Keep refs in sync
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);
  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  // Load from sessionStorage on mount
  useEffect(() => {
    const saved = loadFromSession();
    if (saved.length > 0) setErrors(saved);
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    saveToSession(errors);
  }, [errors]);

  // Auto-scroll to top when new errors arrive
  useEffect(() => {
    if (isCapturing && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [errors.length, isCapturing]);

  // Error capture listeners
  useEffect(() => {
    if (!isCapturing) return;

    function addError(entry: Omit<ErrorEntry, "id" | "timestamp" | "severity">) {
      const newEntry: ErrorEntry = {
        ...entry,
        severity: SEVERITY_MAP[entry.type],
        message: sanitizeSensitiveData(entry.message),
        ...(entry.source !== undefined && { source: sanitizeSensitiveData(entry.source) }),
        ...(entry.stack !== undefined && { stack: sanitizeSensitiveData(entry.stack) }),
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setErrors((prev) => [newEntry, ...prev].slice(0, MAX_ERRORS));
      if (soundRef.current) playAlertSound();
    }

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

    const originalConsoleError = console.error; // eslint-disable-line no-console
    console.error = (...args: unknown[]) => { // eslint-disable-line no-console
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
      if (!message.includes("ErrorLogViewer")) {
        addError({
          type: "console-error",
          message: message.slice(0, 500),
        });
      }
    };

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
      console.error = originalConsoleError; // eslint-disable-line no-console
      window.fetch = originalFetch;
    };
  }, [isCapturing]);

  /* ─── Filtering & Grouping ─── */

  const filteredErrors = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return errors.filter((e) => {
      if (!activeFilters.has(e.type)) return false;
      if (query && !e.message.toLowerCase().includes(query) && !(e.source?.toLowerCase().includes(query))) {
        return false;
      }
      return true;
    });
  }, [errors, activeFilters, searchQuery]);

  const groupedErrors = useMemo((): GroupedError[] => {
    if (!groupMode) {
      return filteredErrors.map((e) => ({
        key: e.id,
        latest: e,
        count: 1,
        firstSeen: e.timestamp,
        lastSeen: e.timestamp,
        entries: [e],
      }));
    }

    const groups = new Map<string, GroupedError>();
    for (const entry of filteredErrors) {
      const k = groupKey(entry);
      const existing = groups.get(k);
      if (existing) {
        existing.count++;
        existing.entries.push(entry);
        if (entry.timestamp < existing.firstSeen) existing.firstSeen = entry.timestamp;
        if (entry.timestamp > existing.lastSeen) existing.lastSeen = entry.timestamp;
        // latest is always the most recent (filteredErrors is newest-first)
        if (!existing.latest || entry.timestamp > existing.latest.timestamp) {
          existing.latest = entry;
        }
      } else {
        groups.set(k, {
          key: k,
          latest: entry,
          count: 1,
          firstSeen: entry.timestamp,
          lastSeen: entry.timestamp,
          entries: [entry],
        });
      }
    }
    return Array.from(groups.values());
  }, [filteredErrors, groupMode]);

  const errorsByType = useMemo(() => {
    return errors.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] ?? 0) + 1;
      return acc;
    }, {});
  }, [errors]);

  /* ─── Actions ─── */

  const toggleFilter = useCallback((type: ErrorType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const copyError = useCallback(async (entry: ErrorEntry) => {
    const text = [
      `[${entry.type.toUpperCase()}] ${formatTime(entry.timestamp)}`,
      entry.message,
      entry.source ? `Source: ${entry.source}` : "",
      entry.stack ? `\nStack:\n${entry.stack}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(entry.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const exportJSON = useCallback(() => {
    const exportData = errors.map((e) => ({
      ...e,
      timestamp: e.timestamp.toISOString(),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [errors]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─── Header Stats ─── */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
          <div className="text-center shrink-0">
            <p className="text-xl sm:text-2xl font-mono font-bold text-foreground">
              {errors.length}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Captured
            </p>
          </div>
          {(Object.keys(TYPE_CONFIG) as ErrorType[]).map((type) => {
            const config = TYPE_CONFIG[type];
            const count = errorsByType[type] ?? 0;
            const isActive = activeFilters.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`text-center shrink-0 transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
                aria-label={`${isActive ? "Hide" : "Show"} ${config.label} errors (${count})`}
                aria-pressed={isActive}
                title={`${isActive ? "Hide" : "Show"} ${config.label} errors`}
              >
                <p className={`text-xl sm:text-2xl font-mono font-bold ${config.color}`}>
                  {count}
                </p>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                  {config.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Sparkline */}
        <ErrorRateSparkline errors={errors} />
      </div>

      {/* ─── Toolbar ─── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search errors..."
            className="w-full pl-8 pr-3 py-1.5 bg-card/40 border border-border/20 rounded-lg text-xs font-mono text-foreground/70 placeholder:text-foreground/20 focus:outline-none focus:border-cyan-400/40"
            aria-label="Search error messages"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupMode(!groupMode)}
            aria-label={groupMode ? "Show individual errors" : "Group identical errors"}
            aria-pressed={groupMode}
            className={`font-mono text-xs ${groupMode ? "border-cyan-500/30 text-cyan-400" : "border-border/30 text-foreground/40"}`}
          >
            {groupMode ? "Grouped" : "Flat"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "Disable error sound alerts" : "Enable error sound alerts"}
            aria-pressed={soundEnabled}
            className={`font-mono text-xs ${soundEnabled ? "border-amber-500/30 text-amber-400" : "border-border/30 text-foreground/40"}`}
          >
            {soundEnabled ? (
              <Bell className="w-3 h-3 mr-1" />
            ) : (
              <BellOff className="w-3 h-3 mr-1" />
            )}
            Sound
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCapturing(!isCapturing)}
            aria-label={isCapturing ? "Pause error capturing" : "Resume error capturing"}
            className={`font-mono text-xs ${
              isCapturing
                ? "border-green-500/30 text-green-400"
                : "border-foreground/20 text-foreground/40"
            }`}
          >
            {isCapturing ? (
              <Wifi className="w-3 h-3 mr-1" />
            ) : (
              <WifiOff className="w-3 h-3 mr-1" />
            )}
            {isCapturing ? "Live" : "Paused"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportJSON}
            disabled={errors.length === 0}
            aria-label="Export error logs as JSON"
            className="border-border/30 text-foreground/40 hover:text-foreground font-mono text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setErrors([]);
              try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
            }}
            disabled={errors.length === 0}
            aria-label="Clear all captured errors"
            className="border-border/30 text-foreground/40 hover:text-foreground font-mono text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* ─── Capture Status ─── */}
      {isCapturing && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 px-3 sm:px-4 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-mono text-foreground/30">
            <span className="hidden sm:inline">
              Capturing browser errors, unhandled rejections, console.error, and failed network requests (5xx)
              {searchQuery && ` · filtered by "${searchQuery}"`}
              {activeFilters.size < 4 && ` · ${activeFilters.size} type${activeFilters.size !== 1 ? "s" : ""} shown`}
            </span>
            <span className="sm:hidden">Capturing errors in real time</span>
          </span>
        </Card>
      )}

      {/* ─── Error List ─── */}
      {filteredErrors.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-6 sm:p-8 text-center">
          <p className="text-foreground/20 font-mono text-sm">
            {errors.length === 0
              ? "No errors captured yet"
              : "No errors match current filters"}
          </p>
          <p className="text-foreground/10 font-mono text-[10px] mt-1">
            {errors.length === 0
              ? "Errors will appear here in real time"
              : `${errors.length} error${errors.length !== 1 ? "s" : ""} hidden by filters`}
          </p>
        </Card>
      ) : (
        <div
          ref={listRef}
          className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto"
          role="log"
          aria-live="polite"
          aria-label="Captured error log"
        >
          {groupedErrors.map((group) => {
            const entry = group.latest;
            const config = TYPE_CONFIG[entry.type];
            if (!config) return null;
            const Icon = config.icon;
            const isExpanded = expandedId === group.key;
            const severityInfo = SEVERITY_CONFIG[entry.severity];
            const isCopied = copied === entry.id;

            return (
              <Card
                key={group.key}
                className="bg-card/40 backdrop-blur-sm border border-border/20 p-2.5 sm:p-3 hover:border-border/30 transition-colors cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : group.key)}
              >
                <div className="flex items-start gap-2">
                  {/* Expand indicator */}
                  <div className="mt-0.5 shrink-0">
                    {isExpanded ? (
                      <ChevronDown className={`w-3.5 h-3.5 ${config.color}`} />
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 ${config.color}`} />
                    )}
                  </div>
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono ${config.badgeColor}`}
                      >
                        {config.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono border-foreground/10 ${severityInfo.color}`}
                      >
                        {severityInfo.label}
                      </Badge>
                      {group.count > 1 && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono border-cyan-500/30 text-cyan-400"
                        >
                          ×{group.count}
                        </Badge>
                      )}
                      <span className="text-[9px] font-mono text-foreground/20">
                        {formatTime(entry.timestamp)}
                        {group.count > 1 && (
                          <span className="text-foreground/15">
                            {" "}(first {formatTime(group.firstSeen)})
                          </span>
                        )}
                      </span>
                      {/* Copy button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyError(entry);
                        }}
                        className="ml-auto shrink-0 p-0.5 rounded text-foreground/20 hover:text-foreground/50 transition-colors"
                        aria-label={`Copy error: ${entry.message.slice(0, 50)}`}
                        title="Copy to clipboard"
                      >
                        <ClipboardCopy className={`w-3 h-3 ${isCopied ? "text-green-400" : ""}`} />
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-foreground/70 break-all line-clamp-2">
                      {entry.message}
                    </p>
                    {entry.source && (
                      <p className="text-[10px] font-mono text-foreground/30 mt-1 truncate">
                        {entry.source}
                      </p>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-2 space-y-2">
                        {/* Stack trace */}
                        {entry.stack && (
                          <pre className="p-2 bg-black/60 rounded border border-border/10 text-[10px] font-mono text-foreground/40 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {entry.stack}
                          </pre>
                        )}

                        {/* Occurrence history for grouped errors */}
                        {group.count > 1 && (
                          <div className="p-2 bg-black/30 rounded border border-border/10">
                            <p className="text-[9px] font-mono text-foreground/30 mb-1.5 uppercase tracking-wider">
                              Occurrences ({group.count})
                            </p>
                            <div className="space-y-0.5 max-h-24 overflow-y-auto">
                              {group.entries.map((e) => (
                                <div
                                  key={e.id}
                                  className="text-[9px] font-mono text-foreground/25 flex items-center gap-2"
                                >
                                  <span className="w-1 h-1 rounded-full bg-foreground/15 shrink-0" />
                                  {formatTime(e.timestamp)}
                                  {e.source && (
                                    <span className="truncate text-foreground/15">{e.source}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Footer ─── */}
      {errors.length > 0 && (
        <div className="text-center">
          <p className="text-[10px] font-mono text-foreground/20">
            {filteredErrors.length} of {errors.length} errors shown
            {groupMode && groupedErrors.length !== filteredErrors.length && (
              <span> · {groupedErrors.length} group{groupedErrors.length !== 1 ? "s" : ""}</span>
            )}
            {" · "}max {MAX_ERRORS}
          </p>
        </div>
      )}
    </div>
  );
}
