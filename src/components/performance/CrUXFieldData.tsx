"use client";

import { Activity, Globe, Zap, MousePointerClick, Clock, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricData {
  p75: number;
  good: number;
  needsImprovement: number;
  poor: number;
}

interface CrUXData {
  origin?: string;
  formFactor?: string;
  timestamp?: string;
  lcp?: MetricData | null;
  fcp?: MetricData | null;
  cls?: MetricData | null;
  inp?: MetricData | null;
  ttfb?: MetricData | null;
  error?: string;
  message?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const METRIC_CONFIG = [
  { key: "lcp", label: "LCP", fullName: "Largest Contentful Paint", unit: "ms", icon: LayoutDashboard, goodThreshold: 2500, poorThreshold: 4000, isDecimal: false },
  { key: "fcp", label: "FCP", fullName: "First Contentful Paint", unit: "ms", icon: Zap, goodThreshold: 1800, poorThreshold: 3000, isDecimal: false },
  { key: "cls", label: "CLS", fullName: "Cumulative Layout Shift", unit: "", icon: Activity, goodThreshold: 0.1, poorThreshold: 0.25, isDecimal: true },
  { key: "inp", label: "INP", fullName: "Interaction to Next Paint", unit: "ms", icon: MousePointerClick, goodThreshold: 200, poorThreshold: 500, isDecimal: false },
  { key: "ttfb", label: "TTFB", fullName: "Time to First Byte", unit: "ms", icon: Clock, goodThreshold: 800, poorThreshold: 1800, isDecimal: false },
] as const;

function getColor(value: number, good: number, poor: number): string {
  if (value <= good) return "text-green-400";
  if (value <= poor) return "text-yellow-400";
  return "text-red-400";
}


export default function CrUXFieldData() {
  const [data, setData] = useState<CrUXData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrUX() {
      try {
        const res = await fetch(`${API_BASE}/crux`);
        if (res.ok) {
          setData(await res.json() as CrUXData);
        }
      } catch {
        // Silently fail — field data is supplementary
      } finally {
        setLoading(false);
      }
    }
    void fetchCrUX();
  }, []);

  if (loading) {
    return (
      <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-6 animate-pulse">
        <div className="h-40 bg-foreground/5 rounded" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-6 text-center">
        <Globe className="w-8 h-8 text-foreground/20 mx-auto mb-2" />
        <p className="text-foreground/40 font-mono text-sm">
          {data?.message ?? "Field data not available yet. CrUX requires sufficient real-user traffic (typically 28 days)."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-foreground/40 font-mono text-xs">
            Source: Chrome UX Report · {data.formFactor ?? "All"} · {data.origin}
          </p>
        </div>
        {data.timestamp && (
          <p className="text-foreground/30 font-mono text-[10px]">
            Updated {new Date(data.timestamp).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {METRIC_CONFIG.map(({ key, label, fullName, unit, icon: Icon, goodThreshold, poorThreshold, isDecimal }) => {
          const metric = data[key as keyof CrUXData] as MetricData | null | undefined;
          if (!metric) return null;

          const displayValue = isDecimal
            ? metric.p75.toFixed(2)
            : Math.round(metric.p75).toLocaleString();
          const colorClass = getColor(metric.p75, goodThreshold, poorThreshold);

          return (
            <div
              key={key}
              className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-4 group hover:border-cyan-500/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-foreground/40 group-hover:text-cyan-400 transition-colors" />
                <span className="font-mono text-xs text-foreground/60 uppercase tracking-wider">{label}</span>
              </div>

              <p className={`font-mono text-2xl font-bold tabular-nums ${colorClass}`}>
                {displayValue}
                <span className="text-foreground/30 text-xs font-normal ml-1">{unit}</span>
              </p>

              <p className="text-foreground/30 font-mono text-[10px] mt-1">{fullName}</p>

              {/* Distribution bar */}
              <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-foreground/5">
                <div className="bg-green-400/80" style={{ width: `${metric.good}%` }} title={`Good: ${metric.good}%`} />
                <div className="bg-yellow-400/80" style={{ width: `${metric.needsImprovement}%` }} title={`Needs improvement: ${metric.needsImprovement}%`} />
                <div className="bg-red-400/80" style={{ width: `${metric.poor}%` }} title={`Poor: ${metric.poor}%`} />
              </div>

              <div className="flex justify-between mt-1.5 text-[9px] font-mono text-foreground/30">
                <span className="text-green-400/60">{metric.good}% good</span>
                <span className="text-red-400/60">{metric.poor}% poor</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
