"use client";

import { Bell, BellOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "site-announcements-enabled";
const LAST_SEEN_KEY = "site-announcements-last-seen";

// Site announcements — update this array to show new toasts to visitors.
// IDs must be chronologically sortable strings (e.g. "YYYY-MM-DD-slug").
const ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: "2026-03-10-performance",
    title: "Performance Dashboard Live",
    description:
      "Check out the new /performance page — real-time Web Vitals and industry benchmarks.",
  },
  {
    id: "2026-03-10-agents",
    title: "AI Agents Showcase",
    description:
      "Explore the /agents page to see AI-powered automation workflows.",
  },
];

interface Announcement {
  id: string;
  title: string;
  description: string;
}

/** Safe localStorage wrapper — returns null on any error (private mode, quota, etc.) */
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
    // Silently fail — storage full or unavailable
  }
}

export function NotificationButton() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(storageGet(STORAGE_KEY) === "true");
  }, []);

  const showUnseenAnnouncements = useCallback(() => {
    if (ANNOUNCEMENTS.length === 0) return;

    const lastSeen = storageGet(LAST_SEEN_KEY) ?? "";
    const unseen = ANNOUNCEMENTS.filter((a) => a.id > lastSeen);
    if (unseen.length === 0) return;

    for (const announcement of unseen) {
      toast(announcement.title, {
        description: announcement.description,
        duration: 8000,
      });
    }

    const latestId = ANNOUNCEMENTS[ANNOUNCEMENTS.length - 1]?.id;
    if (latestId) {
      storageSet(LAST_SEEN_KEY, latestId);
    }
  }, []);

  // Show unseen announcements on page load when enabled
  useEffect(() => {
    if (!mounted || !enabled) return;
    const timer = setTimeout(showUnseenAnnouncements, 2000);
    return () => clearTimeout(timer);
  }, [mounted, enabled, showUnseenAnnouncements]);

  const toggle = () => {
    if (!mounted) return;

    const next = !enabled;
    setEnabled(next);
    storageSet(STORAGE_KEY, String(next));

    if (next) {
      toast.success("Announcements enabled", {
        description: "You'll see site updates when you visit.",
      });
      setTimeout(showUnseenAnnouncements, 500);
    } else {
      toast("Announcements disabled", {
        description: "You won't see site update toasts.",
      });
    }
  };

  if (!mounted) return null;

  return (
    <Button
      onClick={toggle}
      variant="outline"
      size="sm"
      className={`gap-2 ${
        enabled
          ? "border-green-400/50 text-green-400"
          : "border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300"
      }`}
      aria-label={enabled ? "Disable announcements" : "Enable announcements"}
    >
      {enabled ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      <span className="hidden lg:inline">
        {enabled ? "Announcements on" : "Announcements"}
      </span>
    </Button>
  );
}
