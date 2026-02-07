import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { useOptimizedAnimation } from '@/hooks/useDeviceType'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

// Constants for animation thresholds
const SCROLL_ANIMATION_THRESHOLD = 0.2

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation(SCROLL_ANIMATION_THRESHOLD)
  const { duration: optimizedDuration, stiffness, damping, disabled } = useOptimizedAnimation()

  const finalDuration = duration ?? optimizedDuration

  const getInitialPosition = useCallback(() => {
    switch (direction) {
      case 'up':
        return { y: 40, opacity: 0 }
      case 'down':
        return { y: -40, opacity: 0 }
      case 'left':
        return { x: 40, opacity: 0 }
      case 'right':
        return { x: -40, opacity: 0 }
      default:
        return { y: 40, opacity: 0 }
    }
  }, [direction])

  const getAnimatePosition = useCallback(() => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: 0, opacity: 1 }
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 }
      default:
        return { y: 0, opacity: 1 }
    }
  }, [direction])

  const transition = useMemo(
    () => ({
      duration: finalDuration,
      delay,
      type: 'spring' as const,
      stiffness,
      damping,
    }),
    [finalDuration, delay, stiffness, damping],
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isVisible && !disabled ? getAnimatePosition() : getInitialPosition()}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
