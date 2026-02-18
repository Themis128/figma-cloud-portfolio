# VS Code Performance Tuning Script
# Run: & .\vscode-tune.ps1

$settingsPath = "$env:APPDATA\Code\User\settings.json"
Write-Host "`n== VS Code Performance Tuner ==" -ForegroundColor Cyan

# 1. Backup
$backup = "$settingsPath.bak"
Copy-Item $settingsPath $backup -Force
Write-Host "[OK] Backup -> $backup" -ForegroundColor Green

# 2. Remove duplicate extension versions
Write-Host "`n[INFO] Scanning duplicate extension versions..." -ForegroundColor Yellow
$extDir = "$env:USERPROFILE\.vscode\extensions"
$extGroups = Get-ChildItem $extDir -Directory |
  Where-Object { $_.Name -match "^(.+)-(\d+\.\d+\.\d+.*)$" } |
  Group-Object { $_.Name -replace "-\d+\.\d+\.\d+.*$", "" }

$removedCount = 0
foreach ($group in $extGroups) {
  if ($group.Count -gt 1) {
    $sorted = $group.Group | Sort-Object {
      $v = $_.Name -replace "^.+-(\d+\.\d+\.\d+.*)$", '$1'
      [System.Version]($v -replace "[^0-9.]", "")
    } -Descending
    $toRemove = $sorted | Select-Object -Skip 1
    foreach ($old in $toRemove) {
      Write-Host "  Removing old: $($old.Name)" -ForegroundColor DarkYellow
      Remove-Item $old.FullName -Recurse -Force -ErrorAction SilentlyContinue
      $removedCount++
    }
  }
}
Write-Host "[OK] Removed $removedCount duplicate extension folder(s)" -ForegroundColor Green

# 3. Build settings hashtable
Write-Host "`n[INFO] Writing optimized settings..." -ForegroundColor Yellow
$optimized = [ordered]@{
  # Editor basics
  "editor.tabSize"                   = 2
  "editor.fontSize"                  = 14
  "editor.insertSpaces"              = $true
  "editor.formatOnSave"              = $true
  "files.autoSave"                   = "afterDelay"
  "files.autoSaveDelay"              = 1000
  # Rendering
  "editor.cursorBlinking"            = "solid"
  "editor.cursorSmoothCaretAnimation" = "off"
  "editor.smoothScrolling"           = $false
  "workbench.list.smoothScrolling"   = $false
  "editor.minimap.enabled"           = $false
  "editor.renderWhitespace"          = "selection"
  "editor.renderControlCharacters"   = $false
  "editor.renderLineHighlight"       = "line"
  "editor.stickyScroll.enabled"      = $false
  "editor.occurrencesHighlight"      = "singleFile"
  # Suggestions
  "editor.hover.delay"               = 600
  "editor.quickSuggestionsDelay"     = 100
  "editor.quickSuggestions"          = [ordered]@{ strings = "off"; comments = "off"; other = "on" }
  "editor.suggestOnTriggerCharacters" = $true
  "editor.acceptSuggestionOnCommitCharacter" = $false
  "editor.wordBasedSuggestions"      = "off"
  "editor.parameterHints.enabled"    = $true
  "editor.inlineSuggest.enabled"     = $true
  "editor.bracketPairColorization.enabled" = $true
  "editor.guides.bracketPairs"       = $false
  "editor.linkedEditing"             = $true
  # TypeScript
  "typescript.tsserver.maxTsServerMemory"      = 4096
  "typescript.disableAutomaticTypeAcquisition" = $true
  "typescript.preferences.importModuleSpecifier" = "relative"
  "typescript.suggest.autoImports"             = $true
  "typescript.updateImportsOnFileMove.enabled" = "always"
  "typescript.tsserver.watchOptions" = [ordered]@{
    watchFile                 = "useFsEvents"
    watchDirectory            = "useFsEvents"
    fallbackPolling           = "dynamicPriority"
    synchronousWatchDirectory = $false
  }
  # File watchers
  "files.watcherExclude" = [ordered]@{
    "**/node_modules/**"       = $true
    "**/.git/objects/**"       = $true
    "**/.git/subtree-cache/**" = $true
    "**/dist/**"               = $true
    "**/.next/**"              = $true
    "**/.nuxt/**"              = $true
    "**/build/**"              = $true
    "**/coverage/**"           = $true
    "**/.amplify/**"           = $true
    "**/.aws/**"               = $true
  }
  "files.exclude" = [ordered]@{
    "**/node_modules" = $true; "**/.git" = $true; "**/dist" = $true
    "**/.next" = $true; "**/build" = $true; "**/.nuxt" = $true
    "**/coverage" = $true; "**/.cache" = $true; "**/out" = $true
  }
  "search.exclude" = [ordered]@{
    "**/node_modules" = $true; "**/dist" = $true; "**/.next" = $true
    "**/package-lock.json" = $true; "**/yarn.lock" = $true
    "**/pnpm-lock.yaml" = $true; "**/.nuxt" = $true; "**/coverage" = $true
  }
  # Terminal
  "terminal.integrated.fontSize"                     = 14
  "terminal.integrated.gpuAcceleration"              = "on"
  "terminal.integrated.defaultProfile.windows"       = "PowerShell"
  "terminal.integrated.shellIntegration.enabled"     = $true
  "terminal.integrated.enablePersistentSessions"     = $false
  "terminal.integrated.persistentSessionReviveProcess" = "never"
  # Workbench
  "workbench.colorTheme"                        = "Dark+ (default dark)"
  "workbench.startupEditor"                     = "none"
  "workbench.enableExperiments"                 = $false
  "workbench.settings.enableNaturalLanguageSearch" = $false
  "workbench.editor.enablePreview"              = $true
  "workbench.editor.enablePreviewFromQuickOpen" = $false
  # System
  "extensions.autoUpdate"                       = "onlyEnabledExtensions"
  "extensions.autoCheckUpdates"                 = $false
  "telemetry.telemetryLevel"                    = "off"
  "security.promptForLocalFileProtocolHandling" = $false
  "update.mode"                                 = "default"
  "remote.WSL.fileWatcher.polling"              = $false
  # Git
  "git.autofetch"         = $false
  "git.confirmSync"       = $false
  "git.enableSmartCommit" = $true
  # Explorer
  "explorer.confirmDelete"      = $false
  "explorer.confirmDragAndDrop" = $false
  "explorer.compactFolders"     = $true
  # Window
  "window.restoreWindows"      = "folders"
  "window.newWindowDimensions" = "inherit"
  # Formatters
  "[javascript]"      = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[typescript]"      = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[typescriptreact]" = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[javascriptreact]" = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[json]"            = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[jsonc]"           = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[html]"            = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[css]"             = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[markdown]"        = [ordered]@{ "editor.defaultFormatter" = "esbenp.prettier-vscode" }
  "[vue]"             = [ordered]@{ "editor.defaultFormatter" = "Vue.volar" }
  "[yaml]"            = [ordered]@{ "editor.defaultFormatter" = "redhat.vscode-yaml" }
}

# Extension tuning — add directly to the hashtable
# Tailwind CSS
$optimized["tailwindCSS.includeLanguages"]  = [ordered]@{ vue = "html"; typescript = "javascript"; javascript = "javascript" }
$optimized["tailwindCSS.emmetCompletions"]  = $false
$optimized["tailwindCSS.showPixelEquivalents"] = $false
$optimized["tailwindCSS.lint.cssConflict"]  = "warning"
$optimized["tailwindCSS.lint.invalidApply"] = "error"

# ESLint — run on save, not every keystroke (biggest perf win)
$optimized["eslint.run"]           = "onSave"
$optimized["eslint.lintTask.enable"] = $true
$optimized["eslint.validate"]      = @("javascript","javascriptreact","typescript","typescriptreact","vue")
$optimized["eslint.workingDirectories"] = @([ordered]@{ mode = "auto" })
$optimized["eslint.codeAction.showDocumentation"] = [ordered]@{ enable = $false }

# Prettier
$optimized["prettier.requireConfig"]  = $true
$optimized["prettier.useEditorConfig"] = $true
$optimized["prettier.singleQuote"]    = $true
$optimized["prettier.semi"]           = $false
$optimized["prettier.trailingComma"]  = "es5"
$optimized["prettier.tabWidth"]       = 2

# GitHub Copilot — disable in file types where it's noisy/slow
$optimized["github.copilot.enable"] = [ordered]@{
  "*" = $true; plaintext = $false; markdown = $false; yaml = $false; json = $false
}
$optimized["github.copilot.editor.enableAutoCompletions"] = $true
$optimized["github.copilot.chat.experimental.mcp.enabled"] = $false
$optimized["github.copilot.chat.followUps"]    = "never"
$optimized["github.copilot.chat.welcomeMessage"] = "never"

# GitHub Pull Requests — disable background polling
$optimized["githubPullRequests.pullBranch"]              = "never"
$optimized["githubPullRequests.showPullRequestNumberInTree"] = $true
$optimized["githubPullRequests.notifications"]           = "off"

# Volar / Vue — hybrid mode shares tsserver instead of running a separate one
$optimized["vue.server.hybridMode"]              = $true
$optimized["vue.inlayHints.inlineHandlerLeading"] = $false
$optimized["vue.inlayHints.missingProps"]         = $false
$optimized["vue.inlayHints.optionsWrapper"]       = $false
$optimized["vue.inlayHints.vBindShorthand"]       = $false
$optimized["vue.autoInsert.parentheses"]          = $false
$optimized["vue.autoInsert.bracketSpacing"]       = $false
$optimized["vue.complete.casing.tags"]            = "pascal"
$optimized["vue.complete.casing.props"]           = "camel"

# YAML
$optimized["yaml.validate"]           = $true
$optimized["yaml.hover"]              = $true
$optimized["yaml.completion"]         = $true
$optimized["yaml.format.enable"]      = $true
$optimized["yaml.schemaStore.enable"] = $true
$optimized["yaml.telemetry.enabled"]  = $false

# Markdown All in One — skip TOC rebuild on every save
$optimized["markdown.extension.toc.updateOnSave"] = $false
$optimized["markdown.extension.italic.indicator"] = "_"
$optimized["markdown.extension.completion.respectVscodeSearchExclude"] = $true

# Python / Pylance — disable entirely (not a Python project)
$optimized["python.analysis.enabled"]  = $false
$optimized["python.analysis.indexing"] = $false
$optimized["python.languageServer"]    = "None"
$optimized["pylance.insidersChannel"]  = "off"

# PowerShell — don't auto-start server
$optimized["powershell.integratedConsole.showOnStartup"] = $false
$optimized["powershell.scriptAnalysis.enable"]           = $true
$optimized["powershell.codeFormatting.preset"]           = "OTBS"
$optimized["powershell.startAutomatically"]              = $false

# Playwright
$optimized["playwright.reuseBrowser"] = $false
$optimized["playwright.showTrace"]    = $false

# Remote Containers
$optimized["remote.containers.defaultExtensions"] = @()
$optimized["remote.autoForwardPortsSource"]       = "hybrid"

# Cline
$optimized["cline.diffEnabled"]              = $true
$optimized["cline.soundEnabled"]             = $false
$optimized["cline.enableBrowserIntegration"] = $true
$optimized["cline.enableCheckpointsSetting"] = $true
$optimized["cline.mcpMarketplace.enabled"]   = $true
$optimized["cline.terminalShellIntegration"] = $true
$optimized["cline.autoApproveReadOnly"]      = $true
$optimized["cline.maxFileLineCount"]         = 500
$optimized["cline.customInstructions"]       = "You are working on a Nuxt/React portfolio project hosted on AWS Amplify. Tech stack: TypeScript, React 19, Vite, TailwindCSS v4, Playwright for testing. Use 2-space indentation. Prefer functional components and hooks. Always use relative imports with @/ aliases. Follow existing code patterns in the codebase."

# Write settings to disk
$json = $optimized | ConvertTo-Json -Depth 10
Set-Content -Path $settingsPath -Value $json -Encoding UTF8
Write-Host "[OK] Settings written" -ForegroundColor Green

# 4. Clear caches
Write-Host "`n[INFO] Clearing VS Code caches..." -ForegroundColor Yellow
$cacheDirs = @(
  "$env:APPDATA\Code\Cache",
  "$env:APPDATA\Code\CachedData",
  "$env:APPDATA\Code\CachedExtensionVSIXs",
  "$env:APPDATA\Code\Code Cache",
  "$env:APPDATA\Code\GPUCache"
)
foreach ($dir in $cacheDirs) {
  if (Test-Path $dir) {
    $sizeMB = [math]::Round((Get-ChildItem $dir -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Remove-Item "$dir\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleared $dir ($($sizeMB) MB)" -ForegroundColor DarkYellow
  }
}
Write-Host "[OK] Caches cleared" -ForegroundColor Green

# 5. Summary
Write-Host "`n== Summary ==" -ForegroundColor Cyan
Write-Host "  Core settings            optimized" -ForegroundColor White
Write-Host "  ESLint                   run=onSave (was every keystroke)" -ForegroundColor White
Write-Host "  Tailwind CSS             scoped langs, emmet+pixel off" -ForegroundColor White
Write-Host "  Prettier                 requireConfig=true" -ForegroundColor White
Write-Host "  Copilot                  disabled in plaintext/md/yaml/json" -ForegroundColor White
Write-Host "  Copilot Chat             followUps + welcomeMessage off" -ForegroundColor White
Write-Host "  Volar                    hybridMode=true (shares tsserver)" -ForegroundColor White
Write-Host "  Python/Pylance           languageServer=None (not a Python project)" -ForegroundColor White
Write-Host "  PowerShell               startAutomatically=false" -ForegroundColor White
Write-Host "  GitHub PR                notifications=off, no auto-pull" -ForegroundColor White
Write-Host "  YAML                     telemetry off, schemaStore on" -ForegroundColor White
Write-Host "  Markdown All in One      TOC update on save disabled" -ForegroundColor White
Write-Host "  Playwright               reuseBrowser + showTrace off" -ForegroundColor White
Write-Host "  Remote Containers        no default extensions auto-install" -ForegroundColor White
Write-Host "  Duplicate extensions removed: $removedCount" -ForegroundColor White
Write-Host "  VS Code caches cleared" -ForegroundColor White
Write-Host "`n[DONE] Restart VS Code now." -ForegroundColor Cyan
Write-Host "       Backup: $backup`n" -ForegroundColor DarkGray
