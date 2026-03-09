// Push Notifications API endpoints
import { Router, Request, Response } from "express";
import webpush from "web-push";

const router = Router();

// In-memory subscription store (replace with DynamoDB in production)
interface StoredSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

const subscriptions: StoredSubscription[] = [];

// Generate VAPID keys if not provided via env vars.
// In production, set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as env vars
// so they persist across restarts.
const vapidPublicKey =
  process.env.VAPID_PUBLIC_KEY ?? webpush.generateVAPIDKeys().publicKey;
const vapidPrivateKey =
  process.env.VAPID_PRIVATE_KEY ?? webpush.generateVAPIDKeys().privateKey;

webpush.setVapidDetails(
  "mailto:tbaltzakis@cloudless.gr",
  vapidPublicKey,
  vapidPrivateKey,
);

// GET /api/push-notifications?action=vapid-public-key
// GET /api/push-notifications?action=subscriptions
// GET /api/push-notifications (send test notification to all)
router.get("/", (req: Request, res: Response) => {
  const action = req.query.action as string | undefined;

  if (action === "vapid-public-key") {
    return res.json({ publicKey: vapidPublicKey });
  }

  if (action === "subscriptions") {
    return res.json({
      subscriptions: subscriptions.length,
      list: subscriptions.map((s) => ({ endpoint: s.endpoint })),
    });
  }

  // No action = send test notification to all subscribers
  return void sendToAll(
    {
      title: "Test Notification",
      body: "Push notifications are working!",
      icon: "/icons/icon-192x192.png",
    },
    res,
  );
});

// POST /api/push-notifications — send custom notification
router.post("/", (req: Request, res: Response) => {
  const { message } = req.body as {
    message?: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      url?: string;
      data?: Record<string, unknown>;
    };
  };

  if (!message?.title || !message?.body) {
    return res
      .status(400)
      .json({ error: "message.title and message.body are required" });
  }

  return void sendToAll(message, res);
});

// PUT /api/push-notifications — store subscription
router.put("/", (req: Request, res: Response) => {
  const { endpoint, keys } = req.body as Partial<StoredSubscription>;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res
      .status(400)
      .json({ error: "endpoint, keys.p256dh, and keys.auth are required" });
  }

  // Upsert: replace if same endpoint exists
  const existingIndex = subscriptions.findIndex(
    (s) => s.endpoint === endpoint,
  );
  const sub: StoredSubscription = {
    endpoint,
    keys,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = sub;
  } else {
    subscriptions.push(sub);
  }

  return res.json({ success: true, subscriptions: subscriptions.length });
});

// DELETE /api/push-notifications?endpoint=... — remove subscription
router.delete("/", (req: Request, res: Response) => {
  const endpoint = req.query.endpoint as string | undefined;

  if (!endpoint) {
    return res.status(400).json({ error: "endpoint query parameter required" });
  }

  const index = subscriptions.findIndex((s) => s.endpoint === endpoint);
  if (index >= 0) {
    subscriptions.splice(index, 1);
  }

  return res.json({ success: true, subscriptions: subscriptions.length });
});

// Helper: send notification to all subscribers
async function sendToAll(
  payload: Record<string, unknown>,
  res: Response,
): Promise<void> {
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload),
        )
        .then(() => ({
          endpoint: sub.endpoint,
          success: true as const,
          statusCode: 201,
        }))
        .catch((err: unknown) => {
          const statusCode =
            err instanceof Error && "statusCode" in err
              ? (err as { statusCode: number }).statusCode
              : 0;
          return {
            endpoint: sub.endpoint,
            success: false as const,
            statusCode,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }),
    ),
  );

  const settled = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          endpoint: "unknown",
          success: false as const,
          statusCode: 0,
          error: r.reason instanceof Error ? r.reason.message : "Unknown",
        },
  );

  // Remove expired subscriptions (410 Gone)
  const expired = settled.filter(
    (r) => !r.success && r.statusCode === 410,
  );
  for (const e of expired) {
    const idx = subscriptions.findIndex((s) => s.endpoint === e.endpoint);
    if (idx >= 0) subscriptions.splice(idx, 1);
  }

  res.json({
    success: true,
    message: `Sent to ${settled.filter((r) => r.success).length}/${settled.length} subscribers`,
    results: settled,
    totalSubscriptions: subscriptions.length,
  });
}

export default router;
