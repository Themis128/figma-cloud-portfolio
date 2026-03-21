"use client";

import { useEffect, useRef } from "react";

interface CyberConfettiProps {
  trigger: boolean;
}

const COLORS = ["#22d3ee", "#3b82f6", "#10b981", "#8b5cf6"];
const PARTICLE_COUNT = 60;
const DURATION = 3000;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
  opacity: number;
  life: number;
}

function createParticle(w: number, h: number): Particle {
  return {
    x: w * 0.3 + Math.random() * w * 0.4,
    y: h * 0.2 + Math.random() * h * 0.1,
    vx: (Math.random() - 0.5) * 8,
    vy: -(Math.random() * 6 + 2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#22d3ee",
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    shape: Math.random() > 0.5 ? "rect" : "circle",
    opacity: 1,
    life: 0,
  };
}

export default function CyberConfetti({ trigger }: CyberConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;

    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height),
    );

    const startTime = performance.now();
    let animId = 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > DURATION) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.life = elapsed / DURATION;
        p.vy += 0.15; // gravity
        p.vx += (Math.random() - 0.5) * 0.1; // wind
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - p.life * 1.2);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-1.5, -3, 3, 6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [trigger]);

  // Respect prefers-reduced-motion at render level
  if (typeof window !== "undefined") {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return null;
  }

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
