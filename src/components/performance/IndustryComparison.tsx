"use client";

import { useEffect, useRef, useState } from "react";

interface ComparisonItem {
  label: string;
  lcp: number; // in ms
  color: string;
  highlight?: boolean;
  source?: string;
}

// Benchmarks based on HTTP Archive Web Almanac 2024 (desktop median values)
const COMPARISONS: ComparisonItem[] = [
  {
    label: "Average E-Commerce Site",
    lcp: 5100,
    color: "bg-red-400/50",
    source: "Web Almanac 2024",
  },
  {
    label: "Average News Website",
    lcp: 4200,
    color: "bg-orange-400/50",
    source: "Web Almanac 2024",
  },
  {
    label: "Average Portfolio Site",
    lcp: 3100,
    color: "bg-yellow-400/50",
    source: "Web Almanac 2024",
  },
  {
    label: "This Portfolio",
    lcp: 800,
    color: "bg-cyan-400",
    highlight: true,
  },
];

const MAX_LCP = 6000;

function formatLcp(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function IndustryComparison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          How Does This Compare?
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Largest Contentful Paint vs. industry benchmarks
        </p>
      </div>

      <div ref={containerRef} className="space-y-5 max-w-2xl mx-auto">
        {COMPARISONS.map((item, i) => {
          const targetWidth = (item.lcp / MAX_LCP) * 100;
          const delayMs = i * 150;

          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-baseline text-sm">
                <span
                  className={
                    item.highlight
                      ? "text-cyan-400 font-semibold"
                      : "text-foreground/60"
                  }
                >
                  {item.label}
                </span>
                <span
                  className={`font-mono text-xs ${
                    item.highlight ? "text-cyan-400" : "text-foreground/40"
                  }`}
                >
                  {formatLcp(item.lcp)} LCP
                </span>
              </div>

              <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ease-out ${item.color} ${
                    item.highlight ? "shadow-sm shadow-cyan-500/40" : ""
                  }`}
                  style={{
                    width: isVisible ? `${targetWidth}%` : "0%",
                    transitionDuration: `${900 + i * 200}ms`,
                    transitionDelay: `${delayMs}ms`,
                  }}
                  role="meter"
                  aria-label={`${item.label}: ${formatLcp(item.lcp)} LCP`}
                  aria-valuenow={item.lcp}
                  aria-valuemin={0}
                  aria-valuemax={MAX_LCP}
                />
              </div>

              {item.highlight && (
                <p className="text-[10px] text-cyan-400/50 font-mono">
                  ↑ {Math.round(((3100 - item.lcp) / 3100) * 100)}% faster than
                  avg portfolio
                </p>
              )}
            </div>
          );
        })}

        <p className="text-[10px] text-foreground/25 text-center pt-2 font-mono">
          Benchmarks: HTTP Archive Web Almanac 2024 — desktop median LCP values
        </p>
      </div>
    </div>
  );
}
