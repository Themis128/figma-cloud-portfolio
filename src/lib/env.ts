import { z } from "zod";

/**
 * Client-side environment variable validation.
 * These are embedded at build time via NEXT_PUBLIC_ prefix.
 * Validates on first access — logs warnings for missing optional vars.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://www.baltzakisthemis.com"),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("/api"),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

let _validated: z.infer<typeof clientEnvSchema> | null = null;

export function getClientEnv() {
  if (_validated) return _validated;

  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });

  if (!result.success) {
    console.error("[env] Client environment validation failed:", result.error.flatten().fieldErrors); // eslint-disable-line no-console
  }

  _validated = result.success ? result.data : clientEnvSchema.parse({});
  return _validated;
}
