import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";

// Core Web Vitals thresholds (Google standards)
const LCP_GOOD_THRESHOLD = 2500; // ms
const LCP_NEEDS_IMPROVEMENT_THRESHOLD = 4000; // ms
const CLS_GOOD_THRESHOLD = 0.1;
const CLS_NEEDS_IMPROVEMENT_THRESHOLD = 0.25;
const FCP_TTFB_GOOD_THRESHOLD = 1800; // ms
const FCP_TTFB_NEEDS_IMPROVEMENT_THRESHOLD = 3000; // ms
const PROGRESS_PERCENTAGE_MAX = 100;

interface PerformanceDashboardProps {
  className?: string;
  compact?: boolean;
}

export function PerformanceDashboard({ className, compact = false }: PerformanceDashboardProps) {
  const { isSupported, performanceScore, formattedMetrics } = usePerformanceMonitoring();
  const [isExpanded, setIsExpanded] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState<Record<string, number>>({});

  // Track metric changes for trend indicators
  useEffect(() => {
    const currentMetrics: Record<string, number> = {};
    Object.entries(formattedMetrics).forEach(([key, value]) => {
      const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
      if (!Number.isNaN(numericValue)) {
        currentMetrics[key] = numericValue;
      }
    });
    setPreviousMetrics(currentMetrics);
  }, [formattedMetrics]);

  const getTrendIcon = (key: string, currentValue: string) => {
    const current = parseFloat(currentValue.replace(/[^\d.]/g, ""));
    const previous = previousMetrics[key];

    if (!previous || Number.isNaN(current)) return <Minus className='w-3 h-3 text-gray-400' />;

    if (current > previous) {
      return <TrendingUp className='w-3 h-3 text-red-400' />;
    } else if (current < previous) {
      return <TrendingDown className='w-3 h-3 text-green-400' />;
    }
    return <Minus className='w-3 h-3 text-gray-400' />;
  };

  if (!isSupported) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className='text-sm text-muted-foreground'>
          Performance monitoring not supported in this browser
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case "good":
        return "bg-green-500";
      case "needs-improvement":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreText = (score: string) => {
    switch (score) {
      case "good":
        return "Good";
      case "needs-improvement":
        return "Needs Improvement";
      case "poor":
        return "Poor";
      default:
        return "Unknown";
    }
  };

  const getMetricStatus = (key: string, value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));

    if (key.includes("LCP")) {
      if (numericValue <= LCP_GOOD_THRESHOLD) return { status: "good", color: "text-green-400" };
      if (numericValue <= LCP_NEEDS_IMPROVEMENT_THRESHOLD)
        return { status: "needs-improvement", color: "text-yellow-400" };
      return { status: "poor", color: "text-red-400" };
    }

    if (key.includes("CLS")) {
      if (numericValue <= CLS_GOOD_THRESHOLD) return { status: "good", color: "text-green-400" };
      if (numericValue <= CLS_NEEDS_IMPROVEMENT_THRESHOLD)
        return { status: "needs-improvement", color: "text-yellow-400" };
      return { status: "poor", color: "text-red-400" };
    }

    if (key.includes("FCP") || key.includes("TTFB")) {
      if (numericValue <= FCP_TTFB_GOOD_THRESHOLD)
        return { status: "good", color: "text-green-400" };
      if (numericValue <= FCP_TTFB_NEEDS_IMPROVEMENT_THRESHOLD)
        return { status: "needs-improvement", color: "text-yellow-400" };
      return { status: "poor", color: "text-red-400" };
    }

    return { status: "unknown", color: "text-gray-400" };
  };

  if (compact) {
    return (
      <Card
        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className={`w-2 h-2 rounded-full ${getScoreColor(performanceScore)}`} />
            <span className='text-sm font-medium'>Performance</span>
          </div>
          <Badge variant='outline' className='text-xs'>
            {getScoreText(performanceScore)}
          </Badge>
        </div>
        {isExpanded && (
          <div className='mt-3 space-y-2'>
            {Object.entries(formattedMetrics).map(([key, value]) => (
              <div key={key} className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>{key}:</span>
                <span className='font-mono'>{value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`} data-testid="core-web-vitals">
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold flex items-center gap-2'>
            <Activity className='w-5 h-5' />
            Core Web Vitals Dashboard
          </h3>
          <Badge className={`${getScoreColor(performanceScore)} text-white`}>
            {getScoreText(performanceScore)}
          </Badge>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Object.entries(formattedMetrics).map(([key, value]) => {
            const isMeasured = value !== "Not measured";
            const numericValue = isMeasured ? parseFloat(value.replace(/[^\d.]/g, "")) : 0;
            const { color } = getMetricStatus(key, value);

            // Define thresholds for progress bars
            let maxValue = PROGRESS_PERCENTAGE_MAX;
            let progressValue = 0;
            let targetValue = 0;

            if (key.includes("LCP")) {
              maxValue = LCP_NEEDS_IMPROVEMENT_THRESHOLD; // 4s
              targetValue = LCP_GOOD_THRESHOLD; // 2.5s
              progressValue = Math.min(
                (numericValue / maxValue) * PROGRESS_PERCENTAGE_MAX,
                PROGRESS_PERCENTAGE_MAX,
              );
            } else if (key.includes("CLS")) {
              maxValue = CLS_NEEDS_IMPROVEMENT_THRESHOLD;
              targetValue = CLS_GOOD_THRESHOLD;
              progressValue = Math.min(
                (numericValue / maxValue) * PROGRESS_PERCENTAGE_MAX,
                PROGRESS_PERCENTAGE_MAX,
              );
            } else if (key.includes("FCP") || key.includes("TTFB")) {
              maxValue = FCP_TTFB_NEEDS_IMPROVEMENT_THRESHOLD; // 3s
              targetValue = FCP_TTFB_GOOD_THRESHOLD; // 1.8s
              progressValue = Math.min(
                (numericValue / maxValue) * PROGRESS_PERCENTAGE_MAX,
                PROGRESS_PERCENTAGE_MAX,
              );
            }

            return (
              <div key={key} className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium'>{key}</span>
                  <div className='flex items-center gap-2'>
                    {getTrendIcon(key, value)}
                    <span className={`text-sm font-mono ${color}`}>{value}</span>
                  </div>
                </div>

                {isMeasured && (
                  <>
                    <Progress value={progressValue} className='h-2' />
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>Current: {value}</span>
                      <span>
                        Target: {key.includes("CLS") ? `< ${targetValue}` : `< ${targetValue}ms`}
                      </span>
                    </div>
                  </>
                )}

                {!isMeasured && (
                  <div className='text-xs text-muted-foreground'>Waiting for measurement...</div>
                )}
              </div>
            );
          })}
        </div>

        <div className='border-t pt-4'>
          <div className='text-xs text-muted-foreground space-y-2'>
            <p className='font-medium text-foreground'>📊 Core Web Vitals Explained:</p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='font-medium text-cyan-400'>Largest Contentful Paint (LCP)</p>
                <p>Measures loading performance. Target: &lt; 2.5s</p>
              </div>
              <div>
                <p className='font-medium text-cyan-400'>Cumulative Layout Shift (CLS)</p>
                <p>Measures visual stability. Target: &lt; 0.1</p>
              </div>
              <div>
                <p className='font-medium text-cyan-400'>First Contentful Paint (FCP)</p>
                <p>Measures perceived load speed. Target: &lt; 1.8s</p>
              </div>
              <div>
                <p className='font-medium text-cyan-400'>Time to First Byte (TTFB)</p>
                <p>Measures server response time. Target: &lt; 800ms</p>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t pt-4'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Activity className='w-3 h-3' />
            <span>
              Real-time monitoring active • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
