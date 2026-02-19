import { type NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// VAPID keys for Web Push API - loaded from environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || "mailto:noreply@example.com";

if (!vapidPublicKey || !vapidPrivateKey) {
  console.warn("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables are required for push notifications");
} else {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

const vapidKeys = {
  publicKey: vapidPublicKey ?? "",
  privateKey: vapidPrivateKey ?? "",
};

interface PushMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: Record<string, unknown>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// In-memory storage for subscriptions (in production, use a database)
let subscriptions: PushSubscriptionData[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptions: subs, message } = body;

    if (!message || !subs || !Array.isArray(subs) || subs.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: message and subscriptions array",
        },
        { status: 400 },
      );
    }

    const pushMessage: PushMessage = message;
    const results = [];

    // Send push notification to each subscription
    for (const subscription of subs) {
      try {
        const payload = JSON.stringify({
          title: pushMessage.title,
          body: pushMessage.body,
          icon: pushMessage.icon ?? "/logo.jpg",
          badge: pushMessage.badge ?? "/logo.jpg",
          image: pushMessage.image,
          url: pushMessage.url ?? "/",
          data: pushMessage.data ?? {},
        });

        const result = await webpush.sendNotification(subscription, payload);
        results.push({
          endpoint: subscription.endpoint,
          success: true,
          statusCode: result.statusCode,
        });
      } catch (error) {
        console.error(
          "Error sending to subscription:",
          subscription.endpoint,
          error,
        );
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      {
        error: "Failed to send push notification",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// GET endpoint to get VAPID public key
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "vapid-public-key") {
    return NextResponse.json({
      publicKey: vapidKeys.publicKey,
    });
  }

  if (action === "subscriptions") {
    return NextResponse.json({
      subscriptions: subscriptions.length,
      list: subscriptions.map((sub) => ({ endpoint: sub.endpoint })),
    });
  }

  // Test endpoint - send to all stored subscriptions
  try {
    if (subscriptions.length === 0) {
      return NextResponse.json(
        {
          error: "No subscriptions found. Subscribe first using the client.",
        },
        { status: 400 },
      );
    }

    const testMessage: PushMessage = {
      title: "Test Notification",
      body: "This is a test push notification using Web Push API!",
      icon: "/logo.jpg",
      badge: "/logo.jpg",
      url: "/",
      data: {
        test: true,
        timestamp: new Date().toISOString(),
      },
    };

    const payload = JSON.stringify({
      title: testMessage.title,
      body: testMessage.body,
      icon: testMessage.icon,
      badge: testMessage.badge,
      url: testMessage.url,
      data: testMessage.data,
    });

    const results = [];
    for (const subscription of subscriptions) {
      try {
        const result = await webpush.sendNotification(subscription, payload);
        results.push({
          endpoint: subscription.endpoint,
          success: true,
          statusCode: result.statusCode,
        });
      } catch (error) {
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test notifications sent",
      results,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      {
        error: "Failed to send test notification",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// PUT endpoint to store subscription
export async function PUT(request: NextRequest) {
  try {
    const subscription: PushSubscriptionData = await request.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        {
          error: "Invalid subscription data",
        },
        { status: 400 },
      );
    }

    // Remove existing subscription with same endpoint
    subscriptions = subscriptions.filter(
      (sub) => sub.endpoint !== subscription.endpoint,
    );

    // Add new subscription
    subscriptions.push(subscription);

    console.log("Subscription stored:", subscription.endpoint);

    return NextResponse.json({
      success: true,
      message: "Subscription stored",
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error("Error storing subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to store subscription",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

// DELETE endpoint to remove subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        {
          error: "Missing endpoint parameter",
        },
        { status: 400 },
      );
    }

    const initialCount = subscriptions.length;
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    const removed = initialCount - subscriptions.length;

    return NextResponse.json({
      success: true,
      message: `Removed ${removed} subscription(s)`,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error("Error removing subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to remove subscription",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
