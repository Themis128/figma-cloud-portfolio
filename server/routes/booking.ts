// Booking API — proxies to Cal.com API v2 for slot availability and booking creation
import { Router, Request, Response } from "express";

const router = Router();

const CAL_API_KEY = process.env.CAL_API_KEY ?? "";
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID ?? "";
const CAL_API_BASE = "https://api.cal.com/v2";

// GET /api/booking/slots — fetch available slots for the next 7 days
router.get("/slots", async (_req: Request, res: Response) => {
  try {
    if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
      return res
        .status(503)
        .json({ error: "Booking service is not configured" });
    }

    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      start: now.toISOString(),
      end: end.toISOString(),
      eventTypeId: CAL_EVENT_TYPE_ID,
    });

    const response = await fetch(`${CAL_API_BASE}/slots?${params}`, {
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2024-09-04",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: `Cal.com API error: ${errorText}` });
    }

    const data = (await response.json()) as {
      status: string;
      data: Record<string, Array<{ start: string }> | string[]>;
    };

    // Cal.com v2 returns { date: [{ start: "..." }] } — flatten to { date: ["..."] }
    const raw = data.data ?? {};
    const slots: Record<string, string[]> = {};
    for (const [date, arr] of Object.entries(raw)) {
      slots[date] = arr.map((s) =>
        typeof s === "string" ? s : s.start,
      );
    }

    return res.json({ slots });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Failed to fetch slots: ${msg}` });
  }
});

// POST /api/booking/create — create a booking on Cal.com
router.post("/create", async (req: Request, res: Response) => {
  try {
    if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
      return res
        .status(503)
        .json({ error: "Booking service is not configured" });
    }

    const { start, name, email, timeZone } = req.body as {
      start?: string;
      name?: string;
      email?: string;
      timeZone?: string;
    };

    if (!start || !name?.trim() || !email?.trim()) {
      return res
        .status(400)
        .json({ error: "start, name, and email are required" });
    }

    const response = await fetch(`${CAL_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        start,
        eventTypeId: Number(CAL_EVENT_TYPE_ID),
        attendee: {
          name: name.trim(),
          email: email.trim(),
          timeZone: timeZone ?? "UTC",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: `Booking failed: ${errorText}` });
    }

    const data = (await response.json()) as {
      status: string;
      data: {
        uid?: string;
        location?: string;
        meetingUrl?: string;
        status?: string;
      };
    };

    return res.json({
      uid: data.data.uid,
      meetingUrl: data.data.location ?? data.data.meetingUrl ?? null,
      status: data.data.status,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `Booking failed: ${msg}` });
  }
});

export default router;
