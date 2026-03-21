'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface StatItem {
  label: string;
  target: number;
  suffix?: string;
}

const STATS: StatItem[] = [
  { label: 'Years Experience', target: 15, suffix: '+' },
  { label: 'Verified Badges', target: 16 },
  { label: 'Certifications', target: 7 },
  { label: 'Languages', target: 2 },
];

const DURATION_MS = 1500;
const FRAME_INTERVAL = 16;
const TOTAL_FRAMES = DURATION_MS / FRAME_INTERVAL;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function StatCard({ stat }: { stat: StatItem }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion.current) {
      setCount(stat.target);
      setDone(true);
    }
  }, [stat.target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animate = useCallback(() => {
    if (prefersReducedMotion.current) return;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = easeOut(frame / TOTAL_FRAMES);
      setCount(Math.round(progress * stat.target));
      if (frame >= TOTAL_FRAMES) {
        clearInterval(interval);
        setCount(stat.target);
        setDone(true);
      }
    }, FRAME_INTERVAL);
    return () => clearInterval(interval);
  }, [stat.target]);

  useEffect(() => {
    if (visible && !done) {
      const cleanup = animate();
      return cleanup;
    }
    return undefined;
  }, [visible, done, animate]);

  return (
    <div
      ref={ref}
      className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-4 text-center"
    >
      <div className="font-mono text-3xl sm:text-4xl font-bold text-cyan-400">
        {count}
        {done && stat.suffix ? stat.suffix : ''}
      </div>
      <div className="text-[10px] text-foreground/50 uppercase tracking-widest mt-1">
        {stat.label}
      </div>
    </div>
  );
}

export default function CountUpStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
      {STATS.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
