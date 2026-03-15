"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Hammer } from "lucide-react";
import { ResumeBuilderWrapper } from "@/components/resume-builder";
import { ATSGuideContent } from "./ATSGuideContent";

export function ResumePageTabs() {
  return (
    <Tabs defaultValue="builder" className="w-full">
      <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-12 bg-foreground/5 border border-border rounded-lg p-1">
        <TabsTrigger
          value="builder"
          className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400 gap-2 font-medium"
        >
          <Hammer className="h-4 w-4" />
          Build Your CV
        </TabsTrigger>
        <TabsTrigger
          value="guide"
          className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400 gap-2 font-medium"
        >
          <FileText className="h-4 w-4" />
          ATS Guide
        </TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="mt-8">
        <ResumeBuilderWrapper />
      </TabsContent>

      <TabsContent value="guide" className="mt-8">
        <ATSGuideContent />
      </TabsContent>
    </Tabs>
  );
}
