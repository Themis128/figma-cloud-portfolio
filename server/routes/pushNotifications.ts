// Push Notifications API endpoints — subscriptions persisted to S3 (JSON file)
import { Router, Request, Response } from "express";
import webpush from "web-push";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const router = Router();

interface StoredSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: string;
}

// S3 persistence — uses the existing static site bucket with a _data/ prefix
const S3_BUCKET = process.env.PUSH_SUBS_BUCKET ?? "figma-portfolio-static";
const S3_KEY = "_data/push-subscriptions.json";
const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

// In-memory cache — loaded from S3 on first access, written back on mutation
let subscriptions: StoredSubscription[] = [];
let loaded = false;

async function loadSubscriptions(): Promise<StoredSubscription[]> {
  if (loaded) return subscriptions;
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: S3_KEY }));
    const body = await res.Body?.transformToString();
    if (body) {
      subscriptions = JSON.parse(body) as StoredSubscription[];
    }
  } catch (err: unknown) {
    // NoSuchKey = first run, no file yet
    if (err instanceof Error && err.name !== "NoSuchKey") {
      console.error("Failed to load push subscriptions from S3:", err.message);
    }
  }
  loaded = true;
  return subscriptions;
}

async function saveSubscriptions(): Promise<void> {
  try {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: S3_KEY,
      Body: JSON.stringify(subscriptions, null, 2),
      ContentType: "application/json",
    }));
  } catch (err: unknown) {
    console.error("Failed to save push subscriptions to S3:", err instanceof Error ? err.message : err);
  }
}

// VAPID keys
const vapidPublicKey =
  process.env.VAPID_PUBLIC_KEY ?? webpush.generateVAPIDKeys().publicKey;
const vapidPrivateKey =
  process.env.VAPID_PRIVATE_KEY ?? webpush.generateVAPIDKeys().privateKey;

webpush.setVapidDetails(
  process.env.VAPID_EMAIL ?? "mailto:tbaltzakis@cloudless.gr",
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
    return void loadSubscriptions().then((subs) =>
      res.json({
        subscriptions: subs.length,
        list: subs.map((s) => ({ endpoint: s.endpoint, createdAt: s.createdAt })),
      }),
    );
  }

  // No action = send test notification to all subscribers
  return void loadSubscriptions().then(() =>
    sendToAll(
      {
        title: "Test Notification",
        body: "Push notifications are working!",
        icon: "/icons/icon-192x192.png",
      },
      res,
    ),
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

  return void loadSubscriptions().then(() => sendToAll(message, res));
});

// PUT /api/push-notifications — store subscription
router.put("/", (req: Request, res: Response) => {
  const { endpoint, keys } = req.body as Partial<StoredSubscription>;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res
      .status(400)
      .json({ error: "endpoint, keys.p256dh, and keys.auth are required" });
  }

  return void loadSubscriptions().then(async () => {
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

    await saveSubscriptions();
    res.json({ success: true, subscriptions: subscriptions.length });
  });
});

// DELETE /api/push-notifications?endpoint=... — remove subscription
router.delete("/", (req: Request, res: Response) => {
  const endpoint = req.query.endpoint as string | undefined;

  if (!endpoint) {
    return res.status(400).json({ error: "endpoint query parameter required" });
  }

  return void loadSubscriptions().then(async () => {
    const index = subscriptions.findIndex((s) => s.endpoint === endpoint);
    if (index >= 0) {
      subscriptions.splice(index, 1);
      await saveSubscriptions();
    }
    res.json({ success: true, subscriptions: subscriptions.length });
  });
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

  // Remove expired subscriptions (410 Gone) and persist
  const expired = settled.filter(
    (r) => !r.success && r.statusCode === 410,
  );
  if (expired.length > 0) {
    for (const e of expired) {
      const idx = subscriptions.findIndex((s) => s.endpoint === e.endpoint);
      if (idx >= 0) subscriptions.splice(idx, 1);
    }
    await saveSubscriptions();
  }

  res.json({
    success: true,
    message: `Sent to ${settled.filter((r) => r.success).length}/${settled.length} subscribers`,
    results: settled,
    totalSubscriptions: subscriptions.length,
  });
}

export default router;
