"use client";

import { Bot, Code, Play, RotateCcw } from "lucide-react";
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

// Custom block definitions for agent concepts
function defineAgentBlocks(BlocklyModule: typeof import("blockly")) {
  const { Blocks, pythonGenerator } = BlocklyModule as typeof import("blockly") & {
    pythonGenerator: {
      forBlock: Record<string, (block: unknown) => string>;
      valueToCode: (block: unknown, name: string, order: number) => string;
      ORDER_NONE: number;
    };
  };

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
      return `agent.observe("${what}")`;
    };

    pythonGenerator.forBlock["agent_listen"] = (block: unknown) => {
      const what = (block as { getFieldValue: (n: string) => string }).getFieldValue("WHAT");
      return `agent.listen("${what}")`;
    };

    pythonGenerator.forBlock["agent_decide"] = (block: unknown) => {
      const condition = pythonGenerator.valueToCode(block, "CONDITION", pythonGenerator.ORDER_NONE) || '"something"';
      const body = (BlocklyModule as unknown as { pythonGenerator: { statementToCode: (b: unknown, n: string) => string } }).pythonGenerator.statementToCode(block, "DO") || "  pass\n";
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
      const gen = (BlocklyModule as unknown as { pythonGenerator: { statementToCode: (b: unknown, n: string) => string } }).pythonGenerator;
      const yes = gen.statementToCode(block, "YES") || "  pass\n";
      const no = gen.statementToCode(block, "NO") || "  pass\n";
      return `if agent.check_result():\n${yes}else:\n${no}`;
    };

    pythonGenerator.forBlock["agent_loop"] = (block: unknown) => {
      const until = (block as { getFieldValue: (n: string) => string }).getFieldValue("UNTIL");
      const gen = (BlocklyModule as unknown as { pythonGenerator: { statementToCode: (b: unknown, n: string) => string } }).pythonGenerator;
      const body = gen.statementToCode(block, "BODY") || "  pass\n";
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

// Starter blocks XML
const STARTER_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
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
</xml>`;

export default function BlocklyAgentBuilder() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<unknown>(null);
  const [code, setCode] = useState("# Drag blocks to build your agent!\n# The Python code will appear here.");
  const [showCode, setShowCode] = useState(false);
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string[]>([]);

  // Initialize Blockly
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!blocklyDiv.current) return;

      // Dynamic import to avoid SSR
      const BlocklyModule = await import("blockly");
      const { pythonGenerator } = await import("blockly/python");

      if (!mounted) return;

      Blockly = BlocklyModule;

      // Attach pythonGenerator to module for our code generators
      (BlocklyModule as unknown as Record<string, unknown>).pythonGenerator = pythonGenerator;

      // Define custom blocks
      defineAgentBlocks(BlocklyModule);

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
      const xml = BlocklyModule.utils.xml.textToDom(STARTER_XML);
      BlocklyModule.Xml.domToWorkspace(xml, workspace);

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

  const resetWorkspace = useCallback(() => {
    if (!workspaceRef.current || !Blockly) return;
    const ws = workspaceRef.current as {
      clear: () => void;
    };
    ws.clear();
    const xml = Blockly.utils.xml.textToDom(STARTER_XML);
    Blockly.Xml.domToWorkspace(xml, workspaceRef.current as Parameters<typeof Blockly.Xml.domToWorkspace>[1]);
  }, []);

  const simulateRun = useCallback(() => {
    setRunning(true);
    setOutput([]);
    setShowCode(true);

    // Parse the code lines and simulate output
    const lines = code.split("\n").filter((l) => l.trim());
    let i = 0;

    const timer = setInterval(() => {
      if (i >= lines.length) {
        setOutput((prev) => [...prev, "", "✅ Agent finished!"]);
        setRunning(false);
        clearInterval(timer);
        return;
      }

      const line = lines[i]?.trim() ?? "";
      let msg = "";

      if (line.includes("agent.observe")) msg = `👀 Observing ${line.match(/"(.+?)"/)?.[1] ?? "..."}...`;
      else if (line.includes("agent.listen")) msg = `👂 Listening for ${line.match(/"(.+?)"/)?.[1] ?? "..."}...`;
      else if (line.includes("agent.say")) msg = `💬 "${line.match(/"(.+?)"/)?.[1] ?? "..."}"`;
      else if (line.includes("agent.do")) msg = `⚡ Doing: ${line.match(/"(.+?)"/)?.[1] ?? "..."}`;
      else if (line.includes("agent.use_tool")) msg = `🔧 Using tool: ${line.match(/"(.+?)"/)?.[1] ?? "..."}`;
      else if (line.includes("agent.remember")) msg = `💭 Remembered: ${line.match(/"(.+?)"/)?.[1] ?? "..."}`;
      else if (line.includes("agent.check")) msg = "✅ Checking result...";
      else if (line.includes("while")) msg = "🔄 Starting agent loop...";
      else if (line.startsWith("if ")) msg = "🧠 Making a decision...";
      else if (line.startsWith("else")) msg = "🧠 Trying another approach...";

      if (msg) setOutput((prev) => [...prev, msg]);
      i++;
    }, 800);

    return () => clearInterval(timer);
  }, [code]);

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
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border/40 text-foreground/70 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors"
          >
            <Code className="h-3.5 w-3.5" />
            {showCode ? "Hide" : "Show"} Python
          </button>
          <button
            type="button"
            onClick={simulateRun}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            Run Agent
          </button>
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

      {/* Blockly workspace */}
      <div className="rounded-xl border border-border overflow-hidden">
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
            <div className="p-4 text-xs font-mono max-h-60 overflow-y-auto space-y-1">
              {output.length === 0 ? (
                <p className="text-slate-500">
                  Click &quot;Run Agent&quot; to see your agent in action!
                </p>
              ) : (
                output.map((line, i) => (
                  <div
                    key={`${i}-${line}`}
                    className={`${
                      line.startsWith("✅ Agent finished")
                        ? "text-emerald-400 font-bold"
                        : "text-slate-300"
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
              {running && (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
