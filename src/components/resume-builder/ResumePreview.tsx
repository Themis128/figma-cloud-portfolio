"use client";

import type { ResumeFormData, TemplateName } from "@/types/resume-builder";
import { renderResume } from "@/lib/resume-templates";
import { useMemo } from "react";

interface ResumePreviewProps {
  data: ResumeFormData;
  template: TemplateName;
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  const html = useMemo(() => renderResume(data, template), [data, template]);

  return (
    <div className="h-full flex flex-col">
      <div className="text-xs font-mono uppercase tracking-wider text-foreground/40 mb-2">
        Live Preview
      </div>
      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white relative">
        <iframe
          srcDoc={html}
          title="Resume Preview"
          className="w-full h-full"
          sandbox="allow-same-origin"
          style={{
            transform: "scale(0.75)",
            transformOrigin: "top left",
            width: "133.33%",
            height: "133.33%",
          }}
        />
      </div>
    </div>
  );
}
