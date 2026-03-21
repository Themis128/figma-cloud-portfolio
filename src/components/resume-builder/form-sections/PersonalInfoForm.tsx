"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeFormData } from "@/types/resume-builder";

export function PersonalInfoForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const fields = [
    { name: "personalInfo.name" as const, label: "Full Name", placeholder: "Alex Johnson", required: true },
    { name: "personalInfo.title" as const, label: "Job Title", placeholder: "Senior Network Engineer", required: true },
    { name: "personalInfo.email" as const, label: "Email", placeholder: "alex@example.com", type: "email", required: true },
    { name: "personalInfo.phone" as const, label: "Phone", placeholder: "+1 (555) 123-4567" },
    { name: "personalInfo.location" as const, label: "Location", placeholder: "San Francisco, CA" },
    { name: "personalInfo.linkedIn" as const, label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
    { name: "personalInfo.github" as const, label: "GitHub URL", placeholder: "https://github.com/..." },
    { name: "personalInfo.website" as const, label: "Website", placeholder: "https://..." },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
        Personal Information
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const error = field.name.split(".").reduce<Record<string, unknown> | undefined>(
            (obj, key) => (obj as Record<string, unknown> | undefined)?.[key] as Record<string, unknown> | undefined,
            errors as unknown as Record<string, unknown>,
          );
          return (
            <div key={field.name} className={field.name === "personalInfo.name" || field.name === "personalInfo.title" ? "sm:col-span-2" : ""}>
              <Label htmlFor={field.name} className="text-sm text-foreground/70">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              <Input
                id={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                className="mt-1 bg-background/50 border-border focus:border-cyan-400 focus:ring-cyan-400/20"
                {...register(field.name)}
              />
              {error && typeof error === "object" && "message" in error && (
                <p className="text-xs text-red-400 mt-1">{error.message as string}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
