"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeFormData } from "@/types/resume-builder";

export function SummaryForm() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const summary = watch("summary") ?? "";
  const charCount = summary.length;
  const maxChars = 500;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
        Professional Summary
      </h3>
      <div>
        <Label htmlFor="summary" className="text-sm text-foreground/70">
          A brief overview of your experience and goals
        </Label>
        <Textarea
          id="summary"
          placeholder="Experienced network engineer with 8+ years designing enterprise network infrastructure..."
          rows={5}
          className="mt-1 bg-background/50 border-border focus:border-cyan-400 focus:ring-cyan-400/20 resize-none"
          {...register("summary")}
        />
        <div className="flex justify-between mt-1">
          {errors.summary && (
            <p className="text-xs text-red-400">{errors.summary.message}</p>
          )}
          <p
            className={`text-xs ml-auto ${
              charCount > maxChars ? "text-red-400" : "text-foreground/40"
            }`}
          >
            {charCount}/{maxChars}
          </p>
        </div>
      </div>
    </div>
  );
}
