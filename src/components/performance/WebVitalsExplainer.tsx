"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { VitalGaugeRing } from "@/components/performance/VitalGaugeRing";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

const GAUGE_CONFIG: Record<
  string,
  { good: number; poor: number; max: number; unit: string }
> = {
  lcp: { good: 2500, poor: 4000, max: 6000, unit: "ms" },
  fcp: { good: 1800, poor: 3000, max: 5000, unit: "ms" },
  cls: { good: 0.1, poor: 0.25, max: 0.5, unit: "" },
  inp: { good: 200, poor: 500, max: 800, unit: "ms" },
};

interface VitalInfo {
  key: "lcp" | "fcp" | "cls" | "ttfb" | "inp";
  label: string;
  fullName: string;
  icon: string;
  goodThreshold: number;
  poorThreshold: number;
  industryAvg: number;
  whatItMeans: string;
  tip: string;
}

const VITALS: VitalInfo[] = [
  {
    key: "lcp",
    label: "LCP",
    fullName: "Largest Contentful Paint",
    icon: "🖼",
    goodThreshold: 2500,
    poorThreshold: 4000,
    industryAvg: 4200,
    whatItMeans:
      'How quickly the main content — image or text block — becomes visible. This is what users experience as "the page loaded".',
    tip: "Optimised with Next.js SSR and next/image preloading",
  },
  {
    key: "fcp",
    label: "FCP",
    fullName: "First Contentful Paint",
    icon: "⚡",
    goodThreshold: 1800,
    poorThreshold: 3000,
    industryAvg: 2800,
    whatItMeans:
      "When something — any content at all — first appears on screen. Users stop staring at a blank white page.",
    tip: "Improved by server rendering and critical CSS inlining",
  },
  {
    key: "cls",
    label: "CLS",
    fullName: "Cumulative Layout Shift",
    icon: "📐",
    goodThreshold: 0.1,
    poorThreshold: 0.25,
    industryAvg: 0.18,
    whatItMeans:
      "Whether elements jump around as the page loads. A score near 0 means nothing moved unexpectedly — no accidental button clicks.",
    tip: "Eliminated by reserving layout space for images and fonts upfront",
  },
  {
    key: "ttfb",
    label: "TTFB",
    fullName: "Time to First Byte",
    icon: "🌐",
    goodThreshold: 800,
    poorThreshold: 1800,
    industryAvg: 1400,
    whatItMeans:
      "How fast the server responded to the initial request. This reflects server infrastructure, CDN placement, and backend efficiency.",
    tip: "Reduced by AWS Amplify global edge CDN deployment",
  },
  {
    key: "inp",
    label: "INP",
    fullName: "Interaction to Next Paint",
    icon: "👆",
    goodThreshold: 200,
    poorThreshold: 500,
    industryAvg: 350,
    whatItMeans:
      "How quickly the page responds after you click, tap, or type. INP replaced FID as a Core Web Vital in March 2024 — it measures every interaction, not just the first.",
    tip: "Kept low with event delegation and non-blocking React transitions",
  },
];

function getStatus(key: string, value: number) {
  const vital = VITALS.find((v) => v.key === key);
  if (!vital) return "unknown";
  if (value <= vital.goodThreshold) return "good";
  if (value <= vital.poorThreshold) return "warn";
  return "poor";
}

function formatValue(key: string, value: number): string {
  if (key === "cls") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

// How much better this site is vs industry average (0–100%)
function getBetterPercent(
  key: string,
  value: number,
  industryAvg: number,
): number {
  if (key === "cls") {
    // Lower is better; percent of industry avg that we saved
    return Math.max(
      0,
      Math.min(100, ((industryAvg - value) / industryAvg) * 100),
    );
  }
  return Math.max(
    0,
    Math.min(100, ((industryAvg - value) / industryAvg) * 100),
  );
}

export function WebVitalsExplainer() {
  const { metrics } = usePerformanceMonitoring();
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          Core Web Vitals
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Tap any metric to understand what it means in plain terms
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VITALS.map((vital, i) => {
          const rawValue = metrics[vital.key];
          const status =
            rawValue !== undefined ? getStatus(vital.key, rawValue) : null;
          const displayValue =
            rawValue !== undefined ? formatValue(vital.key, rawValue) : "—";
          const isActive = activeCard === vital.key;

          const statusStyle =
            status === "good"
              ? {
                  text: "text-green-400",
                  border: "border-green-400/30",
                  bg: "bg-green-400/5",
                  bar: "bg-green-400",
                  badge: "bg-green-400/10 text-green-400",
                  label: "GOOD",
                }
              : status === "warn"
                ? {
                    text: "text-yellow-400",
                    border: "border-yellow-400/30",
                    bg: "bg-yellow-400/5",
                    bar: "bg-yellow-400",
                    badge: "bg-yellow-400/10 text-yellow-400",
                    label: "FAIR",
                  }
                : status === "poor"
                  ? {
                      text: "text-red-400",
                      border: "border-red-400/30",
                      bg: "bg-red-400/5",
                      bar: "bg-red-400",
                      badge: "bg-red-400/10 text-red-400",
                      label: "POOR",
                    }
                  : {
                      text: "text-foreground/30",
                      border: "border-border/20",
                      bg: "",
                      bar: "bg-foreground/20",
                      badge: "bg-muted/40 text-foreground/40",
                      label: "...",
                    };

          const betterPct =
            rawValue !== undefined
              ? getBetterPercent(vital.key, rawValue, vital.industryAvg)
              : null;

          return (
            <AnimatedSection key={vital.key} delay={0.1 * i}>
              <button
                className={`w-full text-left rounded-lg border bg-card/40 backdrop-blur-sm p-5 transition-all duration-300 cursor-pointer ${statusStyle.border} ${statusStyle.bg} ${
                  isActive
                    ? "ring-1 ring-cyan-400/30 shadow-lg shadow-cyan-500/5"
                    : "hover:border-cyan-400/20 hover:bg-card/60"
                }`}
                onClick={() => setActiveCard(isActive ? null : vital.key)}
                aria-expanded={isActive}
                aria-label={`${vital.fullName}: ${displayValue}. Click for details.`}
              >
                {/* Icon + badge row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl" role="img" aria-hidden>
                    {vital.icon}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${statusStyle.badge}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Gauge ring for core vitals */}
                {rawValue !== undefined &&
                  (() => {
                    const gauge = GAUGE_CONFIG[vital.key];
                    if (!gauge) return null;
                    return (
                      <div className="flex justify-center my-3">
                        <VitalGaugeRing
                          value={rawValue}
                          max={gauge.max}
                          label={vital.label}
                          unit={gauge.unit}
                          good={gauge.good}
                          poor={gauge.poor}
                        />
                      </div>
                    );
                  })()}

                {/* Value */}
                <div
                  className={`text-3xl font-bold font-mono mb-1 ${statusStyle.text}`}
                >
                  {displayValue}
                </div>
                <div className="text-[10px] text-foreground/40 uppercase tracking-widest font-mono">
                  {vital.label}
                </div>
                <div className="text-[11px] text-foreground/30 mt-0.5">
                  {vital.fullName}
                </div>

                {/* vs industry comparison */}
                {rawValue !== undefined && betterPct !== null && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-foreground/30 font-mono">
                      <span>vs industry avg</span>
                      <span>{formatValue(vital.key, vital.industryAvg)}</span>
                    </div>
                    <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusStyle.bar} transition-all duration-700`}
                        style={{
                          width: `${Math.max(5, 100 - (rawValue / vital.industryAvg) * 100)}%`,
                        }}
                      />
                    </div>
                    {betterPct > 0 && (
                      <p className="text-[10px] text-cyan-400/60 font-mono">
                        {Math.round(betterPct)}% faster than average
                      </p>
                    )}
                  </div>
                )}

                {/* Expanded detail */}
                <AnimatePresence>
                  {isActive && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-border/15 space-y-2 text-left">
                        <p className="text-xs text-foreground/60 leading-relaxed">
                          {vital.whatItMeans}
                        </p>
                        <p className="text-[11px] text-cyan-400/70 font-mono">
                          → {vital.tip}
                        </p>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </button>
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}
