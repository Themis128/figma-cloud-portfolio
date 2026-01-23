import type React from "react";
import { useEffect, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply view transition name for page transitions
    if (containerRef.current && "startViewTransition" in document) {
      containerRef.current.style.viewTransitionName = "page-transition";
    }
  }, []);

  return (
    <div ref={containerRef} className={`min-h-screen ${className || ""}`}>
      {children}
    </div>
  );
};

export default PageTransition;
