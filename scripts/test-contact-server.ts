// Temporary test server for contact form delivery testing
// Uses Google's official reCAPTCHA v2 test keys (v3 has no test keys)
// The test secret key returns success=true with no score, so RECAPTCHA_THRESHOLD=0 is needed
//
// Usage: npx tsx scripts/test-contact-server.ts

import express from "express";
import cors from "cors";
import contact from "../server/routes/contact";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use(cors());
app.use("/api/contact", contact);
app.get("/api/ping", (_, res) =>
  res.json({
    status: "ok",
    recaptchaKey: process.env.RECAPTCHA_SECRET_KEY?.substring(0, 10),
    threshold: process.env.RECAPTCHA_THRESHOLD,
    ses: process.env.SES_VERIFIED_EMAIL,
    slack: process.env.SLACK_WEBHOOK_URL ? "configured" : "not set",
  }),
);

app.listen(3002, () => {
  console.log("Test contact server on port 3002");
  console.log(`reCAPTCHA key: ${process.env.RECAPTCHA_SECRET_KEY?.substring(0, 10)}... (threshold: ${process.env.RECAPTCHA_THRESHOLD})`);
  console.log(`SES email: ${process.env.SES_VERIFIED_EMAIL}`);
  console.log(`Slack: ${process.env.SLACK_WEBHOOK_URL ? "configured" : "not configured"}`);
});
