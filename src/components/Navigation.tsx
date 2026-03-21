"use client";

import { Accessibility, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HoverButton } from "@/components/HoverAnimations";
import { NotificationButton } from "@/components/NotificationButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const openAccessibilityPanel = () => {
    window.dispatchEvent(new CustomEvent("open-accessibility-panel"));
  };

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about/" },
    { name: "Resume", href: "/resume/" },
    { name: "Contact", href: "/contact/" },
    { name: "Performance", href: "/performance/" },
    { name: "Agents", href: "/agents/" },
    { name: "Admin", href: "/admin/" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
    return pathname === normalized || pathname === `${normalized}/`;
  };

  return (
    <header className="relative z-50" style={{ paddingTop: 'var(--safe-area-top)' }}>
    <nav>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-foreground font-bold text-xl md:text-2xl tracking-wider hover:text-cyan-400 transition-colors"
            aria-label="Home"
          >
            TB
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-cyan-400 ${
                  isActive(item.href)
                    ? "text-cyan-400 border-b-2 border-cyan-400 pb-1"
                    : "text-foreground/80"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Theme, notifications and accessibility toggles */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationButton />
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={openAccessibilityPanel}
              data-testid="accessibility-toggle"
              aria-label="Open accessibility settings"
              className="border-border/40 hover:border-cyan-400/60 hover:bg-transparent"
            >
              <Accessibility className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Accessibility</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 min-w-11 min-h-11 flex items-center justify-center rounded-md text-foreground hover:text-cyan-400 hover:bg-foreground/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Accessibility Settings */}
          <button
            type="button"
            onClick={() => {
              openAccessibilityPanel();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
          >
            <Accessibility className="h-5 w-5" />
            Accessibility Settings
          </button>

          {/* CTA Button */}
          <div className="pt-2">
            <HoverButton>
              <Link
                href="/contact/"
                onClick={() => setIsOpen(false)}
                className="w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-foreground rounded-lg transition-all duration-300 text-center font-medium block"
              >
                Get In Touch
              </Link>
            </HoverButton>
          </div>
        </div>
      </div>
    </nav>
    </header>
  );
}
