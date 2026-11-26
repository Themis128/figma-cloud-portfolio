# dep-vuln-ops

Triage and fix Dependabot security alerts on
`themis128/figma-cloud-portfolio` (pnpm + `pnpm-lock.yaml`). Covers the
pnpm-override semantics that repeatedly bite this repo, lockfile surgery on
Windows, and how to read Dependabot's own updater failures.

## Environment (Windows host)

- `pnpm` is NOT on bash PATH. Use the shim:
  `"C:/Users/tbaltzakis/AppData/Roaming/npm/pnpm.cmd"`
- Node/npm: `"C:/Program Files/nodejs/npm.cmd"` (no `npm` shell script).
- Repo pins `packageManager: pnpm@10.32.1`; overrides live in
  `package.json → pnpm.overrides` (pnpm 10 still honors this; the lockfile
  echoes them under the top-level `overrides:` key).

## The override trap that caused alert #270 (verified 2026-11-27)

`@tailwindcss/typography@0.5.19` declares
`postcss-selector-parser: 6.0.10` (exact, v6 line). The repo had:

```json
"postcss-selector-parser": ">=7.1.6",
"postcss-selector-parser@6": ">=6.1.5",
"postcss-selector-parser@7": ">=7.1.6"
```

Result: lockfile resolved typography's dep to **7.1.1** — a version that
satisfies NO override. The unbounded `>=6.1.5` let pnpm wander majors, and
`>=`-style scoped overrides do not reliably constrain resolution the way
intuition says. **Exact pins are the fix**:

```json
"postcss-selector-parser@6": "6.1.6",
"@tailwindcss/typography>postcss-selector-parser": "6.1.6"
```

Parent-scoped syntax `parent>child` works in pnpm 10 overrides and is the
most precise instrument. After pinning, `pnpm why` showed only `6.1.6` +
`7.2.1` — alert cleared on merge.

Rules of thumb:

- Prefer **exact versions** over `>=` floors for scoped/parent overrides;
  floors without upper bounds can resolve across majors.
- A bare-name override applies to EVERY request for that package — it can
  fight your `@major`-scoped entries. Keep them consistent.
- `pnpm install --lockfile-only` does NOT always re-resolve stale entries;
  `rm pnpm-lock.yaml && pnpm install --lockfile-only` regenerates clean
  (back up first). `--force` alone did not help here.
- Verify with `pnpm why <pkg>` — it prints every resolved version + parent
  chain. Then `pnpm install --frozen-lockfile` to prove CI consistency.

## Dependabot "Updates" workflow failures are a symptom, not infra

`Dependabot Updates` runs are GitHub-internal updater jobs (`path: dynamic`,
no repo workflow file). The `Failed to parse GITHUB_REGISTRIES_PROXY` line is
cosmetic (empty env). The real failure signature:

```
security_update_not_possible — "The latest possible version of X that can
be installed is Y. The earliest fixed version is Z."
```

Meaning: Dependabot's npm_and_yarn updater can't reconcile transitive deps +
pnpm overrides (`update-subdependencies: false`). It exits 1 → red check.
**Do not chase the workflow — fix the lockfile.** Once the vulnerable
versions are gone from `pnpm-lock.yaml` on the default branch, alerts
auto-dismiss and these runs stop being scheduled. They only look scary.

## Triage loop

```bash
# 1. List open alerts
gh api repos/Themis128/figma-cloud-portfolio/dependabot/alerts \
  --jq '.[] | select(.state=="open") | {number, pkg:.dependency.package.name, sev:.security_advisory.severity}'

# 2. Find who resolves the vulnerable version
"C:/Users/tbaltzakis/AppData/Roaming/npm/pnpm.cmd" why <pkg>

# 3. Or scan the lockfile directly for parent chains
python .devin/skills/dep-vuln-ops/scripts/vuln_paths.py postcss-selector-parser 7.1.1

# 4. Patch package.json overrides → regen lockfile → verify → PR
```

## Scripts

| Script | Purpose |
|---|---|
| `scripts/vuln_paths.py` | Scan `pnpm-lock.yaml` snapshots: which parent packages resolve `name@version`. Usage: `vuln_paths.py <pkg> [version]`. Stdlib only. |

## References

- pnpm overrides docs: selectors `name`, `name@range`, `parent>child`.
- Advisory affected ranges live in each alert's `security_advisory` — note
  they often cover MULTIPLE majors (e.g. `< 6.1.5` AND `>= 7.0.0 < 7.1.6`),
  so "just use the other major" is not automatically safe; check the range.
