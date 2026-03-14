"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatedSection } from "@/components/AnimatedSection";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

function useCountUp(target: number | null, duration = 1400) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === null) return;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

function getGrade(
  lcp: number | undefined,
  fcp: number | undefined,
  cls: number | undefined,
) {
  const scores = [
    lcp !== undefined ? (lcp < 2500 ? 2 : lcp < 4000 ? 1 : 0) : null,
    fcp !== undefined ? (fcp < 1800 ? 2 : fcp < 3000 ? 1 : 0) : null,
    cls !== undefined ? (cls < 0.1 ? 2 : cls < 0.25 ? 1 : 0) : null,
  ].filter((s): s is number => s !== null);

  if (scores.length === 0)
    return {
      label: "...",
      color: "text-foreground/30",
      ring: "border-border/20",
    };

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg >= 1.8)
    return {
      label: "A+",
      color: "text-green-400",
      ring: "border-green-400/40",
    };
  if (avg >= 1.5)
    return { label: "A", color: "text-green-400", ring: "border-green-400/40" };
  if (avg >= 1.2)
    return {
      label: "B",
      color: "text-yellow-400",
      ring: "border-yellow-400/40",
    };
  if (avg >= 0.8)
    return {
      label: "C",
      color: "text-orange-400",
      ring: "border-orange-400/40",
    };
  return { label: "D", color: "text-red-400", ring: "border-red-400/40" };
}

function GradeBadge({
  grade,
}: {
  grade: { label: string; color: string; ring: string };
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger the CSS transition after mount (avoids SSR hydration mismatch)
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hasGrade = grade.label !== "...";

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-24 h-24 rounded-full border-2 ${grade.ring} flex items-center justify-center bg-card/30 backdrop-blur-sm transition-all duration-700 ease-out ${
          mounted ? "scale-100 opacity-100" : "scale-[0.6] opacity-0"
        }`}
        style={{
          boxShadow:
            mounted && hasGrade ? "0 0 30px rgba(34,211,238,0.15)" : "none",
        }}
      >
        <span className={`text-5xl font-bold font-mono ${grade.color}`}>
          {grade.label}
        </span>
      </div>
      <p className="text-xs text-foreground/50 uppercase tracking-widest font-mono">
        Performance Grade
      </p>
    </div>
  );
}

export function LiveLoadHero() {
  const { metrics } = usePerformanceMonitoring();
  const { lcp, fcp, cls, ttfb, inp } = metrics;

  const lcpCountUp = useCountUp(lcp ?? null);
  const grade = getGrade(lcp, fcp, cls);

  type StatStatus = "good" | "warn" | "poor";

  const statusColor: Record<StatStatus, string> = {
    good: "text-green-400",
    warn: "text-yellow-400",
    poor: "text-red-400",
  };

  const stats: Array<{
    label: string;
    value: string;
    sublabel: string;
    status: StatStatus | null;
  }> = [
    {
      label: "LCP",
      value:
        lcp !== undefined
          ? lcp >= 1000
            ? `${(lcp / 1000).toFixed(2)}s`
            : `${Math.round(lcp)}ms`
          : "—",
      sublabel: "Largest Paint",
      status:
        lcp !== undefined
          ? lcp < 2500
            ? "good"
            : lcp < 4000
              ? "warn"
              : "poor"
          : null,
    },
    {
      label: "FCP",
      value:
        fcp !== undefined
          ? fcp >= 1000
            ? `${(fcp / 1000).toFixed(2)}s`
            : `${Math.round(fcp)}ms`
          : "—",
      sublabel: "First Paint",
      status:
        fcp !== undefined
          ? fcp < 1800
            ? "good"
            : fcp < 3000
              ? "warn"
              : "poor"
          : null,
    },
    {
      label: "CLS",
      value: cls !== undefined ? cls.toFixed(3) : "—",
      sublabel: "Layout Shift",
      status:
        cls !== undefined
          ? cls < 0.1
            ? "good"
            : cls < 0.25
              ? "warn"
              : "poor"
          : null,
    },
    {
      label: "INP",
      value:
        inp !== undefined
          ? inp >= 1000
            ? `${(inp / 1000).toFixed(2)}s`
            : `${Math.round(inp)}ms`
          : "—",
      sublabel: "Responsiveness",
      status:
        inp !== undefined
          ? inp < 200
            ? "good"
            : inp < 500
              ? "warn"
              : "poor"
          : null,
    },
  ];

  const lcpSeconds = lcp !== undefined ? (lcpCountUp / 1000).toFixed(2) : "—";

  return (
    <div className="space-y-10">
      {/* Live indicator */}
      <AnimatedSection delay={0.05}>
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs text-foreground/50 uppercase tracking-[0.25em] font-mono">
            Live — Measured for your device
          </span>
        </div>
      </AnimatedSection>

      {/* Main load time */}
      <AnimatedSection delay={0.15}>
        <div className="text-center space-y-2">
          <p className="text-sm text-foreground/50 uppercase tracking-[0.2em] font-mono">
            This page loaded in
          </p>
          <div className="flex items-end justify-center gap-2">
            <span className="text-8xl sm:text-9xl font-bold font-mono text-cyan-400 tabular-nums leading-none">
              {lcpSeconds}
            </span>
            <span className="text-3xl text-foreground/40 pb-3 font-mono">
              s
            </span>
          </div>
          <p className="text-xs text-foreground/40 font-mono">
            Largest Contentful Paint
          </p>
        </div>
      </AnimatedSection>

      {/* Grade badge */}
      <AnimatedSection delay={0.25}>
        <GradeBadge grade={grade} />
      </AnimatedSection>

      {/* 3 stat chips */}
      <AnimatedSection delay={0.35}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-3 hover:border-cyan-400/20 transition-colors"
            >
              <div className="text-[10px] text-foreground/40 uppercase tracking-widest mb-1 font-mono">
                {stat.label}
              </div>
              <div
                className={`text-xl font-bold font-mono ${
                  stat.status ? statusColor[stat.status] : "text-foreground/30"
                }`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] text-foreground/30 mt-0.5">
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* TTFB footnote */}
      {ttfb !== undefined && (
        <AnimatedSection delay={0.4}>
          <p className="text-center text-xs text-foreground/30 font-mono">
            Server responded in{" "}
            <span className="text-cyan-400/60">
              {ttfb >= 1000
                ? `${(ttfb / 1000).toFixed(2)}s`
                : `${Math.round(ttfb)}ms`}
            </span>{" "}
            (TTFB)
          </p>
        </AnimatedSection>
      )}
    </div>
  );
}
