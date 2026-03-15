"use client";

import { templateList } from "@/lib/resume-templates";
import type { TemplateName } from "@/types/resume-builder";
import { cn } from "@/lib/utils";

const templateColors: Record<TemplateName, string> = {
  classic: "bg-gray-800",
  modern: "bg-sky-500",
  minimal: "bg-gray-400",
  executive: "bg-blue-900",
  creative: "bg-purple-500",
  bold: "bg-red-500",
  emerald: "bg-emerald-600",
};

interface TemplateSelectorProps {
  value: TemplateName;
  onChange: (template: TemplateName) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="text-xs font-mono uppercase tracking-wider text-foreground/40">
        Template
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {templateList.map((tmpl) => (
          <button
            key={tmpl.name}
            type="button"
            onClick={() => onChange(tmpl.name)}
            className={cn(
              "min-w-22.5 shrink-0 sm:shrink sm:flex-1 px-3 py-2 rounded-lg border-2 text-left transition-all text-sm",
              value === tmpl.name
                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                : "border-border bg-foreground/5 text-foreground/60 hover:border-foreground/20",
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-3 h-3 rounded-full shrink-0",
                  templateColors[tmpl.name],
                )}
              />
              <span className="font-medium">{tmpl.label}</span>
            </div>
            <div className="text-xs text-foreground/40 mt-0.5 hidden lg:block">
              {tmpl.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
