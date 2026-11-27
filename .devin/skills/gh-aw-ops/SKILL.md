# gh-aw-ops

Operate the GitHub Agentic Workflows (`.github/workflows/*.md` → `*.lock.yml`)
on `themis128/figma-cloud-portfolio`. Covers engine/model selection under
free-tier quota pressure, compilation, and the known gh-aw failure modes.

## Current engine state (2026-11-27)

- Engine: `gemini` (gh-aw v1.4.0 binary at `D:\gh-aw-v140\windows-amd64.exe`;
  `gh aw` extension is v1.2.2 — use the binary for compiles).
- `gemini` engine is **deprecated** upstream; `agy` is its replacement but has
  a different model namespace and its own quota walls.
- `claude` engine is the durable target but blocked: no valid
  `ANTHROPIC_API_KEY` exists (`.env` and Infisical keys both return 401).
- `copilot` engine blocked: no Copilot subscription (`api.githubcopilot.com`
  rejects the PAT; `COPILOT_GITHUB_TOKEN` secret set but subscription absent).

## Quota mechanics (researched 2026-11-26, Google AI Studio docs)

- Quotas are **per-GCP-project, per-model** — NOT per API key. Multiple keys
  in one project share the quota; **separate AI Studio projects each get
  their own free-tier allowance**. LIVE since 2026-11-27: two pools —
  `GEMINI_API_KEY` (project `gen-lang-client-0524292946`) and
  `GEMINI_API_KEY_2` (project `baltzakisthemis-12514`, key `gh-aw-pool2`
  created via CDP-automated AI Studio import). Workflows round-robin across
  both via `engine.env.GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY_2 }}` —
  gh-aw v1.4.0 recompiles the whole secret chain (validate step, awf env,
  `GH_AW_SECRET_NAMES`/`SECRET_*` masking, manifest). To add a third pool:
  import another GCP project in AI Studio → create key →
  `gh secret set GEMINI_API_KEY_3` + Infisical → add to `--pools`.
- Dimensions: RPM + TPM + **RPD** (requests/day, resets midnight Pacific).
  Any one trips → 429. Agent sessions burn ~30-80 requests with ~33K-token
  turns — TPM/RPM can 429 mid-run and gemini-cli may label it
  `TerminalQuotaError` (daily) even when it's a per-minute limit
  (misclassification bugs: gemini-cli#18050, PR#18073).
- **Prefer lite models for agent workloads**: free tier ≈ 500 RPD for
  `gemini-3.5-flash-lite` / `gemini-3.1-flash-lite` vs ~20-250 RPD for
  flash/preview models. All 11 workflows currently sit on lite models.
- `fallback-models` does NOT switch on 429 (documented) — useless here.
- gemini-cli itself falls back toward flash on TerminalQuotaError
  (gemini-cli#13791) but gh-aw pins the model explicitly.

## gh-aw daily-AIC guardrail (the "agent skipped" trap)

- Every agent run counts toward `GH_AW_DEFAULT_MAX_DAILY_AI_CREDITS`
  (repo variable, currently **100000**). Runs that die before writing
  `token_usage` artifacts are charged **assumed-max 1000 credits each** —
  ~20 quota-failed test runs in one day = 20000+ phantom credits →
  `daily_ai_credits_exceeded=true` → `agent` job silently SKIPPED while
  `conclusion` still passes green. Symptom: green run, no review posted.
- Fix: `gh variable set GH_AW_DEFAULT_MAX_DAILY_AI_CREDITS --body <n>`;
  counter resets daily. Keep it high on free-tier keys (no real spend).

## Safe outputs on gemini engine — actual state

- The safeoutputs MCP gateway **does** register its tools (visible in run
  logs as `rpc_response` with the full tool list). Failures are the MODEL
  calling bare names (`update_topic`, `create_issue` without namespace) —
  a model-behavior issue, not a wiring gap. Upstream fixes already in:
  gh-aw#29814 (localhost gateway URL), gh-aw#48602 (zero-tools detection).
- `missing_terminal_safe_output` grader failure = agent died (quota)
  before emitting its terminal output — it resolves itself once runs
  complete; not independently fixable.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/gemini_quota.py` | Probe models via AI Studio API. `ALIVE`/`QUOTA`/`DEAD`(404)/`REJECTED`. **Heavy probe by default** (~400 output tokens) — a tiny ping returns ALIVE with only a sliver of quota left, then the agent's first ~33K-token turn dies mid-run (`TerminalQuotaError`). `--light` for cheap checks, `--json`, `--timeout`. Needs `GEMINI_API_KEY` env or `--key`. |
| `scripts/assign_models.py` | Round-robin live models across all 11 `engine.model` frontmatter lines AND across key pools via `--pools GEMINI_API_KEY,GEMINI_API_KEY_2` (writes `engine.env` for non-default pools; strips it for pool 1). `--dry-run`, `--models`, `--probe`, `--compile`, `--aw-bin`. |
| `scripts/fetch_keys.sh` | Fetch both pool keys from Infisical, print eval-ready `KEY=value` lines — no plaintext file on disk. WSL-side (docker `infisical` container). **LF line endings required** (`set -euo pipefail` breaks on CRLF). |

Key source: repo secrets `GEMINI_API_KEY` + `GEMINI_API_KEY_2`; locally fetch
from Infisical (`cloudless-infra` project, same key names, instance
`localhost:8090`) via `scripts/fetch_keys.sh` — it prints eval-ready
`KEY=value` lines and nothing touches disk. **Never inline keys in a
command** — a secrets hook blocks exec calls containing API key literals,
and CRLF in env files breaks JSON posts (`tr -d '\r'`).

Typical rotation (dual-pool, no plaintext key file):

```bash
eval "$(wsl -e bash -lc \
  'bash /mnt/c/Users/tbaltzakis/figma-cloud-portfolio/.devin/skills/gh-aw-ops/scripts/fetch_keys.sh')"
python .devin/skills/gh-aw-ops/scripts/assign_models.py \
    --pools GEMINI_API_KEY,GEMINI_API_KEY_2 --probe --dry-run
python .devin/skills/gh-aw-ops/scripts/assign_models.py \
    --pools GEMINI_API_KEY,GEMINI_API_KEY_2 --probe --compile
```

`--compile` with a new secret triggers gh-aw "safe update mode" warnings —
expected; add a security-review note to the PR listing `GEMINI_API_KEY_2`.

## Automation

`.github/workflows/quota-rotate.yml` runs the probe+compile daily (09:15
Athens, before the `daily-*` fleet) plus `workflow_dispatch`. It opens a PR
only when the lite-model assignment drifted; steady-state = "assignment
stable" + no PR. Push auth uses repo secret `WORKFLOW_PAT` (workflow-scoped
token — `GITHUB_TOKEN` cannot push `.github/workflows` changes, and
`VITE_GITHUB_TOKEN` is empty/invalid). `--probe` keeps only **lite** models
(~500 RPD); `--include-heavy` opts into flash/preview.

## Compile

```bash
D:\gh-aw-v140\windows-amd64.exe compile .github\workflows
```

Always compile with the **v1.4.0 binary**, not the v1.2.2 extension — the
compiled `*.lock.yml` embeds the compiler version and v1.4.0 fixes the
gemini safe-output registration gap partially.

## Known failure modes (verified)

| Symptom | Cause | Fix |
|---|---|---|
| `agent` fails, log shows `429 ... quota` / `TerminalQuotaError` exit 173 | Model daily quota exhausted | Re-run `assign_models.py --probe` to remap to live models |
| `conclusion` fails, `missing_terminal_safe_output` / low `tool-success-rate` | gh-aw grader double-counts MCP gateway tool calls as failures — upstream bug [gh-aw#81196](https://github.com/github/gh-aw/issues/81196); also gemini-cli never registers safe-output MCP tools | Non-blocking; graders can be tuned via frontmatter `graders.<id>.enabled: false` (see gh-aw Graders spec) |
| `agent` skipped with `daily_ai_credits_exceeded` | gh-aw credit guardrail counts failed runs at assumed-max | Repo variable `GH_AW_DEFAULT_MAX_DAILY_AI_CREDITS` (raised to 20000) |
| `agy` engine rejects `gemini-2.5-flash` | Different model namespace (`Gemini 3.8 Flash (High/Med/Low)` etc.) | Don't mix; agy defaults also hit 20/day quota |
| Codacy +N after pushes | New/edited files billed as "added issues"; does NOT honor inline eslint-disable | Real fixes only; `server/` + `next.config.ts` excluded in `.codacy.yml` |
| Lock-file YAML parse failure | Orphaned duplicate `shell: bash` lines from hand edits | Sweep `.md`+`.lock.yml` for orphan `shell:` keys; always recompile instead of hand-editing |

## Graders quick reference

Frontmatter `graders:` block per workflow (v1.4.0+), e.g.:

```yaml
graders:
  tool-success-rate:
    enabled: false
```

Built-ins: `tool-success-rate`, `tool-failure-count`, `retries`, `loops`,
`trajectory-efficiency`, `execution-step-count`, `execution-duration`,
`working-set-rebuild-factor`, `context-growth`, `artifact-production`.

## Failover options assessed (2026-11-27)

- **Cloudflare Workers AI via `codex`/`pi` engine** (`OPENAI_BASE_URL` →
  `api.cloudflare.com/.../ai/v1`): free tier = 10K neurons/day ≈ less than
  one agent session; `/v1/responses` only for gpt-oss models; known gh-aw
  custom-endpoint bugs (#20997). Not viable as primary.
- **DMR local GPU (qwen3-4b) via Cloudflare Tunnel + pi engine**
  (`model-provider: openai`, `OPENAI_BASE_URL` → tunnel URL): chat-only API
  (no `/responses`), 4B model marginal for agentic tool-calling, VRAM
  contention with ComfyUI on the RTX 3070, needs public exposure + auth.
  Possible plan-B, not optimal.
- **Per-model Gemini rotation (current)**: zero new infra, works today,
  quality stays high. Re-probe on 429s.

## Repo facts

- Repo: `themis128/figma-cloud-portfolio`, default branch `production`.
- Workflows are `.md` frontmatter sources; `*.lock.yml` are compiled output —
  never hand-edit lock files.
- 11 workflows: backup-restore, code-review, daily-accessibility-review,
  daily-maintenance, daily-malicious-code-scan, daily-qa, daily-repo-status,
  link-checker, performance-monitor, playwright-test-runner, test-coverage-report.
