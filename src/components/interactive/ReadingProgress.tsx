"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const ticking = useRef(false);
  const rafId = useRef(0);

  const update = useCallback(() => {
    const article = document.querySelector("article") ?? document.querySelector("main");
    if (!article) {
      ticking.current = false;
      return;
    }

    const rect = article.getBoundingClientRect();
    const articleTop = rect.top + window.scrollY;
    const articleHeight = rect.height;
    const scrolled = window.scrollY - articleTop;
    const pct = Math.min(100, Math.max(0, (scrolled / (articleHeight - window.innerHeight)) * 100));
    setProgress(pct);

    // Estimate time left (assuming 200 words/min, ~5 chars/word)
    const remaining = Math.max(0, articleHeight - scrolled - window.innerHeight);
    const charsPerPixel = 5; // rough estimate
    const wordsLeft = (remaining * charsPerPixel) / 5;
    const minsLeft = Math.ceil(wordsLeft / 200);
    setTimeLeft(minsLeft <= 0 ? "" : minsLeft === 1 ? "1 min left" : `${minsLeft} min left`);

    ticking.current = false;
  }, []);

  const onScroll = useCallback(() => {
    if (!ticking.current) {
      ticking.current = true;
      rafId.current = requestAnimationFrame(update);
    }
  }, [update]);

  useEffect(() => {
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [onScroll, update]);

  if (progress <= 0) return null;

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/10">
      <div className="flex items-center gap-3 max-w-4xl mx-auto px-4 py-1.5">
        <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-foreground/40 font-mono text-[10px] shrink-0 w-10 text-right">
          {Math.round(progress)}%
        </span>
        {timeLeft && (
          <span className="text-foreground/30 font-mono text-[10px] shrink-0 hidden sm:block">
            {timeLeft}
          </span>
        )}
      </div>
    </div>
  );
}
