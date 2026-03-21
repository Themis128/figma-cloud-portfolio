'use client';

import { m } from 'framer-motion';
import { type ReactNode, useEffect, useRef, useState } from 'react';

interface AchievementBadgeProps {
  children: ReactNode;
  index: number;
  onClick?: () => void;
}

function AchievementPill({ visible }: { visible: boolean }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible]);

  if (!show) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center mb-4"
    >
      <span className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-mono px-3 py-1 rounded-full">
        Achievement Unlocked
      </span>
    </m.div>
  );
}

export default function AchievementBadge({
  children,
  index,
  onClick,
}: AchievementBadgeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showPill, setShowPill] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const handleViewportEnter = () => {
    if (index === 0 && !shownRef.current) {
      shownRef.current = true;
      setShowPill(true);
    }
  };

  if (prefersReducedMotion) {
    return (
      <div
        onClick={onClick}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {index === 0 && <AchievementPill visible={showPill} />}
        {children}
      </div>
    );
  }

  return (
    <>
      {index === 0 && <AchievementPill visible={showPill} />}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-50px' }}
        onViewportEnter={handleViewportEnter}
        onClick={onClick}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={onClick ? 'cursor-pointer' : undefined}
      >
        {children}
      </m.div>
    </>
  );
}
