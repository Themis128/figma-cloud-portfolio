"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeFormData } from "@/types/resume-builder";

export function ProjectsForm() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ResumeFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400">
          Projects
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
          onClick={() =>
            append({ name: "", description: "", url: "", technologies: [] })
          }
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-foreground/40 text-center py-6">
          No projects added yet. Click &quot;Add&quot; to showcase your work.
        </p>
      )}

      {fields.map((field, index) => (
        <ProjectEntry
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

function ProjectEntry({
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
  const [newTech, setNewTech] = useState("");
  const technologies = watch(`projects.${index}.technologies`) ?? [];
  const projErrors = errors.projects?.[index];

  function addTech() {
    const trimmed = newTech.trim();
    if (!trimmed || technologies.includes(trimmed)) return;
    setValue(`projects.${index}.technologies`, [...technologies, trimmed]);
    setNewTech("");
  }

  function removeTech(tIndex: number) {
    setValue(
      `projects.${index}.technologies`,
      technologies.filter((_, i) => i !== tIndex),
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
          <Label className="text-xs text-foreground/70">Project Name *</Label>
          <Input
            placeholder="Network Automation Framework"
            className="mt-1 bg-background/50 border-border focus:border-cyan-400"
            {...register(`projects.${index}.name`)}
          />
          {projErrors?.name && (
            <p className="text-xs text-red-400 mt-1">{projErrors.name.message}</p>
          )}
        </div>
        <div>
          <Label className="text-xs text-foreground/70">URL</Label>
          <Input
            placeholder="https://github.com/..."
            className="mt-1 bg-background/50 border-border focus:border-cyan-400"
            {...register(`projects.${index}.url`)}
          />
          {projErrors?.url && (
            <p className="text-xs text-red-400 mt-1">{projErrors.url.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <Label className="text-xs text-foreground/70">Description *</Label>
          <Textarea
            placeholder="Built a Python-based framework for automated network device configuration..."
            rows={3}
            className="mt-1 bg-background/50 border-border focus:border-cyan-400 resize-none"
            {...register(`projects.${index}.description`)}
          />
          {projErrors?.description && (
            <p className="text-xs text-red-400 mt-1">{projErrors.description.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label className="text-xs text-foreground/70">Technologies</Label>
        <div className="flex flex-wrap gap-1.5 mt-1 min-h-[28px]">
          {technologies.map((tech, tIdx) => (
            <Badge
              key={tIdx}
              variant="secondary"
              className="bg-cyan-400/10 text-cyan-400 border-cyan-400/20 gap-1 pr-1"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTech(tIdx)}
                className="hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Type a technology and press Enter"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTech();
              }
            }}
            className="bg-background/50 border-border focus:border-cyan-400 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-cyan-400 shrink-0"
            onClick={addTech}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
