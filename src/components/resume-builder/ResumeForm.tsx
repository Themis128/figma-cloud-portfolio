"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CertificationsForm,
  EducationForm,
  ExperienceForm,
  PersonalInfoForm,
  ProjectsForm,
  SkillsForm,
  SummaryForm,
} from "./form-sections";

const sections = [
  { value: "personal", label: "Personal", component: PersonalInfoForm },
  { value: "summary", label: "Summary", component: SummaryForm },
  { value: "experience", label: "Experience", component: ExperienceForm },
  { value: "education", label: "Education", component: EducationForm },
  { value: "certifications", label: "Certs", component: CertificationsForm },
  { value: "skills", label: "Skills", component: SkillsForm },
  { value: "projects", label: "Projects", component: ProjectsForm },
] as const;

export function ResumeForm() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="personal" className="flex-1 flex flex-col">
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-foreground/5 p-1 rounded-lg">
          {sections.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-xs data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {sections.map(({ value, component: Component }) => (
            <TabsContent key={value} value={value} className="mt-0">
              <Component />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
