import { useEffect, useState } from "react";

// Performance monitoring constants
const MEMORY_USAGE_WARNING_THRESHOLD = 0.8; // Warn when memory usage exceeds 80% of limit
const MEMORY_CHECK_INTERVAL_MS = 30000; // Check memory usage every 30 seconds
const LONG_TASK_DURATION_THRESHOLD_MS = 50; // Consider tasks longer than 50ms as long tasks

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

interface CacheEntry {
  url: string;
  data: unknown;
  timestamp: number;
  ttl: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;

  set(key: string, data: unknown, ttl = 300000): void {
    // 5 minutes default TTL
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      url: key,
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  size(): number {
    return this.cache.size;
  }
}

const performanceCache = new PerformanceCache();

// Performance optimization utilities
const optimizeRender = () => {
  // Debounce scroll events
  let ticking = false;
  const optimizeScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Optimize scroll handlers
        const scrollElements = document.querySelectorAll("[data-scroll-optimize]");
        for (const _el of scrollElements) {
          // Implement scroll optimization logic
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", optimizeScroll, { passive: true });
};

const optimizeAnimations = () => {
  // Use CSS transforms instead of layout properties for animations
  const animatedElements = document.querySelectorAll("[data-animate]");
  for (const el of animatedElements) {
    const element = el as HTMLElement;
    element.style.transform = element.style.transform || "translateZ(0)";
    element.style.willChange = "transform, opacity";
  }
};

const optimizeFonts = () => {
  // Fonts are loaded via CSS @import - no additional preloading needed
  // This function is kept for potential future font optimization strategies
};

const setupPerformanceMonitoring = () => {
  // Monitor memory usage
  if ("memory" in performance) {
    setInterval(() => {
      const perfWithMemory = performance as typeof performance & {
        memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
      };
      const memory = perfWithMemory.memory;
      if (
        memory &&
        memory.usedJSHeapSize > memory.jsHeapSizeLimit * MEMORY_USAGE_WARNING_THRESHOLD
      ) {
      }
    }, MEMORY_CHECK_INTERVAL_MS); // Check every 30 seconds
  }

  // Monitor long tasks (if supported)
  if ("PerformanceObserver" in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.duration > LONG_TASK_DURATION_THRESHOLD_MS) {
          }
        }
      });

      // Check if 'longtask' is supported before observing
      if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      }
    } catch (_error) {}
  }
};

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);

  // Initialize performance monitoring on mount
  useEffect(() => {
    setupPerformanceMonitoring();
  }, []);

  // Apply optimizations
  useEffect(() => {
    if (isOptimized) {
      optimizeRender();
      optimizeAnimations();
      optimizeFonts();
    }
  }, [isOptimized]);

  // Auto-enable optimizations after initial render
  useEffect(() => {
    setIsOptimized(true);
  }, []);

  return children;
};

// Utility functions for manual optimization
export const lazyLoadImage = (src: string, placeholder?: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
    if (placeholder) {
      img.src = placeholder;
      img.onload = () => {
        img.src = src;
      };
    }
  });
};

export const preloadResource = (url: string, type: "image" | "script" | "style"): Promise<void> => {
  return new Promise((resolve, reject) => {
    let element: HTMLElement;

    if (type === "image") {
      element = new Image();
      (element as HTMLImageElement).onload = () => resolve();
      (element as HTMLImageElement).onerror = () => reject(element);
      (element as HTMLImageElement).src = url;
    } else if (type === "script") {
      element = document.createElement("script");
      element.onload = () => resolve();
      element.onerror = () => reject(element);
      (element as HTMLScriptElement).src = url;
      document.head.appendChild(element);
    } else if (type === "style") {
      element = document.createElement("link");
      (element as HTMLLinkElement).rel = "preload";
      (element as HTMLLinkElement).as = "style";
      (element as HTMLLinkElement).href = url;
      element.onload = () => resolve();
      element.onerror = () => reject(element);
      document.head.appendChild(element);
    }
  });
};

export const clearPerformanceCache = () => {
  performanceCache.clear();
};

export const getCacheSize = () => performanceCache.size();

export default PerformanceOptimizer;
