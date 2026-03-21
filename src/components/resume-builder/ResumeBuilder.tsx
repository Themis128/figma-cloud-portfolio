"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import {
  type ResumeFormData,
  type TemplateName,
  defaultResumeData,
  resumeFormSchema,
  sampleResumeData,
} from "@/types/resume-builder";
import { ExportControls } from "./ExportControls";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";
import { TemplateSelector } from "./TemplateSelector";

const STORAGE_KEY = "resume-builder-data";
const TEMPLATE_KEY = "resume-builder-template";

function loadFromStorage(): ResumeFormData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResumeFormData;
  } catch {
    return null;
  }
}

function loadTemplateFromStorage(): TemplateName {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY);
    const valid: TemplateName[] = ["classic", "modern", "minimal", "executive", "creative", "bold", "emerald"];
    if (valid.includes(raw as TemplateName)) return raw as TemplateName;
  } catch {
    // ignore
  }
  return "modern";
}

export function ResumeBuilder() {
  const [template, setTemplate] = useState<TemplateName>(loadTemplateFromStorage);

  const form = useForm<ResumeFormData>({
    resolver: standardSchemaResolver(resumeFormSchema) as unknown as Resolver<ResumeFormData>,
    defaultValues: loadFromStorage() ?? defaultResumeData,
    mode: "onChange",
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const formData = form.watch();

  // Auto-save to localStorage (debounced via effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  // Save template preference
  useEffect(() => {
    localStorage.setItem(TEMPLATE_KEY, template);
  }, [template]);

  const handleLoadSample = useCallback(() => {
    form.reset(sampleResumeData);
  }, [form]);

  const handleReset = useCallback(() => {
    form.reset(defaultResumeData);
    localStorage.removeItem(STORAGE_KEY);
  }, [form]);

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <TemplateSelector value={template} onChange={setTemplate} />
        <ExportControls
          data={formData}
          template={template}
          onLoadSample={handleLoadSample}
          onReset={handleReset}
        />
      </div>

      {/* Main layout: form + preview */}
      <FormProvider {...form}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form panel */}
          <div className="bg-foreground/5 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 min-h-[500px]">
            <ResumeForm />
          </div>

          {/* Preview panel */}
          <div className="min-h-[600px] lg:min-h-0">
            <ResumePreview data={formData} template={template} />
          </div>
        </div>
      </FormProvider>
    </div>
  );
}
