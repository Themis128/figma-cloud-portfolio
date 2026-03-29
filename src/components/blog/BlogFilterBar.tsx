"use client";

import { Search, X } from "lucide-react";
import { useCallback, useState } from "react";

interface BlogFilterBarProps {
  tags: readonly [string, number][];
  onSearch: (query: string) => void;
  onTagToggle: (tag: string) => void;
  activeTags: ReadonlySet<string>;
}

export function BlogFilterBar({
  tags,
  onSearch,
  onTagToggle,
  activeTags,
}: BlogFilterBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search articles..."
          className="w-full rounded-lg border border-border/30 bg-foreground/5 backdrop-blur-sm pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-colors"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(([tag, count]) => {
            const isActive = activeTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono transition-all duration-200 ${
                  isActive
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-400"
                    : "border-border/30 bg-foreground/5 text-muted-foreground hover:border-cyan-400/30 hover:text-foreground"
                }`}
              >
                <span>{tag}</span>
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                    isActive
                      ? "bg-cyan-400/20 text-cyan-400"
                      : "bg-foreground/10 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
