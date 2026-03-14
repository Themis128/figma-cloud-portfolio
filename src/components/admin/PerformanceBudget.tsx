"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle, Gauge, Timer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface VitalMetric {
  name: string;
  value: number | null;
  unit: string;
  budget: number;
  icon: LucideIcon;
  description: string;
}

// Google Core Web Vitals "good" thresholds
const BUDGETS = {
  lcp: 2500,
  fcp: 1800,
  cls: 0.1,
  ttfb: 800,
};

function gradeFromScore(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A+", color: "text-green-400" };
  if (score >= 75) return { grade: "A", color: "text-green-400" };
  if (score >= 60) return { grade: "B", color: "text-cyan-400" };
  if (score >= 40) return { grade: "C", color: "text-yellow-400" };
  return { grade: "D", color: "text-red-400" };
}

function metricScore(value: number | null, budget: number, isCls = false): number {
  if (value === null) return 0;
  if (isCls) {
    // CLS: lower is better, 0 is perfect
    if (value <= budget * 0.5) return 100;
    if (value <= budget) return 75;
    if (value <= budget * 2.5) return 40;
    return 20;
  }
  // Timing metrics: lower is better
  const ratio = value / budget;
  if (ratio <= 0.5) return 100;
  if (ratio <= 1) return 75;
  if (ratio <= 2) return 40;
  return 20;
}

function budgetPercent(value: number | null, budget: number): number {
  if (value === null) return 0;
  return Math.min(100, (value / budget) * 100);
}

function budgetBarColor(value: number | null, budget: number): string {
  if (value === null) return "bg-foreground/10";
  const ratio = value / budget;
  if (ratio <= 0.75) return "bg-green-400";
  if (ratio <= 1) return "bg-cyan-400";
  if (ratio <= 1.5) return "bg-yellow-400";
  return "bg-red-400";
}

export default function PerformanceBudget() {
  const [metrics, setMetrics] = useState<VitalMetric[]>([
    { name: "LCP", value: null, unit: "ms", budget: BUDGETS.lcp, icon: Timer, description: "Largest Contentful Paint" },
    { name: "FCP", value: null, unit: "ms", budget: BUDGETS.fcp, icon: Zap, description: "First Contentful Paint" },
    { name: "CLS", value: null, unit: "", budget: BUDGETS.cls, icon: AlertTriangle, description: "Cumulative Layout Shift" },
    { name: "TTFB", value: null, unit: "ms", budget: BUDGETS.ttfb, icon: Gauge, description: "Time to First Byte" },
  ]);

  useEffect(() => {
    let mounted = true;

    async function collectMetrics() {
      try {
        const webVitals = await import("web-vitals");

        webVitals.onLCP((metric) => {
          if (!mounted) return;
          setMetrics((prev) =>
            prev.map((m) => (m.name === "LCP" ? { ...m, value: Math.round(metric.value) } : m)),
          );
        });

        webVitals.onFCP((metric) => {
          if (!mounted) return;
          setMetrics((prev) =>
            prev.map((m) => (m.name === "FCP" ? { ...m, value: Math.round(metric.value) } : m)),
          );
        });

        webVitals.onCLS((metric) => {
          if (!mounted) return;
          setMetrics((prev) =>
            prev.map((m) =>
              m.name === "CLS" ? { ...m, value: Math.round(metric.value * 1000) / 1000 } : m,
            ),
          );
        });

        webVitals.onTTFB((metric) => {
          if (!mounted) return;
          setMetrics((prev) =>
            prev.map((m) => (m.name === "TTFB" ? { ...m, value: Math.round(metric.value) } : m)),
          );
        });
      } catch {
        // web-vitals not available
      }
    }

    void collectMetrics();
    return () => { mounted = false; };
  }, []);

  const scores = metrics.map((m) =>
    metricScore(m.value, m.budget, m.name === "CLS"),
  );
  const validScores = scores.filter((_, i) => metrics[i]?.value !== null);
  const overallScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;
  const { grade, color: gradeColor } = gradeFromScore(overallScore);
  const withinBudget = metrics.filter(
    (m) => m.value !== null && m.value <= m.budget,
  ).length;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-3xl font-mono font-bold ${gradeColor}`}>
              {validScores.length > 0 ? grade : "—"}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Grade
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-foreground">
              {validScores.length > 0 ? overallScore : "—"}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Score
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-green-400">
              {withinBudget}
              <span className="text-sm text-foreground/30">/{metrics.length}</span>
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Within Budget
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-foreground/10 text-foreground/30 text-[9px] font-mono"
        >
          Live from web-vitals
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const score = metricScore(m.value, m.budget, m.name === "CLS");
          const { grade: mGrade, color: mColor } = gradeFromScore(score);
          const pct = budgetPercent(m.value, m.budget);
          const overBudget = m.value !== null && m.value > m.budget;

          return (
            <Card
              key={m.name}
              className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 hover:border-cyan-400/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-mono text-xs text-foreground/80 font-bold">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-foreground/30">{m.description}</p>
                  </div>
                </div>
                <span className={`font-mono text-lg font-bold ${mColor}`}>
                  {m.value !== null ? mGrade : "—"}
                </span>
              </div>

              {/* Value + Budget */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-xl text-foreground">
                  {m.value !== null ? m.value : "—"}
                </span>
                <span className="text-[10px] text-foreground/30 font-mono">
                  {m.unit}
                </span>
                <span className="text-[10px] text-foreground/20 font-mono ml-auto">
                  budget: {m.budget}
                  {m.unit}
                </span>
              </div>

              {/* Budget Bar */}
              <div className="relative h-2 bg-foreground/5 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${budgetBarColor(m.value, m.budget)}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
                {/* Budget line marker */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-foreground/20"
                  style={{ left: "100%" }}
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                {m.value === null ? (
                  <span className="text-[10px] font-mono text-foreground/20">
                    Collecting...
                  </span>
                ) : overBudget ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] font-mono text-red-400">
                      {Math.round(pct - 100)}% over budget
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] font-mono text-green-400">
                      {Math.round(100 - pct)}% under budget
                    </span>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Budget Reference */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono mb-3">
          Budget Thresholds (Google CWV &quot;Good&quot;)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(BUDGETS).map(([key, value]) => (
            <div
              key={key}
              className="text-center p-2 rounded bg-background/30 border border-border/10"
            >
              <p className="font-mono text-xs text-cyan-400 uppercase">
                {key}
              </p>
              <p className="font-mono text-sm text-foreground/60">
                {key === "cls" ? `≤ ${value}` : `≤ ${value}ms`}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
