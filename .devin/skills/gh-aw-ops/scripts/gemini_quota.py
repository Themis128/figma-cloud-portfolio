#!/usr/bin/env python3
"""Probe Gemini API models for quota/availability.

Free-tier quotas are PER-MODEL: a model returns HTTP 429 when its daily
bucket is exhausted while sibling models stay alive. gh-aw's
`fallback-models` does NOT switch on 429, so the ops pattern is to pin
each workflow to a different live model.

Usage:
    python gemini_quota.py                     # uses GEMINI_API_KEY env
    python gemini_quota.py --key AIza...       # inline key (avoid in shells)
    python gemini_quota.py --models a,b,c      # custom model list
    python gemini_quota.py --json              # machine-readable output

Exit code 0 if at least one model is ALIVE, 1 otherwise.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

API = "https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={k}"

DEFAULT_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-pro-preview",
]

PAYLOAD = {
    "contents": [{"parts": [{"text": "ping"}]}],
    "generationConfig": {"maxOutputTokens": 8},
}


def probe(model: str, key: str, timeout: int = 20) -> dict:
    req = urllib.request.Request(
        API.format(m=model, k=key),
        data=json.dumps(PAYLOAD).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return {"model": model, "status": "ALIVE", "http": r.status}
    except urllib.error.HTTPError as e:
        body = e.read()[:300].decode("utf-8", "replace")
        if e.code == 429:
            status = "QUOTA"
        elif e.code == 404:
            status = "DEAD"
        elif e.code in (400, 403):
            status = "REJECTED"
        else:
            status = f"HTTP{e.code}"
        return {"model": model, "status": status, "http": e.code, "detail": body}
    except Exception as e:  # network/timeout
        return {"model": model, "status": "ERROR", "detail": str(e)[:200]}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--key", default=os.environ.get("GEMINI_API_KEY"))
    ap.add_argument("--models", help="comma-separated model list")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if not args.key:
        print("GEMINI_API_KEY not set and --key not given", file=sys.stderr)
        return 2

    models = args.models.split(",") if args.models else DEFAULT_MODELS
    results = [probe(m.strip(), args.key) for m in models]

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            extra = f"  {r.get('detail', '')[:100]}" if r["status"] not in ("ALIVE",) else ""
            print(f"{r['status']:<10} {r['model']}{extra}")
        alive = [r["model"] for r in results if r["status"] == "ALIVE"]
        print(f"\n{len(alive)}/{len(results)} models alive: {', '.join(alive) or 'NONE'}")

    return 0 if any(r["status"] == "ALIVE" for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
