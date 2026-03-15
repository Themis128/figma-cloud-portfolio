import type { ResumeFormData, ResumeTemplate, TemplateName } from "@/types/resume-builder";
import { renderBold } from "./bold";
import { renderClassic } from "./classic";
import { renderCreative } from "./creative";
import { renderEmerald } from "./emerald";
import { renderExecutive } from "./executive";
import { renderMinimal } from "./minimal";
import { renderModern } from "./modern";

export const templates: Record<TemplateName, ResumeTemplate> = {
  classic: {
    name: "classic",
    label: "Classic",
    description: "Traditional single-column layout with serif headings. Most ATS-friendly.",
    render: renderClassic,
  },
  modern: {
    name: "modern",
    label: "Modern",
    description: "Clean sans-serif design with accent colors and skill tags.",
    render: renderModern,
  },
  minimal: {
    name: "minimal",
    label: "Minimal",
    description: "Maximum whitespace with two-column date layout. Elegant and concise.",
    render: renderMinimal,
  },
  executive: {
    name: "executive",
    label: "Executive",
    description: "Navy header with serif body. Professional and authoritative.",
    render: renderExecutive,
  },
  creative: {
    name: "creative",
    label: "Creative",
    description: "Purple gradient header with timeline dots and rounded skill pills.",
    render: renderCreative,
  },
  bold: {
    name: "bold",
    label: "Bold",
    description: "Dark header with red accents. High contrast and impactful.",
    render: renderBold,
  },
  emerald: {
    name: "emerald",
    label: "Emerald",
    description: "Green sidebar layout with skills and certs on the left.",
    render: renderEmerald,
  },
};

export const templateList = Object.values(templates);

export function renderResume(data: ResumeFormData, templateName: TemplateName): string {
  return templates[templateName].render(data);
}
