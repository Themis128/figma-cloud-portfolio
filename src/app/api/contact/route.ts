import { type NextRequest, NextResponse } from "next/server";

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /eval\(/gi,
  /document\.cookie/gi,
];

const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FROM|WHERE)\b)/gi,
  /(--|;|\/\*|\*\/)/g,
];

function containsMaliciousContent(input: string): boolean {
  return (
    XSS_PATTERNS.some((pattern) => pattern.test(input)) ||
    SQL_PATTERNS.some((pattern) => pattern.test(input))
  );
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // skip verification if secret not configured

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${token}`,
      },
    );
    const data = (await response.json()) as {
      success: boolean;
      score?: number;
    };
    return data.success && (data.score ?? 1) >= 0.5;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
      recaptchaToken?: string;
    };

    const { name, email, message, recaptchaToken } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // Security: check for malicious content
    if (
      containsMaliciousContent(name) ||
      containsMaliciousContent(email) ||
      containsMaliciousContent(message)
    ) {
      return NextResponse.json(
        { error: "Invalid input detected." },
        { status: 400 },
      );
    }

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed." },
          { status: 400 },
        );
      }
    }

    // In production, send email here via SMTP or an email service.
    // For now we log it server-side (visible in server logs / Vercel function logs).
    // eslint-disable-next-line no-console
    console.info("[contact] New submission:", {
      name,
      email,
      messageLength: message.length,
    });

    return NextResponse.json({
      success: true,
      message: "Message received. Thank you!",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[contact] Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
