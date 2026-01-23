import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { useOptimizedAnimation } from '@/hooks/useDeviceType'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

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
  const { ref, isVisible } = useScrollAnimation(0.2)
  const { duration: optimizedDuration, stiffness, damping, disabled } = useOptimizedAnimation()

  const finalDuration = duration ?? optimizedDuration

  const getInitialPosition = () => {
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
  }

  const getAnimatePosition = () => {
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
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isVisible && !disabled ? getAnimatePosition() : getInitialPosition()}
      transition={{
        duration: finalDuration,
        delay,
        type: 'spring',
        stiffness,
        damping,
      }}
    >
      {children}
    </motion.div>
  )
}
