'use client';

import { useEffect, useRef, useState } from 'react';

const PARTICLE_COUNT = 10;
const BASE_OPACITY = 0.4;

interface Particle {
  x: number;
  y: number;
}

export default function CursorTrail() {
  const [enabled, setEnabled] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({ x: -100, y: -100 }))
  );
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);

  // Detect desktop (hover-capable) and reduced-motion preference
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isHoverDevice = window.matchMedia('(hover: hover)').matches;

    if (prefersReducedMotion || !isHoverDevice) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = () => {
      const particles = particlesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      // First particle follows mouse directly
      const first = particles[0];
      if (first) {
        first.x += (mx - first.x) * 0.35;
        first.y += (my - first.y) * 0.35;
      }

      // Each subsequent particle follows the one before it
      for (let i = 1; i < PARTICLE_COUNT; i++) {
        const prev = particles[i - 1];
        const curr = particles[i];
        if (prev && curr) {
          const speed = 0.3 - i * 0.02;
          curr.x += (prev.x - curr.x) * speed;
          curr.y += (prev.y - curr.y) * speed;
        }
      }

      // Apply transforms
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const el = elementsRef.current[i];
        const p = particles[i];
        if (el && p) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const opacity = BASE_OPACITY * (1 - i / PARTICLE_COUNT);
        const scale = 1 - i * 0.06;
        return (
          <div
            key={i}
            ref={(el) => {
              elementsRef.current[i] = el;
            }}
            className="absolute -left-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-cyan-400"
            style={{
              opacity,
              transform: 'translate3d(-100px, -100px, 0)',
              scale: `${scale}`,
              willChange: 'transform',
            }}
          />
        );
      })}
    </div>
  );
}
