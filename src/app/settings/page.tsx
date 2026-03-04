"use client";

import { Moon, Monitor, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY_THEME = "portfolio-theme";
const STORAGE_KEY_ANIMATIONS = "portfolio-animations";
const STORAGE_KEY_REDUCED_MOTION = "portfolio-reduced-motion";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [saved, setSaved] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
    const storedAnimations = localStorage.getItem(STORAGE_KEY_ANIMATIONS);
    const storedReducedMotion = localStorage.getItem(
      STORAGE_KEY_REDUCED_MOTION,
    );

    if (storedTheme) setTheme(storedTheme);
    if (storedAnimations !== null)
      setAnimationsEnabled(storedAnimations === "true");
    if (storedReducedMotion !== null)
      setReducedMotion(storedReducedMotion === "true");
  }, []);

  const applyTheme = (selected: Theme) => {
    setTheme(selected);
    const root = document.documentElement;
    if (selected === "light") {
      root.classList.remove("dark");
    } else if (selected === "dark") {
      root.classList.add("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    localStorage.setItem(STORAGE_KEY_ANIMATIONS, String(animationsEnabled));
    localStorage.setItem(STORAGE_KEY_REDUCED_MOTION, String(reducedMotion));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setTheme("dark");
    setAnimationsEnabled(true);
    setReducedMotion(false);
    setNotificationsEnabled(false);
    setAnalyticsConsent(true);
    applyTheme("dark");
    localStorage.removeItem(STORAGE_KEY_THEME);
    localStorage.removeItem(STORAGE_KEY_ANIMATIONS);
    localStorage.removeItem(STORAGE_KEY_REDUCED_MOTION);
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] =
    [
      { value: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
      { value: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
      {
        value: "system",
        label: "System",
        icon: <Monitor className="w-5 h-5" />,
      },
    ];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20 max-w-3xl">
          {/* Header */}
          <AnimatedSection className="text-center space-y-4 mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white uppercase tracking-wider">
              Settings
            </h1>
            <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            <p className="text-white/70 text-base sm:text-lg">
              Customize your portfolio experience.
            </p>
          </AnimatedSection>

          <div className="space-y-6">
            {/* Appearance */}
            <AnimatedSection delay={0.1}>
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">
                  Appearance
                </h2>
                <div className="space-y-4">
                  <Label className="text-white/80 font-medium">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => applyTheme(option.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                          theme === option.value
                            ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                            : "border-white/10 bg-white/5 text-white/70 hover:border-cyan-400/50 hover:text-white"
                        }`}
                        aria-pressed={theme === option.value}
                      >
                        {option.icon}
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimatedSection>

            {/* Accessibility */}
            <AnimatedSection delay={0.2}>
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">
                  Accessibility
                </h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="animations-toggle"
                        className="text-white/90 font-medium"
                      >
                        Enable Animations
                      </Label>
                      <p className="text-white/50 text-sm mt-0.5">
                        Toggle UI animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="animations-toggle"
                      checked={animationsEnabled}
                      onCheckedChange={setAnimationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="reduced-motion-toggle"
                        className="text-white/90 font-medium"
                      >
                        Reduced Motion
                      </Label>
                      <p className="text-white/50 text-sm mt-0.5">
                        Minimize motion for vestibular sensitivity
                      </p>
                    </div>
                    <Switch
                      id="reduced-motion-toggle"
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                    />
                  </div>
                </div>
              </Card>
            </AnimatedSection>

            {/* Notifications */}
            <AnimatedSection delay={0.3}>
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">
                  Notifications
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="notifications-toggle"
                      className="text-white/90 font-medium"
                    >
                      Push Notifications
                    </Label>
                    <p className="text-white/50 text-sm mt-0.5">
                      Enable browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications-toggle"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </Card>
            </AnimatedSection>

            {/* Privacy */}
            <AnimatedSection delay={0.4}>
              <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Privacy</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="analytics-toggle"
                        className="text-white/90 font-medium"
                      >
                        Analytics
                      </Label>
                      <p className="text-white/50 text-sm mt-0.5">
                        Allow anonymous usage analytics via Google Analytics
                      </p>
                    </div>
                    <Switch
                      id="analytics-toggle"
                      checked={analyticsConsent}
                      onCheckedChange={setAnalyticsConsent}
                    />
                  </div>
                </div>
              </Card>
            </AnimatedSection>

            {/* Actions */}
            <AnimatedSection delay={0.5}>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold"
                >
                  {saved ? "Saved!" : "Save Settings"}
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}
