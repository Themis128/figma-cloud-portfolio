import { type NextRequest, NextResponse } from "next/server";

const CAL_API_KEY = process.env.CAL_API_KEY ?? "";
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID ?? "";
const CAL_API_BASE = "https://api.cal.com/v2";

interface CreateBookingBody {
  start: string;
  name: string;
  email: string;
  timeZone: string;
}

export async function POST(request: NextRequest) {
  if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
    return NextResponse.json(
      { error: "Booking service not configured" },
      { status: 503 },
    );
  }

  let body: CreateBookingBody;
  try {
    body = (await request.json()) as CreateBookingBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { start, name, email, timeZone } = body;

  if (!start || !name || !email || !timeZone) {
    return NextResponse.json(
      { error: "Missing required fields: start, name, email, timeZone" },
      { status: 400 },
    );
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${CAL_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify({
        eventTypeId: Number(CAL_EVENT_TYPE_ID),
        start,
        attendee: {
          name,
          email,
          timeZone,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Cal.com error: ${res.status} ${text}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      status: string;
      data: {
        uid: string;
        meetingUrl?: string;
        start: string;
        end: string;
      };
    };

    return NextResponse.json({
      uid: data.data.uid,
      meetingUrl: data.data.meetingUrl ?? null,
      start: data.data.start,
      end: data.data.end,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create booking: ${message}` },
      { status: 503 },
    );
  }
}
