import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";

// Constants for magic numbers
const ACTIVITY_ID_RADIX = 36;
const PRERENDER_DELAY = 200;

interface ActivityProps {
  children: ReactNode;
  trigger?: "hover" | "viewport" | "manual";
  delay?: number;
  className?: string;
}

/**
 * Activity component for React 19 pre-rendering
 * Pre-renders content that users are likely to interact with soon
 */
export function Activity({
  children,
  trigger = "hover",
  delay = 100,
  className = "",
}: ActivityProps) {
  const [isPreRendered, setIsPreRendered] = useState(trigger === "manual");
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (trigger === "manual") return;

    let timeoutId: number;

    const handleTrigger = () => {
      if (!isPreRendered) {
        timeoutId = window.setTimeout(() => {
          setIsPreRendered(true);
        }, delay);
      }
    };

    if (trigger === "hover" && elementRef) {
      // Pre-render on hover with delay
      elementRef.addEventListener("mouseenter", handleTrigger);
      elementRef.addEventListener("click", () => setIsPreRendered(true));
      return () => {
        elementRef.removeEventListener("mouseenter", handleTrigger);
        elementRef.removeEventListener("click", () => setIsPreRendered(true));
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    } else if (trigger === "viewport" && elementRef) {
      // Pre-render when element enters viewport
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              handleTrigger();
            }
          }
        },
        { threshold: 0.1, rootMargin: "50px" },
      );

      observer.observe(elementRef);
      return () => {
        observer.unobserve(elementRef);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [trigger, delay, isPreRendered, elementRef]);

  const activityId = React.useMemo(() => Math.random().toString(ACTIVITY_ID_RADIX), []);

  return (
    <div
      ref={setElementRef}
      data-activity-id={activityId}
      className={`activity-container ${className}`}
      style={
        {
          contain: isPreRendered ? "none" : "layout style paint",
          contentVisibility: isPreRendered ? "visible" : "auto",
        } as React.CSSProperties
      }
    >
      {isPreRendered ? (
        children
      ) : (
        <div className='activity-placeholder' aria-hidden='true'>
          {/* Placeholder content while pre-rendering */}
          <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4 mb-2' />
          <div className='animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-3 w-1/2' />
        </div>
      )}
    </div>
  );
}

/**
 * Pre-rendered modal/activity that can be triggered
 */
interface ActivityModalProps {
  children: ReactNode;
  trigger: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preRender?: boolean;
}

export function ActivityModal({
  children,
  trigger,
  isOpen,
  onOpenChange,
  preRender = true,
}: ActivityModalProps) {
  const [isPreRendered, setIsPreRendered] = useState(false);

  useEffect(() => {
    if (preRender && !isPreRendered) {
      // Pre-render after a short delay
      const timeout = setTimeout(() => setIsPreRendered(true), PRERENDER_DELAY);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [preRender, isPreRendered]);

  const handleTriggerClick = () => {
    onOpenChange(true);
  };

  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={handleTriggerClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerClick();
          }
        }}
        className='focus:outline-none cursor-pointer inline-block'
        aria-label='Open activity modal'
      >
        {trigger}
      </button>

      {(isPreRendered || isOpen) && (
        <div
          className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}
          style={{
            contentVisibility: isOpen ? "visible" : "hidden",
            contain: isOpen ? "none" : "layout style paint",
          }}
        >
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            aria-hidden='true'
          />
          <div className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>{children}</div>
        </div>
      )}
    </>
  );
}

/**
 * Activity boundary for grouping related interactive elements
 */
interface ActivityBoundaryProps {
  children: ReactNode;
  mode?: "conservative" | "moderate" | "aggressive";
  className?: string;
}

export function ActivityBoundary({
  children,
  mode = "moderate",
  className = "",
}: ActivityBoundaryProps) {
  const delays = {
    conservative: 500,
    moderate: 200,
    aggressive: 50,
  };

  return (
    <div className={`activity-boundary ${className}`} data-activity-boundary={mode}>
      {React.Children.map(children, (child: ReactNode, index: number) => {
        const elementId = `activity-${index}`;

        return (
          <Activity
            key={elementId}
            trigger='viewport'
            delay={delays[mode]}
            className='activity-child'
          >
            {React.isValidElement(child)
              ? React.cloneElement(child, {
                  "data-activity-id": elementId,
                } as React.HTMLAttributes<HTMLElement>)
              : child}
          </Activity>
        );
      })}
    </div>
  );
}

export default Activity;
