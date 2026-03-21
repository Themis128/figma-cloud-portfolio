"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { Keyboard, Play, RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD";

interface ConsoleResponse {
  status: number;
  statusText: string;
  body: string;
  timing: number;
}

interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  timing: number;
  timestamp: Date;
}

const PRESETS = [
  { label: "Ping", method: "GET" as HttpMethod, url: "/api/ping" },
  { label: "Health", method: "GET" as HttpMethod, url: "/api/health" },
  { label: "Slots", method: "GET" as HttpMethod, url: "/api/booking/slots" },
  { label: "API Keys", method: "GET" as HttpMethod, url: "/api/organizations/api_keys" },
  { label: "Subscriptions", method: "GET" as HttpMethod, url: "/api/push-notifications?action=subscriptions" },
];

const STATUS_COLOR: Record<string, string> = {
  "2": "text-green-400 border-green-500/40",
  "3": "text-blue-400 border-blue-500/40",
  "4": "text-yellow-400 border-yellow-500/40",
  "5": "text-red-400 border-red-500/40",
};

function getStatusColor(status: number): string {
  return STATUS_COLOR[String(Math.floor(status / 100))] ?? "text-foreground/60 border-border/40";
}

function syntaxHighlight(json: string): string {
  return json
    .replace(
      /("(?:\\.|[^"\\])*")\s*:/g,
      '<span class="text-foreground/80">$1</span>:',
    )
    .replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span class="text-green-400">$1</span>',
    )
    .replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span class="text-cyan-400">$1</span>',
    )
    .replace(
      /:\s*(true|false|null)/g,
      ': <span class="text-purple-400">$1</span>',
    );
}

export default function ApiConsole() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("/api/ping");
  const [body, setBody] = useState("");
  const [showBody, setShowBody] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ConsoleResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const execute = useCallback(async () => {
    if (!url.startsWith("/")) {
      setResponse({ status: 0, statusText: "Invalid URL", body: "URL must start with / to prevent external requests", timing: 0 });
      return;
    }
    setIsLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const headers: Record<string, string> = {};
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch {
        // Not authenticated
      }
      const opts: RequestInit = { method, redirect: "follow", headers };
      if (["POST", "PUT", "DELETE"].includes(method) && body.trim()) {
        headers["Content-Type"] = "application/json";
        opts.body = body;
      }

      const res = await fetch(url, opts);
      const timing = Math.round(performance.now() - start);
      let resBody: string;
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("json") || ct.includes("text/event-stream")) {
        const text = await res.text();
        try {
          resBody = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          resBody = text;
        }
      } else if (ct.includes("text")) {
        resBody = await res.text();
      } else {
        resBody = `[Binary response: ${ct || "unknown content-type"}]`;
      }

      setResponse({ status: res.status, statusText: res.statusText, body: resBody, timing });
      setHistory((prev) => [
        { id: crypto.randomUUID(), method, url, status: res.status, timing, timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      const timing = Math.round(performance.now() - start);
      const msg = err instanceof Error ? err.message : "Network error";
      setResponse({ status: 0, statusText: "Error", body: msg, timing });
      setHistory((prev) => [
        { id: crypto.randomUUID(), method, url, status: 0, timing, timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [method, url, body]);

  function applyPreset(preset: (typeof PRESETS)[0]) {
    setMethod(preset.method);
    setUrl(preset.url);
    setBody("");
    setShowBody(false);
  }

  function replayHistory(entry: HistoryEntry) {
    setMethod(entry.method);
    setUrl(entry.url);
  }

  // Keyboard shortcut: Ctrl/Cmd+Enter to execute
  const executeRef = useRef(execute);
  executeRef.current = execute;
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        void executeRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const needsBody = ["POST", "PUT", "DELETE"].includes(method);

  return (
    <div className="space-y-6">
      {/* Request Builder */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
          Request
        </p>

        <div className="flex gap-2">
          <Select
            value={method}
            onValueChange={(v) => {
              setMethod(v as HttpMethod);
              if (!["POST", "PUT", "DELETE"].includes(v)) setShowBody(false);
            }}
          >
            <SelectTrigger className="w-30 font-mono text-sm bg-background/50 border-border/30" aria-label="HTTP method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"] as const).map(
                (m) => (
                  <SelectItem key={m} value={m} className="font-mono">
                    {m}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/api/..."
            aria-label="Request URL"
            className="flex-1 font-mono text-sm bg-background/50 border-border/30 focus:border-cyan-500/50"
          />
          <Button
            onClick={() => void execute()}
            disabled={isLoading || !url.trim()}
            aria-label="Send request"
            className="bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-40"
          >
            {isLoading ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Send</span>
          </Button>
          <span className="hidden sm:flex items-center gap-1 text-[9px] text-foreground/20 font-mono shrink-0">
            <Keyboard className="w-3 h-3" />
            Ctrl+Enter
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-2 py-1 rounded text-[10px] font-mono border border-border/20 text-foreground/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Body toggle + textarea */}
        {needsBody && (
          <div>
            <button
              onClick={() => setShowBody(!showBody)}
              className="text-[10px] font-mono text-foreground/40 hover:text-foreground/60 mb-2"
            >
              {showBody ? "- Hide body" : "+ Show body"}
            </button>
            {showBody && (
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-xs bg-background/50 border-border/30 min-h-20"
              />
            )}
          </div>
        )}
      </Card>

      {/* Response Viewer */}
      {response && (
        <Card className="bg-black/80 border border-border/20 rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/10">
            <span className="font-mono text-xs text-cyan-400">
              $ {method} {url}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${getStatusColor(response.status)}`}
            >
              {response.status} {response.statusText}
            </Badge>
            <span className="font-mono text-[10px] text-cyan-400/60 ml-auto">
              {response.timing}ms
            </span>
          </div>
          <div className="p-4 max-h-100 overflow-auto">
            <pre
              className="font-mono text-xs text-foreground/80 whitespace-pre-wrap wrap-break-word"
              dangerouslySetInnerHTML={{
                __html: response.body.startsWith("{") || response.body.startsWith("[")
                  ? syntaxHighlight(response.body)
                  : response.body,
              }}
            />
          </div>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              History ({history.length})
            </p>
            <button
              onClick={() => setHistory([])}
              className="text-foreground/30 hover:text-foreground/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1 max-h-50 overflow-auto" role="log" aria-label="Request history">
            {history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => replayHistory(entry)}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded text-left hover:bg-foreground/5 transition-colors"
              >
                <span
                  className={`font-mono text-[10px] w-12 ${
                    entry.method === "GET"
                      ? "text-green-400"
                      : entry.method === "POST"
                        ? "text-blue-400"
                        : entry.method === "DELETE"
                          ? "text-red-400"
                          : "text-amber-400"
                  }`}
                >
                  {entry.method}
                </span>
                <span className="font-mono text-[10px] text-foreground/60 flex-1 truncate">
                  {entry.url}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono ${getStatusColor(entry.status)}`}
                >
                  {entry.status}
                </Badge>
                <span className="font-mono text-[10px] text-cyan-400/50 w-14 text-right">
                  {entry.timing}ms
                </span>
                <span className="font-mono text-[9px] text-foreground/20 w-16 text-right">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
