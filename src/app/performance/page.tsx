import type { Metadata } from "next";
import { Suspense } from "react";

import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import {
  IndustryComparison,
  LighthouseScore,
  SpeedTestRunner,
  WebVitalsExplainer,
} from "@/components/performance/BelowFoldSections";
import { LiveLoadHero } from "@/components/performance/LiveLoadHero";
import { PerformanceMethodology } from "@/components/performance/PerformanceMethodology";
import { SectionNav } from "@/components/performance/SectionNav";

export const metadata: Metadata = {
  title: "Performance",
  description:
    "Real-time performance metrics, Core Web Vitals, and an interactive speed test for baltzakisthemis.com — built for speed.",
  openGraph: {
    title: "Performance | Themistoklis Baltzakis",
    description:
      "See how fast this portfolio loads on your device — live Core Web Vitals and interactive speed test.",
  },
};

function MetricSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-muted/20 rounded-lg mx-auto max-w-xs" />
      <div className="h-24 w-24 bg-muted/10 rounded-full mx-auto" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: "hero", label: "Live Metrics" },
  { id: "speed-test", label: "Speed Test" },
  { id: "vitals", label: "Web Vitals" },
  { id: "lighthouse", label: "Lighthouse" },
  { id: "comparison", label: "Comparison" },
  { id: "methodology", label: "How It's Built" },
] as const;

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <SectionNav sections={SECTIONS} />

      <main id="main-content" className="relative z-10">
        {/* ── SECTION 1: Hero — Your Load Experience ── */}
        <section
          id="hero"
          aria-labelledby="perf-hero-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20"
        >
          <AnimatedSection delay={0}>
            <div className="text-center mb-16 space-y-4">
              <h1
                id="perf-hero-heading"
                className="text-4xl sm:text-5xl font-bold tracking-tight"
              >
                <span className="block text-foreground/50 uppercase tracking-[0.2em] text-sm sm:text-base mb-3 font-mono">
                  Real-time
                </span>
                <span className="block text-foreground uppercase tracking-wider">
                  Performance
                </span>
              </h1>
              <p className="text-cyan-400 text-sm font-semibold tracking-wide uppercase">
                Measured live — on your device, your connection
              </p>
              <div className="w-12 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            </div>
          </AnimatedSection>

          <Suspense fallback={<MetricSkeleton />}>
            <LiveLoadHero />
          </Suspense>
        </section>

        <div className="border-t border-border/10" />

        {/* ── SECTION 2: Interactive Speed Test ── */}
        <section
          id="speed-test"
          aria-labelledby="speed-test-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <SpeedTestRunner />
        </section>

        <div className="border-t border-border/10" />

        {/* ── SECTION 3: Core Web Vitals Explained ── */}
        <section
          id="vitals"
          aria-labelledby="vitals-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <WebVitalsExplainer />
        </section>

        <div className="border-t border-border/10" />

        {/* ── SECTION 4: Lighthouse Audit ── */}
        <section
          id="lighthouse"
          aria-labelledby="lighthouse-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <LighthouseScore />
        </section>

        <div className="border-t border-border/10" />

        {/* ── SECTION 5: Industry Comparison ── */}
        <section
          id="comparison"
          aria-labelledby="comparison-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <IndustryComparison />
        </section>

        <div className="border-t border-border/10" />

        {/* ── SECTION 6: How It's Built (merged checklist + stack) ── */}
        <section
          id="methodology"
          aria-labelledby="methodology-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32"
        >
          <PerformanceMethodology />
        </section>
      </main>
    </div>
  );
}
