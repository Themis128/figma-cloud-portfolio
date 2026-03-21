"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeFormData } from "@/types/resume-builder";

export function EducationForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
          Education
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={() =>
            append({
              institution: "",
              degree: "",
              field: "",
              startDate: "",
              endDate: "",
              gpa: "",
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-foreground/40 text-center py-6">
          No education added yet. Click &quot;Add&quot; to get started.
        </p>
      )}

      {fields.map((field, index) => {
        const eduErrors = errors.education?.[index];
        return (
          <div
            key={field.id}
            className="bg-foreground/5 border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-foreground/40">#{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs text-foreground/70">Institution *</Label>
                <Input
                  placeholder="University of Texas at Austin"
                  className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                  {...register(`education.${index}.institution`)}
                />
                {eduErrors?.institution && (
                  <p className="text-xs text-red-400 mt-1">{eduErrors.institution.message}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-foreground/70">Degree *</Label>
                <Input
                  placeholder="Bachelor of Science"
                  className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                  {...register(`education.${index}.degree`)}
                />
                {eduErrors?.degree && (
                  <p className="text-xs text-red-400 mt-1">{eduErrors.degree.message}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-foreground/70">Field of Study *</Label>
                <Input
                  placeholder="Computer Science"
                  className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                  {...register(`education.${index}.field`)}
                />
                {eduErrors?.field && (
                  <p className="text-xs text-red-400 mt-1">{eduErrors.field.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-foreground/70">Start *</Label>
                  <Input
                    type="month"
                    className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                    {...register(`education.${index}.startDate`)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-foreground/70">End</Label>
                  <Input
                    type="month"
                    className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                    {...register(`education.${index}.endDate`)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-foreground/70">GPA</Label>
                <Input
                  placeholder="3.7"
                  className="mt-1 bg-background/50 border-border focus:border-cyan-400"
                  {...register(`education.${index}.gpa`)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
