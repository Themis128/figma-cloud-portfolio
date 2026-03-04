import { useEffect, useRef, useState } from "react";

interface UseLazyImageOptions {
  rootMargin?: string;
  threshold?: number;
}

const LAZY_IMAGE_CONSTANTS = {
  DEFAULT_ROOT_MARGIN: "50px",
  DEFAULT_THRESHOLD: 0.1,
} as const;

export function useLazyImage(options: UseLazyImageOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin:
          options.rootMargin ?? LAZY_IMAGE_CONSTANTS.DEFAULT_ROOT_MARGIN,
        threshold: options.threshold ?? LAZY_IMAGE_CONSTANTS.DEFAULT_THRESHOLD,
      },
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [options.rootMargin, options.threshold]);

  const handleLoad = () => {
    setHasLoaded(true);
  };

  const handleError = () => {
    // Fallback handling can be added here
    setHasLoaded(true);
  };

  return {
    imgRef,
    isIntersecting,
    hasLoaded,
    handleLoad,
    handleError,
  };
}
