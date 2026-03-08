// Contact form endpoint — validates reCAPTCHA v3, sends Slack notification + SES email
import { Router, Request, Response } from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const router = Router();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY ?? "";
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? "";
const SES_VERIFIED_EMAIL = process.env.SES_VERIFIED_EMAIL ?? "";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

// Minimum reCAPTCHA score to accept (0.0–1.0, higher = more likely human)
const RECAPTCHA_THRESHOLD = 0.5;

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptchaToken?: string;
}

// ── reCAPTCHA v3 verification ────────────────────────────────────────────────

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number; error?: string }> {
  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await res.json()) as {
      success: boolean;
      score?: number;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return { success: false, score: 0, error: `reCAPTCHA failed: ${(data["error-codes"] ?? []).join(", ")}` };
    }

    const score = data.score ?? 0;
    if (score < RECAPTCHA_THRESHOLD) {
      return { success: false, score, error: `reCAPTCHA score too low (${score})` };
    }

    return { success: true, score };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, score: 0, error: `reCAPTCHA verification error: ${msg}` };
  }
}

// ── Slack notification ───────────────────────────────────────────────────────

async function sendSlackNotification(name: string, email: string, subject: string, message: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  const payload = {
    text: `📬 New Contact Form Submission`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "📬 New Contact Form Submission" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${name}` },
          { type: "mrkdwn", text: `*Email:*\n${email}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Subject:*\n${subject}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Message:*\n${message}` },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Sent from baltzakis.dev contact form · ${new Date().toISOString()}` },
        ],
      },
    ],
  };

  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ── SES email ────────────────────────────────────────────────────────────────

async function sendSesEmail(name: string, email: string, subject: string, message: string): Promise<void> {
  if (!SES_VERIFIED_EMAIL) return;

  const ses = new SESClient({ region: AWS_REGION });

  const command = new SendEmailCommand({
    Source: `Portfolio Contact <${SES_VERIFIED_EMAIL}>`,
    Destination: {
      ToAddresses: ["baltzakis.themis@gmail.com"],
    },
    ReplyToAddresses: [email],
    Message: {
      Subject: { Data: `[Portfolio] ${subject}` },
      Body: {
        Text: {
          Data: [
            `New contact form submission from ${name} (${email})`,
            "",
            `Subject: ${subject}`,
            "",
            message,
            "",
            "---",
            `Sent from baltzakis.dev contact form`,
            `Time: ${new Date().toISOString()}`,
          ].join("\n"),
        },
        Html: {
          Data: [
            `<h2>New Contact Form Submission</h2>`,
            `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
            `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
            `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>`,
            `<hr/>`,
            `<p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
            `<hr/>`,
            `<p style="color:#888;font-size:12px">Sent from baltzakis.dev contact form · ${new Date().toISOString()}</p>`,
          ].join("\n"),
        },
      },
    },
  });

  await ses.send(command);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── POST /api/contact ────────────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, recaptchaToken } = req.body as ContactBody;

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required" });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Verify reCAPTCHA if configured
    if (RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return res.status(400).json({ success: false, message: "reCAPTCHA verification required" });
      }
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.success) {
        return res.status(403).json({ success: false, message: "reCAPTCHA verification failed. Please try again." });
      }
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = (subject ?? "No subject").trim();
    const trimmedMessage = message.trim();

    // If no delivery channels are configured, accept the message (dev/test mode)
    if (!SLACK_WEBHOOK_URL && !SES_VERIFIED_EMAIL) {
      console.log("Contact form received (no delivery channels configured):", { name: trimmedName, email: trimmedEmail, subject: trimmedSubject });
      return res.json({ success: true, message: "Message sent successfully" });
    }

    // Send notifications in parallel — don't fail the request if one channel errors
    const results = await Promise.allSettled([
      sendSlackNotification(trimmedName, trimmedEmail, trimmedSubject, trimmedMessage),
      sendSesEmail(trimmedName, trimmedEmail, trimmedSubject, trimmedMessage),
    ]);

    const slackOk = results[0]?.status === "fulfilled";
    const sesOk = results[1]?.status === "fulfilled";

    // At least one delivery channel must succeed
    if (!slackOk && !sesOk) {
      console.error("Contact form: all delivery channels failed", results);
      return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
    }

    return res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Contact form error:", msg);
    return res.status(500).json({ success: false, message: "An error occurred. Please try again later." });
  }
});

export default router;
