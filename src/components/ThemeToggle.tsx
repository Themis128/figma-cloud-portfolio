"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Keep body in sync with the html dark class for test compatibility
  useEffect(() => {
    if (!resolvedTheme) return;
    document.body.classList.remove("light", "dark");
    document.body.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
    // Apply to body immediately so tests observe the change right away
    document.body.classList.remove("light", "dark");
    document.body.classList.add(next);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label="Toggle theme"
      className="relative border-border/40 hover:border-cyan-400/60 hover:bg-transparent"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
