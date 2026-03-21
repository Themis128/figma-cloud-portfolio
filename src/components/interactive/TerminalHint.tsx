'use client';

import { useEffect, useState } from 'react';

export default function TerminalHint() {
  const [visible, setVisible] = useState(false);
  const [faded, setFaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect((): (() => void) | void => {
    // Hide on touch-only devices
    const hoverQuery = window.matchMedia('(hover: hover)');
    if (!hoverQuery.matches) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    setVisible(true);

    if (!motionQuery.matches) {
      const timer = setTimeout(() => setFaded(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <span
      className="text-[10px] text-foreground/20 font-mono tracking-wider inline-block mt-2"
      style={
        reducedMotion
          ? undefined
          : {
              opacity: faded ? 0 : 1,
              transition: 'opacity 1s ease-out',
            }
      }
      aria-hidden="true"
    >
      Press{' '}
      <kbd className="px-1 py-0.5 rounded border border-foreground/10 bg-foreground/5 text-[10px] font-mono">
        `
      </kbd>{' '}
      for terminal
    </span>
  );
}
