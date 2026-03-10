import { Bell, BellOff, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Time constants
const DAYS_IN_WEEK = 7;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MS_IN_SECOND = 1000;
const ONE_WEEK_MS =
  DAYS_IN_WEEK *
  HOURS_IN_DAY *
  MINUTES_IN_HOUR *
  SECONDS_IN_MINUTE *
  MS_IN_SECOND; // 7 days in milliseconds
const PROMPT_DELAY_MS = 45000; // Show after 45 seconds

export function NotificationButton() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { isSupported, isSubscribed, subscribe } = usePushNotifications();

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);

      // Check if user has dismissed the prompt before
      const dismissedPrompt = localStorage.getItem(
        "notification-prompt-dismissed",
      );
      if (dismissedPrompt) {
        const dismissedTime = parseInt(dismissedPrompt, 10);
        if (Date.now() - dismissedTime < ONE_WEEK_MS) {
          setDismissed(true);
        } else {
          localStorage.removeItem("notification-prompt-dismissed");
        }
      }
    }
  }, []);

  // Show prompt after user has been on the site for a bit
  useEffect(() => {
    if (
      permission === "default" &&
      !dismissed &&
      !isSubscribed &&
      isSupported
    ) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, PROMPT_DELAY_MS); // Show after 45 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [permission, dismissed, isSubscribed, isSupported]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem(
      "notification-prompt-dismissed",
      Date.now().toString(),
    );
  };

  const requestPermission = async () => {
    try {
      if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
      }

      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        setShowPrompt(false);
        // Subscribe to push notifications
        try {
          await subscribe();
          showNotification(
            "Notifications enabled!",
            "You'll now receive updates from Baltzakis Themistoklis.",
          );
        } catch (_error) {
          showNotification(
            "Notifications enabled",
            "However, push notifications may not work properly.",
          );
        }
      } else if (result === "denied") {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.jpg",
        badge: "/logo.jpg",
      });
    }
  };

  const getButtonIcon = () => {
    if (permission === "denied") return BellOff;
    if (isSubscribed) return Bell;
    return Settings;
  };

  const getButtonText = () => {
    if (permission === "denied") return "Notifications blocked";
    if (isSubscribed) return "Notifications on";
    return "Enable notifications";
  };

  const ButtonIcon = getButtonIcon();

  // Don't show button if notifications are not supported
  if (!isSupported) {
    return null;
  }

  // Show compact button if prompt not shown
  if (!showPrompt) {
    return (
      <Button
        onClick={permission === "default" ? requestPermission : undefined}
        variant="outline"
        size="sm"
        className={`gap-2 ${
          permission === "denied"
            ? "border-red-400/50 text-red-400 cursor-not-allowed"
            : permission === "granted"
              ? "border-green-400/50 text-green-400"
              : "border-cyan-400/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300"
        }`}
        disabled={permission === "denied"}
      >
        <ButtonIcon className="h-4 w-4" />
        <span className="hidden lg:inline">{getButtonText()}</span>
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
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1">
              Stay Updated
            </h3>
            <p className="text-slate-300 text-xs mb-3">
              Get notified about new features, updates, and important
              announcements from Baltzakis Themistoklis.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={requestPermission}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1 h-8"
              >
                Enable
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
