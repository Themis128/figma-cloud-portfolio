"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeFormData } from "@/types/resume-builder";

export function SkillsForm() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
          Skills
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={() => append({ category: "", items: [] })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-foreground/40 text-center py-6">
          No skill categories added yet. Click &quot;Add Category&quot; to organize your skills.
        </p>
      )}

      {fields.map((field, index) => (
        <SkillCategoryEntry
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

function SkillCategoryEntry({
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
  const [newSkill, setNewSkill] = useState("");
  const items = watch(`skills.${index}.items`) ?? [];
  const catErrors = errors.skills?.[index];

  function addSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || items.includes(trimmed)) return;
    setValue(`skills.${index}.items`, [...items, trimmed]);
    setNewSkill("");
  }

  function removeSkill(sIndex: number) {
    setValue(
      `skills.${index}.items`,
      items.filter((_, i) => i !== sIndex),
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

      <div>
        <Label className="text-xs text-foreground/70">Category Name *</Label>
        <Input
          placeholder="e.g., Networking, Cloud & DevOps, Security"
          className="mt-1 bg-background/50 border-border focus:border-cyan-400"
          {...register(`skills.${index}.category`)}
        />
        {catErrors?.category && (
          <p className="text-xs text-red-400 mt-1">{catErrors.category.message}</p>
        )}
      </div>

      <div>
        <Label className="text-xs text-foreground/70">Skills</Label>
        <div className="flex flex-wrap gap-1.5 mt-1 min-h-[28px]">
          {items.map((skill, sIdx) => (
            <Badge
              key={sIdx}
              variant="secondary"
              className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 gap-1 pr-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(sIdx)}
                className="hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Type a skill and press Enter"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            className="bg-background/50 border-border focus:border-cyan-400 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-cyan-400 shrink-0"
            onClick={addSkill}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {catErrors?.items && (
          <p className="text-xs text-red-400 mt-1">{catErrors.items.message}</p>
        )}
      </div>
    </div>
  );
}
