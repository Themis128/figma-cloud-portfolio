"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";

interface ScoreCategory {
  label: string;
  score: number;
  color: string;
  description: string;
}

// Latest Lighthouse lab scores — update after each audit
const SCORES: ScoreCategory[] = [
  {
    label: "Performance",
    score: 99,
    color: "text-green-400",
    description: "Speed, interactivity & visual stability",
  },
  {
    label: "Accessibility",
    score: 100,
    color: "text-green-400",
    description: "ARIA, contrast & keyboard support",
  },
  {
    label: "Best Practices",
    score: 100,
    color: "text-green-400",
    description: "Security, modern APIs & standards",
  },
  {
    label: "SEO",
    score: 100,
    color: "text-green-400",
    description: "Crawlability, meta tags & structured data",
  },
];

function ScoreRing({
  score,
  color,
  size = 80,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const hasAnimated = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          // Animate score count-up
          const start = Date.now();
          const duration = 1200;
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(score * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [score]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted/20"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      <span
        className={`absolute text-xl font-bold font-mono ${color}`}
      >
        {animatedScore}
      </span>
    </div>
  );
}

export function LighthouseScore() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-foreground">
          Lighthouse Audit
        </h2>
        <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
        <p className="text-foreground/50 text-sm">
          Latest lab scores from Google Lighthouse
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
        {SCORES.map((cat, i) => (
          <AnimatedSection key={cat.label} delay={0.1 * i}>
            <div className="flex flex-col items-center gap-3 text-center">
              <ScoreRing score={cat.score} color={cat.color} />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {cat.label}
                </div>
                <div className="text-[10px] text-foreground/40 mt-0.5">
                  {cat.description}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <p className="text-[10px] text-foreground/25 text-center font-mono">
        Measured with Lighthouse 12 — Chrome DevTools, desktop preset
      </p>
    </div>
  );
}
