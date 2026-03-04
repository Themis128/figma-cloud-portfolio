import { useMemo } from "react";

import { useLazyImage } from "@/hooks/useLazyImage";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  placeholder?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  sizes = "100vw",
  loading = "lazy",
  priority = false,
  placeholder,
  fallbackSrc,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const { imgRef, isIntersecting, hasLoaded, handleLoad, handleError } =
    useLazyImage({
      rootMargin: "50px",
    });

  // Generate responsive image sources
  const imageSources = useMemo(() => {
    const baseSrc = src.replace(/\.(png|jpe?g)$/i, "");
    return {
      webp: `${baseSrc}.webp`,
      avif: `${baseSrc}.avif`,
      original: src,
    };
  }, [src]);

  // Determine if we should load the image
  const shouldLoad = priority || isIntersecting;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Placeholder/Skeleton */}
      {!hasLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse",
            hasLoaded && "opacity-0 transition-opacity duration-300",
          )}
          aria-hidden="true"
        >
          {placeholder && (
            // biome-ignore lint/performance/noImgElement: Custom optimized image component with lazy loading and responsive formats
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* Optimized Image */}
      <picture
        className={cn(
          "w-full h-full",
          hasLoaded
            ? "opacity-100"
            : "opacity-0 transition-opacity duration-300",
        )}
      >
        {/* AVIF source */}
        <source
          srcSet={shouldLoad ? imageSources.avif : ""}
          type="image/avif"
          sizes={sizes}
        />
        {/* WebP source */}
        <source
          srcSet={shouldLoad ? imageSources.webp : ""}
          type="image/webp"
          sizes={sizes}
        />
        {/* Fallback */}
        <img
          ref={imgRef}
          src={shouldLoad ? fallbackSrc || imageSources.original : ""}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : loading}
          decoding="async"
          className="w-full h-full object-cover"
          onLoad={() => {
            handleLoad();
            onLoad?.();
          }}
          onError={() => {
            handleError();
            onError?.();
          }}
        />
      </picture>
    </div>
  );
}
