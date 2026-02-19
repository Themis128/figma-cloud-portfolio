# Dev Environment Guide

> **Stack:** WSL2 Ubuntu-24.04 · VS Code Insiders · Node v24 · pnpm · uv/uvx · Cline · GitHub Copilot · Amazon Q

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [WSL2 Environment](#wsl2-environment)
3. [Terminal Setup](#terminal-setup)
4. [AI Agent Configuration](#ai-agent-configuration)
5. [MCP Servers Reference](#mcp-servers-reference)
6. [Automated Maintenance](#automated-maintenance)
7. [Manual Commands](#manual-commands)
8. [Troubleshooting](#troubleshooting)
9. [File Reference](#file-reference)

---

## Architecture Overview

```text
Windows 11
├── VS Code Insiders  (editor + AI agents)
│   ├── Cline (stable)     → WSL2 → npx / node / uvx
│   ├── Cline (insiders)   → WSL2 → npx / node / uvx
│   ├── GitHub Copilot     → WSL2 → npx / uvx  (+ 1 native PS7 server)
│   └── Amazon Q           → WSL2 → npx
├── PowerShell 7           (scripts, maintenance, aliases)
├── Task Scheduler         (3 automated maintenance tasks)
└── WSL2 Ubuntu-24.04
    ├── Node v24.13.1  (nvm)
    ├── pnpm 10.30.0
    ├── uv 0.10.4 + uvx
    └── Project root: /mnt/d/Nuxt Projects/new-portfolio
```

All AI agent MCP servers run **inside WSL2** so they share the same Node/Python environment as your project. The command pattern used by every server:

```bash
wsl.exe -d Ubuntu-24.04 -- bash -l -c "source ~/.bash_env && <server-cmd>"
```

---

## WSL2 Environment

### Distro

| Item          | Value                                          |
| ------------- | ---------------------------------------------- |
| Distro name   | `Ubuntu-24.04`                                 |
| Home          | `/home/tbaltzakis`                             |
| Windows mount | `\\wsl.localhost\Ubuntu-24.04\home\tbaltzakis` |
| Project mount | `/mnt/d/Nuxt Projects/new-portfolio`           |

### Installed Tools

| Tool    | Version  | Installed via       |
| ------- | -------- | ------------------- |
| Node.js | v24.13.1 | nvm                 |
| npm     | 11.x     | bundled with Node   |
| pnpm    | 10.30.0  | `npm i -g pnpm`     |
| uv      | 0.10.4   | astral.sh installer |
| uvx     | 0.10.4   | bundled with uv     |
| git     | system   | apt                 |

### Shell Environment Files

#### `~/.bash_env` — The single source of truth for PATH

This file has **no interactive guards** and is safe to source from any context (login shell, non-interactive shell, MCP server subprocess):

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

case ":$PATH:" in
  *":$HOME/.local/bin:"*) ;;
  *) export PATH="$HOME/.local/bin:$PATH" ;;
esac

alias portfolio='cd /mnt/d/Nuxt\ Projects/new-portfolio'
```

#### `~/.bash_profile` — Login shell entry point

```bash
[ -f "$HOME/.bash_env" ] && source "$HOME/.bash_env"
[ -n "$PS1" ] && [ -f "$HOME/.bashrc" ] && source "$HOME/.bashrc"
```

#### `~/.bashrc` — Interactive shell

Patched to include `source ~/.bash_env` **after** the interactive guard so all tools are available in terminal sessions.

### Why `~/.bash_env` exists

Ubuntu's `.bashrc` has an early exit for non-interactive shells:

```bash
case $- in
  *i*) ;;
  *) return;;   # ← exits immediately for non-interactive shells
esac
```

MCP servers use `bash -l -c "..."` which is non-interactive. Without `.bash_env`, every MCP server would get the system `node` (v20 via apt) instead of nvm v24, and `pnpm`/`uvx` would not be in PATH.

### Passwordless sudo for apt

File: `/etc/sudoers.d/tbaltzakis-apt`

```text
tbaltzakis ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/apt-cache
```

Required by the weekly maintenance script to run `apt update/upgrade` without a password prompt.

---

## Terminal Setup

### Default Terminal: WSL2 Ubuntu-24.04

Both VS Code Stable and VS Code Insiders are configured to open WSL2 bash by default.

**Settings** (`settings.json` in both editions):

```json
"terminal.integrated.defaultProfile.windows": "Ubuntu-24.04 (WSL)",
"terminal.integrated.profiles.windows": {
  "Ubuntu-24.04 (WSL)": {
    "path": "C:\\Windows\\System32\\wsl.exe",
    "args": ["-d", "Ubuntu-24.04"],
    "icon": "terminal-ubuntu"
  }
}
```

Opening a new terminal (`` `Ctrl+` ``) drops you directly into your WSL2 home with nvm, pnpm, and uv already in PATH (sourced from `.bash_env` via `.bashrc`).

### PowerShell 7 Profile

File: `C:\Users\baltz\Documents\PowerShell\Microsoft.PowerShell_profile.ps1`

Useful aliases and functions added:

| Command                   | What it does                                 |
| ------------------------- | -------------------------------------------- |
| `maintain-wsl`            | Triggers WSL2 maintenance task immediately   |
| `maintain-ide`            | Triggers IDE maintenance task immediately    |
| `Get-MaintenanceLogs`     | Shows last 20 lines of both maintenance logs |
| `Get-MaintenanceLogs wsl` | Shows only WSL log                           |
| `Get-MaintenanceLogs ide` | Shows only IDE log                           |

```powershell
# Run from any PS7 terminal
maintain-wsl
maintain-ide
Get-MaintenanceLogs
```

---

## AI Agent Configuration

All four AI agents use MCP (Model Context Protocol) servers routed through WSL2.

### Cline (Stable)

**Config:** `C:\Users\baltz\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

- **19 MCP servers** — all via `wsl.exe -d Ubuntu-24.04`
- Uses `npx` for Node-based servers, `uvx` for Python/AWS servers
- Command pattern:

  ```json
  {
    "command": "wsl.exe",
    "args": ["-d", "Ubuntu-24.04", "--", "bash", "-l", "-c",
      "source ~/.bash_env && npx -y @modelcontextprotocol/server-name"]
  }
  ```

### Cline (Insiders)

**Config:** `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

- **15 MCP servers** — all via `wsl.exe -d Ubuntu-24.04`
- `software-planning` and `github-actions` use local `node` inside WSL (mounted from Windows paths)
- `browser-use` is **disabled** (requires Python venv setup)

### GitHub Copilot

**Config:** `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json`

- **12 MCP servers** — 11 via WSL2, 1 native
- Exception: `powershell-exec` runs natively via `C:\Program Files\PowerShell\7\pwsh.exe`
- AWS servers use `uvx awslabs.*@latest` (Python-based, no npm required)

### Amazon Q

**Config:** `C:\Users\baltz\.aws\amazonq\mcp.json`

- **6 MCP servers** — all via WSL2
- Servers: `filesystem`, `git`, `context7`, `fetch`, `memory`, `sequential-thinking`

---

## MCP Servers Reference

### All Servers (Cline Stable — 19 servers)

| Server                | Package                                            | Notes                      |
| --------------------- | -------------------------------------------------- | -------------------------- |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Dynamic reasoning          |
| `memory`              | `@modelcontextprotocol/server-memory`              | Persistent knowledge graph |
| `filesystem`          | `@modelcontextprotocol/server-filesystem`          | File read/write            |
| `git`                 | `mcp-server-git`                                   | Git operations             |
| `fetch`               | `@modelcontextprotocol/server-fetch`               | HTTP requests              |
| `brave-search`        | `@modelcontextprotocol/server-brave-search`        | Web search                 |
| `context7`            | `@upstash/context7-mcp`                            | Up-to-date library docs    |
| `playwright`          | `@playwright/mcp`                                  | Browser automation         |
| `figma`               | `figma-developer-mcp`                              | Figma design access        |
| `github`              | `@modelcontextprotocol/server-github`              | GitHub API                 |
| `time`                | `mcp-server-time`                                  | Timezone / time tools      |
| `browser-tools`       | `@agentdesks/mcp-browser-tools`                    | Browser DevTools           |
| `aws-docs`            | `awslabs.aws-documentation-mcp-server`             | AWS docs (uvx)             |
| `aws-cdk`             | `awslabs.cdk-mcp-server`                           | CDK (uvx)                  |
| `aws-cfn`             | `awslabs.cfn-mcp-server`                           | CloudFormation (uvx)       |
| `aws-kb`              | `awslabs.amazon-bedrock-agentcore-mcp-server`      | Bedrock (uvx)              |
| `code-mode`           | local node                                         | Custom code assistant      |
| `software-planning`   | local node                                         | Project planning           |
| `github-actions`      | local node                                         | GitHub Actions helper      |

### Verifying a Server is Running

From PowerShell 7:

```powershell
$p = New-Object System.Diagnostics.ProcessStartInfo
$p.FileName = "wsl.exe"
$p.Arguments = '-d Ubuntu-24.04 -- bash -l -c "source ~/.bash_env && npx -y @modelcontextprotocol/server-sequential-thinking"'
$p.RedirectStandardOutput = $true
$p.UseShellExecute = $false
$proc = [System.Diagnostics.Process]::Start($p)
Start-Sleep 8
if (!$proc.HasExited) { Write-Host "RUNNING"; $proc.Kill() } else { Write-Host "FAILED" }
```

Or from WSL2 bash:

```bash
source ~/.bash_env
node --version   # should be v24.13.1
pnpm --version   # should be 10.30.0
uvx --version    # should be 0.10.4
npx -y @modelcontextprotocol/server-sequential-thinking &
sleep 5 && kill %1 2>/dev/null && echo "MCP OK"
```

---

## Automated Maintenance

Three Task Scheduler tasks keep the environment clean and up-to-date:

| Task Name              | Schedule           | Script                      |
| ---------------------- | ------------------ | --------------------------- |
| `VSCode-NodeCleanup`   | Every 30 min       | Built-in zombie node killer |
| `VSCode-IDE-Maintain`  | Daily 4:00 AM      | `ide-maintain.ps1`          |
| `WSL2-Ubuntu-Maintain` | Weekly Sun 3:00 AM | `wsl-maintain.sh`           |

### VSCode-IDE-Maintain (`ide-maintain.ps1`)

Runs daily at 4:00 AM. What it does:

1. **Extension update** — runs `Code - Insiders.exe --update-extensions`
2. **Cache cleanup** — clears VS Code logs, CachedData, CachedExtensionVSIXs, blob_storage
3. **npx cache** — wipes `~\AppData\Local\npm-cache\_npx`
4. **Zombie node kill** — terminates orphaned node processes (same logic as cleanup-watch.ps1)
5. **pnpm store prune** — removes unreferenced packages (60s timeout)
6. **Temp cleanup** — removes files from `%TEMP%` older than 7 days
7. **Disk report** — logs free space on C: and D:

Log file: `D:\Nuxt Projects\new-portfolio\logs\ide-maintain.log` (auto-rotates at 500 KB)

### WSL2-Ubuntu-Maintain (`wsl-maintain.sh`)

Runs weekly on Sunday at 3:00 AM inside WSL2. What it does:

1. **apt update + upgrade** — passwordless via sudoers rule
2. **npm global update** — `npm update -g`
3. **pnpm update** — `pnpm add -g pnpm@latest`
4. **corepack update** — `corepack prepare pnpm@latest --activate`
5. **pnpm store prune** — removes orphaned packages (60s timeout)
6. **uv self-update** — `uv self update`
7. **uv cache clean** — `uv cache clean --force`
8. **npm cache clean** — `npm cache clean --force`
9. **Disk usage report** — logs WSL2 disk usage summary

Log file: `~/logs/wsl-maintain.log` (auto-rotates at 2000 lines)

### Triggering Maintenance Manually

From any PowerShell 7 terminal:

```powershell
maintain-wsl        # run WSL2 maintenance now
maintain-ide        # run IDE maintenance now
Get-MaintenanceLogs # view last 20 lines of both logs
```

Or via Task Scheduler:

```powershell
schtasks /Run /TN "WSL2-Ubuntu-Maintain"
schtasks /Run /TN "VSCode-IDE-Maintain"
schtasks /Query /TN "VSCode-IDE-Maintain" /FO LIST
```

### Checking Task Status

```powershell
schtasks /Query /FO TABLE | Select-String "VSCode|WSL2"
```

---

## Manual Commands

### WSL2 Bash

```bash
# Enter WSL2
wsl -d Ubuntu-24.04

# Load environment in current shell
source ~/.bash_env

# Check all tool versions
node --version    # v24.13.1
pnpm --version    # 10.30.0
uv --version      # 0.10.4
uvx --version     # 0.10.4

# Navigate to project
portfolio         # alias → cd /mnt/d/Nuxt\ Projects/new-portfolio

# Update nvm default Node version
nvm install --lts
nvm alias default <new-version>

# Install a global package (both pnpm and npm)
pnpm add -g <package>
npm install -g <package>

# Run maintenance manually
bash ~/wsl-maintain.sh

# View maintenance log
tail -50 ~/logs/wsl-maintain.log
```

### PowerShell 7

```powershell
# Open WSL2 bash
wsl -d Ubuntu-24.04

# Run a command in WSL2 from PS7
wsl -d Ubuntu-24.04 -- bash -l -c "source ~/.bash_env && node --version"

# Maintenance
maintain-wsl
maintain-ide
Get-MaintenanceLogs
Get-MaintenanceLogs wsl
Get-MaintenanceLogs ide

# Check Task Scheduler tasks
schtasks /Query /FO TABLE | Select-String "VSCode|WSL2"

# View IDE maintenance log
Get-Content "D:\Nuxt Projects\new-portfolio\logs\ide-maintain.log" -Tail 50
```

### Adding a New MCP Server

1. Choose the target agent config file (see [File Reference](#file-reference))
1. Add an entry using this template:

```json
"my-server": {
  "command": "wsl.exe",
  "args": [
    "-d", "Ubuntu-24.04", "--", "bash", "-l", "-c",
    "source ~/.bash_env && npx -y @scope/server-package /allowed/path"
  ],
  "timeout": 60,
  "disabled": false,
  "alwaysAllow": []
}
```

1. For Python-based servers use `uvx` instead of `npx`:

```json
"args": ["-d", "Ubuntu-24.04", "--", "bash", "-l", "-c",
  "source ~/.bash_env && uvx awslabs.my-server@latest"]
```

1. Reload the agent (Cline: click the reload icon; Copilot: restart VS Code)

---

## Troubleshooting

### MCP Server shows "Failed" or "Disconnected"

**Check 1 — environment loads correctly:**

```bash
wsl -d Ubuntu-24.04 -- bash -l -c "source ~/.bash_env && node --version && pnpm --version && uvx --version"
```

All three should return version numbers. If not, check `~/.bash_env` exists.

**Check 2 — test the server directly:**

```bash
wsl -d Ubuntu-24.04 -- bash -l -c "source ~/.bash_env && npx -y @modelcontextprotocol/server-sequential-thinking"
```

If it hangs (doesn't exit), that means it's running and waiting for input — this is correct behavior. If it exits immediately with an error, the package or path is wrong.

**Check 3 — wrong distro name:**
All configs must use `-d Ubuntu-24.04` (not `-d Ubuntu` or `-d ubuntu`). Verify:

```powershell
wsl --list --verbose
```

---

### `node` returns v20 instead of v24

```bash
# In WSL2 bash
source ~/.bash_env
node --version    # should now show v24.13.1

# If still v20, check nvm is loaded:
nvm --version
nvm use 24
nvm alias default v24.13.1
```

The system apt `node` at `/usr/bin/node` is v20. nvm's v24 lives at `~/.nvm/versions/node/v24.13.1/bin/node`. The `.bash_env` ensures nvm loads first.

---

### `uvx` command not found

```bash
# Reinstall uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bash_env   # picks up ~/.local/bin
uvx --version
```

---

### `pnpm` command not found in MCP server

```bash
# Check pnpm location
which pnpm    # should be ~/.local/share/pnpm/pnpm

# Verify PNPM_HOME in bash_env
grep PNPM ~/.bash_env
```

If missing, re-add to `~/.bash_env`:

```bash
export PNPM_HOME="$HOME/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
```

---

### WSL maintenance script fails on apt

```bash
# Test passwordless sudo
wsl -d Ubuntu-24.04 -- bash -l -c "sudo -n apt-get update -qq"
```

If it asks for password, the sudoers file is missing or malformed:

```bash
# Recreate it (requires Windows admin)
wsl.exe -d Ubuntu-24.04 --user root -- bash -c "echo 'tbaltzakis ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/apt-cache' > /etc/sudoers.d/tbaltzakis-apt && chmod 440 /etc/sudoers.d/tbaltzakis-apt"
```

---

### Scheduled task not running / stuck

```powershell
# Check last run result (0 = success)
schtasks /Query /TN "VSCode-IDE-Maintain" /FO LIST | Select-String "Status|Last Run|Result"

# Force run now
schtasks /Run /TN "VSCode-IDE-Maintain"

# Check the log immediately after
Start-Sleep 5
Get-Content "D:\Nuxt Projects\new-portfolio\logs\ide-maintain.log" -Tail 20
```

---

### VS Code opens PowerShell instead of WSL2

Check `settings.json` in the active VS Code edition:

```json
"terminal.integrated.defaultProfile.windows": "Ubuntu-24.04 (WSL)"
```

The profile must exist:

```json
"terminal.integrated.profiles.windows": {
  "Ubuntu-24.04 (WSL)": {
    "path": "C:\\Windows\\System32\\wsl.exe",
    "args": ["-d", "Ubuntu-24.04"]
  }
}
```

---

### Adding a new WSL2 package / tool to PATH

1. Install it so the binary lands in `~/.local/bin` (most tools do this by default)
2. If it installs elsewhere, add to `~/.bash_env`:
   ```bash
   export PATH="/custom/tool/bin:$PATH"
   ```

3. Reload: `source ~/.bash_env`
4. All MCP servers will pick it up automatically on their next start

---

### Re-registering Task Scheduler tasks after a reset

If the Task Scheduler tasks were deleted:

```powershell
# Re-register IDE task
$xml = Get-Content "C:\Windows\System32\Tasks\VSCode-IDE-Maintain" -Raw
$svc = New-Object -ComObject Schedule.Service
$svc.Connect()
$svc.GetFolder('\').RegisterTask('VSCode-IDE-Maintain', $xml, 6, $null, $null, 3, $null)

# Re-register WSL task
$xml = Get-Content "C:\Windows\System32\Tasks\WSL2-Ubuntu-Maintain" -Raw
$svc.GetFolder('\').RegisterTask('WSL2-Ubuntu-Maintain', $xml, 6, $null, $null, 3, $null)
```

---

## File Reference

### Scripts

| File                | Location                          | Purpose                           |
| ------------------- | --------------------------------- | --------------------------------- |
| `ide-maintain.ps1`  | `D:\Nuxt Projects\new-portfolio\` | Daily VS Code maintenance         |
| `wsl-maintain.sh`   | `~/` (WSL2)                       | Weekly Ubuntu maintenance         |
| `cleanup-watch.ps1` | `D:\Nuxt Projects\new-portfolio\` | Node zombie killer (every 30 min) |

### Logs

| Log              | Location                                                             | Rotation   |
| ---------------- | -------------------------------------------------------------------- | ---------- |
| IDE maintenance  | `D:\Nuxt Projects\new-portfolio\logs\ide-maintain.log`               | 500 KB     |
| WSL2 maintenance | `\\wsl.localhost\Ubuntu-24.04\home\tbaltzakis\logs\wsl-maintain.log` | 2000 lines |

### WSL2 Shell Files

| File                            | Purpose                                                             |
| ------------------------------- | ------------------------------------------------------------------- |
| `~/.bash_env`                   | Tool PATH setup, no interactive guards — sourced by MCP servers     |
| `~/.bash_profile`               | Login shell entry point, sources `.bash_env` unconditionally        |
| `~/.bashrc`                     | Interactive shell config, includes `source ~/.bash_env` after guard |
| `/etc/sudoers.d/tbaltzakis-apt` | Passwordless apt for maintenance script                             |

### MCP Config Files

| Agent            | Config File                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Cline (Stable)   | `C:\Users\baltz\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`            |
| Cline (Insiders) | `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| GitHub Copilot   | `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\mcp.json`                                                              |
| Amazon Q         | `C:\Users\baltz\.aws\amazonq\mcp.json`                                                                                      |

### VS Code Settings

| Edition          | Settings File                                                       |
| ---------------- | ------------------------------------------------------------------- |
| VS Code Stable   | `C:\Users\baltz\AppData\Roaming\Code\User\settings.json`            |
| VS Code Insiders | `C:\Users\baltz\AppData\Roaming\Code - Insiders\User\settings.json` |

### PowerShell Profile

| File                                                                   | Purpose                              |
| ---------------------------------------------------------------------- | ------------------------------------ |
| `C:\Users\baltz\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` | PS7 profile with maintenance aliases |

### Task Scheduler Tasks

| Task                   | XML Location                                     | Trigger            |
| ---------------------- | ------------------------------------------------ | ------------------ |
| `VSCode-NodeCleanup`   | `C:\Windows\System32\Tasks\VSCode-NodeCleanup`   | Every 30 min       |
| `VSCode-IDE-Maintain`  | `C:\Windows\System32\Tasks\VSCode-IDE-Maintain`  | Daily 4:00 AM      |
| `WSL2-Ubuntu-Maintain` | `C:\Windows\System32\Tasks\WSL2-Ubuntu-Maintain` | Weekly Sun 3:00 AM |

---

## Quick Reference Card

```text
┌─────────────────────────────────────────────────────────────┐
│  OPEN TERMINAL       Ctrl+` in VS Code  →  WSL2 bash       │
│  GOTO PROJECT        portfolio  (bash alias)                │
│  CHECK TOOLS         node -v · pnpm -v · uvx -v            │
│  MAINTAIN WSL        maintain-wsl  (PS7)                    │
│  MAINTAIN IDE        maintain-ide  (PS7)                    │
│  VIEW LOGS           Get-MaintenanceLogs  (PS7)             │
│  RELOAD ENV          source ~/.bash_env  (bash)             │
└─────────────────────────────────────────────────────────────┘
```

---

Last updated: 2025 — covers WSL2 Ubuntu-24.04, VS Code Insiders, Node v24, pnpm 10, uv 0.10
