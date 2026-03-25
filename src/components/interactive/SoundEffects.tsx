"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

// Web Audio API context (shared, created on first interaction)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playBlip(frequency = 1200, duration = 0.04) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.03; // Very subtle
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported or blocked
  }
}

function playClick() {
  playBlip(800, 0.03);
}

export default function SoundEffects() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);

  // Sync ref with state for event handlers
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sound-effects");
      if (stored === "true") setEnabled(true);
    } catch {
      // Ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("sound-effects", String(next));
      if (next) playBlip(1500, 0.06); // Confirmation blip
      return next;
    });
  }, []);

  // Attach hover and click listeners to interactive elements
  useEffect(() => {
    function onHover(e: Event) {
      if (!enabledRef.current) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        playBlip(1200 + Math.random() * 400, 0.03);
      }
    }

    function onClick(e: Event) {
      if (!enabledRef.current) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        playClick();
      }
    }

    document.addEventListener("mouseenter", onHover, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mouseenter", onHover, { capture: true });
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
      title={enabled ? "Sound on" : "Sound off"}
      className="fixed bottom-[max(1.5rem,var(--safe-area-bottom))] right-[max(1.5rem,var(--safe-area-right))] z-40 p-2.5 rounded-full border border-border/20 bg-card/60 backdrop-blur-sm text-foreground/40 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
