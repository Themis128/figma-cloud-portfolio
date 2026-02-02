import { useEffect, useState } from 'react'

declare const window: Window & typeof globalThis

// Device breakpoints
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Animation constants
const ANIMATION_DURATION_MOBILE = 0.3
const ANIMATION_DURATION_DESKTOP = 0.5
const ANIMATION_STIFFNESS_MOBILE = 120
const ANIMATION_STIFFNESS_DESKTOP = 100
const ANIMATION_DAMPING_MOBILE = 20
const ANIMATION_DAMPING_DESKTOP = 15
const ANIMATION_THRESHOLD_MOBILE = 0.3
const ANIMATION_THRESHOLD_DESKTOP = 0.2

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        const width = (window as Window).innerWidth
        setScreenWidth(width)
        setIsMobile(width < MOBILE_BREAKPOINT)
        setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
        setIsDesktop(width >= TABLET_BREAKPOINT)
      }
    }

    const checkMotionPreference = () => {
      if (window?.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotion(mediaQuery.matches)
      }
    }

    // Initial check
    checkDevice()
    checkMotionPreference()

    // Listen for changes only if window is defined
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkDevice)
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (motionQuery) {
        motionQuery.addEventListener('change', checkMotionPreference)
        return () => {
          window.removeEventListener('resize', checkDevice)
          motionQuery.removeEventListener('change', checkMotionPreference)
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkDevice)
      }
    }
  }, [])

  return { isMobile, isTablet, isDesktop, screenWidth, prefersReducedMotion }
}

export function useOptimizedAnimation() {
  const { isMobile, prefersReducedMotion } = useDeviceType()

  // Reduce animation complexity on mobile and for users who prefer reduced motion
  const shouldReduceMotion = isMobile || prefersReducedMotion

  return {
    duration: shouldReduceMotion ? ANIMATION_DURATION_MOBILE : ANIMATION_DURATION_DESKTOP,
    stiffness: shouldReduceMotion ? ANIMATION_STIFFNESS_MOBILE : ANIMATION_STIFFNESS_DESKTOP,
    damping: shouldReduceMotion ? ANIMATION_DAMPING_MOBILE : ANIMATION_DAMPING_DESKTOP,
    threshold: shouldReduceMotion ? ANIMATION_THRESHOLD_MOBILE : ANIMATION_THRESHOLD_DESKTOP,
    disabled: prefersReducedMotion,
  }
}
