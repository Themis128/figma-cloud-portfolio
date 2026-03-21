"use client";

import { Bell, BellOff, BellRing, ExternalLink, Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiOrigin } from "@/lib/admin-constants";

const LAST_SEEN_KEY = "site-announcements-last-seen";
const READ_IDS_KEY = "site-announcements-read";
const PUSH_NOTIFICATIONS_KEY = "site-push-notifications";
const MAX_PUSH_NOTIFICATIONS = 20;

// Site announcements — update this array to show new items to visitors.
// IDs must be chronologically sortable strings (e.g. "YYYY-MM-DD-slug").
// Optional `href` adds a "View" link. Optional `expires` auto-hides after that date.
const ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: "2026-03-10-performance",
    title: "Performance Dashboard Live",
    description:
      "Check out the new /performance page — real-time Web Vitals and industry benchmarks.",
    href: "/performance/",
  },
  {
    id: "2026-03-10-agents",
    title: "AI Agents Showcase",
    description:
      "Explore the /agents page to see AI-powered automation workflows.",
    href: "/agents/",
  },
];

interface Announcement {
  id: string;
  title: string;
  description: string;
  /** Optional link to the relevant page */
  href?: string;
  /** ISO date string — announcement hidden after this date */
  expires?: string;
  /** Whether this came from a push notification */
  isPush?: boolean;
  /** Timestamp for push notifications */
  receivedAt?: string;
}

/** Load push notifications from localStorage */
function getPushNotifications(): Announcement[] {
  const raw = storageGet(PUSH_NOTIFICATIONS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Announcement[];
  } catch { /* ignore */ }
  return [];
}

/** Save a new push notification to localStorage */
function savePushNotification(notification: Announcement): void {
  const existing = getPushNotifications();
  // Avoid duplicates by ID
  if (existing.some((n) => n.id === notification.id)) return;
  const updated = [notification, ...existing].slice(0, MAX_PUSH_NOTIFICATIONS);
  storageSet(PUSH_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/** Safe localStorage wrapper */
function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail
  }
}

function getReadIds(): Set<string> {
  const raw = storageGet(READ_IDS_KEY);
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveReadIds(ids: Set<string>): void {
  storageSet(READ_IDS_KEY, JSON.stringify([...ids]));
}

/** Filter out expired announcements */
function getActiveAnnouncements(): readonly Announcement[] {
  const now = new Date().toISOString();
  return ANNOUNCEMENTS.filter((a) => !a.expires || a.expires > now);
}

/** Convert a base64url string to ArrayBuffer (for VAPID applicationServerKey). */
function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; ++i) view[i] = raw.charCodeAt(i);
  return buf;
}

export function NotificationButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  // Push subscription state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushNotifications, setPushNotifications] = useState<Announcement[]>([]);

  // Merge static announcements + push notifications
  const staticActive = getActiveAnnouncements();
  const allItems = mounted
    ? [...pushNotifications, ...staticActive]
    : [...staticActive];
  const unreadCount = mounted
    ? allItems.filter((a) => !readIds.has(a.id)).length
    : 0;

  // Check push support, load saved push notifications, and listen for SW messages
  useEffect(() => {
    setMounted(true);
    setReadIds(getReadIds());
    setPushNotifications(getPushNotifications());

    // Check Web Push API support
    if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
      setPushSupported(true);
      // Check if already subscribed
      navigator.serviceWorker.getRegistration("/sw.js").then((reg) => {
        if (reg) {
          reg.pushManager.getSubscription().then((sub) => {
            setPushSubscribed(sub !== null);
          }).catch(() => { /* ignore */ });
        }
      }).catch(() => { /* ignore */ });
    }

    // Listen for push notifications forwarded from the service worker
    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_RECEIVED") {
        const { title, body, url } = event.data;
        const notification: Announcement = {
          id: `push-${Date.now()}`,
          title: title ?? "New Notification",
          description: body ?? "",
          ...(url ? { href: url } : {}),
          isPush: true,
          receivedAt: new Date().toISOString(),
        };
        savePushNotification(notification);
        setPushNotifications(getPushNotifications());
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleSwMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleSwMessage);
    };
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!pushSupported || pushLoading) return;
    setPushLoading(true);
    try {
      // 1. Request notification permission (skip if already granted)
      let permission = Notification.permission;
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") {
        setPushLoading(false);
        return;
      }

      // 2. Get an active SW registration — use navigator.serviceWorker.ready
      //    which resolves when any SW controlling this page is active
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("SW ready timeout")), 5000),
        ),
      ]).catch(async () => {
        // Fallback: register fresh and wait
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (reg.active) return reg;
        return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("SW activation timeout")), 8000);
          const sw = reg.installing ?? reg.waiting;
          if (!sw) { clearTimeout(timeout); reject(new Error("No SW")); return; }
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") { clearTimeout(timeout); resolve(reg); }
          });
        });
      });

      // 3. Get VAPID public key from server
      const origin = getApiOrigin();
      const vapidRes = await fetch(`${origin}/api/push-notifications?action=vapid-public-key`);
      if (!vapidRes.ok) throw new Error("Failed to get VAPID key");
      const { publicKey } = await vapidRes.json() as { publicKey: string };

      // 4. Clear any stale subscription (different VAPID key causes hang)
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      // 5. Subscribe via Push API
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(publicKey),
      });

      // 5. Send subscription to server
      const subJSON = subscription.toJSON();
      const putRes = await fetch(`${origin}/api/push-notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys,
        }),
      });

      if (!putRes.ok) throw new Error("Failed to store subscription");
      setPushSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err instanceof Error ? err.message : err);
    } finally {
      setPushLoading(false);
    }
  }, [pushSupported, pushLoading]);

  // Global timeout wrapper — ensures subscribe never hangs forever
  const handleSubscribe = useCallback(async () => {
    const timeout = setTimeout(() => {
      console.error("Push subscribe global timeout (15s)");
      setPushLoading(false);
    }, 15000);
    await subscribeToPush();
    clearTimeout(timeout);
  }, [subscribeToPush]);

  const unsubscribeFromPush = useCallback(async () => {
    if (pushLoading) return;
    setPushLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Remove from server
          const origin = getApiOrigin();
          await fetch(
            `${origin}/api/push-notifications?endpoint=${encodeURIComponent(subscription.endpoint)}`,
            { method: "DELETE" },
          );
          // Unsubscribe locally
          await subscription.unsubscribe();
        }
      }
      setPushSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    } finally {
      setPushLoading(false);
    }
  }, [pushLoading]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const markAllRead = useCallback(() => {
    const ids = new Set(allItems.map((a) => a.id));
    setReadIds(ids);
    saveReadIds(ids);
    const latestId = allItems[allItems.length - 1]?.id;
    if (latestId) storageSet(LAST_SEEN_KEY, latestId);
  }, [allItems]);

  const togglePanel = () => {
    const next = !open;
    setOpen(next);
    // Mark all as read when opening
    if (next && unreadCount > 0) {
      markAllRead();
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <Button
        onClick={togglePanel}
        variant="outline"
        size="icon"
        className={`relative border-border/40 hover:border-cyan-400/60 hover:bg-transparent ${
          open ? "border-cyan-400/60 text-cyan-300" : ""
        }`}
        aria-label={
          unreadCount > 0
            ? `${unreadCount} new announcements`
            : "Announcements"
        }
        aria-expanded={open}
      >
        {open ? (
          <Bell className="h-[1.2rem] w-[1.2rem] text-cyan-400" />
        ) : (
          <Bell className="h-[1.2rem] w-[1.2rem]" />
        )}

        {/* Unseen badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-slate-900">
              {unreadCount}
            </span>
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-cyan-400/20 bg-slate-900/95 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.1)] z-50"
          role="dialog"
          aria-label="Announcements"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-400/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-cyan-400">
                Announcements
              </h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Close announcements"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Announcement list */}
          <div className="max-h-72 overflow-y-auto">
            {allItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                <BellOff className="h-6 w-6" />
                <p className="text-xs">No announcements right now</p>
              </div>
            ) : (
              <ul className="divide-y divide-cyan-400/10">
                {[...allItems].reverse().map((announcement) => {
                  const isRead = readIds.has(announcement.id);
                  return (
                    <li
                      key={announcement.id}
                      className={`px-4 py-3 transition-colors ${
                        isRead
                          ? "opacity-60"
                          : announcement.isPush
                            ? "bg-purple-400/5"
                            : "bg-cyan-400/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread dot */}
                        <div className="mt-1.5 shrink-0">
                          {!isRead ? (
                            <span className={`block h-2 w-2 rounded-full ${announcement.isPush ? "bg-purple-400" : "bg-cyan-400"}`} />
                          ) : (
                            <span className="block h-2 w-2 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-200">
                              {announcement.title}
                            </p>
                            {announcement.isPush && (
                              <span className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/20">
                                Push
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                            {announcement.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {announcement.href && (
                              <Link
                                href={announcement.href}
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                              >
                                Check it out
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                            {announcement.receivedAt && (
                              <span className="text-[10px] text-slate-600 font-mono">
                                {new Date(announcement.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Push Subscription Toggle */}
          {pushSupported && (
            <div className="border-t border-cyan-400/10 px-4 py-3">
              <button
                onClick={() => void (pushSubscribed ? unsubscribeFromPush() : handleSubscribe())}
                disabled={pushLoading}
                className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  pushSubscribed
                    ? "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                    : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20"
                } ${pushLoading ? "opacity-50 cursor-wait" : ""}`}
                aria-label={pushSubscribed ? "Unsubscribe from push notifications" : "Subscribe to push notifications"}
              >
                <BellRing className="w-3.5 h-3.5" />
                {pushLoading
                  ? "Processing..."
                  : pushSubscribed
                    ? "Subscribed — tap to unsubscribe"
                    : "Get push notifications"}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-cyan-400/10 px-4 py-2">
            <p className="text-[10px] text-slate-500 text-center font-mono">
              {allItems.length} item{allItems.length !== 1 ? "s" : ""}
              {pushNotifications.length > 0 && (
                <span className="text-purple-400/60"> · {pushNotifications.length} push</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
