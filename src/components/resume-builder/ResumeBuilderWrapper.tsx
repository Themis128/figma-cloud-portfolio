"use client";

import dynamic from "next/dynamic";

const ResumeBuilder = dynamic(
  () =>
    import("./ResumeBuilder").then((mod) => ({
      default: mod.ResumeBuilder,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-foreground/50 font-mono">
            Loading CV Builder...
          </p>
        </div>
      </div>
    ),
  },
);

export function ResumeBuilderWrapper() {
  return <ResumeBuilder />;
}
