import { useEffect, useState } from "react";

declare const window: Window & typeof globalThis;

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
        setIsMobile(width < 768);
        setIsTablet(width >= 768 && width < 1024);
        setIsDesktop(width >= 1024);
      }
    };

    const checkMotionPreference = () => {
      if (typeof window !== "undefined" && window.matchMedia) {
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
      const motionQuery = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      );
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
    duration: shouldReduceMotion ? 0.3 : 0.5,
    stiffness: shouldReduceMotion ? 120 : 100,
    damping: shouldReduceMotion ? 20 : 15,
    threshold: shouldReduceMotion ? 0.3 : 0.2,
    disabled: prefersReducedMotion,
  };
}
