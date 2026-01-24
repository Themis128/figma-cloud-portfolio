import { AlertCircle, Bell, CheckCircle, Send, Settings, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null);
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
              state: registration.active?.state,
            });
          }
        } catch (error) {
          console.error("Error checking service worker:", error);
        }
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
      console.error("Error checking subscriptions:", error);
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
          message: "No subscriptions found. Subscribe first using the Notification Button.",
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
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case "granted":
        return { icon: CheckCircle, color: "text-green-500", text: "Granted" };
      case "denied":
        return { icon: XCircle, color: "text-red-500", text: "Denied" };
      default:
        return { icon: AlertCircle, color: "text-yellow-500", text: "Not Requested" };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  return (
    <Card className='p-6 space-y-6'>
      <div className='flex items-center gap-3'>
        <Bell className='w-6 h-6 text-cyan-400' />
        <div>
          <h3 className='text-lg font-semibold'>Web Push API Tester</h3>
          <p className='text-sm text-muted-foreground'>
            Test push notifications using native Web Push API with VAPID keys.
          </p>
        </div>
      </div>

      {/* Permission Status */}
      <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <PermissionIcon className={`w-4 h-4 ${permissionStatus.color}`} />
          <span className='text-sm font-medium'>Notification Permission:</span>
          <span className={`text-sm ${permissionStatus.color}`}>{permissionStatus.text}</span>
        </div>
        {notificationPermission !== "granted" && (
          <Button onClick={requestNotificationPermission} size='sm' variant='outline'>
            Request Permission
          </Button>
        )}
      </div>

      {/* Service Worker Status */}
      <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2'>
          {serviceWorkerStatus.registered ? (
            serviceWorkerStatus.active ? (
              <CheckCircle className='w-4 h-4 text-green-500' />
            ) : (
              <AlertCircle className='w-4 h-4 text-yellow-500' />
            )
          ) : (
            <XCircle className='w-4 h-4 text-red-500' />
          )}
          <span className='text-sm font-medium'>Service Worker:</span>
          <span className='text-sm'>
            {serviceWorkerStatus.registered
              ? serviceWorkerStatus.active
                ? `Active (${serviceWorkerStatus.state})`
                : "Registered (Inactive)"
              : "Not Registered"}
          </span>
        </div>
      </div>

      {/* Subscription Status */}
      <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Users className='w-4 h-4 text-blue-500' />
          <span className='text-sm font-medium'>Active Subscriptions:</span>
          <span className='text-sm'>
            {subscriptionCount !== null ? subscriptionCount : "Unknown"}
          </span>
        </div>
        <Button onClick={checkSubscriptions} disabled={isLoading} size='sm' variant='outline'>
          Check Subscriptions
        </Button>
      </div>

      {/* Action Buttons */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Button
          onClick={sendTestNotification}
          disabled={isLoading || subscriptionCount === 0}
          className='flex items-center gap-2'
        >
          <Send className='w-4 h-4' />
          {isLoading ? "Sending..." : "Send Test Notification"}
        </Button>

        <Button
          onClick={sendCustomNotification}
          disabled={isLoading || subscriptionCount === 0}
          variant='outline'
          className='flex items-center gap-2'
        >
          <Settings className='w-4 h-4' />
          {isLoading ? "Sending..." : "Send Custom Notification"}
        </Button>
      </div>

      {/* Custom Notification Form */}
      <div className='space-y-4 p-4 border rounded-lg bg-muted/30'>
        <h4 className='font-medium flex items-center gap-2'>
          <Settings className='w-4 h-4' />
          Custom Notification Settings
        </h4>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Title</Label>
            <Input
              id='title'
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder='Notification title'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='url'>URL (optional)</Label>
            <Input
              id='url'
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder='/about'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='body'>Message Body</Label>
          <Textarea
            id='body'
            value={customBody}
            onChange={(e) => setCustomBody(e.target.value)}
            placeholder='Notification message'
            rows={3}
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className='flex items-start gap-3'>
            {result.success ? (
              <CheckCircle className='w-5 h-5 text-green-500 mt-0.5' />
            ) : (
              <XCircle className='w-5 h-5 text-red-500 mt-0.5' />
            )}
            <div className='flex-1'>
              <p className='font-medium'>{result.message}</p>
              {result.totalSent !== undefined && result.totalFailed !== undefined && (
                <p className='text-sm text-muted-foreground mt-1'>
                  Sent: {result.totalSent} | Failed: {result.totalFailed}
                </p>
              )}
              {result.results && result.results.length > 0 && (
                <details className='mt-2'>
                  <summary className='text-sm cursor-pointer hover:text-foreground'>
                    View detailed results ({result.results.length} endpoints)
                  </summary>
                  <div className='mt-2 space-y-1 max-h-32 overflow-y-auto'>
                    {result.results.map((endpointResult, _index) => (
                      <div
                        key={endpointResult.endpoint}
                        className={`text-xs p-2 rounded flex items-center gap-2 ${
                          endpointResult.success
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        {endpointResult.success ? (
                          <CheckCircle className='w-3 h-3 text-green-600' />
                        ) : (
                          <XCircle className='w-3 h-3 text-red-600' />
                        )}
                        <span className='truncate flex-1'>
                          {endpointResult.endpoint.split("/").pop()}
                        </span>
                        {endpointResult.statusCode && (
                          <span className='text-muted-foreground'>{endpointResult.statusCode}</span>
                        )}
                        {endpointResult.error && (
                          <span className='text-red-600 truncate max-w-32'>
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
        </div>
      )}

      {/* Requirements */}
      <div className='text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg'>
        <p className='font-medium mb-2'>📋 Requirements for notifications to appear:</p>
        <ul className='space-y-1 ml-4'>
          <li className='flex items-center gap-2'>
            {notificationPermission === "granted" ? (
              <CheckCircle className='w-3 h-3 text-green-500' />
            ) : (
              <XCircle className='w-3 h-3 text-red-500' />
            )}
            Notification permission must be granted
          </li>
          <li className='flex items-center gap-2'>
            <AlertCircle className='w-3 h-3 text-yellow-500' />
            App must be running in background or another tab
          </li>
          <li className='flex items-center gap-2'>
            {subscriptionCount && subscriptionCount > 0 ? (
              <CheckCircle className='w-3 h-3 text-green-500' />
            ) : (
              <XCircle className='w-3 h-3 text-red-500' />
            )}
            Must be subscribed using the Notification Button
          </li>
          <li className='flex items-center gap-2'>
            <CheckCircle className='w-3 h-3 text-green-500' />
            Web Push API must be configured with VAPID keys
          </li>
          <li className='flex items-center gap-2'>
            {serviceWorkerStatus.registered && serviceWorkerStatus.active ? (
              <CheckCircle className='w-3 h-3 text-green-500' />
            ) : (
              <XCircle className='w-3 h-3 text-red-500' />
            )}
            Service Worker must be registered and active
          </li>
        </ul>
      </div>
    </Card>
  );
}
