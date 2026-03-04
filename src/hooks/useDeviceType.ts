"use client";

import { useEffect, useState } from "react";

declare const window: Window & typeof globalThis;

// Device breakpoints
const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

// Animation settings
const ANIMATION_SETTINGS = {
  REDUCED_MOTION: {
    DURATION: 0.3,
    STIFFNESS: 120,
    DAMPING: 20,
    THRESHOLD: 0.3,
  },
  NORMAL: {
    DURATION: 0.5,
    STIFFNESS: 100,
    DAMPING: 15,
    THRESHOLD: 0.2,
  },
} as const;

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== "undefined") {
        const width = (window as Window).innerWidth;
        setScreenWidth(width);
        setIsMobile(width < BREAKPOINTS.MOBILE);
        setIsTablet(width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET);
        setIsDesktop(width >= BREAKPOINTS.TABLET);
      }
    };

    const checkMotionPreference = () => {
      if (window?.matchMedia) {
        const mediaQuery = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        );
        setPrefersReducedMotion(mediaQuery.matches);
      }
    };

    // Initial check
    checkDevice();
    checkMotionPreference();

    // Listen for changes only if window is defined
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkDevice);
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (motionQuery) {
        motionQuery.addEventListener("change", checkMotionPreference);
        return () => {
          window.removeEventListener("resize", checkDevice);
          motionQuery.removeEventListener("change", checkMotionPreference);
        };
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkDevice);
      }
    };
  }, []);

  return { isMobile, isTablet, isDesktop, screenWidth, prefersReducedMotion };
}

export function useOptimizedAnimation() {
  const { isMobile, prefersReducedMotion } = useDeviceType();

  // Reduce animation complexity on mobile and for users who prefer reduced motion
  const shouldReduceMotion = isMobile || prefersReducedMotion;

  return {
    duration: shouldReduceMotion
      ? ANIMATION_SETTINGS.REDUCED_MOTION.DURATION
      : ANIMATION_SETTINGS.NORMAL.DURATION,
    stiffness: shouldReduceMotion
      ? ANIMATION_SETTINGS.REDUCED_MOTION.STIFFNESS
      : ANIMATION_SETTINGS.NORMAL.STIFFNESS,
    damping: shouldReduceMotion
      ? ANIMATION_SETTINGS.REDUCED_MOTION.DAMPING
      : ANIMATION_SETTINGS.NORMAL.DAMPING,
    threshold: shouldReduceMotion
      ? ANIMATION_SETTINGS.REDUCED_MOTION.THRESHOLD
      : ANIMATION_SETTINGS.NORMAL.THRESHOLD,
    disabled: prefersReducedMotion,
  };
}
