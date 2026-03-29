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
    const wasActive = reacted.has(key);
    const nextReacted = new Set(reacted);
    if (wasActive) {
      nextReacted.delete(key);
    } else {
      nextReacted.add(key);
    }
    const nextCounts = {
      ...counts,
      [key]: wasActive ? Math.max(0, counts[key] - 1) : counts[key] + 1,
    };
    setReacted(nextReacted);
    setCounts(nextCounts);
    try {
      localStorage.setItem(`blog-reactions-${slug}`, JSON.stringify([...nextReacted]));
      localStorage.setItem(`blog-counts-${slug}`, JSON.stringify(nextCounts));
    } catch {
      // Ignore localStorage errors
    }
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
