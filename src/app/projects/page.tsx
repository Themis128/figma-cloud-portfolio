import type { Metadata } from "next";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import SearchableProjects from "@/components/SearchableProjects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Portfolio of projects by Themistoklis Baltzakis - Network infrastructure, DevOps, web applications, and AI/data tools.",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 mb-12 md:mb-16">
            <AnimatedSection delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
                Projects
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-cyan-400 text-lg sm:text-xl font-semibold tracking-wide">
                Portfolio & Open Source Work
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                A collection of projects spanning network infrastructure, web
                development, DevOps, and AI/data tools.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Projects Gallery */}
          <AnimatedSection delay={0.3}>
            <SearchableProjects />
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
