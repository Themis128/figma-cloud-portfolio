"use client";

import {
  Accessibility,
  Bot,
  BookOpen,
  Gauge,
  Home,
  FileText,
  Mail,
  Menu,
  Shield,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HoverButton } from "@/components/HoverAnimations";
import { MatrixRainToggle } from "@/components/interactive/MatrixRainToggle";
import { NotificationButton } from "@/components/NotificationButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SoundEffects = dynamic(
  () => import("@/components/interactive/SoundEffects"),
  { ssr: false },
);

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about/", icon: User },
  { name: "Resume", href: "/resume/", icon: FileText },
  { name: "Contact", href: "/contact/", icon: Mail },
  { name: "Blog", href: "/blog/", icon: BookOpen },
  { name: "Performance", href: "/performance/", icon: Gauge },
  { name: "Agents", href: "/agents/", icon: Bot },
  { name: "Admin", href: "/admin/", icon: Shield },
];

export default function Navigation() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();

  const openAccessibilityPanel = () => {
    window.dispatchEvent(new CustomEvent("open-accessibility-panel"));
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
    return pathname === normalized || pathname === `${normalized}/`;
  };

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/10"
      style={{ paddingTop: "var(--safe-area-top)" }}
    >
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

            {/* Desktop Navigation Links */}
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

            {/* Desktop Toolbar */}
            <div className="hidden md:flex items-center gap-1.5">
              <NotificationButton />
              <ThemeToggle />

              <Separator orientation="vertical" className="h-5 mx-1 bg-border/30" />

              <SoundEffects />
              <MatrixRainToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={openAccessibilityPanel}
                data-testid="accessibility-toggle"
                aria-label="Open accessibility settings"
                title="Accessibility settings"
                className="border-border/40 hover:border-cyan-400/60 hover:bg-transparent"
              >
                <Accessibility className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Accessibility</span>
              </Button>

              <Separator orientation="vertical" className="h-5 mx-1 bg-border/30" />

              <Link
                href="/contact/"
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-500 text-black text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                Get In Touch
              </Link>
            </div>

            {/* Mobile: bell + theme + hamburger Sheet */}
            <div className="flex md:hidden items-center gap-1">
              <NotificationButton />
              <ThemeToggle />

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-md text-foreground hover:text-cyan-400 hover:bg-foreground/10 transition-colors"
                    aria-label="Toggle menu"
                    suppressHydrationWarning
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-72 bg-background/95 backdrop-blur-xl border-l border-border/20 p-0"
                >
                  <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle className="text-left font-mono text-lg tracking-wider text-cyan-400">
                      TB
                    </SheetTitle>
                    <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
                  </SheetHeader>

                  {/* Navigation Links */}
                  <div className="px-3 py-2 space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                              : "text-foreground/70 hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  <Separator className="mx-6 my-2 bg-border/20" />

                  {/* Effects & Settings */}
                  <div className="px-6 py-3 space-y-3">
                    <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-wider">
                      Effects & Settings
                    </p>
                    <div className="flex items-center gap-2">
                      <SoundEffects />
                      <MatrixRainToggle />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          openAccessibilityPanel();
                          setSheetOpen(false);
                        }}
                        aria-label="Open accessibility settings"
                        className="border-border/40 hover:border-cyan-400/60 hover:bg-transparent"
                      >
                        <Accessibility className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Accessibility</span>
                      </Button>
                    </div>
                  </div>

                  <Separator className="mx-6 my-2 bg-border/20" />

                  {/* CTA */}
                  <div className="px-6 py-3">
                    <HoverButton>
                      <Link
                        href="/contact/"
                        onClick={() => setSheetOpen(false)}
                        className="w-full px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-foreground rounded-lg transition-all duration-300 text-center font-medium block"
                      >
                        Get In Touch
                      </Link>
                    </HoverButton>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
