"use client";

import { Bell, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface PushMessage {
  id: string;
  title: string;
  body: string;
  url?: string;
}

const TOAST_DURATION = 8000; // auto-dismiss after 8s

export default function PushToast() {
  const [toasts, setToasts] = useState<PushMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_RECEIVED") {
        const msg: PushMessage = {
          id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: event.data.title ?? "Notification",
          body: event.data.body ?? "",
          url: event.data.url,
        };
        setToasts((prev) => [msg, ...prev].slice(0, 5));

        // Auto-dismiss
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== msg.id));
        }, TOAST_DURATION);
      }
    };

    // Listen on SW container (production) and window (fallback for tests/SSE)
    navigator.serviceWorker.addEventListener("message", handler);
    window.addEventListener("message", handler);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
      window.removeEventListener("message", handler);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-right-full fade-in duration-300 rounded-xl border border-cyan-400/30 bg-slate-900/95 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden"
          style={{ animationDelay: `${i * 50}ms` }}
          role="alert"
        >
          {/* Cyan top accent line */}
          <div className="h-[2px] bg-linear-to-r from-cyan-400 to-blue-500" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white font-mono leading-tight">
                  {toast.title}
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {toast.body}
                </p>
                {toast.url && toast.url !== "/" && (
                  <Link
                    href={toast.url}
                    onClick={() => dismiss(toast.id)}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-medium transition-colors"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar — auto-dismiss countdown */}
          <div className="h-[2px] bg-slate-800">
            <div
              className="h-full bg-cyan-400/40 rounded-full"
              style={{
                animation: `shrink ${TOAST_DURATION}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
