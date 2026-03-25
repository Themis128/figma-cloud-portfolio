"use client";

import { ThumbsUp, Lightbulb, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";

interface BlogReactionsProps {
  slug: string;
}

const REACTIONS = [
  { key: "helpful", icon: ThumbsUp, label: "Helpful" },
  { key: "interesting", icon: Lightbulb, label: "Interesting" },
  { key: "bookmarked", icon: Bookmark, label: "Bookmark" },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];

export default function BlogReactions({ slug }: BlogReactionsProps) {
  const [reacted, setReacted] = useState<Set<ReactionKey>>(new Set());
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({
    helpful: 0,
    interesting: 0,
    bookmarked: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`blog-reactions-${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored) as ReactionKey[];
        setReacted(new Set(parsed));
      }
      const storedCounts = localStorage.getItem(`blog-counts-${slug}`);
      if (storedCounts) {
        setCounts(JSON.parse(storedCounts) as Record<ReactionKey, number>);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [slug]);

  function toggleReaction(key: ReactionKey) {
    setReacted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setCounts((c) => {
          const updated = { ...c, [key]: Math.max(0, c[key] - 1) };
          localStorage.setItem(`blog-counts-${slug}`, JSON.stringify(updated));
          return updated;
        });
      } else {
        next.add(key);
        setCounts((c) => {
          const updated = { ...c, [key]: c[key] + 1 };
          localStorage.setItem(`blog-counts-${slug}`, JSON.stringify(updated));
          return updated;
        });
      }
      localStorage.setItem(`blog-reactions-${slug}`, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-foreground/40 font-mono text-xs">React:</span>
      {REACTIONS.map(({ key, icon: Icon, label }) => {
        const isActive = reacted.has(key);
        return (
          <button
            key={key}
            onClick={() => toggleReaction(key)}
            aria-label={label}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-xs transition-all ${
              isActive
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400"
                : "border-border/20 text-foreground/50 hover:border-cyan-500/30 hover:text-cyan-400"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {counts[key] > 0 && (
              <span className="text-[10px] opacity-70">{counts[key]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
