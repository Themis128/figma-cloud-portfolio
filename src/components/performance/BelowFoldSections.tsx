"use client";

import dynamic from "next/dynamic";

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-muted/20 rounded-lg"
          style={{ opacity: 1 - i * 0.2 }}
        />
      ))}
    </div>
  );
}

const SpeedTestRunner = dynamic(
  () =>
    import("@/components/performance/SpeedTestRunner").then((m) => ({
      default: m.SpeedTestRunner,
    })),
  { ssr: false, loading: () => <SectionSkeleton rows={4} /> },
);

const WebVitalsExplainer = dynamic(
  () =>
    import("@/components/performance/WebVitalsExplainer").then((m) => ({
      default: m.WebVitalsExplainer,
    })),
  { ssr: false, loading: () => <SectionSkeleton rows={2} /> },
);

const IndustryComparison = dynamic(
  () =>
    import("@/components/performance/IndustryComparison").then((m) => ({
      default: m.IndustryComparison,
    })),
  { ssr: false, loading: () => <SectionSkeleton rows={4} /> },
);

const LighthouseScore = dynamic(
  () =>
    import("@/components/performance/LighthouseScore").then((m) => ({
      default: m.LighthouseScore,
    })),
  { ssr: false, loading: () => <SectionSkeleton rows={2} /> },
);

const CrUXFieldData = dynamic(
  () => import("@/components/performance/CrUXFieldData"),
  { ssr: false, loading: () => <SectionSkeleton rows={3} /> },
);

export {
  SpeedTestRunner,
  WebVitalsExplainer,
  IndustryComparison,
  LighthouseScore,
  CrUXFieldData,
};
