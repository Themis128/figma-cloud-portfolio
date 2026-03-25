"use client";

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function MatrixRainToggle() {
  const [active, setActive] = useState(false);

  // Listen for state changes from the MatrixRain component
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ active: boolean }>).detail;
      setActive(detail.active);
    };
    window.addEventListener("matrix-rain-state", handler);
    return () => window.removeEventListener("matrix-rain-state", handler);
  }, []);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => window.dispatchEvent(new CustomEvent("toggle-matrix-rain"))}
      aria-label={active ? "Disable matrix rain effect" : "Enable matrix rain effect"}
      title={active ? "Disable matrix rain" : "Enable matrix rain"}
      className={`border-border/40 hover:border-cyan-400/60 hover:bg-transparent ${
        active ? "text-cyan-400 border-cyan-400/60 shadow-[0_0_8px_rgba(34,211,238,0.3)]" : ""
      }`}
    >
      <Zap className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Matrix rain</span>
    </Button>
  );
}
