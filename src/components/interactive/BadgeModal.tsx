'use client';

import { AnimatePresence, m } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

export interface BadgeData {
  name: string;
  issuer: string;
  image: string;
  description: string;
  url?: string;
}

interface BadgeModalProps {
  badge: BadgeData | null;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (badge) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      // Focus the dialog after animation
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [badge, handleKeyDown]);

  return (
    <AnimatePresence>
      {badge && (
        <m.div
          key="badge-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <m.div
            key="badge-modal-content"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={badge.name}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-background/95 backdrop-blur-lg border border-cyan-400/20 rounded-xl p-6 max-w-md w-full outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <Image
                src={badge.image}
                alt={badge.name}
                width={80}
                height={80}
                className="rounded-lg shrink-0"
                unoptimized
              />
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {badge.name}
                </h2>
                <p className="text-cyan-400 text-sm font-mono">
                  {badge.issuer}
                </p>
              </div>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed mb-6">
              {badge.description}
            </p>
            <div className="flex items-center justify-between">
              {badge.url ? (
                <a
                  href={badge.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-mono rounded-lg hover:bg-cyan-400/20 transition-colors"
                >
                  View on Credly &rarr;
                </a>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
