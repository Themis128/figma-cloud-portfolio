"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export function HoverCard({
  children,
  className = "",
  scale = 1.02,
  duration = 0.2,
}: HoverCardProps) {
  return (
    <m.div
      className={className}
      whileHover={{ scale }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}

interface HoverButtonProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  y?: number;
  duration?: number;
}

export function HoverButton({
  children,
  className = "",
  scale = 1.05,
  y = -2,
  duration = 0.2,
}: HoverButtonProps) {
  return (
    <m.div
      className={className}
      whileHover={{ scale, y }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}

interface HoverIconProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  rotate?: number;
  duration?: number;
}

export function HoverIcon({
  children,
  className = "",
  scale = 1.1,
  rotate = 0,
  duration = 0.3,
}: HoverIconProps) {
  return (
    <m.div
      className={className}
      whileHover={{ scale, rotate }}
      transition={{ duration, ease: "easeOut" }}
    >
      {children}
    </m.div>
  );
}
