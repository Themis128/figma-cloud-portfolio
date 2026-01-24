import { useEffect } from "react";

interface ResourcePreloaderProps {
  children: React.ReactNode;
}

const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({ children }) => {
  useEffect(() => {
    // Resource Preloading using React 19 APIs
    // Note: These are conceptual implementations as React 19 APIs are still emerging

    // 1. Prefetch DNS for external resources
    const dnsResources = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://www.google.com",
      "https://api.context7.com",
      "https://api.openai.com",
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ];

    dnsResources.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = url;
      document.head.appendChild(link);
    });

    // 2. Preconnect to important origins
    const preconnectResources = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://api.context7.com",
    ];

    preconnectResources.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // 3. Fonts are loaded via CSS @import in global.css - no preload needed

    // 4. Preload only essential images that are used immediately
    const criticalImages: string[] = [
      // Logo is not preloaded as Navigation uses text "TB" instead of image
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = src;
      link.as = "image";
      document.head.appendChild(link);
    });

    // 5. Don't preload CSS - let Vite handle it
    // const criticalCSS = ['/global.css']

    // 6. Don't preload scripts - let Vite handle code splitting
    // const criticalScripts: string[] = []

    // 7. Prefetch non-critical resources (lower priority)
    const prefetchResources = ["/resume.pdf"]; // Only prefetch resume as it's user-initiated

    prefetchResources.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
    });

    // 8. Initialize critical resources (minimal)
    const initializeCriticalResources = async () => {
      try {
        // Just wait for fonts to be ready
        if ("fonts" in document) {
          await document.fonts.ready;
        }

        // Critical resources initialized successfully
      } catch (_error) {
        // Resource initialization failed - silently handle
      }
    };

    initializeCriticalResources();
  }, []);

  return <>{children}</>;
};

export default ResourcePreloader;
