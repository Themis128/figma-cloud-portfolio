import { Globe as GlobeIcon, Linkedin, Mail } from "lucide-react";
import type { Metadata } from "next";

import AIBrain from "@/components/AIBrain";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverButton, HoverIcon } from "@/components/HoverAnimations";
import Navigation from "@/components/Navigation";
import QuickContactForm from "@/components/QuickContactForm";

export const metadata: Metadata = {
  title: "Home | Themistoklis Baltzakis",
  description:
    "Full-stack developer specializing in React, Next.js, AWS, and cloud solutions. Building modern, scalable web applications with cutting-edge technologies.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      {/* Circuit background */}
      <CircuitBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main
        id="main-content"
        className="relative z-10 min-h-screen flex items-center"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Left side - Text content */}
            <section
              className="space-y-6 md:space-y-8 lg:space-y-12"
              aria-labelledby="hero-heading"
            >
              <div className="space-y-3 md:space-y-4">
                <AnimatedSection delay={0.1}>
                  <h1
                    id="hero-heading"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                    <span className="block text-foreground/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 md:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                      Themistoklis
                    </span>
                    <span className="block text-foreground uppercase tracking-wider leading-tight">
                      Baltzakis
                    </span>
                  </h1>
                </AnimatedSection>
                <AnimatedSection delay={0.2}>
                  <p className="text-cyan-400 text-base sm:text-lg md:text-xl font-semibold tracking-wide">
                    IT Network Engineer
                  </p>
                  <div className="w-12 sm:w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mb-3 md:mb-4" />
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <p className="text-foreground/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                    IT Network Engineer with over 15 years of extensive
                    experience in network infrastructure, Cisco systems, and
                    Fortinet security solutions.
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection
                delay={0.4}
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <HoverButton>
                  <a
                    href="/about/"
                    className="group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-foreground/90 hover:text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-11 flex items-center justify-center"
                  >
                    <span className="relative z-10">Learn More</span>
                    <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300 rounded-md" />
                  </a>
                </HoverButton>
                <HoverButton>
                  <a
                    href="/resume/"
                    className="group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-border/30 hover:border-border/60 text-foreground/80 hover:text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-foreground/10 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-11 flex items-center justify-center"
                  >
                    <span className="relative z-10">Build Resume</span>
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 rounded-md" />
                  </a>
                </HoverButton>
                <HoverButton>
                  <a
                    href="/contact/"
                    className="group relative px-6 sm:px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-11 flex items-center justify-center"
                  >
                    <span className="relative z-10">Get In Touch</span>
                  </a>
                </HoverButton>
              </AnimatedSection>

              {/* Social media icons */}
              <AnimatedSection
                delay={0.5}
                className="flex items-center justify-center sm:justify-start gap-4 md:gap-6 pt-6 md:pt-8"
              >
                <HoverIcon>
                  <a
                    href="https://www.linkedin.com/in/baltzakis-themis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-11 min-h-11 flex items-center justify-center"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </HoverIcon>
                <HoverIcon>
                  <a
                    href="mailto:baltzakis.themis@gmail.com"
                    className="text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-11 min-h-11 flex items-center justify-center"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </HoverIcon>
                <HoverIcon>
                  <a
                    href="https://www.baltzakisthemis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-cyan-400 transition-colors duration-300 p-2 min-w-11 min-h-11 flex items-center justify-center"
                    aria-label="Portfolio"
                  >
                    <GlobeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </HoverIcon>
              </AnimatedSection>
            </section>

            {/* Right side - AI Brain visualization */}
            <section
              className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
              aria-label="Interactive AI visualization"
            >
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <AIBrain />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Quick contact section */}
      <section
        id="quick-contact"
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-16 md:pb-24"
        aria-label="Quick contact form"
      >
        <div className="max-w-lg mx-auto">
          <AnimatedSection delay={0.6} className="text-center mb-6">
            <h2 className="text-foreground/60 uppercase tracking-[0.15em] text-sm font-mono mb-2">
              Quick Contact
            </h2>
            <div className="w-12 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
          </AnimatedSection>
          <QuickContactForm />
        </div>
      </section>
    </div>
  );
}
