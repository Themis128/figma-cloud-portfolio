"use client";

import { Bot, BookOpen, Code, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Blockly will be dynamically imported to avoid SSR issues
let Blockly: typeof import("blockly") | null = null;

// Custom dark cyberpunk theme for Blockly
const CYBERPUNK_THEME_DEF = {
  name: "cyberpunk",
  base: "classic" as const,
  componentStyles: {
    workspaceBackgroundColour: "#0d1117",
    toolboxBackgroundColour: "#161b22",
    toolboxForegroundColour: "#c9d1d9",
    flyoutBackgroundColour: "#161b22",
    flyoutForegroundColour: "#c9d1d9",
    flyoutOpacity: 0.9,
    scrollbarColour: "#22d3ee40",
    scrollbarOpacity: 0.5,
    insertionMarkerColour: "#22d3ee",
    insertionMarkerOpacity: 0.6,
    cursorColour: "#22d3ee",
  },
  blockStyles: {
    observe_blocks: { colourPrimary: "#10b981", colourSecondary: "#059669", colourTertiary: "#047857" },
    think_blocks: { colourPrimary: "#3b82f6", colourSecondary: "#2563eb", colourTertiary: "#1d4ed8" },
    act_blocks: { colourPrimary: "#8b5cf6", colourSecondary: "#7c3aed", colourTertiary: "#6d28d9" },
    evaluate_blocks: { colourPrimary: "#f59e0b", colourSecondary: "#d97706", colourTertiary: "#b45309" },
    loop_blocks: { colourPrimary: "#22d3ee", colourSecondary: "#06b6d4", colourTertiary: "#0891b2" },
  },
  categoryStyles: {
    observe_category: { colour: "#10b981" },
    think_category: { colour: "#3b82f6" },
    act_category: { colour: "#8b5cf6" },
    evaluate_category: { colour: "#f59e0b" },
    loop_category: { colour: "#22d3ee" },
  },
};

// Python generator type
type PythonGen = {
  forBlock: Record<string, (block: unknown) => string | [string, number]>;
  valueToCode: (block: unknown, name: string, order: number) => string;
  statementToCode: (block: unknown, name: string) => string;
  ORDER_NONE: number;
};

// Custom block definitions for agent concepts
function defineAgentBlocks(BlocklyModule: typeof import("blockly"), pythonGenerator?: PythonGen) {
  const { Blocks } = BlocklyModule;

  // --- OBSERVE blocks ---
  Blocks["agent_see"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_see",
        message0: "👀 Look at %1",
        args0: [
          {
            type: "field_dropdown",
            name: "WHAT",
            options: [
              ["the room", "room"],
              ["the weather", "weather"],
              ["the clock", "clock"],
              ["my inbox", "inbox"],
              ["the network", "network"],
            ],
          },
        ],
        output: "String",
        style: "observe_blocks",
        tooltip: "The agent observes something in the world",
      });
    },
  };

  Blocks["agent_listen"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_listen",
        message0: "👂 Listen for %1",
        args0: [
          {
            type: "field_dropdown",
            name: "WHAT",
            options: [
              ["a question", "question"],
              ["an alarm", "alarm"],
              ["a message", "message"],
            ],
          },
        ],
        output: "String",
        style: "observe_blocks",
        tooltip: "The agent listens for input",
      });
    },
  };

  // Statement versions of observe blocks (for use inside loops and sequences)
  Blocks["agent_scan"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_scan",
        message0: "👀 Scan %1",
        args0: [
          {
            type: "field_dropdown",
            name: "WHAT",
            options: [
              ["the room", "room"],
              ["the weather", "weather"],
              ["the clock", "clock"],
              ["my inbox", "inbox"],
              ["the network", "network"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "observe_blocks",
        tooltip: "The agent scans and observes something (use inside loops)",
      });
    },
  };

  Blocks["agent_wait_for"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_wait_for",
        message0: "👂 Wait for %1",
        args0: [
          {
            type: "field_dropdown",
            name: "WHAT",
            options: [
              ["a question", "question"],
              ["an alarm", "alarm"],
              ["a message", "message"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "observe_blocks",
        tooltip: "The agent waits and listens for input (use inside loops)",
      });
    },
  };

  // --- THINK blocks ---
  Blocks["agent_decide"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_decide",
        message0: "🧠 If %1 then",
        args0: [{ type: "input_value", name: "CONDITION", check: "String" }],
        message1: "do %1",
        args1: [{ type: "input_statement", name: "DO" }],
        previousStatement: null,
        nextStatement: null,
        style: "think_blocks",
        tooltip: "The agent makes a decision based on what it observed",
      });
    },
  };

  Blocks["agent_remember"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_remember",
        message0: "💭 Remember %1",
        args0: [
          {
            type: "field_input",
            name: "WHAT",
            text: "something important",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "think_blocks",
        tooltip: "The agent saves something to memory",
      });
    },
  };

  // --- ACT blocks ---
  Blocks["agent_say"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_say",
        message0: "💬 Say %1",
        args0: [
          {
            type: "field_input",
            name: "TEXT",
            text: "Hello! I am your agent.",
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "act_blocks",
        tooltip: "The agent says something",
      });
    },
  };

  Blocks["agent_do"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_do",
        message0: "⚡ Do %1",
        args0: [
          {
            type: "field_dropdown",
            name: "ACTION",
            options: [
              ["send an email", "email"],
              ["turn on the lights", "lights"],
              ["search the web", "search"],
              ["save a file", "save"],
              ["restart a server", "restart"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "act_blocks",
        tooltip: "The agent performs an action",
      });
    },
  };

  Blocks["agent_use_tool"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_use_tool",
        message0: "🔧 Use tool: %1",
        args0: [
          {
            type: "field_dropdown",
            name: "TOOL",
            options: [
              ["calculator", "calculator"],
              ["web browser", "browser"],
              ["database", "database"],
              ["ping command", "ping"],
            ],
          },
        ],
        previousStatement: null,
        nextStatement: null,
        style: "act_blocks",
        tooltip: "The agent uses an external tool",
      });
    },
  };

  // --- EVALUATE blocks ---
  Blocks["agent_check"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_check",
        message0: "✅ Check: did it work?",
        message1: "if yes %1",
        args1: [{ type: "input_statement", name: "YES" }],
        message2: "if no %1",
        args2: [{ type: "input_statement", name: "NO" }],
        previousStatement: null,
        nextStatement: null,
        style: "evaluate_blocks",
        tooltip: "The agent checks if the action was successful",
      });
    },
  };

  // --- LOOP block ---
  Blocks["agent_loop"] = {
    init(this: { jsonInit: (json: Record<string, unknown>) => void }) {
      this.jsonInit({
        type: "agent_loop",
        message0: "🔄 Keep going until %1",
        args0: [
          {
            type: "field_dropdown",
            name: "UNTIL",
            options: [
              ["the task is done", "done"],
              ["someone says stop", "stop"],
              ["3 tries", "tries"],
            ],
          },
        ],
        message1: "do %1",
        args1: [{ type: "input_statement", name: "BODY" }],
        previousStatement: null,
        nextStatement: null,
        style: "loop_blocks",
        tooltip: "The agent repeats steps in a loop — this is the agentic loop!",
      });
    },
  };

  // --- Python code generators ---
  if (pythonGenerator) {
    pythonGenerator.forBlock["agent_see"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return [`agent.observe("${what}")`, pythonGenerator.ORDER_NONE];
    };

    pythonGenerator.forBlock["agent_listen"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return [`agent.listen("${what}")`, pythonGenerator.ORDER_NONE];
    };

    pythonGenerator.forBlock["agent_scan"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return `agent.observe("${what}")\n`;
    };

    pythonGenerator.forBlock["agent_wait_for"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return `agent.listen("${what}")\n`;
    };

    pythonGenerator.forBlock["agent_decide"] = (block: unknown) => {
      const condition = pythonGenerator.valueToCode(block, "CONDITION", pythonGenerator.ORDER_NONE) || '"something"';
      const body = pythonGenerator.statementToCode(block, "DO") || "  pass\n";
      return `if ${condition}:\n${body}`;
    };

    pythonGenerator.forBlock["agent_remember"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return `agent.remember("${what}")\n`;
    };

    pythonGenerator.forBlock["agent_say"] = (block: unknown) => {
      const text = (block as { getFieldValue: (n: string) => string }).getFieldValue("TEXT");
      return `agent.say("${text}")\n`;
    };

    pythonGenerator.forBlock["agent_do"] = (block: unknown) => {
      const action = (block as { getFieldValue: (n: string) => string }).getFieldValue("ACTION");
      return `agent.do("${action}")\n`;
    };

    pythonGenerator.forBlock["agent_use_tool"] = (block: unknown) => {
      const tool = (block as { getFieldValue: (n: string) => string }).getFieldValue("TOOL");
      return `agent.use_tool("${tool}")\n`;
    };

    pythonGenerator.forBlock["agent_check"] = (block: unknown) => {
      const yes = pythonGenerator.statementToCode(block, "YES") || "  pass\n";
      const no = pythonGenerator.statementToCode(block, "NO") || "  pass\n";
      return `if agent.check_result():\n${yes}else:\n${no}`;
    };

    pythonGenerator.forBlock["agent_loop"] = (block: unknown) => {
      const until = (block as { getFieldValue: (n: string) => string }).getFieldValue("UNTIL");
      const body = pythonGenerator.statementToCode(block, "BODY") || "  pass\n";
      return `while not agent.is_done("${until}"):\n${body}`;
    };
  }
}

// Toolbox definition
const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "👀 Observe",
      categorystyle: "observe_category",
      contents: [
        { kind: "block", type: "agent_see" },
        { kind: "block", type: "agent_listen" },
        { kind: "block", type: "agent_scan" },
        { kind: "block", type: "agent_wait_for" },
      ],
    },
    {
      kind: "category",
      name: "🧠 Think",
      categorystyle: "think_category",
      contents: [
        { kind: "block", type: "agent_decide" },
        { kind: "block", type: "agent_remember" },
      ],
    },
    {
      kind: "category",
      name: "⚡ Act",
      categorystyle: "act_category",
      contents: [
        { kind: "block", type: "agent_say" },
        { kind: "block", type: "agent_do" },
        { kind: "block", type: "agent_use_tool" },
      ],
    },
    {
      kind: "category",
      name: "✅ Evaluate",
      categorystyle: "evaluate_category",
      contents: [{ kind: "block", type: "agent_check" }],
    },
    {
      kind: "category",
      name: "🔄 Agent Loop",
      categorystyle: "loop_category",
      contents: [{ kind: "block", type: "agent_loop" }],
    },
  ],
};

// Prebuilt agent templates
interface PrebuiltAgent {
  id: string;
  name: string;
  icon: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  xml: string;
}

const PREBUILT_AGENTS: PrebuiltAgent[] = [
  {
    id: "starter",
    name: "Starter Agent",
    icon: "🤖",
    description: "A basic observe-think-act loop. Great starting point!",
    difficulty: "beginner",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_loop" x="30" y="30">
    <field name="UNTIL">done</field>
    <statement name="BODY">
      <block type="agent_decide">
        <value name="CONDITION">
          <block type="agent_see">
            <field name="WHAT">room</field>
          </block>
        </value>
        <statement name="DO">
          <block type="agent_say">
            <field name="TEXT">I see something interesting!</field>
            <next>
              <block type="agent_do">
                <field name="ACTION">search</field>
                <next>
                  <block type="agent_check">
                    <statement name="YES">
                      <block type="agent_say">
                        <field name="TEXT">Great, it worked!</field>
                      </block>
                    </statement>
                    <statement name="NO">
                      <block type="agent_remember">
                        <field name="WHAT">try a different approach</field>
                      </block>
                    </statement>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: "email-assistant",
    name: "Email Assistant",
    icon: "📧",
    description: "Checks your inbox, reads messages, and drafts replies automatically.",
    difficulty: "beginner",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_loop" x="30" y="30">
    <field name="UNTIL">done</field>
    <statement name="BODY">
      <block type="agent_scan">
        <field name="WHAT">inbox</field>
        <next>
          <block type="agent_decide">
            <value name="CONDITION">
              <block type="agent_listen">
                <field name="WHAT">message</field>
              </block>
            </value>
            <statement name="DO">
              <block type="agent_remember">
                <field name="WHAT">sender and subject</field>
                <next>
                  <block type="agent_say">
                    <field name="TEXT">I'll draft a reply for you!</field>
                    <next>
                      <block type="agent_do">
                        <field name="ACTION">email</field>
                        <next>
                          <block type="agent_check">
                            <statement name="YES">
                              <block type="agent_say">
                                <field name="TEXT">Email sent successfully!</field>
                              </block>
                            </statement>
                            <statement name="NO">
                              <block type="agent_say">
                                <field name="TEXT">Saving as draft for your review.</field>
                              </block>
                            </statement>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: "security-monitor",
    name: "Security Monitor",
    icon: "🛡️",
    description: "Watches the network for threats, investigates alerts, and takes action.",
    difficulty: "intermediate",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_loop" x="30" y="30">
    <field name="UNTIL">stop</field>
    <statement name="BODY">
      <block type="agent_scan">
        <field name="WHAT">network</field>
        <next>
          <block type="agent_decide">
            <value name="CONDITION">
              <block type="agent_listen">
                <field name="WHAT">alarm</field>
              </block>
            </value>
            <statement name="DO">
              <block type="agent_remember">
                <field name="WHAT">alert type and source IP</field>
                <next>
                  <block type="agent_use_tool">
                    <field name="TOOL">database</field>
                    <next>
                      <block type="agent_decide">
                        <value name="CONDITION">
                          <block type="agent_see">
                            <field name="WHAT">network</field>
                          </block>
                        </value>
                        <statement name="DO">
                          <block type="agent_say">
                            <field name="TEXT">Threat detected! Blocking source.</field>
                            <next>
                              <block type="agent_do">
                                <field name="ACTION">restart</field>
                                <next>
                                  <block type="agent_check">
                                    <statement name="YES">
                                      <block type="agent_say">
                                        <field name="TEXT">Threat neutralized. Logging incident.</field>
                                      </block>
                                    </statement>
                                    <statement name="NO">
                                      <block type="agent_say">
                                        <field name="TEXT">Escalating to human analyst!</field>
                                      </block>
                                    </statement>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </statement>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: "research-agent",
    name: "Research Agent",
    icon: "🔬",
    description: "Searches the web, collects data, analyzes findings, and writes a report.",
    difficulty: "intermediate",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_wait_for" x="30" y="30">
    <field name="WHAT">question</field>
    <next>
      <block type="agent_remember">
        <field name="WHAT">the research question</field>
        <next>
          <block type="agent_loop">
            <field name="UNTIL">tries</field>
            <statement name="BODY">
              <block type="agent_use_tool">
                <field name="TOOL">browser</field>
                <next>
                  <block type="agent_remember">
                    <field name="WHAT">key findings from search</field>
                    <next>
                      <block type="agent_check">
                        <statement name="YES">
                          <block type="agent_say">
                            <field name="TEXT">Found enough data. Compiling report...</field>
                          </block>
                        </statement>
                        <statement name="NO">
                          <block type="agent_do">
                            <field name="ACTION">search</field>
                          </block>
                        </statement>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
            <next>
              <block type="agent_use_tool">
                <field name="TOOL">calculator</field>
                <next>
                  <block type="agent_do">
                    <field name="ACTION">save</field>
                    <next>
                      <block type="agent_say">
                        <field name="TEXT">Research complete! Report saved.</field>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`,
  },
  {
    id: "smart-home",
    name: "Smart Home Agent",
    icon: "🏠",
    description: "Monitors your home, adjusts settings based on conditions, and alerts you.",
    difficulty: "beginner",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_loop" x="30" y="30">
    <field name="UNTIL">stop</field>
    <statement name="BODY">
      <block type="agent_scan">
        <field name="WHAT">room</field>
        <next>
          <block type="agent_decide">
            <value name="CONDITION">
              <block type="agent_see">
                <field name="WHAT">weather</field>
              </block>
            </value>
            <statement name="DO">
              <block type="agent_do">
                <field name="ACTION">lights</field>
                <next>
                  <block type="agent_say">
                    <field name="TEXT">Lights adjusted for the evening!</field>
                  </block>
                </next>
              </block>
            </statement>
            <next>
              <block type="agent_decide">
                <value name="CONDITION">
                  <block type="agent_see">
                    <field name="WHAT">clock</field>
                  </block>
                </value>
                <statement name="DO">
                  <block type="agent_say">
                    <field name="TEXT">Good morning! Here is your schedule.</field>
                    <next>
                      <block type="agent_check">
                        <statement name="YES">
                          <block type="agent_say">
                            <field name="TEXT">All systems normal.</field>
                          </block>
                        </statement>
                        <statement name="NO">
                          <block type="agent_say">
                            <field name="TEXT">Alert: unusual activity detected!</field>
                          </block>
                        </statement>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: "devops-agent",
    name: "DevOps Agent",
    icon: "⚙️",
    description: "Monitors servers, detects issues, runs diagnostics, and auto-remediates.",
    difficulty: "advanced",
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="agent_loop" x="30" y="30">
    <field name="UNTIL">stop</field>
    <statement name="BODY">
      <block type="agent_scan">
        <field name="WHAT">network</field>
        <next>
          <block type="agent_decide">
            <value name="CONDITION">
              <block type="agent_listen">
                <field name="WHAT">alarm</field>
              </block>
            </value>
            <statement name="DO">
              <block type="agent_say">
                <field name="TEXT">Server issue detected. Running diagnostics...</field>
                <next>
                  <block type="agent_use_tool">
                    <field name="TOOL">ping</field>
                    <next>
                      <block type="agent_use_tool">
                        <field name="TOOL">database</field>
                        <next>
                          <block type="agent_remember">
                            <field name="WHAT">diagnostic results</field>
                            <next>
                              <block type="agent_check">
                                <statement name="YES">
                                  <block type="agent_say">
                                    <field name="TEXT">Issue identified. Auto-remediating...</field>
                                    <next>
                                      <block type="agent_do">
                                        <field name="ACTION">restart</field>
                                        <next>
                                          <block type="agent_check">
                                            <statement name="YES">
                                              <block type="agent_say">
                                                <field name="TEXT">Server recovered! Updating status page.</field>
                                              </block>
                                            </statement>
                                            <statement name="NO">
                                              <block type="agent_say">
                                                <field name="TEXT">Auto-fix failed. Paging on-call engineer.</field>
                                                <next>
                                                  <block type="agent_do">
                                                    <field name="ACTION">email</field>
                                                  </block>
                                                </next>
                                              </block>
                                            </statement>
                                          </block>
                                        </next>
                                      </block>
                                    </next>
                                  </block>
                                </statement>
                                <statement name="NO">
                                  <block type="agent_say">
                                    <field name="TEXT">Cannot determine root cause. Collecting logs.</field>
                                    <next>
                                      <block type="agent_do">
                                        <field name="ACTION">save</field>
                                      </block>
                                    </next>
                                  </block>
                                </statement>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
];

const DEFAULT_AGENT_ID = "starter";

// --- Real Execution Engine ---

interface LogEntry {
  time: string;
  text: string;
  indent: boolean;
}

interface ExecutableBlock {
  id: string;
  type: string;
  getFieldValue(name: string): string;
  getInputTargetBlock(name: string): ExecutableBlock | null;
  getNextBlock(): ExecutableBlock | null;
}

class AgentRuntime {
  memory: string[] = [];
  lastResult = "";
  lastSuccess = true;
  iteration = 0;
  readonly startTime = Date.now();
  private onLog: (entry: LogEntry) => void;
  private signal: AbortSignal;

  constructor(onLog: (entry: LogEntry) => void, signal: AbortSignal) {
    this.onLog = onLog;
    this.signal = signal;
  }

  private ts(): string {
    return `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`;
  }

  log(text: string, indent = false) {
    if (!this.signal.aborted) {
      this.onLog({ time: this.ts(), text, indent });
    }
  }

  private async pause(ms = 350) {
    if (this.signal.aborted) throw new DOMException("Aborted", "AbortError");
    await new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, ms);
      const onAbort = () => {
        clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      };
      this.signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  async observe(what: string): Promise<string> {
    this.log(`👀 Observing ${what}...`);
    await this.pause();
    let result: string;
    switch (what) {
      case "clock": {
        const now = new Date();
        result = `${now.toLocaleTimeString()} — ${now.toLocaleDateString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
        break;
      }
      case "room": {
        const cores = navigator.hardwareConcurrency || "unknown";
        const mem = (navigator as unknown as Record<string, unknown>).deviceMemory;
        result = `${cores} CPU cores${mem ? `, ${mem}GB RAM` : ""}, display ${screen.width}×${screen.height}, tab ${document.visibilityState}`;
        break;
      }
      case "network": {
        const conn = (navigator as unknown as Record<string, unknown>).connection as
          | Record<string, unknown>
          | undefined;
        const entries = performance.getEntriesByType("resource");
        const t0 = performance.now();
        try {
          await fetch(window.location.href, {
            method: "HEAD",
            cache: "no-store",
            signal: this.signal,
          });
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") throw e;
        }
        const latency = Math.round(performance.now() - t0);
        result = conn
          ? `${conn.effectiveType} (${conn.downlink}Mbps, RTT ${conn.rtt}ms), ${entries.length} resources, latency: ${latency}ms`
          : `${entries.length} resources loaded, measured latency: ${latency}ms`;
        break;
      }
      case "weather": {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const hour = new Date().getHours();
        const period =
          hour < 6 ? "night" : hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
        result = `${tz}, local ${period} (${hour}:00), locale: ${navigator.language}`;
        break;
      }
      case "inbox": {
        let inbox: { from: string; subject: string; read: boolean }[];
        try {
          inbox = JSON.parse(localStorage.getItem("agent_inbox") || "[]");
        } catch {
          inbox = [];
        }
        if (inbox.length === 0) {
          inbox = [
            { from: "alice@example.com", subject: "Q1 Report Review", read: false },
            { from: "bob@example.com", subject: "Meeting Tomorrow", read: false },
            { from: "system@alerts.com", subject: "Server CPU Warning", read: false },
          ];
          localStorage.setItem("agent_inbox", JSON.stringify(inbox));
        }
        const unread = inbox.filter((m) => !m.read).length;
        result = `${inbox.length} messages (${unread} unread)`;
        break;
      }
      default:
        result = `${what}: no data source`;
    }
    this.lastResult = result;
    this.log(`→ ${result}`, true);
    return result;
  }

  async listen(what: string): Promise<string> {
    this.log(`👂 Listening for ${what}...`);
    await this.pause();
    let result: string;
    switch (what) {
      case "question":
        result = "User query received: 'What is the current system status?'";
        break;
      case "alarm": {
        const entries = performance.getEntriesByType("resource");
        const slow = entries.filter((e) => (e as PerformanceResourceTiming).duration > 100);
        if (slow.length > 0) {
          const worst = Math.round(
            Math.max(...slow.map((e) => (e as PerformanceResourceTiming).duration)),
          );
          result = `⚠ Alert: ${slow.length} slow resources detected (>100ms), worst: ${worst}ms`;
        } else if (entries.length > 15) {
          result = `⚠ Alert: High resource count (${entries.length} loaded)`;
        } else {
          result = "No alerts — all systems nominal";
        }
        break;
      }
      case "message": {
        let inbox: { from: string; subject: string; read: boolean }[];
        try {
          inbox = JSON.parse(localStorage.getItem("agent_inbox") || "[]");
        } catch {
          inbox = [];
        }
        const unread = inbox.find((m) => !m.read);
        if (unread) {
          unread.read = true;
          localStorage.setItem("agent_inbox", JSON.stringify(inbox));
          result = `New message from ${unread.from}: "${unread.subject}"`;
        } else {
          result = "No new messages";
        }
        break;
      }
      default:
        result = `${what}: nothing received`;
    }
    this.lastResult = result;
    this.log(`→ ${result}`, true);
    return result;
  }

  async say(text: string) {
    this.log(`💬 "${text}"`);
    await this.pause(250);
  }

  async doAction(action: string) {
    this.log(`⚡ Executing: ${action}`);
    await this.pause();
    let result: string;
    switch (action) {
      case "email": {
        const draft = {
          to: "team@company.com",
          subject: `Agent Report — ${new Date().toLocaleTimeString()}`,
          body: this.memory.slice(-3).join("; "),
          created: new Date().toISOString(),
        };
        const drafts: unknown[] = JSON.parse(localStorage.getItem("agent_drafts") || "[]");
        drafts.push(draft);
        localStorage.setItem("agent_drafts", JSON.stringify(drafts));
        result = `Draft saved: "${draft.subject}" (${drafts.length} total in localStorage)`;
        this.lastSuccess = true;
        break;
      }
      case "lights":
        document.documentElement.classList.toggle("agent-lights-dimmed");
        result = `Lights ${document.documentElement.classList.contains("agent-lights-dimmed") ? "dimmed" : "restored"} — CSS filter applied`;
        this.lastSuccess = true;
        break;
      case "search": {
        const q = this.memory.at(-1) || "system status";
        result = `Search: "${q}" → ${10 + performance.getEntriesByType("resource").length} results indexed`;
        this.lastSuccess = true;
        break;
      }
      case "save": {
        const state = {
          memory: this.memory,
          iterations: this.iteration,
          saved: new Date().toISOString(),
        };
        localStorage.setItem("agent_state", JSON.stringify(state));
        result = `State persisted: ${this.memory.length} memories, ${this.iteration} iterations → localStorage["agent_state"]`;
        this.lastSuccess = true;
        break;
      }
      case "restart": {
        const count = performance.getEntriesByType("resource").length;
        performance.clearResourceTimings();
        result = `Cleared ${count} performance entries, monitoring baseline reset`;
        this.lastSuccess = true;
        break;
      }
      default:
        result = `"${action}" completed`;
        this.lastSuccess = true;
    }
    this.lastResult = result;
    this.log(`→ ${result}`, true);
  }

  async useTool(tool: string) {
    this.log(`🔧 Using tool: ${tool}`);
    await this.pause(500);
    let result: string;
    switch (tool) {
      case "calculator": {
        const a = Math.round(performance.now());
        const b = navigator.hardwareConcurrency || 4;
        result = `Computed: ${a} × ${b} = ${a * b} (perf.now × CPU cores)`;
        this.lastSuccess = true;
        break;
      }
      case "browser": {
        const t0 = performance.now();
        try {
          const resp = await fetch(window.location.origin, {
            method: "HEAD",
            signal: this.signal,
          });
          result = `HEAD ${window.location.origin} → ${resp.status} ${resp.statusText} (${Math.round(performance.now() - t0)}ms)`;
          this.lastSuccess = resp.ok;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") throw e;
          result = `Fetch failed: ${e instanceof Error ? e.message : "error"}`;
          this.lastSuccess = false;
        }
        break;
      }
      case "database": {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("agent_"));
        const bytes = keys.reduce((s, k) => s + (localStorage.getItem(k)?.length || 0), 0);
        result = `localStorage: ${keys.length} agent keys, ${bytes} bytes [${keys.join(", ")}]`;
        this.lastSuccess = true;
        break;
      }
      case "ping": {
        const t0 = performance.now();
        try {
          await fetch(window.location.origin, {
            method: "HEAD",
            cache: "no-store",
            signal: this.signal,
          });
          result = `Ping ${window.location.origin} → ${Math.round(performance.now() - t0)}ms`;
          this.lastSuccess = true;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") throw e;
          result = "Ping failed: timeout";
          this.lastSuccess = false;
        }
        break;
      }
      default:
        result = `Tool "${tool}" executed`;
        this.lastSuccess = true;
    }
    this.lastResult = result;
    this.log(`→ ${result}`, true);
  }

  async remember(what: string) {
    const ctx = this.lastResult ? ` | ctx: ${this.lastResult.slice(0, 80)}` : "";
    const entry = `${what}${ctx}`;
    this.memory.push(entry);
    this.log(`💭 Memory[${this.memory.length - 1}]: "${entry}"`);
    await this.pause(200);
  }

  checkResult(): boolean {
    const ok = this.lastSuccess;
    this.log(`✅ Check → ${ok ? "SUCCESS ✓" : "FAILED ✗"}`);
    return ok;
  }

  isDone(condition: string): boolean {
    switch (condition) {
      case "tries":
        return this.iteration >= 3;
      case "done":
        return this.iteration >= 2;
      case "stop":
        return this.iteration >= 2;
      default:
        return this.iteration >= 3;
    }
  }
}

async function executeValue(block: ExecutableBlock, rt: AgentRuntime): Promise<string> {
  switch (block.type) {
    case "agent_see":
      return rt.observe(block.getFieldValue("WHAT"));
    case "agent_listen":
      return rt.listen(block.getFieldValue("WHAT"));
    default:
      return "";
  }
}

async function executeStatement(
  block: ExecutableBlock | null,
  rt: AgentRuntime,
  signal: AbortSignal,
  highlight: (id: string) => void,
): Promise<void> {
  if (!block || signal.aborted) return;
  highlight(block.id);

  switch (block.type) {
    case "agent_loop": {
      const until = block.getFieldValue("UNTIL");
      const labels: Record<string, string> = {
        done: "task is done",
        stop: "stopped",
        tries: "3 tries",
      };
      rt.log(`🔄 Loop started (until: ${labels[until] || until})`);
      const body = block.getInputTargetBlock("BODY");
      rt.iteration = 0;
      while (!rt.isDone(until) && !signal.aborted) {
        rt.log(`── iteration ${rt.iteration + 1} ──`);
        await executeStatement(body, rt, signal, highlight);
        rt.iteration++;
      }
      rt.log(`🔄 Loop ended after ${rt.iteration} iterations`);
      break;
    }
    case "agent_decide": {
      const cond = block.getInputTargetBlock("CONDITION");
      let val = "";
      if (cond) val = await executeValue(cond, rt);
      const negativePatterns = /^No (new |alerts)|nothing received|no data source|all systems nominal/i;
      const triggered = val.length > 0 && !negativePatterns.test(val);
      rt.log(`🧠 Decision: ${triggered ? "TRIGGERED ✓" : "NOT TRIGGERED ✗"}`);
      if (triggered) {
        await executeStatement(block.getInputTargetBlock("DO"), rt, signal, highlight);
      }
      break;
    }
    case "agent_check": {
      const ok = rt.checkResult();
      await executeStatement(
        block.getInputTargetBlock(ok ? "YES" : "NO"),
        rt,
        signal,
        highlight,
      );
      break;
    }
    case "agent_scan":
      await rt.observe(block.getFieldValue("WHAT"));
      break;
    case "agent_wait_for":
      await rt.listen(block.getFieldValue("WHAT"));
      break;
    case "agent_say":
      await rt.say(block.getFieldValue("TEXT"));
      break;
    case "agent_do":
      await rt.doAction(block.getFieldValue("ACTION"));
      break;
    case "agent_use_tool":
      await rt.useTool(block.getFieldValue("TOOL"));
      break;
    case "agent_remember":
      await rt.remember(block.getFieldValue("WHAT"));
      break;
    default:
      break;
  }

  const next = block.getNextBlock();
  if (next && !signal.aborted) await executeStatement(next, rt, signal, highlight);
}

export default function BlocklyAgentBuilder() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<unknown>(null);
  const [code, setCode] = useState("# Drag blocks to build your agent!\n# The Python code will appear here.");
  const [showCode, setShowCode] = useState(false);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [activeAgent, setActiveAgent] = useState(DEFAULT_AGENT_ID);
  const [showTemplates, setShowTemplates] = useState(false);

  // Initialize Blockly
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!blocklyDiv.current) return;

      try {
        // Dynamic import to avoid SSR
        const BlocklyModule = await import("blockly");
        const { pythonGenerator } = await import("blockly/python");

        if (!mounted) return;

        Blockly = BlocklyModule;

        // Define custom blocks and register Python generators
        defineAgentBlocks(BlocklyModule, pythonGenerator as unknown as PythonGen);

        // Create theme
        const theme = BlocklyModule.Theme.defineTheme(
          CYBERPUNK_THEME_DEF.name,
          CYBERPUNK_THEME_DEF,
        );

        // Inject workspace
        const workspace = BlocklyModule.inject(blocklyDiv.current!, {
          toolbox: TOOLBOX,
          theme,
          renderer: "zelos",
          grid: {
            spacing: 25,
            length: 3,
            colour: "#22d3ee15",
            snap: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 0.85,
            maxScale: 2,
            minScale: 0.4,
            scaleSpeed: 1.1,
          },
          trashcan: true,
          move: {
            scrollbars: true,
            drag: true,
            wheel: true,
          },
        });

        workspaceRef.current = workspace;

        // Load starter blocks
        const starterAgent = PREBUILT_AGENTS.find((a) => a.id === DEFAULT_AGENT_ID);
        if (starterAgent) {
          const xml = BlocklyModule.utils.xml.textToDom(starterAgent.xml);
          BlocklyModule.Xml.domToWorkspace(xml, workspace);
        }

        // Generate code on change
        workspace.addChangeListener(() => {
          try {
            const generated = pythonGenerator.workspaceToCode(workspace);
            setCode(generated || "# Empty workspace — drag some blocks!");
          } catch {
            setCode("# Drag blocks to build your agent!");
          }
        });

        setReady(true);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load block editor");
      }
    }

    init();

    return () => {
      mounted = false;
      if (workspaceRef.current && Blockly) {
        (workspaceRef.current as { dispose: () => void }).dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  const loadAgentTemplate = useCallback((agentId: string) => {
    if (!workspaceRef.current || !Blockly) return;
    const agent = PREBUILT_AGENTS.find((a) => a.id === agentId);
    if (!agent) return;
    const ws = workspaceRef.current as { clear: () => void };
    ws.clear();
    const xml = Blockly.utils.xml.textToDom(agent.xml);
    Blockly.Xml.domToWorkspace(xml, workspaceRef.current as Parameters<typeof Blockly.Xml.domToWorkspace>[1]);
    setActiveAgent(agentId);
    setShowTemplates(false);
    setOutput([]);
  }, []);

  const resetWorkspace = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
    setOutput([]);
    loadAgentTemplate(activeAgent);
  }, [activeAgent, loadAgentTemplate]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const stopAgent = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  const runAgent = useCallback(async () => {
    if (!workspaceRef.current) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setOutput([]);
    setShowCode(true);

    const ws = workspaceRef.current as {
      getTopBlocks(ordered: boolean): ExecutableBlock[];
      highlightBlock(id: string): void;
    };
    const topBlocks = ws.getTopBlocks(true);

    if (topBlocks.length === 0) {
      setOutput([{ time: "0.0s", text: "⚠ No blocks in workspace!", indent: false }]);
      setRunning(false);
      return;
    }

    const rt = new AgentRuntime(
      (entry) => {
        if (!controller.signal.aborted) setOutput((prev) => [...prev, entry]);
      },
      controller.signal,
    );

    const highlight = (id: string) => {
      try {
        ws.highlightBlock(id);
      } catch {
        /* ok */
      }
    };

    rt.log("▶ Agent execution started");

    try {
      for (const block of topBlocks) {
        if (controller.signal.aborted) break;
        await executeStatement(block, rt, controller.signal, highlight);
      }
      if (!controller.signal.aborted) {
        rt.log(`✅ Agent completed — ${rt.memory.length} memories, ${rt.iteration} iterations`);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        const elapsed = ((Date.now() - rt.startTime) / 1000).toFixed(1);
        setOutput((prev) => [
          ...prev,
          { time: `${elapsed}s`, text: "⏹ Agent stopped by user", indent: false },
        ]);
      } else {
        setOutput((prev) => [
          ...prev,
          {
            time: "—",
            text: `❌ Error: ${e instanceof Error ? e.message : "Unknown"}`,
            indent: false,
          },
        ]);
      }
    }

    try {
      ws.highlightBlock("");
    } catch {
      /* clear highlight */
    }
    setRunning(false);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <Bot className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-mono">
          Block editor couldn&apos;t load. Try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Agent Block Builder
            </h3>
            <p className="text-xs text-muted-foreground">
              Drag blocks to teach your robot agent what to do!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
              showTemplates
                ? "border-cyan-400/40 text-cyan-400 bg-cyan-400/5"
                : "border-border/40 text-foreground/70 hover:text-cyan-400 hover:border-cyan-400/40"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Templates
          </button>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border/40 text-foreground/70 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
          >
            <Code className="h-3.5 w-3.5" />
            {showCode ? "Hide" : "Show"} Python
          </button>
          {running ? (
            <button
              type="button"
              onClick={stopAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20 transition-colors"
            >
              <span className="h-3 w-3 bg-red-400 rounded-sm" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={runAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              Run Agent
            </button>
          )}
          <button
            type="button"
            onClick={resetWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border/40 text-foreground/70 hover:text-foreground transition-colors"
            title="Reset to starter example"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Prebuilt Templates */}
      {showTemplates && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PREBUILT_AGENTS.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => loadAgentTemplate(agent.id)}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                activeAgent === agent.id
                  ? "border-cyan-400/60 bg-cyan-400/10"
                  : "border-border/40 bg-foreground/5 hover:border-cyan-400/30 hover:bg-foreground/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{agent.icon}</span>
                <span className="text-sm font-bold text-foreground">{agent.name}</span>
                <span
                  className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                    agent.difficulty === "beginner"
                      ? "text-green-400 border-green-400/30 bg-green-400/10"
                      : agent.difficulty === "intermediate"
                        ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                        : "text-red-400 border-red-400/30 bg-red-400/10"
                  }`}
                >
                  {agent.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{agent.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* Blockly workspace */}
      <div className="relative rounded-xl border border-border overflow-hidden">
        <div
          ref={blocklyDiv}
          className="w-full"
          style={{ height: "420px" }}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-sm text-muted-foreground font-mono animate-pulse">
              Loading block editor...
            </p>
          </div>
        )}
      </div>

      {/* Code + Output panel */}
      {showCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Generated Python */}
          <div className="rounded-xl border border-border bg-slate-900/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-slate-800/50">
              <Code className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Python Code
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>

          {/* Simulation output */}
          <div className="rounded-xl border border-border bg-slate-900/80 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-slate-800/50">
              <Play className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Agent Output
              </span>
            </div>
            <div
              ref={outputRef}
              className="p-4 text-xs font-mono max-h-72 overflow-y-auto space-y-0.5"
            >
              {output.length === 0 ? (
                <p className="text-slate-500">
                  Click &quot;Run Agent&quot; to execute your agent with real browser APIs!
                </p>
              ) : (
                output.map((entry, i) => (
                  <div
                    key={`${i}-${entry.time}`}
                    className={`flex gap-2 ${entry.indent ? "pl-6" : ""} ${
                      entry.text.includes("✅ Agent completed")
                        ? "text-emerald-400 font-bold mt-1"
                        : entry.text.startsWith("⏹")
                          ? "text-yellow-400 mt-1"
                          : entry.text.startsWith("❌")
                            ? "text-red-400"
                            : entry.text.startsWith("──")
                              ? "text-cyan-600/60 border-t border-cyan-900/30 pt-1 mt-1"
                              : entry.indent
                                ? "text-slate-400"
                                : "text-slate-300"
                    }`}
                  >
                    <span className="text-cyan-700 shrink-0 w-14 text-right select-none">
                      [{entry.time}]
                    </span>
                    <span>{entry.text}</span>
                  </div>
                ))
              )}
              {running && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-cyan-700 shrink-0 w-14 text-right select-none">
                    [...]
                  </span>
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
