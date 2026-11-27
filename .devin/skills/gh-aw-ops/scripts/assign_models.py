#!/usr/bin/env python3
"""Distribute gh-aw workflows across live Gemini quota pools (project + model).

Quota reality (verified 2026-11-27): free-tier quotas are **per GCP project,
per model, per day**. Two levers exist:

  1. Multiple models inside one project — `engine.model` pins (this script's
     original job).
  2. Multiple GCP projects — separate quota pools. Wire a second project's key
     via `engine.env.GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY_2 }}`; gh-aw
     v1.4.0 recompiles the whole secret chain (validate step, agent env,
     SECRET_* masking) to the alternate secret.

Usage:
    python assign_models.py --pools GEMINI_API_KEY,GEMINI_API_KEY_2 --probe
    python assign_models.py --pools GEMINI_API_KEY --models m1,m2
    python assign_models.py --probe                # single-pool shorthand
    python assign_models.py --compile --aw-bin D:\\gh-aw-v140\\windows-amd64.exe

Each pool is a repo-secret name; the script probes it with the same-named
env var (GEMINI_API_KEY=..., GEMINI_API_KEY_2=...). Pool 1 = GEMINI_API_KEY
implicitly. Workflows round-robin across pools, models round-robin within
each pool's live list. Idempotent.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
WORKFLOWS = REPO / ".github" / "workflows"
DEFAULT_AW = r"D:\gh-aw-v140\windows-amd64.exe"

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---", re.DOTALL)
ENGINE_BLOCK_RE = re.compile(r"(?m)^engine:\n((?:[ \t]+.*\n)+)")
MODEL_LINE_RE = re.compile(r"^(\s*)model:\s*(\S+)[ \t]*$", re.MULTILINE)
ENV_SUB_RE = re.compile(r"(?m)^([ \t]*)env:\n(?:[ \t]+.*\n)+")
ENV_KEY_RE = re.compile(r"(?m)^([ \t]*)GEMINI_API_KEY:")

DEFAULT_SECRET = "GEMINI_API_KEY"


def workflow_files() -> list[Path]:
    return sorted(WORKFLOWS.glob("*.md"))


def get_engine_block(fm: str) -> str | None:
    m = ENGINE_BLOCK_RE.search(fm)
    return m.group(1) if m else None


def set_model(block: str, model: str) -> str:
    if MODEL_LINE_RE.search(block):
        return MODEL_LINE_RE.sub(lambda mm: f"{mm.group(1)}model: {model}", block, count=1)
    lines = block.splitlines(keepends=True)
    for i, ln in enumerate(lines):
        if re.match(r"^\s*id:", ln):
            indent = re.match(r"^(\s*)", ln).group(1)
            lines.insert(i + 1, f"{indent}model: {model}\n")
            return "".join(lines)
    return block + f"  model: {model}\n"


def set_secret(block: str, secret: str) -> str:
    """Ensure engine.env GEMINI_API_KEY points at `secret`.

    Omitting env entirely means gh-aw defaults to secrets.GEMINI_API_KEY,
    so strip the block for the default secret to keep files clean.
    """
    if ENV_SUB_RE.search(block):
        block = ENV_SUB_RE.sub("", block, count=1)
    if secret == DEFAULT_SECRET:
        return block
    m = re.match(r"^(\s*)id:", block, re.MULTILINE)
    indent = m.group(1) if m else "  "
    if not block.endswith("\n"):
        block += "\n"
    return block + f"{indent}env:\n{indent}  GEMINI_API_KEY: ${{{{ secrets.{secret} }}}}\n"


def current_state(block: str) -> tuple[str, str]:
    m = MODEL_LINE_RE.search(block)
    s = ENV_KEY_RE.search(block)
    secret = DEFAULT_SECRET
    if s:
        tail = block[s.end():]
        sm = re.search(r"secrets\.(\w+)", tail)
        if sm:
            secret = sm.group(1)
    return (m.group(2) if m else "(none)", secret)


def assign(pools: list[tuple[str, list[str]]], dry_run: bool) -> list[tuple[Path, str, str, str, str]]:
    """Round-robin (file -> pool) then (file-in-pool -> model)."""
    changes = []
    files = workflow_files()
    pool_counters = [0] * len(pools)
    for i, f in enumerate(files):
        text = f.read_text(encoding="utf-8")
        fm = FRONTMATTER_RE.match(text)
        if not fm:
            continue
        block = get_engine_block(fm.group(1))
        if not block:
            continue
        pi = i % len(pools)
        secret, models = pools[pi]
        if not models:
            continue
        new_model = models[pool_counters[pi] % len(models)]
        pool_counters[pi] += 1
        old_model, old_secret = current_state(block)
        if old_model == new_model and old_secret == secret:
            continue
        changes.append((f, old_model, new_model, old_secret, secret))
        if not dry_run:
            new_block = set_secret(set_model(block, new_model), secret)
            m = ENGINE_BLOCK_RE.search(fm.group(1))
            new_fm = fm.group(1).replace(m.group(1), new_block, 1)
            f.write_text(text[: fm.start(1)] + new_fm + text[fm.end(1):], encoding="utf-8")
    return changes


def probe(secret: str) -> list[str]:
    key = os.environ.get(secret) or os.environ.get("GEMINI_API_KEY" if secret != DEFAULT_SECRET else "")
    if not key:
        sys.exit(f"{secret} not in env — export the key value under that name (or --models)")
    here = Path(__file__).parent
    out = subprocess.run(
        [sys.executable, str(here / "gemini_quota.py"), "--json", "--key", key],
        capture_output=True, text=True, check=True,
    )
    return [r["model"] for r in json.loads(out.stdout) if r["status"] == "ALIVE"]


def compile_all(aw_bin: str) -> int:
    return subprocess.run([aw_bin, "compile", str(WORKFLOWS)], cwd=REPO).returncode


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pools", default=DEFAULT_SECRET,
                    help="comma-separated repo-secret names, one per GCP project")
    ap.add_argument("--models", help="comma-separated live models, applied to ALL pools")
    ap.add_argument("--probe", action="store_true", help="probe each pool via gemini_quota.py")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--compile", action="store_true")
    ap.add_argument("--aw-bin", default=DEFAULT_AW)
    args = ap.parse_args()

    secrets = [s.strip() for s in args.pools.split(",") if s.strip()]
    pools: list[tuple[str, list[str]]] = []
    for secret in secrets:
        if args.models:
            models = [m.strip() for m in args.models.split(",") if m.strip()]
        elif args.probe or len(secrets) == 1:
            models = probe(secret)
        else:
            sys.exit("multi-pool needs --probe or --models")
        if not models:
            sys.exit(f"no ALIVE models on {secret}")
        print(f"{secret}: {len(models)} live -> {', '.join(models)}")
        pools.append((secret, models))

    changes = assign(pools, args.dry_run)
    verb = "would change" if args.dry_run else "changed"
    for f, om, nm, os_, ns in changes:
        extra = f" [{os_}->{ns}]" if os_ != ns else ""
        print(f"{verb}: {f.name}: {om} -> {nm}{extra}")
    print(f"{len(changes)} workflow(s) {verb}")

    if args.compile and not args.dry_run:
        print("\ncompiling...")
        return compile_all(args.aw_bin)
    return 0


if __name__ == "__main__":
    sys.exit(main())
