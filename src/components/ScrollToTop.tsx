"use client";

import { ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/20 bg-background/80 backdrop-blur-sm text-foreground/50 shadow-lg shadow-cyan-500/5 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-background/90 transition-all duration-200"
      aria-label="Scroll to top"
      title="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
