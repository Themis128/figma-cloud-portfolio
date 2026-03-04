import { type NextRequest, NextResponse } from "next/server";

const CAL_API_KEY = process.env.CAL_API_KEY ?? "";
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID ?? "";
const CAL_API_BASE = "https://api.cal.com/v2";

export interface SlotsByDate {
  [date: string]: string[]; // date "YYYY-MM-DD" → array of ISO start times
}

export async function GET(request: NextRequest) {
  if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
    return NextResponse.json(
      { error: "Booking service not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);

  // Default: next 7 days
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  const startTime = searchParams.get("startTime") ?? now.toISOString();
  const endTime = searchParams.get("endTime") ?? sevenDaysLater.toISOString();

  try {
    const url = new URL(`${CAL_API_BASE}/slots`);
    url.searchParams.set("start", startTime);
    url.searchParams.set("end", endTime);
    url.searchParams.set("eventTypeId", CAL_EVENT_TYPE_ID);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2024-09-04",
      },
      next: { revalidate: 60 }, // cache 60s
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Cal.com error: ${res.status} ${text}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      status?: string;
      data: Record<string, { start: string }[]>;
    };

    // Reshape into { "YYYY-MM-DD": ["ISO", ...] }
    const slotsByDate: SlotsByDate = {};
    const rawSlots = data?.data ?? {};

    for (const [dateKey, slots] of Object.entries(rawSlots)) {
      if (Array.isArray(slots)) {
        slotsByDate[dateKey] = slots.map((s) => s.start);
      }
    }

    return NextResponse.json({ slots: slotsByDate });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch slots: ${message}` },
      { status: 503 },
    );
  }
}
