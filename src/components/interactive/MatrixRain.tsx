'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const KATAKANA =
  '\u30A0\u30A1\u30A2\u30A3\u30A4\u30A5\u30A6\u30A7\u30A8\u30A9\u30AA\u30AB\u30AC\u30AD\u30AE\u30AF\u30B0\u30B1\u30B2\u30B3\u30B4\u30B5\u30B6\u30B7\u30B8\u30B9\u30BA\u30BB\u30BC\u30BD\u30BE\u30BF\u30C0\u30C1\u30C2\u30C3\u30C4\u30C5\u30C6\u30C7\u30C8\u30C9\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF';
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const CHARS = KATAKANA + LATIN + DIGITS;

const AUTO_DISABLE_MS = 15_000;
const FADE_DURATION_MS = 1_000;
const FONT_SIZE = 14;
const FADE_ALPHA = 0.05;
const CYAN = '#22d3ee';
const CYAN_BRIGHT = '#67e8f9';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [active, setActive] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const fadeStartRef = useRef<number>(0);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const stop = useCallback(() => {
    setFadingOut(true);
    fadeStartRef.current = performance.now();
  }, []);

  // Handle fade-out completion
  useEffect(() => {
    if (!fadingOut) return;

    const checkFade = () => {
      const elapsed = performance.now() - fadeStartRef.current;
      if (elapsed >= FADE_DURATION_MS) {
        setFadingOut(false);
        setActive(false);
      } else {
        rafRef.current = requestAnimationFrame(checkFade);
      }
    };
    rafRef.current = requestAnimationFrame(checkFade);

    return () => cancelAnimationFrame(rafRef.current);
  }, [fadingOut]);

  useEffect(() => {
    if (!active || fadingOut) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const columns = Math.floor(canvas.width / FONT_SIZE);
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.random() * -100
    );

    const draw = () => {
      // Fading trail
      ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
        const x = i * FONT_SIZE;
        const drop = drops[i] ?? 0;
        const y = drop * FONT_SIZE;

        // Leading character is brighter
        ctx.fillStyle = CYAN_BRIGHT;
        ctx.fillText(char, x, y);

        // Trail characters
        if (drop > 1) {
          ctx.fillStyle = CYAN;
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)] ?? '0';
          ctx.fillText(trailChar, x, y - FONT_SIZE);
        }

        // Reset drop when it goes off screen or randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] = drop + 1;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    // Auto-disable after 15 seconds (with fade-out)
    timerRef.current = setTimeout(stop, AUTO_DISABLE_MS);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, fadingOut, stop]);

  // Listen for toggle event from navbar button
  useEffect(() => {
    const handleToggle = () => {
      if (fadingOut) return;
      if (active) {
        stop();
      } else {
        setActive(true);
      }
    };
    window.addEventListener("toggle-matrix-rain", handleToggle);
    return () => window.removeEventListener("toggle-matrix-rain", handleToggle);
  }, [active, fadingOut, stop]);

  // Broadcast state so navbar button can reflect it
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("matrix-rain-state", { detail: { active: active && !fadingOut } }),
    );
  }, [active, fadingOut]);

  // Don't render anything if user prefers reduced motion
  if (prefersReducedMotion) return null;

  // Canvas opacity for fade-out
  const canvasOpacity = fadingOut
    ? Math.max(0, 1 - (performance.now() - fadeStartRef.current) / FADE_DURATION_MS)
    : 1;

  if (!active && !fadingOut) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 pointer-events-none transition-opacity duration-1000"
      style={{ opacity: fadingOut ? canvasOpacity : 1 }}
      aria-hidden="true"
    />
  );
}
