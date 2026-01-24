"use client";

import {
  Contrast,
  Eye,
  EyeOff,
  HelpCircle,
  Monitor,
  RotateCcw,
  Settings,
  Text,
  Volume2,
  VolumeX,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
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
  screenReader: boolean;
  keyboardNavigation: boolean;
}

const AccessibilityEnhancer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    contrast: "normal",
    animations: true,
    focusIndicator: true,
    screenReader: false,
    keyboardNavigation: true,
  });

  const { toast } = useToast();

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty("--accessibility-font-size", `${settings.fontSize}%`);

    // Contrast
    if (settings.contrast === "high") {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Animations
    if (!settings.animations) {
      root.style.setProperty("--animation-duration", "0ms");
    } else {
      root.style.setProperty("--animation-duration", "300ms");
    }

    // Focus indicators
    if (settings.focusIndicator) {
      root.classList.add("focus-visible");
    } else {
      root.classList.remove("focus-visible");
    }

    // Screen reader optimizations
    if (settings.screenReader) {
      root.classList.add("screen-reader-mode");
    } else {
      root.classList.remove("screen-reader-mode");
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add("keyboard-navigation");
    } else {
      root.classList.remove("keyboard-navigation");
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Accessibility Updated",
      description: `Setting updated: ${key}`,
      duration: 2000,
    });
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      contrast: "normal",
      animations: true,
      focusIndicator: true,
      screenReader: false,
      keyboardNavigation: true,
    });
    toast({
      title: "Settings Reset",
      description: "All accessibility settings have been reset to default",
      duration: 3000,
    });
  };

  const increaseFontSize = () => {
    if (settings.fontSize < 150) {
      updateSetting("fontSize", settings.fontSize + 10);
    }
  };

  const decreaseFontSize = () => {
    if (settings.fontSize > 80) {
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
    <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Contrast className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Accessibility</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your experience</p>
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
                disabled={settings.fontSize <= 80}
                className="px-2"
              >
                A-
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                disabled={settings.fontSize >= 150}
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
            onValueChange={(value) => updateSetting("fontSize", value[0])}
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
            <Monitor className="h-4 w-4" />
            <span>Animations</span>
          </Label>
          <Toggle
            pressed={settings.animations}
            onPressedChange={(pressed) => updateSetting("animations", pressed)}
            className="w-full justify-between"
          >
            <span className="text-sm">Enable smooth transitions</span>
            {settings.animations ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
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
            onPressedChange={(pressed) => updateSetting("focusIndicator", pressed)}
            className="w-full justify-between"
          >
            <span className="text-sm">Show focus outlines</span>
            {settings.focusIndicator ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Toggle>
        </div>

        {/* Screen Reader */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Screen Reader</span>
          </Label>
          <Toggle
            pressed={settings.screenReader}
            onPressedChange={(pressed) => updateSetting("screenReader", pressed)}
            className="w-full justify-between"
          >
            <span className="text-sm">Enhanced screen reader support</span>
            {settings.screenReader ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ON</span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">OFF</span>
            )}
          </Toggle>
        </div>

        {/* Keyboard Navigation */}
        <div className="space-y-3">
          <Label className="flex items-center space-x-2">
            <Text className="h-4 w-4" />
            <span>Keyboard Navigation</span>
          </Label>
          <Toggle
            pressed={settings.keyboardNavigation}
            onPressedChange={(pressed) => updateSetting("keyboardNavigation", pressed)}
            className="w-full justify-between"
          >
            <span className="text-sm">Tab navigation enhancements</span>
            {settings.keyboardNavigation ? (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ON</span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">OFF</span>
            )}
          </Toggle>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>High contrast mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Screen reader friendly</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Keyboard navigation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>Reduced motion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global accessibility styles
const createAccessibilityStyles = () => {
  if (typeof document !== "undefined") {
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
      .focus-visible *:focus {
        outline: 3px solid #007bff !important;
        outline-offset: 2px !important;
      }
      
      /* Screen Reader Mode */
      .screen-reader-mode .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      /* Keyboard Navigation */
      .keyboard-navigation *:focus {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
      
      /* Reduced Motion */
      * {
        transition-duration: var(--animation-duration, 300ms) !important;
        animation-duration: var(--animation-duration, 300ms) !important;
      }
      
      /* Accessibility Font Size */
      :root {
        --accessibility-font-size: 100%;
      }
      
      html {
        font-size: var(--accessibility-font-size) !important;
      }
      
      /* Skip Links */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        z-index: 100;
        text-decoration: none;
        border-radius: 4px;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles
createAccessibilityStyles();

export default AccessibilityEnhancer;
