"use client";

import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { Component, type ErrorInfo, type ReactNode } from "react";

class BlocklyErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("BlocklyAgentBuilder failed to load:", error, info); // eslint-disable-line no-console
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-foreground/50">
          <AlertTriangle className="w-8 h-8 text-yellow-400/60" />
          <p className="text-sm font-mono">Block editor failed to load</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const BlocklyAgentBuilder = dynamic(
  () => import("@/components/agents/BlocklyAgentBuilder"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground font-mono animate-pulse">
          Loading block editor...
        </p>
      </div>
    ),
  },
);

export default function BlocklyAgentBuilderWrapper() {
  return (
    <BlocklyErrorBoundary>
      <BlocklyAgentBuilder />
    </BlocklyErrorBoundary>
  );
}
