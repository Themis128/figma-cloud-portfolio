import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggleButton() {
  const { theme, setTheme, actualTheme } = useTheme();

  // Simple toggle between light and dark (ignores system preference)
  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="relative"
          aria-label={`Current theme: ${actualTheme}. Click to toggle between light and dark themes.`}
          data-testid="theme-toggle-button"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-200 ease-in-out dark:-rotate-90 dark:scale-0 lucide lucide-sun" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-200 ease-in-out dark:rotate-0 dark:scale-100 lucide lucide-moon" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={actualTheme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4 lucide lucide-sun" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={actualTheme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4 lucide lucide-moon" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4 lucide lucide-monitor" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Alternative: Simple toggle button (no dropdown)
export function SimpleThemeToggleButton() {
  const { actualTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      aria-label={`Switch to ${actualTheme === "light" ? "dark" : "light"} theme`}
      data-testid="simple-theme-toggle"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-200 ease-in-out dark:-rotate-90 dark:scale-0 lucide lucide-sun" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-200 ease-in-out dark:rotate-0 dark:scale-100 lucide lucide-moon" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
