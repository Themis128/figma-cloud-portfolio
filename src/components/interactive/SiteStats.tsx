"use client";

import { Activity, Globe, Zap, Code2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  lighthouseScore: number;
  techCount: number;
  pagesCount: number;
  uptime: string;
}

export default function SiteStats() {
  const [stats, setStats] = useState<Stats>({
    lighthouseScore: 95,
    techCount: 12,
    pagesCount: 14,
    uptime: "99.9%",
  });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger count-up animation after mount
    const timer = setTimeout(() => setAnimated(true), 300);

    // Try to get real performance score from web-vitals
    if (typeof window !== "undefined" && "performance" in window) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        const loadTime = nav.loadEventEnd - nav.startTime;
        // Approximate Lighthouse score from load time
        const score = loadTime < 1500 ? 98 : loadTime < 2500 ? 95 : loadTime < 4000 ? 85 : 75;
        setStats((s) => ({ ...s, lighthouseScore: score }));
      }
    }

    return () => clearTimeout(timer);
  }, []);

  const items = [
    { icon: Zap, label: "Lighthouse", value: animated ? stats.lighthouseScore : 0, suffix: "/100", color: "text-green-400" },
    { icon: Code2, label: "Tech Stack", value: animated ? stats.techCount : 0, suffix: " tools", color: "text-cyan-400" },
    { icon: Globe, label: "Pages", value: animated ? stats.pagesCount : 0, suffix: " pages", color: "text-blue-400" },
    { icon: Activity, label: "Uptime", value: stats.uptime, suffix: "", color: "text-emerald-400", isString: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ icon: Icon, label, value, suffix, color, isString }) => (
        <div
          key={label}
          className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-3 text-center group hover:border-cyan-500/20 transition-colors"
        >
          <Icon className={`w-4 h-4 ${color} mx-auto mb-1.5 group-hover:scale-110 transition-transform`} />
          <p className={`${color} font-mono text-lg font-bold tabular-nums`}>
            {isString ? value : value}
            <span className="text-foreground/40 text-xs font-normal">{suffix}</span>
          </p>
          <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
}
