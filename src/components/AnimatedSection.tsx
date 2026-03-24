"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { useOptimizedAnimation } from "@/hooks/useDeviceType";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Animation constants
const SCROLL_VISIBILITY_THRESHOLD = 0.2;

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation(SCROLL_VISIBILITY_THRESHOLD);
  const {
    duration: optimizedDuration,
    stiffness,
    damping,
    disabled,
  } = useOptimizedAnimation();

  const finalDuration = duration ?? optimizedDuration;

  // Skip Framer Motion entirely when animations are disabled (low-end devices,
  // reduced-motion preference). Removes IntersectionObserver + spring overhead.
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  const offset = 20; // px — smaller offset for faster visual reveal

  const initial = (() => {
    switch (direction) {
      case "up":
        return { y: offset, opacity: 0 };
      case "down":
        return { y: -offset, opacity: 0 };
      case "left":
        return { x: offset, opacity: 0 };
      case "right":
        return { x: -offset, opacity: 0 };
      default:
        return { y: offset, opacity: 0 };
    }
  })();

  const animate = (() => {
    const visible = { opacity: 1 };
    switch (direction) {
      case "up":
      case "down":
        return isVisible ? { y: 0, ...visible } : initial;
      case "left":
      case "right":
        return isVisible ? { x: 0, ...visible } : initial;
      default:
        return isVisible ? { y: 0, ...visible } : initial;
    }
  })();

  return (
    <m.div
      ref={ref}
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        duration: finalDuration,
        delay,
        type: "spring",
        stiffness,
        damping,
      }}
    >
      {children}
    </m.div>
  );
}
