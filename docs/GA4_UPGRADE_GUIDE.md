# GA4 — Implementation guide & 2026 trends

Quick summary: this document captures current GA4 best practices (client + server), privacy/consent guidance, event naming and deduplication patterns, recommended observability (BigQuery export, DebugView) — and lists the repository changes I applied so your implementation matches these recommendations.

---

## TL;DR ✅

- Use GA4 (gtag.js) with `send_page_view: false` and manually fire `page_view` on route changes (already implemented).
- Add stable `event_id` on every event and include `client_id` for server-side Measurement Protocol (MP) forwarding — prevents duplicates and enables joining client & server signals.
- Implement server-side MP forwarding (optional) for better resilience, enhanced conversions and privacy-safe server events.
- Respect Consent Mode v2 (set `gtag('consent','default',...)` then `update`) and prefer server-side for privacy-sensitive conversions.
- Export raw events to BigQuery for advanced analysis and ML features.

---

## 2026 trends & why they matter

- Privacy-first measurement: Consent Mode v2, cookieless measurement and first-party data are standard. Implement consent-aware tags and server-side controls.
- Server-side tagging & Measurement Protocol v2: used to (1) improve data reliability, (2) do privacy-safe enrichment (hashed conversions), (3) reduce client-side loss (ad-blockers, network failures).
- Event deduplication and stable identifiers: `event_id` + `client_id` to dedupe client/server duplicates.
- BigQuery + predictive metrics: export GA4 events to BigQuery for custom analytics, cohorting and ML features (predictive audiences).
- Emphasis on standard event/parameter naming and types to keep reports and ML features accurate.

Sources: Google Developers (GA4 + Measurement Protocol + Consent Mode), GTM server-side docs, Google Analytics BigQuery export docs.

---

## Recommended implementation (summary)

1. Client-side
   - Load Google tag (gtag.js) or GTM.
   - Initialize with `send_page_view: false` and manually emit `page_view` for SPA route changes.
   - Attach `client_id` and a generated `event_id` to events.
   - Use recommended event names and types (snake_case, consistent param types).
   - Respect Consent Mode v2: default-to-deny where required, update on user consent.

2. Server-side (Measurement Protocol v2)
   - Forward validated events to GA MP using `measurement_id` + `api_secret`.
   - Always include `client_id` (or `user_id`) and `event_id` for deduplication.
   - Use MP for offline conversions, enhanced conversions, or to augment client signals.
   - Validate payloads using MP debug endpoint during testing.

3. Observability & QA
   - Use GA DebugView and MP validation endpoint during dev.
   - Add Playwright/E2E tests that assert `dataLayer` / `gtag` events.
   - Export to BigQuery for playback & audits.

---

## Key GA4 details you should follow

- Event dedupe: include `event_id` on client and server events.
- Client identifier: `client_id` (persisted in localStorage/cookie) — MP relies on it to join events.
- Consent mode: call `gtag('consent','default', {...})` before any `config` or `event`.
- Debugging: use `https://www.google-analytics.com/debug/mp/collect` for server payloads and DebugView in GA UI for client events.
- Reserved names: do not try to emulate or replace GA automatic events via MP (use tagging + MP augmentation per Google docs).

---

## What I changed in this repo (applied)

- Client: added stable `event_id` generation and included `event_id` on all outgoing gtag events (page_view, contact_form_submit, generate_lead, exception, web_vitals, etc.).
- Client: included `clientId` in backend analytics payloads so server can forward accurately.
- Server: `POST /api/analytics` now optionally forwards events to GA4 Measurement Protocol v2 when server env vars are present (measurement_id + api_secret). MP forwarding runs asynchronously and uses `event_id` + `client_id` for dedupe.
- Types: extended `AnalyticsEvent` shared type to include `clientId` and `eventId`.
- Docs: added this upgrade guide and updated secrets guide to include `GOOGLE_ANALYTICS_API_SECRET` and `GOOGLE_ANALYTICS_MEASUREMENT_ID` (server-side).

Files changed (high level):
- `client/components/GoogleAnalytics.tsx` (event_id + clientId additions)
- `server/routes/analytics.ts` (MP forwarding + debug support)
- `shared/api.ts` (type updates)
- `docs/GITHUB_SECRETS_SETUP.md` (new secret)
- `docs/GA4_UPGRADE_GUIDE.md` (this file)

---

## How to enable server-side MP forwarding (steps)

1. In GA4 Admin → Data Streams → choose web stream → Measurement Protocol → create an API secret.
2. Add the secret to your server environment as `GOOGLE_ANALYTICS_API_SECRET` and set `GOOGLE_ANALYTICS_MEASUREMENT_ID` (same as your client measurement id) in production secrets.
3. Restart server. The `/api/analytics` endpoint will attempt to forward validated events to MP automatically.
4. Use the MP debug endpoint (development) to validate payloads before enabling in production.

Security note: keep the API secret on the server only (do NOT expose as `VITE_` env var).

---

## Developer checklist (quick)

- [ ] Add `GOOGLE_ANALYTICS_API_SECRET` to server secrets (optional)
- [ ] Verify `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID` is set for client-side
- [ ] Run E2E tests: `pnpm test:e2e --grep "Analytics"`
- [ ] Validate server MP payloads with MP debug endpoint (dev)
- [ ] Check DebugView for client events
- [ ] (Optional) Configure BigQuery export in GA4 for raw-event analysis

---

## Sample Measurement Protocol v2 payload (server)

`POST https://www.google-analytics.com/mp/collect?measurement_id=G-XXXX&api_secret=SECRET`

Body (JSON):
{
  "client_id": "1678821234.1234567890",
  "events": [
    {
      "name": "contact_form_submit",
      "params": {
        "event_id": "1678821234.abc123",
        "page_location": "https://example.com/contact",
        "engagement_time_msec": 2345
      }
    }
  ]
}

---

## Testing & validation

- Use GA DebugView and `mp/collect?debug` to verify server payloads.
- Playwright tests in this repo already check `dataLayer` and common events — run `pnpm test:e2e`.

---

## Additional reading (official)

- GA4 web + tag docs: [GA4 web + tag docs](https://developers.google.com/analytics/devguides/collection/ga4)
- Measurement Protocol (MP v2): [Measurement Protocol (MP v2)](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- Consent Mode v2 & developer guide: [Consent Mode v2 & developer guide](https://developers.google.com/tag-platform/devguides/consent)
- GTM server-side tagging: [GTM server-side tagging](https://developers.google.com/tag-manager/server-side)
- BigQuery export: [BigQuery export](https://developers.google.com/analytics/bigquery)

---

If you want, I can:
- Add Consent Mode calls and a small consent utility (reads a localStorage flag) to `GoogleAnalytics.tsx`.
- Wire enhanced conversions (server-side hashed emails) into `/api/analytics`.
- Add a Playwright test that asserts `event_id` is present in `dataLayer` for page views and conversions.

Tell me which of the above you'd like next. 🔧
