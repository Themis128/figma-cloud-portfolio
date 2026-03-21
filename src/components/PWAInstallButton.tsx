import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

// Time constants
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const ONE_DAY_MS =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND; // 24 hours in milliseconds
const PROMPT_DELAY_MS = 30000; // Show after 30 seconds

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if user has dismissed the prompt before
  useEffect(() => {
    const dismissedPrompt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedPrompt) {
      const dismissedTime = parseInt(dismissedPrompt, 10);
      if (Date.now() - dismissedTime < ONE_DAY_MS) {
        setDismissed(true);
      } else {
        localStorage.removeItem("pwa-prompt-dismissed");
      }
    }
  }, []);

  // Show prompt after user has been on the site for a bit
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, PROMPT_DELAY_MS); // Show after 30 seconds

      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isInstallable, isInstalled, dismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    await installPWA();
    setShowPrompt(false);
  };

  if (isInstalled || !isInstallable) {
    return null;
  }

  // Show compact button if prompt not shown
  if (!showPrompt) {
    return (
      <Button
        onClick={handleInstall}
        variant="outline"
        size="sm"
        className="gap-2 border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300"
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    );
  }

  // Show full prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">
              Install App
            </h3>
            <p className="text-slate-300 text-xs mb-3">
              Get the full experience with offline access, faster loading, and
              native app features.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-8"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-300 text-xs px-3 py-1 h-8"
              >
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-300 p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
