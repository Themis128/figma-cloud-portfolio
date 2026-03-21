import { useCallback, useEffect, useState } from "react";
import { pushNotificationsApi } from "@/lib/api";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Constants for base64 encoding
const BASE64_CONSTANTS = {
  GROUP_SIZE: 4,
  PADDING_CHAR: "=",
} as const;

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [vapidPublicKey, setVapidPublicKey] = useState<string | null>(null);

  const fetchVapidPublicKey = useCallback(async () => {
    try {
      const data = await pushNotificationsApi.getVapidPublicKey();
      setVapidPublicKey(data.publicKey);
    } catch (_error) {
      // Silently fail in development if API server isn't running
      if (process.env.NODE_ENV === "development") {
      } else {
      }
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      if (!("serviceWorker" in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      setSubscription(existingSubscription);
      setIsSubscribed(!!existingSubscription);
    } catch (_error) {}
  }, []);

  useEffect(() => {
    // Check if push notifications are supported
    if (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      checkSubscription();
      fetchVapidPublicKey();
    }
  }, [checkSubscription, fetchVapidPublicKey]);

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error("Push notifications are not supported");
    }

    if (!vapidPublicKey) {
      throw new Error("VAPID public key not available");
    }

    // Request notification permission first
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }

    const registration = await navigator.serviceWorker.ready;

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    setSubscription(newSubscription);
    setIsSubscribed(true);

    // Send subscription data to server
    await sendSubscriptionToServer(newSubscription);

    return { subscription: newSubscription };
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    const result = await subscription.unsubscribe();
    setSubscription(null);
    setIsSubscribed(false);

    // Remove subscription from server
    await removeSubscriptionFromServer(subscription);

    return result;
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    // Get subscription keys
    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");

    if (!(p256dhKey && authKey)) {
      throw new Error("Failed to get subscription keys");
    }

    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
        auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
      },
    };

    // Store locally for demo purposes
    localStorage.setItem("push-subscription", JSON.stringify(subscriptionData));

    // Send to server
    await pushNotificationsApi.storeSubscription(subscriptionData);
  };

  const removeSubscriptionFromServer = async (
    subscription: PushSubscription,
  ) => {
    try {
      // Remove from local storage
      localStorage.removeItem("push-subscription");

      // Remove from server
      await pushNotificationsApi.removeSubscription(subscription.endpoint);
    } catch (_error) {}
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    vapidPublicKey,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = BASE64_CONSTANTS.PADDING_CHAR.repeat(
    (BASE64_CONSTANTS.GROUP_SIZE -
      (base64String.length % BASE64_CONSTANTS.GROUP_SIZE)) %
      BASE64_CONSTANTS.GROUP_SIZE,
  );
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
