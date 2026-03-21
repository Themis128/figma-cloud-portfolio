"use client";

import { useEffect, useRef, useState } from "react";

interface VitalGaugeRingProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  good: number;
  poor: number;
}

const RADIUS = 32;
const STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColor(value: number, good: number, poor: number): string {
  if (value <= good) return "#22c55e";
  if (value <= poor) return "#eab308";
  return "#ef4444";
}

export function VitalGaugeRing({
  value,
  max,
  label,
  unit = "",
  good,
  poor,
}: VitalGaugeRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fraction = Math.min(value / max, 1);
  const offset = CIRCUMFERENCE * (1 - fraction);
  const color = getColor(value, good, poor);
  const shouldAnimate = isVisible && !reducedMotion;
  const showFinal = isVisible && reducedMotion;

  const displayValue = unit === "" ? value.toFixed(3) : Math.round(value);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        ref={ref}
        viewBox="0 0 80 80"
        className="w-20 h-20"
        aria-label={`${label}: ${displayValue}${unit}`}
        role="img"
      >
        {/* Background ring */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          className="stroke-foreground/10"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Foreground arc */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={
            shouldAnimate || showFinal ? offset : CIRCUMFERENCE
          }
          transform="rotate(-90 40 40)"
          style={{
            transition: shouldAnimate
              ? "stroke-dashoffset 1.2s ease-out"
              : "none",
          }}
        />
        {/* Center value */}
        <text
          x="40"
          y="38"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground font-mono text-[11px] font-bold"
        >
          {displayValue}
        </text>
        {unit && (
          <text
            x="40"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground/40 font-mono text-[7px]"
          >
            {unit}
          </text>
        )}
      </svg>
      <span className="text-[10px] text-foreground/50 uppercase font-mono tracking-wider">
        {label}
      </span>
    </div>
  );
}
