"use client";

import {
  Contrast,
  Eye,
  EyeOff,
  Keyboard,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Text,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/use-toast";

interface AccessibilitySettings {
  fontSize: number;
  contrast: "normal" | "high";
  animations: boolean;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
}

const STORAGE_KEY = "portfolio-accessibility";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 100,
  contrast: "normal",
  animations: true,
  focusIndicator: true,
  keyboardNavigation: true,
};

// Constants for font size limits
const MIN_FONT_SIZE_PERCENT = 80;
const MAX_FONT_SIZE_PERCENT = 150;

const AccessibilityEnhancer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] =
    useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const { toast } = useToast();

  // Inject accessibility styles once on mount
  useEffect(() => {
    if (styleRef.current) return;
    const style = document.createElement("style");
    style.textContent = `
      /* High Contrast Mode */
      .high-contrast {
        filter: contrast(1.5) brightness(1.1);
      }
      .high-contrast * {
        background-color: #000 !important;
        color: #fff !important;
        border-color: #fff !important;
      }
      .high-contrast a {
        color: #00f !important;
        text-decoration: underline !important;
      }
      .high-contrast button,
      .high-contrast input,
      .high-contrast select {
        background-color: #fff !important;
        color: #000 !important;
        border: 2px solid #000 !important;
      }
      /* Focus Indicators */
      .a11y-focus-visible *:focus {
        outline: 3px solid #007bff !important;
        outline-offset: 2px !important;
      }
      /* Keyboard Navigation */
      .keyboard-navigation *:focus {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
      /* Reduced Motion */
      .a11y-reduce-motion * {
        transition-duration: 0ms !important;
        animation-duration: 0ms !important;
      }
      /* Accessibility Font Size */
      html {
        font-size: var(--accessibility-font-size, 100%) !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AccessibilitySettings>;
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Listen for custom event from Navigation accessibility button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-accessibility-panel", handleOpen);
    return () =>
      window.removeEventListener("open-accessibility-panel", handleOpen);
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty(
      "--accessibility-font-size",
      `${settings.fontSize}%`,
    );

    // Contrast
    root.classList.toggle("high-contrast", settings.contrast === "high");

    // Animations
    root.classList.toggle("a11y-reduce-motion", !settings.animations);

    // Focus indicators
    root.classList.toggle("a11y-focus-visible", settings.focusIndicator);

    // Keyboard navigation
    root.classList.toggle("keyboard-navigation", settings.keyboardNavigation);
  }, [settings]);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K],
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      toast({
        title: "Accessibility Updated",
        description: `Setting updated: ${key}`,
        duration: 2000,
      });
    },
    [toast],
  );

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to default",
      duration: 3000,
    });
  };

  const increaseFontSize = () => {
    if (settings.fontSize < MAX_FONT_SIZE_PERCENT) {
      updateSetting("fontSize", settings.fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > MIN_FONT_SIZE_PERCENT) {
      updateSetting("fontSize", settings.fontSize - 10);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="rounded-full w-14 h-14 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Accessibility Settings"
        >
          <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50"
      role="dialog"
      aria-label="Accessibility Settings"
      data-testid="accessibility-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Contrast className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Accessibility
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize your experience
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Reset Settings"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size" className="flex items-center space-x-2">
              <Text className="h-4 w-4" />
              <span>Font Size</span>
            </Label>
            <div className="flex space-x-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseFontSize}
                disabled={settings.fontSize <= MIN_FONT_SIZE_PERCENT}
                className="px-2"
              >
                A-
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                disabled={settings.fontSize >= MAX_FONT_SIZE_PERCENT}
                className="px-2"
              >
                A+
              </Button>
            </div>
          </div>
          <Slider
            id="font-size"
            min={80}
            max={150}
            step={10}
            value={[settings.fontSize]}
            onValueChange={(value) =>
              updateSetting("fontSize", value[0] ?? settings.fontSize)
            }
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {settings.fontSize}%
          </p>
        </div>

        {/* Contrast */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Contrast className="h-4 w-4" />
            <span>Contrast</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={settings.contrast === "normal" ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("contrast", "normal")}
              className="justify-start"
            >
              Normal
            </Button>
            <Button
              variant={settings.contrast === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("contrast", "high")}
              className="justify-start"
            >
              High Contrast
            </Button>
          </div>
        </div>

        {/* Animations */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            {settings.animations ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            <span>Animations</span>
          </Label>
          <Toggle
            pressed={settings.animations}
            onPressedChange={(pressed) => updateSetting("animations", pressed)}
            className="w-full justify-between"
          >
            <span className="text-sm">Enable smooth transitions</span>
            {settings.animations ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ON
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                OFF
              </span>
            )}
          </Toggle>
        </div>

        {/* Focus Indicators */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Focus Indicators</span>
          </Label>
          <Toggle
            pressed={settings.focusIndicator}
            onPressedChange={(pressed) =>
              updateSetting("focusIndicator", pressed)
            }
            className="w-full justify-between"
          >
            <span className="text-sm">Show focus outlines</span>
            {settings.focusIndicator ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Toggle>
        </div>

        {/* Keyboard Navigation */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Keyboard className="h-4 w-4" />
            <span>Keyboard Navigation</span>
          </Label>
          <Toggle
            pressed={settings.keyboardNavigation}
            onPressedChange={(pressed) =>
              updateSetting("keyboardNavigation", pressed)
            }
            className="w-full justify-between"
          >
            <span className="text-sm">Tab navigation enhancements</span>
            {settings.keyboardNavigation ? (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                ON
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                OFF
              </span>
            )}
          </Toggle>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
              <span>High contrast mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></span>
              <span>Keyboard navigation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
              <span>Focus indicators</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full" aria-hidden="true"></span>
              <span>Reduced motion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityEnhancer;
