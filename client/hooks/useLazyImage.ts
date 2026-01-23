import { useEffect, useRef, useState } from 'react'

interface UseLazyImageOptions {
  rootMargin?: string
  threshold?: number
}

export function useLazyImage(options: UseLazyImageOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: options.rootMargin ?? '50px',
        threshold: options.threshold ?? 0.1,
      },
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [options.rootMargin, options.threshold])

  const handleLoad = () => {
    setHasLoaded(true)
  }

  const handleError = () => {
    // Fallback handling can be added here
    setHasLoaded(true)
  }

  return {
    imgRef,
    isIntersecting,
    hasLoaded,
    handleLoad,
    handleError,
  }
}
