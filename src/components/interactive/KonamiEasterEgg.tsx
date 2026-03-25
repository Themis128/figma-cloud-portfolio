"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiEasterEgg() {
  const [activated, setActivated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const inputRef = useRef<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    inputRef.current.push(e.key);
    // Keep only the last N keys
    if (inputRef.current.length > KONAMI_CODE.length) {
      inputRef.current.shift();
    }
    // Check if the sequence matches
    if (inputRef.current.length === KONAMI_CODE.length &&
        inputRef.current.every((k, i) => k === KONAMI_CODE[i])) {
      setActivated(true);
      setShowToast(true);
      inputRef.current = [];
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!activated) return;

    // Create Matrix rain effect
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;opacity:0.8";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "THEMISBALTZAKIS01ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.random() * -100);

    let frame = 0;
    const maxFrames = 180; // ~3 seconds at 60fps

    function draw() {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22d3ee";
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const dropY = drops[i] ?? 0;
        const char = chars[Math.floor(Math.random() * chars.length)] ?? "0";
        ctx.fillText(char, i * fontSize, dropY * fontSize);
        if (dropY * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] = dropY + 1;
      }

      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        canvas.style.transition = "opacity 1s";
        canvas.style.opacity = "0";
        setTimeout(() => canvas.remove(), 1000);
        setActivated(false);
      }
    }

    requestAnimationFrame(draw);

    return () => {
      canvas.remove();
    };
  }, [activated]);

  // Auto-hide toast
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, [showToast]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-black/90 border border-cyan-500/50 rounded-lg px-6 py-3 shadow-[0_0_30px_rgba(34,211,238,0.3)] backdrop-blur-lg">
        <p className="text-cyan-400 font-mono text-sm font-bold tracking-wider">
          ↑↑↓↓←→←→BA — KONAMI CODE ACTIVATED!
        </p>
        <p className="text-cyan-500/60 font-mono text-xs mt-1">
          You found a secret! Try Ctrl+K for more hidden features.
        </p>
      </div>
    </div>
  );
}
