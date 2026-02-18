# cleanup-watch.ps1
# Automated cleanup: kills zombie node processes + frees disk space
# WITHOUT closing VS Code / VS Code Insiders
# Run anytime:  & .\cleanup-watch.ps1
# Watch mode:   & .\cleanup-watch.ps1 -WatchMode -IntervalMinutes 30

param(
  [switch]$WatchMode,
  [int]$IntervalMinutes = 30
)

$ErrorActionPreference = "SilentlyContinue"

# ── Thresholds ────────────────────────────────────────────────────────────────
$DISK_WARN_PCT   = 90
$NODE_WARN_COUNT = 20

# ── pnpm paths ────────────────────────────────────────────────────────────────
$PNPM_BIN        = "C:\Users\baltz\AppData\Roaming\npm\pnpm.CMD"
$PNPM_STORE_V3   = "C:\Users\baltz\AppData\Local\pnpm\store\v3"
$PNPM_STORE_V10  = "C:\Users\baltz\AppData\Local\pnpm\store\v10"
$PNPM_CACHE      = "C:\Users\baltz\AppData\Local\pnpm-cache"   # if exists
$NPX_CACHE       = "D:\npm-cache\_npx"                         # pnpx/npx cache on D:

# ── Safe process patterns — NEVER kill these ──────────────────────────────────
$KEEP_PATTERNS = @(
  "vite",
  "nuxt",
  "next",
  "tsx",
  "playwright",
  "pnpm",
  "aws-lsp",
  "AmazonQ",
  "codewhisperer",
  "github-actions",
  "software-planning",
  "pdf-filler",
  "kubernetes",
  "spotify",
  "figma",
  "hubspot",
  "sentry",
  "browser-tools",
  "scripts/run-with-secrets",
  "Windows-MCP"
)

# ── Zombie npx bootstrappers — safe to kill once real child is running ────────
$ZOMBIE_PATTERNS = @(
  "npx-cli.*@agentdeskai/browser-tools-mcp",
  "npx-cli.*@modelcontextprotocol/server-filesystem",
  "npx-cli.*@utcp/code-mode-mcp",
  "npx-cli.*@modelcontextprotocol/server-sequential-thinking",
  "npx-cli.*@modelcontextprotocol/server-memory",
  "npx-cli.*@playwright/mcp",
  "npx-cli.*@upstash/context7-mcp",
  "npx-cli.*@brave/brave-search-mcp-server",
  "npx-cli.*figma-developer-mcp",
  "npx-cli.*mcp-fetch-server"
)

function Write-Section($title) {
  Write-Host "`n$('-' * 62)" -ForegroundColor DarkGray
  Write-Host "  $title" -ForegroundColor Cyan
  Write-Host "$('-' * 62)" -ForegroundColor DarkGray
}

function Get-DiskInfo {
  $d      = Get-PSDrive C -PSProvider FileSystem
  $usedGB = [math]::Round($d.Used / 1GB, 1)
  $freeGB = [math]::Round($d.Free / 1GB, 1)
  $totGB  = [math]::Round(($d.Used + $d.Free) / 1GB, 1)
  $pct    = [math]::Round($d.Used / ($d.Used + $d.Free) * 100, 1)
  return [pscustomobject]@{ UsedGB=$usedGB; FreeGB=$freeGB; TotalGB=$totGB; Pct=$pct }
}

function Show-Status {
  $disk  = Get-DiskInfo
  $nodes = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
  $dc    = if ($disk.Pct -gt $DISK_WARN_PCT)  { "Red"   } else { "Green" }
  $nc    = if ($nodes    -gt $NODE_WARN_COUNT) { "Red"   } else { "Green" }
  Write-Host "  Disk C:  $($disk.UsedGB) GB / $($disk.TotalGB) GB  ($($disk.Pct)%  —  $($disk.FreeGB) GB free)" -ForegroundColor $dc
  Write-Host "  Node processes: $nodes" -ForegroundColor $nc
}

# ── Node cleanup ──────────────────────────────────────────────────────────────
function Invoke-NodeCleanup {
  Write-Section "NODE PROCESS CLEANUP"
  $procs = Get-Process -Name "node" -ErrorAction SilentlyContinue
  if (-not $procs) { Write-Host "  No node processes running." -ForegroundColor Green; return }
  Write-Host "  Before: $($procs.Count) processes" -ForegroundColor Yellow

  $wmi    = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
  $killed = 0
  $kept   = 0

  foreach ($proc in $procs) {
    $cmd = ($wmi | Where-Object ProcessId -eq $proc.Id).CommandLine

    # Always keep VS Code / Insiders children
    $parentName = (Get-Process -Id $proc.Parent.Id -ErrorAction SilentlyContinue).Name
    if ($parentName -match "Code|code-insiders") { $kept++; continue }

    # Keep safe patterns
    $safe = $false
    foreach ($pat in $KEEP_PATTERNS) {
      if ($cmd -match [regex]::Escape($pat) -or $cmd -match $pat) { $safe = $true; break }
    }
    if ($safe) { $kept++; continue }

    # Kill zombie npx bootstrappers
    $zombie = $false
    foreach ($zpat in $ZOMBIE_PATTERNS) {
      if ($cmd -match $zpat) { $zombie = $true; break }
    }

    # Kill truly idle processes (<5 MB, barely any CPU)
    $mb   = [math]::Round($proc.WorkingSet / 1MB, 1)
    $idle = ($proc.CPU -lt 0.1 -and $mb -lt 5)

    if ($zombie -or $idle) {
      $tag = if ($zombie) { "npx-zombie" } else { "idle" }
      $preview = if ($cmd.Length -gt 80) { $cmd.Substring(0,80) + "..." } else { $cmd }
      Write-Host "  KILL [$tag] PID $($proc.Id)  $mb MB  $preview" -ForegroundColor DarkYellow
      Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
      $killed++
    } else {
      $kept++
    }
  }

  $after = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
  Write-Host "  Killed: $killed  |  Kept: $kept  |  After: $after" -ForegroundColor Green
}

# ── Disk cleanup ──────────────────────────────────────────────────────────────
function Clear-Folder($path, $label, $daysOld = 0) {
  if (-not (Test-Path $path)) { return 0 }
  $items = Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { -not $_.PSIsContainer }
  if ($daysOld -gt 0) {
    $cutoff = (Get-Date).AddDays(-$daysOld)
    $items  = $items | Where-Object { $_.LastWriteTime -lt $cutoff }
  }
  $bytes = ($items | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
  $mb    = [math]::Round($bytes / 1MB, 1)
  if ($mb -gt 0) {
    $items | Remove-Item -Force -ErrorAction SilentlyContinue
    Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.PSIsContainer } |
      Sort-Object FullName -Descending |
      Where-Object { (Get-ChildItem $_.FullName -ErrorAction SilentlyContinue).Count -eq 0 } |
      Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] $label — freed $mb MB" -ForegroundColor Green
  } else {
    Write-Host "  [--] $label — nothing to clear" -ForegroundColor DarkGray
  }
  return $mb
}

function Invoke-DiskCleanup {
  Write-Section "DISK CLEANUP"
  $freed = 0

  # 1. User Temp (files older than 2 days)
  $freed += Clear-Folder $env:TEMP "User Temp (>2 days)" -daysOld 2

  # 2. Windows Temp
  $freed += Clear-Folder "C:\Windows\Temp" "Windows Temp (>1 day)" -daysOld 1

  # 3. Windows Update download cache
  $freed += Clear-Folder "C:\Windows\SoftwareDistribution\Download" "Windows Update Cache"

  # 4. VS Code & Insiders caches (rebuilt automatically on next launch)
  foreach ($app in @("Code", "Code - Insiders")) {
    foreach ($sub in @("Cache", "CachedData", "CachedExtensionVSIXs", "Code Cache", "GPUCache")) {
      $freed += Clear-Folder "$env:APPDATA\$app\$sub" "$app / $sub"
    }
  }

  # 5. pnpx / npx cache older than 7 days
  if (Test-Path $NPX_CACHE) {
    $old   = Get-ChildItem $NPX_CACHE -Directory | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) }
    $count = $old.Count
    $old | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] pnpx/npx cache — removed $count entries older than 7 days" -ForegroundColor Green
  }

  # 6. pnpm store prune (removes unreferenced packages — pnpm's own GC)
  Write-Host "  [..] pnpm store prune..." -ForegroundColor DarkGray
  & $PNPM_BIN store prune --force 2>&1 | Out-Null
  Write-Host "  [OK] pnpm store prune done" -ForegroundColor Green

  # 7. Old pnpm store version (v3 if v10 exists and is newer)
  if ((Test-Path $PNPM_STORE_V3) -and (Test-Path $PNPM_STORE_V10)) {
    $v3size = [math]::Round(
      (Get-ChildItem $PNPM_STORE_V3 -Recurse -ErrorAction SilentlyContinue |
       Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    if ($v3size -gt 0) {
      Write-Host "  [INFO] Found old pnpm store v3 ($v3size MB) — v10 is active" -ForegroundColor Yellow
      Write-Host "         Run manually to remove: Remove-Item '$PNPM_STORE_V3' -Recurse -Force" -ForegroundColor DarkYellow
    }
  }

  # 8. Playwright browser cache — keep only 2 most recent
  $pwDir = "$env:LOCALAPPDATA\ms-playwright"
  if (Test-Path $pwDir) {
    $pwOld = Get-ChildItem $pwDir -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip 2
    foreach ($d in $pwOld) {
      $mb = [math]::Round(
        (Get-ChildItem $d.FullName -Recurse -ErrorAction SilentlyContinue |
         Measure-Object -Property Length -Sum).Sum / 1MB, 1)
      Remove-Item $d.FullName -Recurse -Force -ErrorAction SilentlyContinue
      $freed += $mb
      Write-Host "  [OK] Old Playwright browser: $($d.Name) — freed $mb MB" -ForegroundColor Green
    }
  }

  Write-Host "`n  Total freed: $([math]::Round($freed / 1024, 2)) GB" -ForegroundColor Cyan
}

# ── Main ──────────────────────────────────────────────────────────────────────
function Invoke-Cleanup {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "`n== VS Code Cleanup & Node Watchdog  |  $ts ==" -ForegroundColor Cyan

  Write-Section "BEFORE"
  Show-Status

  Invoke-NodeCleanup
  Invoke-DiskCleanup

  Write-Section "AFTER"
  Show-Status

  Write-Host "`n[DONE] $(Get-Date -Format 'HH:mm:ss') — VS Code / Insiders were NOT touched.`n" -ForegroundColor Green
}

# ── Entry point ───────────────────────────────────────────────────────────────
if ($WatchMode) {
  Write-Host "Watch mode ON — every $IntervalMinutes min. Ctrl+C to stop." -ForegroundColor Cyan
  while ($true) {
    Invoke-Cleanup
    Write-Host "  Next run in $IntervalMinutes min..." -ForegroundColor DarkGray
    Start-Sleep -Seconds ($IntervalMinutes * 60)
  }
} else {
  Invoke-Cleanup
}

<#
================================================================
  SCHEDULING OPTIONS
================================================================

  [A] Task Scheduler — runs silently every 30 min (recommended):

    $exe    = "powershell.exe"
    $script = "D:\Nuxt Projects\new-portfolio\cleanup-watch.ps1"
    $action = New-ScheduledTaskAction -Execute $exe `
                -Argument "-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`""
    $trigger  = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 30) -Once -At (Get-Date)
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -RunOnlyIfIdle:$false -StartWhenAvailable
    Register-ScheduledTask -TaskName "VSCode-NodeCleanup" -Action $action -Trigger $trigger -Settings $settings -Force

  Remove task:
    Unregister-ScheduledTask -TaskName "VSCode-NodeCleanup" -Confirm:$false

  [B] Watch mode (keep terminal open):
    & .\cleanup-watch.ps1 -WatchMode -IntervalMinutes 30

  [C] Manual one-shot:
    & .\cleanup-watch.ps1
================================================================
#>



