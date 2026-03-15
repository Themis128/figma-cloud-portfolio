"use client";

import dynamic from "next/dynamic";

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
  return <BlocklyAgentBuilder />;
}
