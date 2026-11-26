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

## The quota model (root cause of all agent failures)

- Gemini free-tier quotas are **per-model, per-day**. A 429 on one model says
  nothing about siblings.
- gh-aw `engine.fallback-models` exists but **explicitly does NOT switch on
  HTTP 429** — useless for quota failures. Do not rely on it.
- Working pattern: **pin each workflow to a different live model** so the
  11 workflows share 4-5 quota pools. Re-probe daily; quotas reset ~midnight
  PT.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/gemini_quota.py` | Probe models via AI Studio API. `ALIVE`/`QUOTA`/`DEAD`(404)/`REJECTED`. Needs `GEMINI_API_KEY` env or `--key`. |
| `scripts/assign_models.py` | Round-robin live models across all 11 `engine.model` frontmatter lines. `--dry-run`, `--models`, `--probe`, `--compile`, `--aw-bin`. |

Key source: repo secret `GEMINI_API_KEY`; locally fetch from Infisical
(`cloudless-infra` project, key `GEMINI_API_KEY`, instance `localhost:8090`)
or export before running.

Typical rotation:

```bash
export GEMINI_API_KEY=...
python .devin/skills/gh-aw-ops/scripts/assign_models.py --probe --dry-run
python .devin/skills/gh-aw-ops/scripts/assign_models.py --probe --compile
```

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
