import React, { useEffect, useRef } from "react";

interface ViewTransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  name?: string;
}

export const ViewTransitionWrapper: React.FC<ViewTransitionWrapperProps> = ({
  children,
  className,
  name = "page-transition",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      return;
    }

    // Apply view transition name to the container
    if (containerRef.current) {
      containerRef.current.style.viewTransitionName = name;
    }
  }, [name]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Utility function to trigger view transitions programmatically
export const startViewTransition = (updateCallback: () => void | Promise<void>) => {
  if (document.startViewTransition) {
    return document.startViewTransition(updateCallback);
  } else {
    // Fallback for browsers that don't support View Transitions
    updateCallback();
    return null;
  }
};

// Hook for managing view transitions in components
export const useViewTransition = () => {
  const triggerTransition = React.useCallback((updateCallback: () => void | Promise<void>) => {
    return startViewTransition(updateCallback);
  }, []);

  return { triggerTransition, isSupported: !!document.startViewTransition };
};

// CSS-in-JS styles for View Transitions
const createViewTransitionStyles = () => {
  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slide-up {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slide-down {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      /* View Transition animations */
      ::view-transition-old(root) {
        animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
        animation-name: fade-out;
      }

      ::view-transition-new(root) {
        animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both;
        animation-name: fade-in;
      }

      /* Custom page transition classes */
      .page-enter {
        animation: slide-up 300ms ease-out;
      }

      .page-exit {
        animation: slide-down 300ms ease-in;
      }

      /* Additional view transition styles for better UX */
      ::view-transition-image-pair(root) {
        isolation: auto;
      }

      ::view-transition-group(root) {
        animation-duration: 300ms;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles
createViewTransitionStyles();

export default ViewTransitionWrapper;
