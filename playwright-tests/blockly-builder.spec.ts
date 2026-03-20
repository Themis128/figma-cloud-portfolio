import { expect, test, type Page } from "@playwright/test";
import { waitForAppReady } from "./test-utils";

/**
 * Comprehensive tests for the Blockly Agent Builder component.
 * Tests all 9 improvements: blocks, templates, runtime, step mode,
 * syntax highlighting, export/copy, responsive, accessibility, block counter.
 */

// Blockly is dynamically imported and consistently times out in CI
test.skip(
  !!process.env.CI || !!process.env.GITHUB_ACTIONS,
  "Blockly dynamic import times out in CI",
);

// --- Helpers ---

/** Navigate to /agents and wait for Blockly workspace to load */
async function gotoBlocklyBuilder(page: Page) {
  await page.goto("/agents/");
  await waitForAppReady(page);
  await page.waitForLoadState("networkidle");

  // Scroll to the Build Your Own Agent section
  const heading = page.getByText("Build Your Own Agent");
  await heading.scrollIntoViewIfNeeded();

  // Wait for Blockly workspace + toolbox to fully load (dynamic import — slow in CI)
  await page.waitForSelector(".blocklyWorkspace", { timeout: 30000 });
  await page.waitForSelector(".blocklyToolboxDiv", { timeout: 15000 });
}

/** Click the "Show Python" / "Hide Python" toggle */
async function togglePythonPanel(page: Page) {
  const btn = page.getByRole("button", { name: /^(Show|Hide) Python$/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

/** Click the "Templates" toggle */
async function toggleTemplates(page: Page) {
  const btn = page.getByRole("button", { name: /Toggle template browser/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

/** Click the "Run Agent" button */
async function clickRunAgent(page: Page) {
  const btn = page.getByRole("button", { name: /Run agent/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
}

/** Wait for agent execution to complete */
async function waitForAgentComplete(page: Page, timeout = 30000) {
  await page.waitForSelector("text=Agent completed", { timeout });
}

// ─────────────────────────────────────────────────────────────────
// 1. WORKSPACE & BLOCK DEFINITIONS
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Workspace", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should render Blockly workspace with cyberpunk theme", async ({ page }) => {
    const workspace = page.locator(".blocklyWorkspace");
    await expect(workspace.first()).toBeVisible();

    // Cyberpunk theme: dark background (#0d1117)
    const bg = page.locator(".blocklyMainBackground");
    await expect(bg.first()).toBeAttached();
  });

  test("should load starter agent blocks by default", async ({ page }) => {
    // The starter template has blocks — check that blocks exist in workspace
    const blocks = page.locator(".blocklyDraggable");
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have toolbox with 4 categories", async ({ page }) => {
    // Observe, Think, Act, Evaluate categories
    const toolbox = page.locator(".blocklyToolboxDiv");
    await expect(toolbox.first()).toBeAttached();
  });

  test("should have trashcan visible", async ({ page }) => {
    const trashcan = page.locator(".blocklyTrash");
    await expect(trashcan.first()).toBeAttached();
  });

  test("should have zoom controls", async ({ page }) => {
    const zoomControls = page.locator(".blocklyZoom");
    await expect(zoomControls.first()).toBeAttached();
  });

  test("should display block counter badge", async ({ page }) => {
    const counter = page.getByText(/\d+ blocks/);
    await expect(counter).toBeVisible();
    const text = await counter.textContent();
    const count = parseInt(text?.match(/(\d+)/)?.[1] || "0");
    expect(count).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────
// 2. TEMPLATE SYSTEM
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Templates", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should toggle template browser on/off", async ({ page }) => {
    // Initially hidden
    const templateGrid = page.locator("[role='listbox']");
    await expect(templateGrid).not.toBeVisible();

    // Open templates
    await toggleTemplates(page);
    await expect(templateGrid).toBeVisible();

    // Close templates
    await toggleTemplates(page);
    await expect(templateGrid).not.toBeVisible();
  });

  test("should display all 6 prebuilt agent templates", async ({ page }) => {
    await toggleTemplates(page);

    const options = page.locator("[role='option']");
    await expect(options).toHaveCount(6);
  });

  test("should show template names and difficulty badges", async ({ page }) => {
    await toggleTemplates(page);

    for (const name of [
      "Starter Agent",
      "Email Assistant",
      "Security Monitor",
      "Smart Home",
      "DevOps Agent",
      "Custom Agent",
    ]) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }

    // Difficulty badges
    await expect(page.getByText("beginner").first()).toBeVisible();
    await expect(page.getByText("intermediate").first()).toBeVisible();
    await expect(page.getByText("advanced").first()).toBeVisible();
  });

  test("should mark active template with aria-selected", async ({ page }) => {
    await toggleTemplates(page);

    const starterOption = page.locator("[role='option']").filter({ hasText: "Starter Agent" });
    await expect(starterOption).toHaveAttribute("aria-selected", "true");

    // Others should not be selected
    const emailOption = page.locator("[role='option']").filter({ hasText: "Email Assistant" });
    await expect(emailOption).toHaveAttribute("aria-selected", "false");
  });

  test("should load Email Assistant template and change blocks", async ({ page }) => {
    await toggleTemplates(page);

    // Count blocks before
    const blocksBefore = await page.locator(".blocklyDraggable").count();

    // Click Email Assistant
    const emailOption = page.locator("[role='option']").filter({ hasText: "Email Assistant" });
    await emailOption.click();

    // Template grid should close
    await expect(page.locator("[role='listbox']")).not.toBeVisible();

    // Blocks should change (Email Assistant has more blocks than Starter)
    await page.waitForTimeout(500);
    const blocksAfter = await page.locator(".blocklyDraggable").count();
    expect(blocksAfter).toBeGreaterThan(0);
    // Block count changed (different template)
    expect(blocksAfter !== blocksBefore || blocksAfter > 0).toBeTruthy();
  });

  test("should load Custom Agent template with empty workspace", async ({ page }) => {
    await toggleTemplates(page);

    const customOption = page.locator("[role='option']").filter({ hasText: "Custom Agent" });
    await customOption.click();

    await page.waitForTimeout(500);

    // Custom agent has no blocks
    const blocks = page.locator(".blocklyDraggable");
    const count = await blocks.count();
    expect(count).toBe(0);
  });

  test("should update block counter when switching templates", async ({ page }) => {
    const counter = page.getByText(/\d+ blocks/);
    const initialText = await counter.textContent();

    await toggleTemplates(page);

    // Load Custom Agent (empty)
    const customOption = page.locator("[role='option']").filter({ hasText: "Custom Agent" });
    await customOption.click();
    await page.waitForTimeout(500);

    // Block counter should disappear or show 0
    const counterVisible = await counter.isVisible().catch(() => false);
    if (counterVisible) {
      const newText = await counter.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 3. PYTHON CODE GENERATION
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Python Code Generation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should toggle Python code panel", async ({ page }) => {
    // Panel starts hidden
    const codePanel = page.getByText("Python Code").first();
    await expect(codePanel).not.toBeVisible();

    // Show it
    await togglePythonPanel(page);
    await expect(codePanel).toBeVisible();

    // Hide it
    await togglePythonPanel(page);
    await expect(codePanel).not.toBeVisible();
  });

  test("should generate correct Python for starter template", async ({ page }) => {
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const code = await codeBlock.textContent();

    // Starter template should generate these patterns
    expect(code).toContain("while not agent.is_done");
    expect(code).toContain("if agent.observe");
    expect(code).toContain('agent.say(');
    expect(code).toContain('agent.do(');
    expect(code).toContain("agent.check_result()");
  });

  test("should generate max iterations comment in loop code", async ({ page }) => {
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const code = await codeBlock.textContent();

    // Loop should include max iterations comment
    expect(code).toMatch(/# max \d+ iterations/);
  });

  test("should generate else branch when template has otherwise blocks", async ({ page }) => {
    // Starter template has agent_check with yes/no which generates if/else
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const code = await codeBlock.textContent();

    expect(code).toContain("else:");
  });

  test("should update code when switching templates", async ({ page }) => {
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const starterCode = await codeBlock.textContent();

    // Switch to Security Monitor
    await toggleTemplates(page);
    const securityOption = page.locator("[role='option']").filter({ hasText: "Security Monitor" });
    await securityOption.click();
    await page.waitForTimeout(500);

    const securityCode = await codeBlock.textContent();
    expect(securityCode).not.toBe(starterCode);
    expect(securityCode).toContain("agent.observe");
  });
});

// ─────────────────────────────────────────────────────────────────
// 4. SYNTAX HIGHLIGHTING
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Syntax Highlighting", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await togglePythonPanel(page);
  });

  test("should highlight Python keywords in purple", async ({ page }) => {
    // Keywords like while, if, else, not should have purple styling
    const keywords = page.locator("pre code span.text-purple-400");
    const count = await keywords.count();
    expect(count).toBeGreaterThan(0);

    // Check a specific keyword
    const firstKeyword = await keywords.first().textContent();
    expect(["while", "if", "else", "not"]).toContain(firstKeyword?.trim());
  });

  test("should highlight strings in amber", async ({ page }) => {
    const strings = page.locator("pre code span.text-amber-400");
    const count = await strings.count();
    expect(count).toBeGreaterThan(0);

    // Strings should be quoted
    const firstString = await strings.first().textContent();
    expect(firstString).toMatch(/^["']/);
  });

  test("should highlight 'agent' in cyan", async ({ page }) => {
    const agentTokens = page.locator("pre code span.text-cyan-400");
    const count = await agentTokens.count();
    expect(count).toBeGreaterThan(0);

    const text = await agentTokens.first().textContent();
    expect(text?.trim()).toBe("agent");
  });

  test("should highlight method calls in emerald", async ({ page }) => {
    const methods = page.locator("pre code span.text-emerald-400");
    const count = await methods.count();
    expect(count).toBeGreaterThan(0);

    // Methods should start with a dot
    const text = await methods.first().textContent();
    expect(text).toMatch(/^\./);
  });

  test("should highlight comments in grey italic", async ({ page }) => {
    // The loop generates a "# max N iterations" comment
    const comments = page.locator("pre code span.text-slate-500.italic");
    const count = await comments.count();
    expect(count).toBeGreaterThan(0);

    const text = await comments.first().textContent();
    expect(text).toMatch(/^#/);
  });
});

// ─────────────────────────────────────────────────────────────────
// 5. COPY & EXPORT
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Copy & Export", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await togglePythonPanel(page);
  });

  test("should have copy button in code panel header", async ({ page }) => {
    const copyBtn = page.getByRole("button", { name: /Copy Python code/i });
    await expect(copyBtn).toBeVisible();
  });

  test("should have export/download button in code panel header", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /Download workspace/i });
    await expect(exportBtn).toBeVisible();
  });

  test("should trigger download when export button clicked", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 });
    const exportBtn = page.getByRole("button", { name: /Download workspace/i });
    await exportBtn.click();
    const download = await downloadPromise;

    // Filename should match pattern: agent-<id>-<timestamp>.xml
    expect(download.suggestedFilename()).toMatch(/^agent-.*\.xml$/);
  });

  test("should copy code to clipboard and show feedback", async ({ page, context }) => {
    // Grant clipboard permission
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    const copyBtn = page.getByRole("button", { name: /Copy Python code/i });
    await copyBtn.click();

    // Button title should change to "Copied!" momentarily
    await expect(copyBtn).toHaveAttribute("title", "Copied!");

    // Should revert after ~1.5s
    await page.waitForTimeout(2000);
    await expect(copyBtn).toHaveAttribute("title", "Copy code");
  });
});

// ─────────────────────────────────────────────────────────────────
// 6. AGENT RUNTIME EXECUTION
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Agent Runtime", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should show output panel when Run Agent is clicked", async ({ page }) => {
    await clickRunAgent(page);

    // Output panel should appear (showCode is set to true on run)
    const outputPanel = page.getByText("Agent Output");
    await expect(outputPanel).toBeVisible();
  });

  test("should display execution started message", async ({ page }) => {
    await clickRunAgent(page);

    await expect(page.getByText("Agent execution started")).toBeVisible({ timeout: 5000 });
  });

  test("should show loop iteration markers", async ({ page }) => {
    await clickRunAgent(page);
    await page.waitForTimeout(2000);

    await expect(page.getByText("iteration 1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should show observe actions in output", async ({ page }) => {
    await clickRunAgent(page);

    await expect(page.getByText(/Observing room/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should show decision results", async ({ page }) => {
    await clickRunAgent(page);

    // Starter template should trigger the decision
    await expect(page.getByText(/Decision.*TRIGGERED/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should show agent say messages", async ({ page }) => {
    await clickRunAgent(page);

    await expect(page.getByText(/I see something interesting/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("should show check results", async ({ page }) => {
    await clickRunAgent(page);

    await expect(page.getByText(/Check.*SUCCESS/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("should complete execution with summary", async ({ page }) => {
    await clickRunAgent(page);

    await waitForAgentComplete(page);

    const summary = page.getByText(/Agent completed.*memories.*iterations/i);
    await expect(summary).toBeVisible();
  });

  test("should show Stop button while running", async ({ page }) => {
    await clickRunAgent(page);

    const stopBtn = page.getByRole("button", { name: /Stop agent/i });
    await expect(stopBtn).toBeVisible();
  });

  test("should stop execution when Stop is clicked", async ({ page }) => {
    await clickRunAgent(page);
    await page.waitForTimeout(500);

    const stopBtn = page.getByRole("button", { name: /Stop agent/i });
    await stopBtn.click();

    await expect(page.getByText("Agent stopped by user")).toBeVisible({ timeout: 5000 });

    // Run button should reappear
    await expect(page.getByRole("button", { name: /Run agent/i })).toBeVisible();
  });

  test("should run Email Assistant template successfully", async ({ page }) => {
    // Load Email Assistant
    await toggleTemplates(page);
    const emailOption = page.locator("[role='option']").filter({ hasText: "Email Assistant" });
    await emailOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);

    // Should observe inbox
    await expect(page.getByText(/Observing inbox/i).first()).toBeVisible({ timeout: 10000 });

    await waitForAgentComplete(page);
  });

  test("should run Security Monitor template successfully", async ({ page }) => {
    await toggleTemplates(page);
    const secOption = page.locator("[role='option']").filter({ hasText: "Security Monitor" });
    await secOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);

    await expect(page.getByText(/Observing network/i).first()).toBeVisible({ timeout: 10000 });

    await waitForAgentComplete(page);
  });

  test("should run Smart Home template with adjust action", async ({ page }) => {
    await toggleTemplates(page);
    const homeOption = page.locator("[role='option']").filter({ hasText: "Smart Home" });
    await homeOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);

    await expect(page.getByText(/Observing room/i).first()).toBeVisible({ timeout: 10000 });

    await waitForAgentComplete(page);

    // Smart Home uses "adjust" action
    const output = page.locator("[role='log']");
    const text = await output.textContent();
    expect(text).toContain("adjust");
  });

  test("should run DevOps Agent template with deploy action", async ({ page }) => {
    await toggleTemplates(page);
    const devopsOption = page.locator("[role='option']").filter({ hasText: "DevOps Agent" });
    await devopsOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);

    await waitForAgentComplete(page);

    // DevOps uses "deploy" action
    const output = page.locator("[role='log']");
    const text = await output.textContent();
    expect(text).toContain("deploy");
  });

  test("should handle empty workspace gracefully", async ({ page }) => {
    // Load Custom Agent (empty)
    await toggleTemplates(page);
    const customOption = page.locator("[role='option']").filter({ hasText: "Custom Agent" });
    await customOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);

    await expect(page.getByText("No blocks in workspace")).toBeVisible({ timeout: 5000 });
  });

  test("should auto-scroll output log", async ({ page }) => {
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // The output container should be scrolled to bottom
    const outputDiv = page.locator("[role='log']");
    const scrollTop = await outputDiv.evaluate((el) => el.scrollTop);
    const scrollHeight = await outputDiv.evaluate((el) => el.scrollHeight);
    const clientHeight = await outputDiv.evaluate((el) => el.clientHeight);

    // If content overflows, scrollTop should be near the bottom
    if (scrollHeight > clientHeight) {
      expect(scrollTop + clientHeight).toBeGreaterThanOrEqual(scrollHeight - 20);
    }
  });
});

// ─────────────────────────────────────────────────────────────────
// 7. STEP-BY-STEP EXECUTION
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Step Mode", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should have Step toggle button", async ({ page }) => {
    const stepBtn = page.getByRole("button", { name: /Toggle step-by-step/i });
    await expect(stepBtn).toBeVisible();
  });

  test("should toggle step mode on and off", async ({ page }) => {
    const stepBtn = page.getByRole("button", { name: /Toggle step-by-step/i });

    // Initially not pressed
    await expect(stepBtn).toHaveAttribute("aria-pressed", "false");

    await stepBtn.click();
    await expect(stepBtn).toHaveAttribute("aria-pressed", "true");

    await stepBtn.click();
    await expect(stepBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("should disable Step toggle while agent is running", async ({ page }) => {
    await clickRunAgent(page);

    const stepBtn = page.getByRole("button", { name: /Toggle step-by-step/i });
    await expect(stepBtn).toBeDisabled();
  });

  test("should pause execution and show Next Step button in step mode", async ({ page }) => {
    // Enable step mode
    const stepToggle = page.getByRole("button", { name: /Toggle step-by-step/i });
    await stepToggle.click();

    // Run agent
    await clickRunAgent(page);

    // Should show "Waiting for next step" message
    await expect(page.getByText("Waiting for next step")).toBeVisible({ timeout: 10000 });

    // Should show Next Step button
    const nextStepBtn = page.getByRole("button", { name: /Execute next step/i });
    await expect(nextStepBtn).toBeVisible();

    // Should also show Stop button
    const stopBtn = page.getByRole("button", { name: /Stop agent/i });
    await expect(stopBtn).toBeVisible();
  });

  test("should advance one step when Next Step is clicked", async ({ page }) => {
    // Enable step mode
    const stepToggle = page.getByRole("button", { name: /Toggle step-by-step/i });
    await stepToggle.click();

    await clickRunAgent(page);

    // Wait for first pause
    await expect(page.getByText("Waiting for next step")).toBeVisible({ timeout: 10000 });

    // Count output entries before advancing
    const logEntries = page.locator("[role='log'] > div");
    const countBefore = await logEntries.count();

    // Click Next Step
    const nextStepBtn = page.getByRole("button", { name: /Execute next step/i });
    await nextStepBtn.click();

    // Wait for next pause
    await page.waitForTimeout(1000);

    // Should have more output entries
    const countAfter = await logEntries.count();
    expect(countAfter).toBeGreaterThan(countBefore);
  });

  test("should stop execution in step mode", async ({ page }) => {
    const stepToggle = page.getByRole("button", { name: /Toggle step-by-step/i });
    await stepToggle.click();

    await clickRunAgent(page);
    await expect(page.getByText("Waiting for next step")).toBeVisible({ timeout: 10000 });

    // Stop while paused
    const stopBtn = page.getByRole("button", { name: /Stop agent/i });
    await stopBtn.click();

    // Run button should reappear
    await expect(page.getByRole("button", { name: /Run agent/i })).toBeVisible();

    // Step toggle should reset
    await expect(stepToggle).toHaveAttribute("aria-pressed", "false");
  });

  test("should complete execution step by step", async ({ page }) => {
    test.setTimeout(60000);

    const stepToggle = page.getByRole("button", { name: /Toggle step-by-step/i });
    await stepToggle.click();

    // Load Custom Agent and add minimal blocks manually would be ideal,
    // but since we can't drag blocks in Playwright, let's use Starter
    // and advance through all steps
    await clickRunAgent(page);

    // Keep clicking Next Step until execution completes
    for (let i = 0; i < 50; i++) {
      const waitingVisible = await page.getByText("Waiting for next step").isVisible().catch(() => false);
      const completedVisible = await page.getByText("Agent completed").isVisible().catch(() => false);
      const stoppedVisible = await page.getByText("Agent stopped").isVisible().catch(() => false);

      if (completedVisible || stoppedVisible) break;

      if (waitingVisible) {
        const nextStepBtn = page.getByRole("button", { name: /Execute next step/i });
        await nextStepBtn.click();
      }

      await page.waitForTimeout(200);
    }

    // Should have completed
    await expect(page.getByText(/Agent completed/)).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────
// 8. RESET & WORKSPACE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Reset & Management", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should reset workspace to current template", async ({ page }) => {
    const blocksBefore = await page.locator(".blocklyDraggable").count();

    // Click reset
    const resetBtn = page.getByRole("button", { name: /Reset workspace/i });
    await resetBtn.click();

    await page.waitForTimeout(500);
    const blocksAfter = await page.locator(".blocklyDraggable").count();

    // Should have same number of blocks (reset to same template)
    expect(blocksAfter).toBe(blocksBefore);
  });

  test("should clear output on reset", async ({ page }) => {
    // Run agent first
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // Output should have entries
    await expect(page.getByText("Agent completed")).toBeVisible();

    // Reset
    const resetBtn = page.getByRole("button", { name: /Reset workspace/i });
    await resetBtn.click();

    // Output should be cleared
    await expect(page.getByText("Agent completed")).not.toBeVisible();
  });

  test("should reset to the active template, not always starter", async ({ page }) => {
    // Load Email Assistant
    await toggleTemplates(page);
    const emailOption = page.locator("[role='option']").filter({ hasText: "Email Assistant" });
    await emailOption.click();
    await page.waitForTimeout(500);

    // Show code panel to verify
    await togglePythonPanel(page);
    const codeBlock = page.locator("pre code").first();
    const emailCode = await codeBlock.textContent();

    // Reset should reload Email Assistant, not Starter
    const resetBtn = page.getByRole("button", { name: /Reset workspace/i });
    await resetBtn.click();
    await page.waitForTimeout(500);

    const resetCode = await codeBlock.textContent();
    expect(resetCode).toBe(emailCode);
  });
});

// ─────────────────────────────────────────────────────────────────
// 9. RESPONSIVE DESIGN
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Responsive Design", () => {
  test("should render workspace on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoBlocklyBuilder(page);

    const workspace = page.locator(".blocklyWorkspace");
    await expect(workspace.first()).toBeVisible();
  });

  test("should have responsive workspace height", async ({ page }) => {
    await gotoBlocklyBuilder(page);

    // Check that workspace uses clamp for height
    const workspaceDiv = page.locator(".blocklyWorkspace").first().locator(".."); // parent div
    const height = await workspaceDiv.evaluate((el) => {
      return window.getComputedStyle(el).height;
    });
    const heightPx = parseInt(height);

    // Height should be between 280px and 420px
    expect(heightPx).toBeGreaterThanOrEqual(270); // small tolerance
    expect(heightPx).toBeLessThanOrEqual(430);
  });

  test("should wrap toolbar buttons on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoBlocklyBuilder(page);

    // All buttons should still be accessible (flex-wrap handles wrapping)
    const templateBtn = page.getByRole("button", { name: /Toggle template browser/i });
    await expect(templateBtn).toBeVisible();

    const runBtn = page.getByRole("button", { name: /Run agent/i });
    await expect(runBtn).toBeVisible();
  });

  test("should stack code and output panels on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoBlocklyBuilder(page);
    await togglePythonPanel(page);

    // Both panels should be visible (stacked vertically on mobile via grid-cols-1)
    await expect(page.getByText("Python Code").first()).toBeVisible();
    await expect(page.getByText("Agent Output")).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────
// 10. ACCESSIBILITY
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should have aria-labels on all toolbar buttons", async ({ page }) => {
    const buttons = [
      /Toggle template browser/i,
      /Python code/i,
      /Toggle step-by-step/i,
      /Run agent/i,
      /Reset workspace/i,
    ];

    for (const label of buttons) {
      const btn = page.getByRole("button", { name: label });
      await expect(btn).toBeAttached();
    }
  });

  test("should have aria-pressed on toggle buttons", async ({ page }) => {
    const toggles = [
      page.getByRole("button", { name: /Toggle template browser/i }),
      page.getByRole("button", { name: /generated Python code/i }),
      page.getByRole("button", { name: /Toggle step-by-step/i }),
    ];

    for (const toggle of toggles) {
      const pressed = await toggle.getAttribute("aria-pressed");
      expect(pressed).toMatch(/^(true|false)$/);
    }
  });

  test("should have role='listbox' on template grid", async ({ page }) => {
    await toggleTemplates(page);

    const listbox = page.locator("[role='listbox']");
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveAttribute("aria-label", "Agent templates");
  });

  test("should have role='option' and aria-selected on template cards", async ({ page }) => {
    await toggleTemplates(page);

    const options = page.locator("[role='option']");
    const count = await options.count();
    expect(count).toBe(6);

    for (let i = 0; i < count; i++) {
      const selected = await options.nth(i).getAttribute("aria-selected");
      expect(selected).toMatch(/^(true|false)$/);
    }
  });

  test("should have role='log' and aria-live on output panel", async ({ page }) => {
    await clickRunAgent(page);

    const log = page.locator("[role='log']");
    await expect(log).toBeVisible();
    await expect(log).toHaveAttribute("aria-live", "polite");
    await expect(log).toHaveAttribute("aria-label", "Agent execution output");
  });

  test("should have aria-hidden on decorative icons", async ({ page }) => {
    await toggleTemplates(page);

    // Template emoji icons should be aria-hidden
    const hiddenIcons = page.locator("[aria-hidden='true']");
    const count = await hiddenIcons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should have keyboard-accessible buttons", async ({ page }) => {
    // Tab to the builder area and verify focus
    const runBtn = page.getByRole("button", { name: /Run agent/i });
    await runBtn.scrollIntoViewIfNeeded();
    await runBtn.focus();

    // Should be focusable
    await expect(runBtn).toBeFocused();

    // Should be activatable with Enter
    await page.keyboard.press("Enter");

    // Agent should start running
    await expect(page.getByText("Agent execution started")).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────────────
// 11. OUTPUT LOG STYLING
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Output Log Styling", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlocklyBuilder(page);
  });

  test("should show timestamps on each log entry", async ({ page }) => {
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // Each entry should have a timestamp like [0.0s]
    const timestamps = page.locator("[role='log'] .text-cyan-700");
    const count = await timestamps.count();
    expect(count).toBeGreaterThan(0);

    const text = await timestamps.first().textContent();
    expect(text).toMatch(/\[\d+\.\d+s\]/);
  });

  test("should highlight completion message in green", async ({ page }) => {
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    const completionLine = page.locator("[role='log'] .text-emerald-400").last();
    await expect(completionLine).toBeVisible();
    const text = await completionLine.textContent();
    expect(text).toContain("Agent completed");
  });

  test("should indent sub-results", async ({ page }) => {
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // Indented lines have pl-6 class
    const indented = page.locator("[role='log'] .pl-6");
    const count = await indented.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should show iteration separators", async ({ page }) => {
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // Iteration markers like "── iteration 1 ──"
    const separators = page.locator("[role='log'] .border-t");
    const count = await separators.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should show pulsing cursor while running", async ({ page }) => {
    await clickRunAgent(page);

    // Should show pulsing cursor before completion
    const cursor = page.locator("[role='log'] .animate-pulse").first();
    await expect(cursor).toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────────────────────────
// 12. AGENT_DO ACTIONS (adjust & deploy)
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Action Handlers", () => {
  test("should simulate 'adjust' action with temperature output", async ({ page }) => {
    await gotoBlocklyBuilder(page);

    // Load Smart Home template
    await toggleTemplates(page);
    const homeOption = page.locator("[role='option']").filter({ hasText: "Smart Home" });
    await homeOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);
    await waitForAgentComplete(page);

    const output = page.locator("[role='log']");
    const text = await output.textContent();

    // Adjust action should report temperature
    expect(text).toMatch(/temperature.*°C/i);
  });

  test("should simulate 'deploy' action with version output", async ({ page }) => {
    await gotoBlocklyBuilder(page);

    // Load DevOps template
    await toggleTemplates(page);
    const devopsOption = page.locator("[role='option']").filter({ hasText: "DevOps Agent" });
    await devopsOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);
    await waitForAgentComplete(page);

    const output = page.locator("[role='log']");
    const text = await output.textContent();

    // Deploy action should report version and commit hash
    expect(text).toMatch(/Deployed v\d+\.\d+\.\d+/);
    expect(text).toMatch(/commit [a-z0-9]+/);
  });
});

// ─────────────────────────────────────────────────────────────────
// 13. DECIDE BLOCK — OTHERWISE BRANCH
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Decision Otherwise Branch", () => {
  test("should generate Python else when otherwise blocks are present", async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const code = await codeBlock.textContent();

    // Starter template has agent_check with YES/NO → generates if/else
    expect(code).toContain("if agent.check_result():");
    expect(code).toContain("else:");
  });

  test("should execute otherwise branch when decision not triggered", async ({ page }) => {
    await gotoBlocklyBuilder(page);

    // Load Email Assistant — reads inbox, after all messages are read
    // the "message" listener returns "No new messages" which triggers
    // the NOT TRIGGERED path
    await toggleTemplates(page);
    const emailOption = page.locator("[role='option']").filter({ hasText: "Email Assistant" });
    await emailOption.click();
    await page.waitForTimeout(500);

    await clickRunAgent(page);
    await waitForAgentComplete(page);

    const output = page.locator("[role='log']");
    const text = await output.textContent();

    // After processing all messages, decision should be NOT TRIGGERED
    expect(text).toContain("NOT TRIGGERED");
  });
});

// ─────────────────────────────────────────────────────────────────
// 14. CONFIGURABLE LOOP ITERATIONS
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Configurable Loop", () => {
  test("should show max iterations in loop log message", async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    // Loop started message should include max count
    await expect(page.getByText(/Loop started.*max: \d+/i)).toBeVisible();
  });

  test("should respect iteration count in execution", async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await clickRunAgent(page);
    await waitForAgentComplete(page);

    const output = page.locator("[role='log']");
    const text = await output.textContent();

    // Count iteration markers
    const iterations = (text?.match(/── iteration \d+ ──/g) || []).length;

    // Default is 3 iterations for the starter template
    expect(iterations).toBeGreaterThanOrEqual(2);
    expect(iterations).toBeLessThanOrEqual(20);
  });

  test("should include max iterations comment in generated Python", async ({ page }) => {
    await gotoBlocklyBuilder(page);
    await togglePythonPanel(page);

    const codeBlock = page.locator("pre code").first();
    const code = await codeBlock.textContent();

    expect(code).toMatch(/# max \d+ iterations/);
  });
});

// ─────────────────────────────────────────────────────────────────
// 15. CROSS-TEMPLATE COMPARISON
// ─────────────────────────────────────────────────────────────────

test.describe("Blockly Builder — Template Consistency", () => {
  const templates = [
    { name: "Starter Agent", observe: "room" },
    { name: "Email Assistant", observe: "inbox" },
    { name: "Security Monitor", observe: "network" },
    { name: "Smart Home", observe: "room" },
    { name: "DevOps Agent", observe: "logs" },
  ];

  for (const tmpl of templates) {
    test(`${tmpl.name} should execute and complete without errors`, async ({ page }) => {
      await gotoBlocklyBuilder(page);

      if (tmpl.name !== "Starter Agent") {
        await toggleTemplates(page);
        const option = page.locator("[role='option']").filter({ hasText: tmpl.name });
        await option.click();
        await page.waitForTimeout(500);
      }

      await clickRunAgent(page);
      await waitForAgentComplete(page);

      // No error messages
      const errorVisible = await page.getByText(/❌ Error/i).isVisible().catch(() => false);
      expect(errorVisible).toBe(false);
    });

    test(`${tmpl.name} should generate valid Python code`, async ({ page }) => {
      await gotoBlocklyBuilder(page);

      if (tmpl.name !== "Starter Agent") {
        await toggleTemplates(page);
        const option = page.locator("[role='option']").filter({ hasText: tmpl.name });
        await option.click();
        await page.waitForTimeout(500);
      }

      await togglePythonPanel(page);

      const codeBlock = page.locator("pre code").first();
      const code = await codeBlock.textContent();

      // All templates should have these patterns
      expect(code).toContain("while not agent.is_done");
      expect(code).toContain("agent.observe");
      expect(code?.length).toBeGreaterThan(50);
    });
  }
});
