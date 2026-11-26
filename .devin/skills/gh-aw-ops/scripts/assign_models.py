#!/usr/bin/env python3
"""Distribute gh-aw workflow models across live Gemini quota pools.

Free-tier Gemini quotas are per-model and reset daily. gh-aw's
`fallback-models` does NOT switch on HTTP 429, so the working pattern is:
probe live models (gemini_quota.py), then pin each workflow's
`engine.model` to a different model so 11 workflows share 4-5 quota pools.

Usage:
    python assign_models.py --dry-run                 # show planned mapping
    python assign_models.py --models m1,m2,m3         # explicit live list
    python assign_models.py --probe                   # auto-probe via GEMINI_API_KEY
    python assign_models.py --compile                  # also run `gh aw compile`
    python assign_models.py --compile --aw-bin D:\\gh-aw-v140\\windows-amd64.exe

Only rewrites the `model:` line inside each workflow's `engine:` frontmatter
block. Safe to re-run; idempotent.
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[4]
WORKFLOWS = REPO / ".github" / "workflows"
DEFAULT_AW = r"D:\gh-aw-v140\windows-amd64.exe"

FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---", re.DOTALL)
ENGINE_BLOCK_RE = re.compile(r"(?ms)^engine:\n((?:[ \t]+.*\n)+)")
MODEL_LINE_RE = re.compile(r"^(\s*)model:\s*(\S+)\s*$", re.MULTILINE)


def workflow_files() -> list[Path]:
    return sorted(WORKFLOWS.glob("*.md"))


def get_engine_block(text: str) -> tuple[str, str] | None:
    m = ENGINE_BLOCK_RE.search(text)
    if not m:
        return None
    return m.group(1), m.group(0)


def set_model(block: str, model: str) -> str:
    if MODEL_LINE_RE.search(block):
        return MODEL_LINE_RE.sub(lambda mm: f"{mm.group(1)}model: {model}", block, count=1)
    # no model line: insert after `id:` line if present, else append
    lines = block.splitlines(keepends=True)
    for i, ln in enumerate(lines):
        if re.match(r"^\s*id:", ln):
            indent = re.match(r"^(\s*)", ln).group(1)
            lines.insert(i + 1, f"{indent}model: {model}\n")
            return "".join(lines)
    return block + f"  model: {model}\n"


def assign(models: list[str], dry_run: bool) -> list[tuple[Path, str, str]]:
    """Round-robin live models across workflows. Returns (file, old, new)."""
    changes = []
    files = workflow_files()
    for i, f in enumerate(files):
        text = f.read_text(encoding="utf-8")
        fm = FRONTMATTER_RE.match(text)
        if not fm:
            continue
        found = get_engine_block(fm.group(1))
        if not found:
            continue
        block, _ = found
        old_m = MODEL_LINE_RE.search(block)
        old = old_m.group(2) if old_m else "(none)"
        new = models[i % len(models)]
        if old == new:
            continue
        changes.append((f, old, new))
        if not dry_run:
            new_block = set_model(block, new)
            new_fm = fm.group(1).replace(block, new_block, 1)
            f.write_text(text[: fm.start(1)] + new_fm + text[fm.end(1):], encoding="utf-8")
    return changes


def probe_models() -> list[str]:
    key = __import__("os").environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY not set — pass --models or set the env var")
    here = Path(__file__).parent
    out = subprocess.run(
        [sys.executable, str(here / "gemini_quota.py"), "--json"],
        capture_output=True, text=True, check=True,
    )
    import json
    results = json.loads(out.stdout)
    alive = [r["model"] for r in results if r["status"] == "ALIVE"]
    if not alive:
        sys.exit("no ALIVE models — nothing to assign")
    return alive


def compile_all(aw_bin: str) -> int:
    return subprocess.run([aw_bin, "compile", str(WORKFLOWS)], cwd=REPO).returncode


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--models", help="comma-separated model list (skips probing)")
    ap.add_argument("--probe", action="store_true", help="auto-probe via gemini_quota.py")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--compile", action="store_true", help="run gh aw compile after assigning")
    ap.add_argument("--aw-bin", default=DEFAULT_AW, help="gh-aw binary for compile")
    args = ap.parse_args()

    if args.models:
        models = [m.strip() for m in args.models.split(",") if m.strip()]
    elif args.probe:
        models = probe_models()
    else:
        sys.exit("pass --models or --probe")

    print(f"models: {', '.join(models)}")
    changes = assign(models, args.dry_run)
    verb = "would change" if args.dry_run else "changed"
    for f, old, new in changes:
        print(f"{verb}: {f.name}: {old} -> {new}")
    print(f"{len(changes)} workflow(s) {verb}")

    if args.compile and not args.dry_run:
        print("\ncompiling...")
        return compile_all(args.aw_bin)
    return 0


if __name__ == "__main__":
    sys.exit(main())
