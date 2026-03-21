import type { Metadata } from "next";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import { ResumePageTabs } from "@/components/resume/ResumePageTabs";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "CV Builder & Career Guide",
  description:
    "Build a professional CV with our interactive builder, or learn how to write a resume that beats ATS systems. Practical tips for IT professionals.",
  openGraph: {
    title: "CV Builder & Career Guide | Themistoklis Baltzakis",
    description:
      "Build a professional CV with our interactive builder, or learn how to write a resume that beats ATS systems. Practical tips for IT professionals.",
    url: `${SITE_URL}/resume/`,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/resume/` },
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "CV Builder & Career Guide", url: `${SITE_URL}/resume/` },
        ]}
      />
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 mb-12 md:mb-16">
            <AnimatedSection delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                CV Builder & Career Guide
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-cyan-400 text-lg sm:text-xl font-semibold tracking-wide">
                Build Your Professional CV or Master ATS Optimization
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                Create a polished, ATS-friendly resume with our interactive
                builder, or dive into the career guide to learn what makes IT
                resumes stand out.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Tabs: Builder + ATS Guide */}
          <div className="max-w-6xl mx-auto">
            <ResumePageTabs />
          </div>
        </div>
      </main>
    </div>
  );
}
