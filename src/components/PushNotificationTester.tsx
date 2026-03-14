"use client";

import {
  AlertCircle,
  CheckCircle,
  Send,
  Settings,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { pushNotificationsApi } from "@/lib/api";

interface NotificationResult {
  success: boolean;
  message: string;
  totalSent?: number;
  totalFailed?: number;
  results?: Array<{
    endpoint: string;
    success: boolean;
    statusCode?: number;
    error?: string;
  }>;
}

export function PushNotificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NotificationResult | null>(null);
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(
    null,
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // Custom notification fields
  const [customTitle, setCustomTitle] = useState("Custom Test Notification");
  const [customBody, setCustomBody] = useState(
    "This is a custom push notification using Web Push API!",
  );
  const [customUrl, setCustomUrl] = useState("/about");

  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<{
    registered: boolean;
    active: boolean;
    state?: string;
  }>({ registered: false, active: false });

  // Check service worker status on mount
  useEffect(() => {
    const checkServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            setServiceWorkerStatus({
              registered: true,
              active: registration.active !== null,
              ...(registration.active?.state !== undefined && {
                state: registration.active.state,
              }),
            });
          }
        } catch (_error) {}
      }
    };

    checkServiceWorker();
  }, []);

  const checkSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await pushNotificationsApi.getSubscriptionCount();
      setSubscriptionCount(data.subscriptions);
      setResult({
        success: true,
        message: `Found ${data.subscriptions} active subscription${data.subscriptions !== 1 ? "s" : ""}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error checking subscriptions: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const data = await pushNotificationsApi.sendTestNotification();

      setResult({
        success: true,
        message: `Test notification sent successfully!`,
        totalSent: data.totalSubscriptions,
        results: data.results,
      });
    } catch (error: unknown) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendCustomNotification = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Check if there are any subscriptions first
      const subsData = await pushNotificationsApi.getSubscriptionCount();

      if (!subsData.subscriptions || subsData.subscriptions === 0) {
        setResult({
          success: false,
          message:
            "No subscriptions found. Subscribe first using the Notification Button.",
        });
        setIsLoading(false);
        return;
      }

      // Send custom message to all stored subscriptions on server
      const data = await pushNotificationsApi.sendCustomNotification({
        title: customTitle,
        body: customBody,
        icon: "/logo.jpg",
        badge: "/logo.jpg",
        url: customUrl,
        data: {
          custom: true,
          timestamp: new Date().toISOString(),
        },
      });

      setResult({
        success: true,
        message: "Custom notification sent successfully!",
        totalSent: data.totalSent,
        totalFailed: data.totalFailed,
        results: data.results,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Network error: ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (_error) {}
    }
  };

  function permissionBadge() {
    switch (notificationPermission) {
      case "granted":
        return (
          <Badge
            variant="outline"
            className="border-green-500/40 text-green-400 text-[10px] uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
            Granted
          </Badge>
        );
      case "denied":
        return (
          <Badge
            variant="outline"
            className="border-red-500/40 text-red-400 text-[10px] uppercase tracking-wider"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/40 text-yellow-400 text-[10px] uppercase tracking-wider"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Requested
          </Badge>
        );
    }
  }

  function statusDot(ok: boolean) {
    return ok ? "bg-green-400" : "bg-red-400";
  }

  function statusText(ok: boolean, label: string) {
    return (
      <span className={`text-xs font-mono ${ok ? "text-green-400" : "text-red-400"}`}>
        {label}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Permission Status */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Permission
            </p>
            {permissionBadge()}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot(notificationPermission === "granted")}`} />
            {statusText(
              notificationPermission === "granted",
              notificationPermission === "granted"
                ? "Browser Authorized"
                : notificationPermission === "denied"
                  ? "Blocked by User"
                  : "Awaiting Prompt",
            )}
          </div>
          {notificationPermission !== "granted" && (
            <Button
              onClick={requestNotificationPermission}
              size="sm"
              variant="outline"
              className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
            >
              Request Permission
            </Button>
          )}
        </Card>

        {/* Service Worker Status */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Service Worker
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider ${
                serviceWorkerStatus.registered && serviceWorkerStatus.active
                  ? "border-green-500/40 text-green-400"
                  : serviceWorkerStatus.registered
                    ? "border-yellow-500/40 text-yellow-400"
                    : "border-red-500/40 text-red-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  serviceWorkerStatus.registered && serviceWorkerStatus.active
                    ? "bg-green-400"
                    : serviceWorkerStatus.registered
                      ? "bg-yellow-400"
                      : "bg-red-400"
                }`}
              />
              {serviceWorkerStatus.registered
                ? serviceWorkerStatus.active
                  ? "Active"
                  : "Inactive"
                : "Missing"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusDot(
                serviceWorkerStatus.registered && serviceWorkerStatus.active,
              )}`}
            />
            {statusText(
              serviceWorkerStatus.registered && serviceWorkerStatus.active,
              serviceWorkerStatus.registered
                ? serviceWorkerStatus.active
                  ? `Running (${serviceWorkerStatus.state ?? "unknown"})`
                  : "Registered but Inactive"
                : "Not Registered",
            )}
          </div>
        </Card>

        {/* Subscriptions */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Subscriptions
            </p>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-lg text-cyan-400">
                {subscriptionCount !== null ? subscriptionCount : "—"}
              </span>
            </div>
          </div>
          <Button
            onClick={() => void checkSubscriptions()}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-mono text-xs"
          >
            Check Subscriptions
          </Button>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => void sendTestNotification()}
          disabled={isLoading || subscriptionCount === 0}
          className="bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60 font-mono text-xs"
        >
          <Send className="w-4 h-4 mr-1.5" />
          {isLoading ? "Sending..." : "Send Test Notification"}
        </Button>

        <Button
          onClick={() => void sendCustomNotification()}
          disabled={isLoading || subscriptionCount === 0}
          variant="outline"
          className="border-border/30 text-foreground/60 hover:text-foreground hover:border-border/50 font-mono text-xs"
        >
          <Settings className="w-4 h-4 mr-1.5" />
          {isLoading ? "Sending..." : "Send Custom Notification"}
        </Button>
      </div>

      {/* Custom Notification Form */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
          Custom Notification
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="push-title"
              className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono"
            >
              Title
            </label>
            <Input
              id="push-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Notification title"
              className="font-mono text-sm bg-background/50 border-border/30 focus:border-cyan-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="push-url"
              className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono"
            >
              URL (optional)
            </label>
            <Input
              id="push-url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="/about"
              className="font-mono text-sm bg-background/50 border-border/30 focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="push-body"
            className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono"
          >
            Message Body
          </label>
          <Textarea
            id="push-body"
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder="Notification message"
            rows={3}
            className="font-mono text-xs bg-background/50 border-border/30 focus:border-cyan-500/50 min-h-20"
          />
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card
          className={`backdrop-blur-sm border p-4 ${
            result.success
              ? "bg-green-500/5 border-green-500/20"
              : "bg-red-500/5 border-red-500/20"
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`font-mono text-xs ${result.success ? "text-green-400" : "text-red-400"}`}
              >
                {result.message}
              </p>
              {result.totalSent !== undefined &&
                result.totalFailed !== undefined && (
                  <p className="text-[10px] text-foreground/40 font-mono mt-1">
                    Sent: {result.totalSent} | Failed: {result.totalFailed}
                  </p>
                )}
              {result.results && result.results.length > 0 && (
                <details className="mt-2">
                  <summary className="text-[10px] cursor-pointer font-mono text-foreground/40 hover:text-foreground/60 uppercase tracking-wider">
                    Detailed results ({result.results.length} endpoints)
                  </summary>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {result.results.map((endpointResult) => (
                      <div
                        key={endpointResult.endpoint}
                        className={`text-[10px] font-mono p-2 rounded flex items-center gap-2 ${
                          endpointResult.success
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            endpointResult.success ? "bg-green-400" : "bg-red-400"
                          }`}
                        />
                        <span className="truncate flex-1">
                          {endpointResult.endpoint.split("/").pop()}
                        </span>
                        {endpointResult.statusCode && (
                          <span className="text-foreground/30">
                            {endpointResult.statusCode}
                          </span>
                        )}
                        {endpointResult.error && (
                          <span className="text-red-400/60 truncate max-w-32">
                            {endpointResult.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Requirements Checklist */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono mb-3">
          Requirements
        </p>
        <div className="space-y-2">
          {[
            {
              ok: notificationPermission === "granted",
              label: "Notification permission granted",
            },
            {
              ok: serviceWorkerStatus.registered && serviceWorkerStatus.active,
              label: "Service Worker registered and active",
            },
            {
              ok: (subscriptionCount ?? 0) > 0,
              label: "Subscribed via Notification Button",
            },
            { ok: true, label: "Web Push API configured with VAPID keys" },
          ].map((req) => (
            <div key={req.label} className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${req.ok ? "bg-green-400" : "bg-red-400"}`}
              />
              <span
                className={`text-[10px] font-mono ${req.ok ? "text-foreground/50" : "text-foreground/30"}`}
              >
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
