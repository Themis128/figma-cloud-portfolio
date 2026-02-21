# =============================================================================
# fix-wsl-connection.ps1 — Diagnose & Fix WSL2 ↔ VS Code Insiders Disconnections
# Run: & .\scripts\fix-wsl-connection.ps1
# =============================================================================

param(
  [switch]$FixAll,
  [switch]$DiagnoseOnly
)

$ErrorActionPreference = "Continue"

function Write-Section($title) {
  Write-Host "`n$('=' * 64)" -ForegroundColor Cyan
  Write-Host "  $title" -ForegroundColor Cyan
  Write-Host "$('=' * 64)" -ForegroundColor Cyan
}

function Write-Finding($severity, $msg) {
  $color = switch ($severity) {
    "CRITICAL" { "Red" }
    "WARNING"  { "Yellow" }
    "OK"       { "Green" }
    "INFO"     { "DarkGray" }
    default    { "White" }
  }
  Write-Host "  [$severity] $msg" -ForegroundColor $color
}

$findings = @()

Write-Host "`n  WSL2 <-> VS Code Insiders Connection Diagnostic" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor DarkGray

# ── 1. WSL VERSION & KERNEL ─────────────────────────────────────────────────

Write-Section "1. WSL VERSION & KERNEL"

try {
  $wslVersion = wsl.exe --version 2>&1
  Write-Host $wslVersion -ForegroundColor White

  # Check WSL version number
  $wslVer = ($wslVersion | Select-String "WSL version" | ForEach-Object { $_ -replace "WSL version:\s*", "" }).Trim()
  if ($wslVer) {
    $major, $minor = $wslVer.Split('.')[0..1]
    if ([int]$major -lt 2) {
      Write-Finding "CRITICAL" "WSL version $wslVer is outdated. Update with: wsl --update"
      $findings += "WSL version outdated ($wslVer)"
    } else {
      Write-Finding "OK" "WSL version: $wslVer"
    }
  }

  # Check kernel version
  $kernelLine = $wslVersion | Select-String "Kernel version"
  if ($kernelLine) {
    $kernelVer = ($kernelLine -replace "Kernel version:\s*", "").Trim()
    Write-Finding "INFO" "Kernel: $kernelVer"
    # Kernels older than 5.15 have known stability issues
    $kMajor = ($kernelVer.Split('.')[0])
    $kMinor = ($kernelVer.Split('.')[1])
    if ([int]$kMajor -lt 5 -or ([int]$kMajor -eq 5 -and [int]$kMinor -lt 15)) {
      Write-Finding "WARNING" "Kernel $kernelVer is older than 5.15. Run: wsl --update"
      $findings += "WSL kernel outdated"
    }
  }
} catch {
  Write-Finding "WARNING" "Could not query WSL version: $_"
}

# ── 2. WSL DISTRO STATUS ────────────────────────────────────────────────────

Write-Section "2. WSL DISTRO STATUS"

try {
  $distros = wsl.exe --list --verbose 2>&1
  Write-Host $distros -ForegroundColor White

  if ($distros -match "Ubuntu-24.04.*Running") {
    Write-Finding "OK" "Ubuntu-24.04 is running"
  } elseif ($distros -match "Ubuntu-24.04.*Stopped") {
    Write-Finding "WARNING" "Ubuntu-24.04 is stopped — will start on next connection"
    $findings += "WSL distro stopped"
  } else {
    Write-Finding "CRITICAL" "Ubuntu-24.04 not found in distro list"
    $findings += "Ubuntu-24.04 distro not found"
  }

  # Check if WSL 2 (not WSL 1)
  if ($distros -match "Ubuntu-24.04\s+Running\s+1\s*$" -or $distros -match "Ubuntu-24.04\s+Stopped\s+1\s*$") {
    Write-Finding "CRITICAL" "Ubuntu-24.04 is running WSL 1, not WSL 2! Convert with:"
    Write-Host "    wsl --set-version Ubuntu-24.04 2" -ForegroundColor Yellow
    $findings += "Distro running WSL 1 instead of WSL 2"
  }
} catch {
  Write-Finding "WARNING" "Could not list WSL distros: $_"
}

# ── 3. WSLCONFIG — MEMORY & CPU LIMITS ──────────────────────────────────────

Write-Section "3. .wslconfig (MEMORY & CPU LIMITS)"

$wslconfigPath = "$env:USERPROFILE\.wslconfig"
if (Test-Path $wslconfigPath) {
  $wslconfig = Get-Content $wslconfigPath -Raw
  Write-Host "  Found: $wslconfigPath" -ForegroundColor Green
  Write-Host $wslconfig -ForegroundColor White

  if ($wslconfig -match "memory\s*=\s*(\d+)") {
    $memGB = $Matches[1]
    if ([int]$memGB -lt 4) {
      Write-Finding "WARNING" "WSL memory limit is ${memGB}GB — recommend at least 8GB"
      $findings += "WSL memory limit too low (${memGB}GB)"
    } else {
      Write-Finding "OK" "WSL memory limit: ${memGB}GB"
    }
  } else {
    Write-Finding "WARNING" "No explicit memory limit set — WSL defaults to 50% of system RAM"
    $findings += "No explicit WSL memory limit"
  }

  if ($wslconfig -notmatch "autoMemoryReclaim") {
    Write-Finding "WARNING" "autoMemoryReclaim not configured — can prevent memory bloat"
    $findings += "autoMemoryReclaim not enabled"
  }
} else {
  Write-Finding "CRITICAL" "No .wslconfig found at $wslconfigPath"
  Write-Finding "INFO" "This is a major cause of disconnections — WSL can consume all RAM"
  $findings += ".wslconfig file missing"
}

# ── 4. WSL /etc/wsl.conf ────────────────────────────────────────────────────

Write-Section "4. /etc/wsl.conf (INSIDE WSL)"

try {
  $wslConf = wsl.exe -d Ubuntu-24.04 -- cat /etc/wsl.conf 2>&1
  if ($wslConf -and $wslConf -notmatch "No such file") {
    Write-Host $wslConf -ForegroundColor White
    Write-Finding "OK" "/etc/wsl.conf exists"
  } else {
    Write-Finding "WARNING" "/etc/wsl.conf not found — default settings in use"
    $findings += "/etc/wsl.conf missing"
  }
} catch {
  Write-Finding "WARNING" "Could not read /etc/wsl.conf: $_"
}

# ── 5. VS CODE SERVER STATE ─────────────────────────────────────────────────

Write-Section "5. VS CODE SERVER STATE (INSIDE WSL)"

try {
  # Check vscode-server-insiders directory
  $serverDir = wsl.exe -d Ubuntu-24.04 -- bash -c "ls -la ~/.vscode-server-insiders/ 2>&1" 2>&1
  if ($serverDir -match "No such file") {
    Write-Finding "INFO" "No .vscode-server-insiders directory — clean install expected on connect"
  } else {
    Write-Host $serverDir -ForegroundColor White

    # Check server disk usage
    $serverSize = wsl.exe -d Ubuntu-24.04 -- bash -c "du -sh ~/.vscode-server-insiders/ 2>/dev/null | cut -f1" 2>&1
    Write-Finding "INFO" "VS Code Server Insiders size: $($serverSize.Trim())"

    # Check for corruption — log files
    $logCount = wsl.exe -d Ubuntu-24.04 -- bash -c "find ~/.vscode-server-insiders/ -name '*.log' 2>/dev/null | wc -l" 2>&1
    Write-Finding "INFO" "Server log files: $($logCount.Trim())"

    # Check for stale lock files
    $lockFiles = wsl.exe -d Ubuntu-24.04 -- bash -c "find ~/.vscode-server-insiders/ -name '*.lock' -mmin +60 2>/dev/null | wc -l" 2>&1
    $lockCount = [int]($lockFiles.Trim())
    if ($lockCount -gt 0) {
      Write-Finding "WARNING" "$lockCount stale lock file(s) found (older than 60 min)"
      $findings += "Stale VS Code Server lock files"
    }
  }

  # Check server processes running in WSL
  $serverProcs = wsl.exe -d Ubuntu-24.04 -- bash -c "ps aux 2>/dev/null | grep -c '[v]scode-server'" 2>&1
  $procCount = [int]($serverProcs.Trim())
  if ($procCount -gt 10) {
    Write-Finding "WARNING" "$procCount VS Code server processes running — possible process leak"
    $findings += "Too many VS Code server processes ($procCount)"
  } elseif ($procCount -gt 0) {
    Write-Finding "OK" "$procCount VS Code server process(es) running"
  } else {
    Write-Finding "INFO" "No VS Code server processes currently running"
  }
} catch {
  Write-Finding "WARNING" "Could not check VS Code server state: $_"
}

# ── 6. MEMORY USAGE IN WSL ──────────────────────────────────────────────────

Write-Section "6. WSL MEMORY USAGE"

try {
  $memInfo = wsl.exe -d Ubuntu-24.04 -- bash -c "free -h 2>/dev/null" 2>&1
  Write-Host $memInfo -ForegroundColor White

  # Extract used/total
  $memLine = ($memInfo -split "`n" | Where-Object { $_ -match "^Mem:" })
  if ($memLine) {
    Write-Finding "OK" "Memory info retrieved"
  }

  # Check for OOM kills
  $oomKills = wsl.exe -d Ubuntu-24.04 -- bash -c "dmesg 2>/dev/null | grep -ci 'oom\|out of memory'" 2>&1
  $oomCount = [int]($oomKills.Trim())
  if ($oomCount -gt 0) {
    Write-Finding "CRITICAL" "$oomCount OOM (Out of Memory) events found in kernel log"
    Write-Finding "INFO" "This is a primary cause of WSL disconnections — increase memory in .wslconfig"
    $findings += "OOM kills detected ($oomCount events)"
  } else {
    Write-Finding "OK" "No OOM events in kernel log"
  }
} catch {
  Write-Finding "WARNING" "Could not check WSL memory: $_"
}

# ── 7. NETWORK CONNECTIVITY ─────────────────────────────────────────────────

Write-Section "7. NETWORK / DNS"

try {
  $dns = wsl.exe -d Ubuntu-24.04 -- bash -c "cat /etc/resolv.conf 2>/dev/null" 2>&1
  if ($dns -match "nameserver") {
    Write-Finding "OK" "DNS configured in resolv.conf"
    $nameservers = ($dns -split "`n" | Where-Object { $_ -match "^nameserver" })
    foreach ($ns in $nameservers) {
      Write-Finding "INFO" "$ns"
    }
  } else {
    Write-Finding "WARNING" "No nameserver in resolv.conf — DNS resolution may fail"
    $findings += "DNS not configured in WSL"
  }

  # Check if resolv.conf is auto-generated (can cause issues)
  if ($dns -match "generateResolvConf") {
    Write-Finding "INFO" "resolv.conf is auto-generated by WSL"
  }
} catch {
  Write-Finding "WARNING" "Could not check DNS: $_"
}

# ── 8. VS CODE SETTINGS (WSL-related) ───────────────────────────────────────

Write-Section "8. VS CODE INSIDERS SETTINGS"

$settingsPath = "$env:APPDATA\Code - Insiders\User\settings.json"
if (Test-Path $settingsPath) {
  $settings = Get-Content $settingsPath -Raw

  # Check connection method
  if ($settings -match '"remote\.WSL2?\.connectionMethod"\s*:\s*"([^"]+)"') {
    $connMethod = $Matches[1]
    Write-Finding "INFO" "WSL connection method: $connMethod"
    if ($connMethod -ne "wslExeProxy") {
      Write-Finding "WARNING" "Consider using 'wslExeProxy' connection method for better reconnection"
      $findings += "WSL connection method not set to wslExeProxy"
    }
  } else {
    Write-Finding "WARNING" "No explicit WSL connection method set"
    Write-Finding "INFO" "Setting remote.WSL2.connectionMethod to 'wslExeProxy' improves reconnection"
    $findings += "WSL connection method not configured"
  }

  # Check file watcher polling
  if ($settings -match '"remote\.WSL\.fileWatcher\.polling"\s*:\s*(true|false)') {
    $polling = $Matches[1]
    if ($polling -eq "true") {
      Write-Finding "WARNING" "File watcher polling is ON — uses more CPU, may cause slowdowns"
    } else {
      Write-Finding "OK" "File watcher polling is OFF (using native inotify)"
    }
  }

  # Check remote.extensionKind
  if ($settings -match "remote\.extensionKind") {
    Write-Finding "INFO" "Custom remote.extensionKind settings found"
  }

  # Check for reconnection settings
  if ($settings -match "remote\.autoForwardPorts") {
    Write-Finding "INFO" "Auto port forwarding is configured"
  }
} else {
  Write-Finding "WARNING" "VS Code Insiders settings.json not found at expected path"
}

# ── 9. WINDOWS FIREWALL / DEFENDER ──────────────────────────────────────────

Write-Section "9. WINDOWS FIREWALL (WSL-related rules)"

try {
  $wslRules = Get-NetFirewallRule -DisplayName "*WSL*" -ErrorAction SilentlyContinue
  if ($wslRules) {
    foreach ($rule in $wslRules) {
      $status = if ($rule.Enabled -eq "True") { "Enabled" } else { "Disabled" }
      $action = $rule.Action
      Write-Finding "INFO" "$($rule.DisplayName): $status ($action)"
    }
  } else {
    Write-Finding "INFO" "No WSL-specific firewall rules found"
  }

  # Check for vscode firewall rules
  $codeRules = Get-NetFirewallRule -DisplayName "*Code*" -ErrorAction SilentlyContinue
  if ($codeRules) {
    $blocked = $codeRules | Where-Object { $_.Action -eq "Block" }
    if ($blocked) {
      Write-Finding "CRITICAL" "VS Code is BLOCKED by firewall — this causes disconnections"
      $findings += "VS Code blocked by Windows Firewall"
    } else {
      Write-Finding "OK" "VS Code firewall rules exist and allow traffic"
    }
  }
} catch {
  Write-Finding "INFO" "Could not check firewall rules (may need admin)"
}

# ── 10. VMMEM PROCESS CHECK ─────────────────────────────────────────────────

Write-Section "10. VMMEM MEMORY USAGE"

try {
  $vmmem = Get-Process -Name "vmmem" -ErrorAction SilentlyContinue
  if ($vmmem) {
    $vmmemMB = [math]::Round($vmmem.WorkingSet64 / 1MB, 0)
    $vmmemGB = [math]::Round($vmmem.WorkingSet64 / 1GB, 2)
    Write-Finding "INFO" "vmmem process: ${vmmemGB} GB (${vmmemMB} MB)"

    $totalRAM = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
    $pct = [math]::Round($vmmem.WorkingSet64 / $totalRAM * 100, 1)
    if ($pct -gt 70) {
      Write-Finding "CRITICAL" "vmmem is using ${pct}% of system RAM — likely cause of disconnections"
      $findings += "vmmem consuming ${pct}% of system RAM"
    } elseif ($pct -gt 50) {
      Write-Finding "WARNING" "vmmem is using ${pct}% of system RAM — monitor closely"
      $findings += "vmmem using ${pct}% of system RAM"
    } else {
      Write-Finding "OK" "vmmem RAM usage: ${pct}%"
    }
  } else {
    Write-Finding "INFO" "vmmem process not found (WSL may not be running)"
  }
} catch {
  Write-Finding "INFO" "Could not check vmmem process"
}

# ── SUMMARY ──────────────────────────────────────────────────────────────────

Write-Section "DIAGNOSTIC SUMMARY"

if ($findings.Count -eq 0) {
  Write-Host "  No issues found! Your WSL connection should be stable." -ForegroundColor Green
} else {
  Write-Host "  Found $($findings.Count) issue(s):`n" -ForegroundColor Yellow
  $i = 1
  foreach ($f in $findings) {
    Write-Host "  $i. $f" -ForegroundColor Yellow
    $i++
  }
}

# ── AUTO-FIX ─────────────────────────────────────────────────────────────────

if ($DiagnoseOnly) {
  Write-Host "`n  [DiagnoseOnly mode] Skipping fixes." -ForegroundColor DarkGray
  return
}

Write-Section "RECOMMENDED FIXES"

# Fix 1: Create/update .wslconfig
$needsWslConfig = $findings | Where-Object { $_ -match "wslconfig|memory" }
if ($needsWslConfig -or $FixAll) {
  Write-Host "`n  [FIX 1] Create/Update .wslconfig" -ForegroundColor Cyan

  $totalRAMBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
  $totalRAMGB = [math]::Floor($totalRAMBytes / 1GB)
  $recommendedMem = [math]::Min([math]::Max([math]::Floor($totalRAMGB * 0.5), 4), 16)
  $recommendedProc = [math]::Min((Get-CimInstance Win32_Processor).NumberOfLogicalProcessors, 8)

  $wslconfigContent = @"
[wsl2]
memory=${recommendedMem}GB
processors=$recommendedProc
swap=4GB
localhostForwarding=true

[experimental]
autoMemoryReclaim=gradual
sparseVhd=true
"@

  if (-not (Test-Path $wslconfigPath)) {
    Write-Host "  Creating $wslconfigPath with recommended settings:" -ForegroundColor Green
    Write-Host $wslconfigContent -ForegroundColor White
    if ($FixAll) {
      Set-Content -Path $wslconfigPath -Value $wslconfigContent -Encoding UTF8
      Write-Finding "OK" ".wslconfig created — restart WSL with: wsl --shutdown"
    } else {
      Write-Host "`n  Run with -FixAll to apply, or create manually:" -ForegroundColor Yellow
      Write-Host "  Path: $wslconfigPath" -ForegroundColor DarkGray
    }
  } else {
    Write-Host "  .wslconfig already exists. Recommended content:" -ForegroundColor Yellow
    Write-Host $wslconfigContent -ForegroundColor White
    Write-Host "  Review and merge manually." -ForegroundColor DarkGray
  }
}

# Fix 2: Create /etc/wsl.conf if missing
$needsWslConf = $findings | Where-Object { $_ -match "wsl\.conf" }
if ($needsWslConf -or $FixAll) {
  Write-Host "`n  [FIX 2] Create /etc/wsl.conf" -ForegroundColor Cyan

  $wslConfContent = @"
[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"

[network]
generateResolvConf = true

[interop]
enabled = true
appendWindowsPath = true
"@

  Write-Host "  Recommended /etc/wsl.conf:" -ForegroundColor Yellow
  Write-Host $wslConfContent -ForegroundColor White

  if ($FixAll) {
    $escaped = $wslConfContent -replace '"', '\"' -replace "`n", "\n"
    wsl.exe -d Ubuntu-24.04 --user root -- bash -c "printf '$escaped' > /etc/wsl.conf"
    Write-Finding "OK" "/etc/wsl.conf created — restart WSL with: wsl --shutdown"
  } else {
    Write-Host "`n  Run with -FixAll to apply automatically." -ForegroundColor Yellow
  }
}

# Fix 3: VS Code Insiders settings
$needsConnMethod = $findings | Where-Object { $_ -match "connection method" }
if ($needsConnMethod -or $FixAll) {
  Write-Host "`n  [FIX 3] VS Code Insiders WSL Connection Settings" -ForegroundColor Cyan
  Write-Host "  Add these to your VS Code Insiders settings.json:" -ForegroundColor Yellow
  Write-Host @"

  "remote.WSL2.connectionMethod": "wslExeProxy",
  "remote.WSL.fileWatcher.polling": false,
  "remote.autoForwardPortsSource": "hybrid",
  "remote.extensionKind": {
    "ms-vscode.js-debug": ["workspace"]
  }
"@ -ForegroundColor White
  Write-Host "`n  The wslExeProxy method improves reconnection after sleep/network changes." -ForegroundColor DarkGray
}

# Fix 4: Clean stale VS Code Server
$needsServerClean = $findings | Where-Object { $_ -match "lock file|server process" }
if ($needsServerClean -or $FixAll) {
  Write-Host "`n  [FIX 4] Clean Stale VS Code Server State" -ForegroundColor Cyan
  Write-Host "  Run these commands in WSL:" -ForegroundColor Yellow
  Write-Host @"

  # Kill orphaned server processes
  pkill -f vscode-server-insiders

  # Remove stale lock files
  find ~/.vscode-server-insiders/ -name '*.lock' -mmin +60 -delete

  # Nuclear option (forces full re-download of server):
  # rm -rf ~/.vscode-server-insiders
"@ -ForegroundColor White
}

# Fix 5: Update WSL
Write-Host "`n  [FIX 5] Keep WSL Updated" -ForegroundColor Cyan
Write-Host "  Run periodically from PowerShell (admin):" -ForegroundColor Yellow
Write-Host @"

  wsl --update
  wsl --shutdown
"@ -ForegroundColor White

Write-Host "`n$('=' * 64)" -ForegroundColor Cyan
Write-Host "  DONE — Review findings above and apply fixes as needed." -ForegroundColor Cyan
Write-Host "  After applying fixes, restart WSL: wsl --shutdown" -ForegroundColor Yellow
Write-Host "$('=' * 64)`n" -ForegroundColor Cyan
