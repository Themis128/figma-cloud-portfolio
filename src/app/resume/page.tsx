import type { Metadata } from "next";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import {
  ResumeBuilderHero,
  FeaturePreview,
  TemplateShowcase,
} from "@/components/ResumeBuilder";

export const metadata: Metadata = {
  title: "Resume Builder",
  description:
    "Interactive resume builder coming soon. Check back for an AI-powered resume generation tool.",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />
      <main id="main-content" className="relative z-10 min-h-screen">
        <ResumeBuilderHero />
        <FeaturePreview />
        <TemplateShowcase />
      </main>
    </div>
  );
}
