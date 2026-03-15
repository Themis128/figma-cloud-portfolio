'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafId = useRef<number>(0);
  const ticking = useRef(false);

  const updateProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    setProgress(Math.min(100, Math.max(0, scrollPercent)));
    setVisible(scrollTop > 50);
    ticking.current = false;
  }, []);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;
      rafId.current = requestAnimationFrame(updateProgress);
    }
  }, [updateProgress]);

  useEffect(() => {
    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [onScroll, updateProgress]);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 transition-[width] duration-150 ease-out"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        transition: 'width 150ms ease-out, opacity 300ms ease-in-out',
      }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
}
