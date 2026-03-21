"use client";

import { CheckCircle2, Circle, Play, RotateCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type Phase = "idle" | "running" | "done";
type MetricStatus = "good" | "warn" | "poor";

interface TestItem {
  id: string;
  label: string;
  description: string;
  metricKey: "lcp" | "fcp" | "cls" | "ttfb" | "inp";
  goodThreshold: number;
  poorThreshold: number;
  unit: string;
}

const TEST_SEQUENCE: TestItem[] = [
  {
    id: "ttfb",
    label: "Time to First Byte",
    description: "Server response speed",
    metricKey: "ttfb",
    goodThreshold: 800,
    poorThreshold: 1800,
    unit: "ms",
  },
  {
    id: "fcp",
    label: "First Contentful Paint",
    description: "First pixel on screen",
    metricKey: "fcp",
    goodThreshold: 1800,
    poorThreshold: 3000,
    unit: "ms",
  },
  {
    id: "lcp",
    label: "Largest Contentful Paint",
    description: "Main content visible",
    metricKey: "lcp",
    goodThreshold: 2500,
    poorThreshold: 4000,
    unit: "ms",
  },
  {
    id: "cls",
    label: "Cumulative Layout Shift",
    description: "Visual stability score",
    metricKey: "cls",
    goodThreshold: 0.1,
    poorThreshold: 0.25,
    unit: "",
  },
  {
    id: "inp",
    label: "Interaction to Next Paint",
    description: "Input responsiveness",
    metricKey: "inp",
    goodThreshold: 200,
    poorThreshold: 500,
    unit: "ms",
  },
];

function getStatus(item: TestItem, value: number): MetricStatus {
  if (value <= item.goodThreshold) return "good";
  if (value <= item.poorThreshold) return "warn";
  return "poor";
}

function formatValue(metricKey: string, value: number): string {
  if (metricKey === "cls") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

function getOverallGrade(items: TestItem[], metrics: Record<string, number>) {
  const scores: number[] = items
    .filter((t) => metrics[t.metricKey] !== undefined)
    .map((t) => {
      const value = metrics[t.metricKey];
      if (value === undefined) return 0;
      const status = getStatus(t, value);
      return status === "good" ? 2 : status === "warn" ? 1 : 0;
    });

  if (scores.length === 0) return null;
  const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

  if (avg >= 1.8)
    return {
      label: "A+",
      color: "text-green-400",
      tagline: "Excellent — blazing fast",
    };
  if (avg >= 1.5)
    return {
      label: "A",
      color: "text-green-400",
      tagline: "Great — above average",
    };
  if (avg >= 1.2)
    return {
      label: "B",
      color: "text-yellow-400",
      tagline: "Good — room to improve",
    };
  return {
    label: "C",
    color: "text-orange-400",
    tagline: "Fair — optimizations needed",
  };
}

const STATUS_COLORS: Record<
  MetricStatus,
  { text: string; badge: string; icon: string }
> = {
  good: {
    text: "text-green-400",
    badge: "bg-green-400/10 text-green-400 border-green-400/30",
    icon: "text-green-400",
  },
  warn: {
    text: "text-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    icon: "text-yellow-400",
  },
  poor: {
    text: "text-red-400",
    badge: "bg-red-400/10 text-red-400 border-red-400/30",
    icon: "text-red-400",
  },
};

export function SpeedTestRunner() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [capturedMetrics, setCapturedMetrics] = useState<
    Record<string, number>
  >({});
  const metricsRef = useRef<Record<string, number>>({});

  // Passively collect metrics as the page loads
  useEffect(() => {
    onLCP((m: Metric) => {
      metricsRef.current.lcp = m.value;
    });
    onFCP((m: Metric) => {
      metricsRef.current.fcp = m.value;
    });
    onCLS((m: Metric) => {
      metricsRef.current.cls = m.value;
    });
    onTTFB((m: Metric) => {
      metricsRef.current.ttfb = m.value;
    });
    onINP((m: Metric) => {
      metricsRef.current.inp = m.value;
    });
  }, []);

  const runTest = async () => {
    setPhase("running");
    setProgress(0);
    setRevealedCount(0);
    setCapturedMetrics({});

    // Animate progress bar over ~3 seconds
    const totalSteps = 60;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise<void>((r) => setTimeout(r, 50));
      setProgress((i / totalSteps) * 100);
    }

    // Snapshot the collected metrics
    setCapturedMetrics({ ...metricsRef.current });
    setPhase("done");

    // Reveal each result sequentially
    for (let i = 1; i <= TEST_SEQUENCE.length; i++) {
      await new Promise<void>((r) => setTimeout(r, 450));
      setRevealedCount(i);
    }
  };

  const rerun = () => {
    // Reload the page for a fresh measurement — web-vitals only reports once per page load
    window.location.reload();
  };

  const shareResults = () => {
    const lines = TEST_SEQUENCE.filter(
      (t) => capturedMetrics[t.metricKey] !== undefined,
    )
      .map((t) => {
        const v = capturedMetrics[t.metricKey];
        return `${t.label}: ${v !== undefined ? formatValue(t.metricKey, v) : "—"}`;
      })
      .join("\n");

    const text = `Portfolio performance results:\n${lines}\nbaltzakisthemis.com`;

    if (navigator.share) {
      void navigator.share({
        title: "baltzakisthemis.com — Performance Results",
        text,
      });
    } else {
      void navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Performance results ready to paste.",
        });
      });
    }
  };

  const grade =
    phase === "done" ? getOverallGrade(TEST_SEQUENCE, capturedMetrics) : null;

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          Live Speed Test
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/60 text-sm max-w-md mx-auto">
          Measure this page&apos;s real performance on your device and
          connection
        </p>
      </div>

      {/* Idle CTA */}
      {phase === "idle" && (
        <div className="flex justify-center">
          <button
            onClick={() => void runTest()}
            className="group relative px-10 py-4 bg-transparent border-2 border-cyan-400/50 hover:border-cyan-400 text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium flex items-center gap-3"
          >
            <Play className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Start Speed Test</span>
            <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/5 transition-colors duration-300 rounded-md" />
          </button>
        </div>
      )}

      {/* Running state */}
      {phase === "running" && (
        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-foreground/50 font-mono">
            <span>Analysing your experience...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-center text-foreground/30 font-mono">
            Reading Core Web Vitals from your browser
          </p>
        </div>
      )}

      {/* Results */}
      {phase === "done" && (
        <div className="space-y-6">
          <div className="space-y-3 max-w-lg mx-auto">
            {TEST_SEQUENCE.map((test, i) => {
              const isRevealed = i < revealedCount;
              const value = capturedMetrics[test.metricKey];
              const status =
                value !== undefined ? getStatus(test, value) : null;
              const colors = status ? STATUS_COLORS[status] : null;

              return (
                <div
                  key={test.id}
                  className={`flex items-center justify-between p-4 rounded-lg border border-border/20 bg-card/40 backdrop-blur-sm transition-all duration-500 ${
                    isRevealed
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3 pointer-events-none"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isRevealed && colors ? (
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${colors.icon}`}
                      />
                    ) : (
                      <Circle className="w-5 h-5 shrink-0 text-foreground/20" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {test.label}
                      </div>
                      <div className="text-xs text-foreground/40">
                        {test.description}
                      </div>
                    </div>
                  </div>

                  {isRevealed && (
                    <div className="text-right shrink-0 ml-4">
                      {value !== undefined && colors ? (
                        <>
                          <div
                            className={`text-lg font-bold font-mono ${colors.text}`}
                          >
                            {formatValue(test.metricKey, value)}
                          </div>
                          <span
                            className={`text-[10px] font-mono border rounded px-1.5 py-0.5 ${colors.badge}`}
                          >
                            {status === "good"
                              ? "GOOD"
                              : status === "warn"
                                ? "FAIR"
                                : "POOR"}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-foreground/30 font-mono">
                          Not captured
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall grade reveal */}
          {revealedCount >= TEST_SEQUENCE.length && grade && (
            <div className="text-center space-y-4 pt-4 border-t border-border/10">
              <div className={`text-7xl font-bold font-mono ${grade.color}`}>
                {grade.label}
              </div>
              <div>
                <p className="text-foreground/60 text-sm">
                  Overall Performance Grade
                </p>
                <p className={`text-xs font-mono mt-1 ${grade.color}`}>
                  {grade.tagline}
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={shareResults}
                  className="flex items-center gap-2 px-4 py-2 border border-border/20 hover:border-cyan-400/40 rounded-md text-sm text-foreground/60 hover:text-foreground transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={rerun}
                  className="flex items-center gap-2 px-4 py-2 border border-border/20 hover:border-cyan-400/40 rounded-md text-sm text-foreground/60 hover:text-foreground transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-measure
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
