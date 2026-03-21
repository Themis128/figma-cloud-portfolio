"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeFormData } from "@/types/resume-builder";

export function ExperienceForm() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
          Work Experience
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={() =>
            append({
              company: "",
              role: "",
              location: "",
              startDate: "",
              endDate: "",
              current: false,
              highlights: [],
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-foreground/40 text-center py-6">
          No work experience added yet. Click &quot;Add&quot; to get started.
        </p>
      )}

      {fields.map((field, index) => (
        <ExperienceEntry
          key={field.id}
          index={index}
          onRemove={() => remove(index)}
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
      ))}
    </div>
  );
}

function ExperienceEntry({
  index,
  onRemove,
  register,
  watch,
  setValue,
  errors,
}: {
  index: number;
  onRemove: () => void;
  register: ReturnType<typeof useFormContext<ResumeFormData>>["register"];
  watch: ReturnType<typeof useFormContext<ResumeFormData>>["watch"];
  setValue: ReturnType<typeof useFormContext<ResumeFormData>>["setValue"];
  errors: ReturnType<typeof useFormContext<ResumeFormData>>["formState"]["errors"];
}) {
  const [newHighlight, setNewHighlight] = useState("");
  const isCurrent = watch(`experience.${index}.current`);
  const highlights = watch(`experience.${index}.highlights`) ?? [];
  const expErrors = errors.experience?.[index];

  function addHighlight() {
    const trimmed = newHighlight.trim();
    if (!trimmed) return;
    setValue(`experience.${index}.highlights`, [...highlights, trimmed]);
    setNewHighlight("");
  }

  function removeHighlight(hIndex: number) {
    setValue(
      `experience.${index}.highlights`,
      highlights.filter((_, i) => i !== hIndex),
    );
  }

  return (
    <div className="bg-foreground/5 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-foreground/40">#{index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-foreground/70">Role *</Label>
          <Input
            placeholder="Senior Network Engineer"
            className="mt-1 bg-background/50 border-border focus:border-cyan-400"
            {...register(`experience.${index}.role`)}
          />
          {expErrors?.role && (
            <p className="text-xs text-red-400 mt-1">{expErrors.role.message}</p>
          )}
        </div>
        <div>
          <Label className="text-xs text-foreground/70">Company *</Label>
          <Input
            placeholder="CloudTech Solutions"
            className="mt-1 bg-background/50 border-border focus:border-cyan-400"
            {...register(`experience.${index}.company`)}
          />
          {expErrors?.company && (
            <p className="text-xs text-red-400 mt-1">{expErrors.company.message}</p>
          )}
        </div>
        <div>
          <Label className="text-xs text-foreground/70">Location</Label>
          <Input
            placeholder="San Francisco, CA"
            className="mt-1 bg-background/50 border-border focus:border-cyan-400"
            {...register(`experience.${index}.location`)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-foreground/70">Start *</Label>
            <Input
              type="month"
              className="mt-1 bg-background/50 border-border focus:border-cyan-400"
              {...register(`experience.${index}.startDate`)}
            />
          </div>
          <div>
            <Label className="text-xs text-foreground/70">End</Label>
            <Input
              type="month"
              disabled={isCurrent}
              className="mt-1 bg-background/50 border-border focus:border-cyan-400 disabled:opacity-40"
              {...register(`experience.${index}.endDate`)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`current-${index}`}
          checked={isCurrent}
          onCheckedChange={(checked) =>
            setValue(`experience.${index}.current`, checked === true)
          }
        />
        <Label htmlFor={`current-${index}`} className="text-xs text-foreground/70 cursor-pointer">
          Currently working here
        </Label>
      </div>

      <div>
        <Label className="text-xs text-foreground/70">Key Achievements</Label>
        <div className="space-y-1 mt-1">
          {highlights.map((h, hIdx) => (
            <div key={hIdx} className="flex items-start gap-2 text-sm">
              <span className="text-foreground/40 mt-0.5">•</span>
              <span className="flex-1">{h}</span>
              <button
                type="button"
                onClick={() => removeHighlight(hIdx)}
                className="text-foreground/30 hover:text-red-400 mt-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Reduced network incidents by 60%..."
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
            className="bg-background/50 border-border focus:border-cyan-400 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-cyan-400 shrink-0"
            onClick={addHighlight}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
