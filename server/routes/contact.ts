// Contact form endpoint — validates reCAPTCHA v3, sends Slack notification + SES email
import { Router, Request, Response } from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const router = Router();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY ?? "";
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? "";
const SES_VERIFIED_EMAIL = process.env.SES_VERIFIED_EMAIL ?? "";
const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";

// Minimum reCAPTCHA score to accept (0.0–1.0, higher = more likely human)
const RECAPTCHA_THRESHOLD = parseFloat(process.env.RECAPTCHA_THRESHOLD ?? "0.5");

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  recaptchaToken?: string;
}

/** Metadata extracted from the request for enriching notifications */
interface RequestMeta {
  ip: string;
  userAgent: string;
  referer: string;
  origin: string;
  acceptLanguage: string;
  recaptchaScore: number | null;
  timestamp: string;
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

    console.log("reCAPTCHA verify response:", JSON.stringify(data));

    if (!data.success) {
      return { success: false, score: 0, error: `reCAPTCHA failed: ${(data["error-codes"] ?? []).join(", ")}` };
    }

    const score = data.score ?? 0;
    console.log(`reCAPTCHA score: ${score}, threshold: ${RECAPTCHA_THRESHOLD}`);
    if (score < RECAPTCHA_THRESHOLD) {
      return { success: false, score, error: `reCAPTCHA score too low (${score})` };
    }

    return { success: true, score };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, score: 0, error: `reCAPTCHA verification error: ${msg}` };
  }
}

/** Extract client metadata from the Express request */
function extractMeta(req: Request, recaptchaScore: number | null): RequestMeta {
  return {
    ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.socket.remoteAddress
      || "unknown",
    userAgent: (req.headers["user-agent"] as string) || "unknown",
    referer: (req.headers["referer"] as string) || "direct",
    origin: (req.headers["origin"] as string) || "unknown",
    acceptLanguage: (req.headers["accept-language"] as string) || "unknown",
    recaptchaScore,
    timestamp: new Date().toISOString(),
  };
}

// ── Slack notification ───────────────────────────────────────────────────────

async function sendSlackNotification(
  name: string,
  email: string,
  subject: string,
  message: string,
  meta: RequestMeta,
): Promise<void> {
  if (!SLACK_WEBHOOK_URL) return;

  const scoreText = meta.recaptchaScore !== null
    ? `${meta.recaptchaScore.toFixed(2)} / 1.0`
    : "N/A";

  const payload = {
    text: `📬 New Contact Form Submission from ${name}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "📬 New Contact Form Submission" },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*👤 Name:*\n${name}` },
          { type: "mrkdwn", text: `*📧 Email:*\n<mailto:${email}|${email}>` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*📋 Subject:*\n${subject}` },
          { type: "mrkdwn", text: `*🛡️ reCAPTCHA Score:*\n${scoreText}` },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*💬 Message:*\n${message}` },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🌐 IP Address:*\n\`${meta.ip}\`` },
          { type: "mrkdwn", text: `*🔗 Referer:*\n${meta.referer}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🖥️ User-Agent:*\n\`${truncate(meta.userAgent, 150)}\`` },
          { type: "mrkdwn", text: `*🌍 Language:*\n${meta.acceptLanguage}` },
        ],
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*🔗 Origin:*\n${meta.origin}` },
        ],
      },
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📍 Sent from *baltzakisthemis.com* contact form · ${meta.timestamp}`,
          },
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

async function sendSesEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  meta: RequestMeta,
): Promise<void> {
  if (!SES_VERIFIED_EMAIL) return;

  const ses = new SESClient({ region: AWS_REGION });

  const scoreText = meta.recaptchaScore !== null
    ? `${meta.recaptchaScore.toFixed(2)} / 1.0`
    : "N/A";

  const textBody = [
    `New contact form submission from ${name} (${email})`,
    "",
    `Subject: ${subject}`,
    "",
    message,
    "",
    "─────────────────────────────────────────",
    "Request Details:",
    `  IP Address:      ${meta.ip}`,
    `  User-Agent:      ${meta.userAgent}`,
    `  Referer:         ${meta.referer}`,
    `  Origin:          ${meta.origin}`,
    `  Language:        ${meta.acceptLanguage}`,
    `  reCAPTCHA Score: ${scoreText}`,
    `  Timestamp:       ${meta.timestamp}`,
    "",
    "─────────────────────────────────────────",
    "Sent from baltzakisthemis.com contact form",
  ].join("\n");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #0a0a0f; color: #e5e5e5; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; }
    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 24px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.05em; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 13px; }
    .body { background: #111827; padding: 24px; border: 1px solid #1f2937; border-top: none; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #06b6d4; font-weight: 600; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #e5e5e5; }
    .field-value a { color: #06b6d4; text-decoration: none; }
    .message-box { background: #0d1117; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin: 16px 0; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #d1d5db; }
    .divider { border: none; border-top: 1px solid #1f2937; margin: 20px 0; }
    .meta-section { background: #0d1117; border: 1px solid #1f2937; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .meta-title { font-size: 13px; font-weight: 600; color: #06b6d4; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
    .meta-grid { display: table; width: 100%; }
    .meta-row { display: table-row; }
    .meta-key { display: table-cell; padding: 4px 12px 4px 0; font-size: 12px; color: #9ca3af; white-space: nowrap; vertical-align: top; }
    .meta-val { display: table-cell; padding: 4px 0; font-size: 12px; color: #d1d5db; word-break: break-all; }
    .footer { background: #0d1117; padding: 16px 24px; border-radius: 0 0 12px 12px; border: 1px solid #1f2937; border-top: none; text-align: center; }
    .footer p { margin: 0; font-size: 11px; color: #6b7280; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-green { background: rgba(34,197,94,0.15); color: #22c55e; }
    .badge-yellow { background: rgba(234,179,8,0.15); color: #eab308; }
    .badge-gray { background: rgba(156,163,175,0.15); color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Contact Form Submission</h1>
      <p>Someone reached out via baltzakisthemis.com</p>
    </div>
    <div class="body">
      <div style="display: table; width: 100%;">
        <div style="display: table-cell; width: 50%; padding-right: 12px;">
          <div class="field">
            <div class="field-label">👤 Name</div>
            <div class="field-value">${escapeHtml(name)}</div>
          </div>
        </div>
        <div style="display: table-cell; width: 50%; padding-left: 12px;">
          <div class="field">
            <div class="field-label">📧 Email</div>
            <div class="field-value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
          </div>
        </div>
      </div>
      <div class="field">
        <div class="field-label">📋 Subject</div>
        <div class="field-value">${escapeHtml(subject)}</div>
      </div>
      <hr class="divider"/>
      <div class="field">
        <div class="field-label">💬 Message</div>
        <div class="message-box">${escapeHtml(message).replace(/\n/g, "<br/>")}</div>
      </div>
      <div class="meta-section">
        <div class="meta-title">🔍 Request Details</div>
        <div class="meta-grid">
          <div class="meta-row"><div class="meta-key">IP Address:</div><div class="meta-val"><code>${escapeHtml(meta.ip)}</code></div></div>
          <div class="meta-row"><div class="meta-key">User-Agent:</div><div class="meta-val"><code>${escapeHtml(meta.userAgent)}</code></div></div>
          <div class="meta-row"><div class="meta-key">Referer:</div><div class="meta-val">${escapeHtml(meta.referer)}</div></div>
          <div class="meta-row"><div class="meta-key">Origin:</div><div class="meta-val">${escapeHtml(meta.origin)}</div></div>
          <div class="meta-row"><div class="meta-key">Language:</div><div class="meta-val">${escapeHtml(meta.acceptLanguage)}</div></div>
          <div class="meta-row"><div class="meta-key">reCAPTCHA:</div><div class="meta-val"><span class="badge ${recaptchaBadgeClass(meta.recaptchaScore)}">${scoreText}</span></div></div>
          <div class="meta-row"><div class="meta-key">Timestamp:</div><div class="meta-val">${meta.timestamp}</div></div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Sent from <strong>baltzakisthemis.com</strong> contact form · ${meta.timestamp}</p>
    </div>
  </div>
</body>
</html>`.trim();

  const command = new SendEmailCommand({
    Source: `Portfolio Contact <${SES_VERIFIED_EMAIL}>`,
    Destination: {
      ToAddresses: ["baltzakis.themis@gmail.com"],
    },
    ReplyToAddresses: [email],
    Message: {
      Subject: { Data: `[Portfolio] ${subject}` },
      Body: {
        Text: { Data: textBody },
        Html: { Data: htmlBody },
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

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function recaptchaBadgeClass(score: number | null): string {
  if (score === null) return "badge-gray";
  if (score >= 0.7) return "badge-green";
  return "badge-yellow";
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

    // Verify reCAPTCHA if configured (skip in development when NODE_ENV !== "production")
    let recaptchaScore: number | null = null;
    const isDev = process.env.NODE_ENV !== "production";
    if (RECAPTCHA_SECRET_KEY && !isDev) {
      if (!recaptchaToken) {
        return res.status(400).json({ success: false, message: "reCAPTCHA verification required" });
      }
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.success) {
        return res.status(403).json({ success: false, message: "reCAPTCHA verification failed. Please try again." });
      }
      recaptchaScore = captcha.score;
    } else if (isDev) {
      console.log("reCAPTCHA skipped (development mode)");
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = (subject ?? "No subject").trim();
    const trimmedMessage = message.trim();
    const meta = extractMeta(req, recaptchaScore);

    // If no delivery channels are configured, accept the message (dev/test mode)
    if (!SLACK_WEBHOOK_URL && !SES_VERIFIED_EMAIL) {
      console.log("Contact form received (no delivery channels configured):", { name: trimmedName, email: trimmedEmail, subject: trimmedSubject, meta });
      return res.json({ success: true, message: "Message sent successfully" });
    }

    // Send notifications in parallel — don't fail the request if one channel errors
    const results = await Promise.allSettled([
      sendSlackNotification(trimmedName, trimmedEmail, trimmedSubject, trimmedMessage, meta),
      sendSesEmail(trimmedName, trimmedEmail, trimmedSubject, trimmedMessage, meta),
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
