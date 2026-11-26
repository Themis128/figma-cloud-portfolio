#!/usr/bin/env python3
"""Find which packages in pnpm-lock.yaml resolve a given dependency version.

Scans the `snapshots:` section: each `name@ver(...):` header starts a package
entry whose `dependencies:` block lists `dep: resolved-version`. Reports the
parent chain for every resolution matching the query.

Usage:
    vuln_paths.py postcss-selector-parser 7.1.1
    vuln_paths.py esbuild            # all resolved versions
"""
import re
import sys
from pathlib import Path

LOCK = Path(__file__).resolve().parents[4] / "pnpm-lock.yaml"

SNAP_HDR = re.compile(r"^  '?([^\s']+?)'?:\s*$")
DEP_LINE = re.compile(r"^\s{6,}(?:'([^']+)'|([A-Za-z0-9@._/-]+)):\s*([^\s(]+)")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    pkg = sys.argv[1]
    want = sys.argv[2] if len(sys.argv) > 2 else None

    lines = LOCK.read_text(encoding="utf-8").splitlines()
    in_snapshots = False
    current = None
    hits = []

    for line in lines:
        if line.startswith("snapshots:"):
            in_snapshots = True
            continue
        if in_snapshots and line and not line.startswith((" ", "#")):
            break  # next top-level section
        if not in_snapshots:
            continue
        m = SNAP_HDR.match(line)
        if m and not line.startswith("      "):
            current = m.group(1)
            continue
        if current is None:
            continue
        d = DEP_LINE.match(line)
        if not d:
            continue
        dep = d.group(1) or d.group(2)
        ver = d.group(3)
        if dep == pkg and (want is None or ver == want):
            hits.append((current, ver))

    if not hits:
        print(f"no resolutions of {pkg}" + (f"@{want}" if want else ""))
        return 1
    for parent, ver in hits:
        print(f"{parent}  ->  {pkg}@{ver}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
