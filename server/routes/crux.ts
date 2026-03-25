// CrUX (Chrome UX Report) API proxy — fetches real field data for the portfolio site
import { Router, Request, Response } from "express";

const router = Router();

const CRUX_API_URL = "https://chromeuxreport.googleapis.com/v1/records:queryRecord";
const CRUX_API_KEY = process.env.CRUX_API_KEY ?? "";
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "https://www.baltzakisthemis.com";

// Cache CrUX data for 1 hour (updated daily by Google anyway)
let cachedData: Record<string, unknown> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CrUXMetric {
  histogram: Array<{ start: number; end?: number; density: number }>;
  percentiles: { p75: number };
}

interface CrUXResponse {
  record?: {
    key?: { origin?: string };
    metrics?: {
      largest_contentful_paint?: CrUXMetric;
      first_contentful_paint?: CrUXMetric;
      cumulative_layout_shift?: CrUXMetric;
      interaction_to_next_paint?: CrUXMetric;
      first_input_delay?: CrUXMetric;
      experimental_time_to_first_byte?: CrUXMetric;
    };
  };
}

function formatCrUXData(raw: CrUXResponse) {
  const metrics = raw.record?.metrics;
  if (!metrics) return null;

  function extract(m: CrUXMetric | undefined) {
    if (!m) return null;
    const good = m.histogram[0]?.density ?? 0;
    const needsImprovement = m.histogram[1]?.density ?? 0;
    const poor = m.histogram[2]?.density ?? 0;
    return {
      p75: m.percentiles.p75,
      good: Math.round(good * 100),
      needsImprovement: Math.round(needsImprovement * 100),
      poor: Math.round(poor * 100),
    };
  }

  return {
    origin: raw.record?.key?.origin ?? SITE_ORIGIN,
    lcp: extract(metrics.largest_contentful_paint),
    fcp: extract(metrics.first_contentful_paint),
    cls: extract(metrics.cumulative_layout_shift),
    inp: extract(metrics.interaction_to_next_paint),
    fid: extract(metrics.first_input_delay),
    ttfb: extract(metrics.experimental_time_to_first_byte),
  };
}

// GET /api/crux
router.get("/", async (_req: Request, res: Response) => {
  // Return cached data if fresh
  if (cachedData && Date.now() < cacheExpiry) {
    return res.json(cachedData);
  }

  if (!CRUX_API_KEY) {
    return res.json({
      error: "CrUX API key not configured",
      hint: "Set CRUX_API_KEY environment variable with a Google Cloud API key",
    });
  }

  try {
    const response = await fetch(`${CRUX_API_URL}?key=${CRUX_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: SITE_ORIGIN,
        formFactor: "PHONE",
        metrics: [
          "largest_contentful_paint",
          "first_contentful_paint",
          "cumulative_layout_shift",
          "interaction_to_next_paint",
          "experimental_time_to_first_byte",
        ],
      }),
    });

    if (!response.ok) {
      // Try without form factor filter
      const fallback = await fetch(`${CRUX_API_URL}?key=${CRUX_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: SITE_ORIGIN,
          metrics: [
            "largest_contentful_paint",
            "first_contentful_paint",
            "cumulative_layout_shift",
            "interaction_to_next_paint",
            "experimental_time_to_first_byte",
          ],
        }),
      });

      if (!fallback.ok) {
        return res.json({
          error: `CrUX API returned ${fallback.status}`,
          message: "No field data available yet — site needs enough traffic for CrUX to collect data (typically 28 days).",
        });
      }

      const data = (await fallback.json()) as CrUXResponse;
      const formatted = formatCrUXData(data);
      cachedData = { ...formatted, formFactor: "ALL", timestamp: new Date().toISOString() };
      cacheExpiry = Date.now() + CACHE_TTL_MS;
      return res.json(cachedData);
    }

    const data = (await response.json()) as CrUXResponse;
    const formatted = formatCrUXData(data);
    cachedData = { ...formatted, formFactor: "PHONE", timestamp: new Date().toISOString() };
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return res.json(cachedData);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: `CrUX request failed: ${msg}` });
  }
});

export default router;
