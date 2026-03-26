import { Globe as GlobeIcon, Linkedin, Mail } from "lucide-react";
import type { Metadata } from "next";
import AIBrain from "@/components/AIBrain";
import { AnimatedSection } from "@/components/AnimatedSection";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverButton, HoverIcon } from "@/components/HoverAnimations";
import CyberQuiz from "@/components/interactive/CyberQuiz";
import GitHubHeatmap from "@/components/interactive/GitHubHeatmap";
import SiteStats from "@/components/interactive/SiteStats";
import TerminalHint from "@/components/interactive/TerminalHint";
import Testimonials from "@/components/interactive/Testimonials";
import TypeWriter from "@/components/interactive/TypeWriter";
import Navigation from "@/components/Navigation";
import QuickContactForm from "@/components/QuickContactForm";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Home | Themistoklis Baltzakis",
  description:
    "Cloud Architect & Network Engineer with 15+ years in Cisco, Fortinet, AWS, and enterprise security. Scalable infrastructure & modern web apps.",
  openGraph: {
    title: "Home | Themistoklis Baltzakis",
    description:
      "Cloud Architect & Network Engineer with 15+ years in Cisco, Fortinet, AWS, and enterprise security. Scalable infrastructure & modern web apps.",
    url: `${SITE_URL}/`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect" }],
  },
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[{ name: "Home", url: `${SITE_URL}/` }]}
      />
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
                <AvailabilityBadge delay={0.05} />
                  <h1
                    id="hero-heading"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                    <span className="block text-foreground/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 md:mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                      Themistoklis
                    </span>{" "}
                    <span className="block text-foreground uppercase tracking-wider leading-tight">
                      Baltzakis
                    </span>{" "}
                    <span className="block text-cyan-400/90 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide mt-2 normal-case">
                      IT Network Engineer &amp; Cloud Architect
                    </span>
                  </h1>
                <div>
                  <p className="text-cyan-400 text-base sm:text-lg md:text-xl font-semibold tracking-wide">
                    <TypeWriter
                      words={[
                        'Cybersecurity Specialist',
                        'DevOps Engineer',
                        'Azure AD & M365 Administrator',
                        'Data Center Expert',
                      ]}
                      typingSpeed={80}
                      deletingSpeed={40}
                      pauseTime={2500}
                    />
                  </p>
                  <div className="w-12 sm:w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mb-3 md:mb-4" />
                  <TerminalHint />
                </div>
                <div>
                  <p className="text-foreground/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
                    IT Network Engineer with over 15 years of extensive
                    experience in network infrastructure, Cisco systems, and
                    Fortinet security solutions. Specializing in data center
                    management, Azure AD, Microsoft 365 administration, and
                    AWS cloud environments.
                  </p>
                  <p className="text-foreground/60 text-sm sm:text-base leading-relaxed max-w-2xl mt-3">
                    From designing secure enterprise networks to building
                    modern web applications with React, Next.js, and
                    serverless architectures. I bridge the gap between
                    infrastructure engineering and full-stack development.
                  </p>
                </div>
              </div>

              <AnimatedSection
                delay={0.4}
                className="flex flex-col sm:flex-row gap-3 md:gap-4"
              >
                <HoverButton>
                  <a
                    href="/contact/"
                    className="group relative px-8 sm:px-10 py-3.5 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 uppercase text-sm tracking-wider text-center min-h-11 flex items-center justify-center"
                  >
                    <span className="relative z-10">Get In Touch</span>
                  </a>
                </HoverButton>
                <HoverButton>
                  <a
                    href="/about/"
                    className="group relative px-6 sm:px-8 py-3 bg-transparent border-2 border-cyan-400/40 hover:border-cyan-400 text-foreground/80 hover:text-foreground rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 uppercase text-xs sm:text-sm tracking-wider font-medium text-center min-h-11 flex items-center justify-center"
                  >
                    <span className="relative z-10">Learn More</span>
                    <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors duration-300 rounded-md" />
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
                    aria-label="Portfolio website"
                  >
                    <GlobeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="sr-only">Portfolio website</span>
                  </a>
                </HoverIcon>
              </AnimatedSection>
            </section>

            {/* Right side - AI Brain visualization (deferred for LCP) */}
            <section
              className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0"
              aria-label="Interactive AI visualization"
              style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
            >
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <AIBrain />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Core expertise section */}
      <section
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16"
        aria-label="Core expertise"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={0.55} className="text-center space-y-4">
            <h2 className="text-foreground/60 uppercase tracking-[0.15em] text-sm font-mono mb-2">
              Core Expertise
            </h2>
            <div className="w-12 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
              With deep expertise in Cisco routing and switching, Fortinet
              firewall management, and enterprise network security, I deliver
              reliable, high-performance infrastructure for organizations of all
              sizes. My background spans data center operations, VPN
              configuration, network monitoring, and disaster recovery planning.
            </p>
            <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
              Beyond traditional networking, I bring hands-on experience with
              cloud platforms including AWS and Azure, containerization with
              Docker and Kubernetes, and modern DevOps practices. I hold
              certifications in Cisco, Fortinet, and AWS, and I am passionate
              about continuous learning and adopting emerging technologies to
              solve real-world problems.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Site stats */}
      <section
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16"
        aria-label="Site statistics"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={0.6}>
            <SiteStats />
          </AnimatedSection>
        </div>
      </section>

      {/* GitHub activity */}
      <section
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16"
        aria-label="GitHub activity"
      >
        <div className="max-w-3xl mx-auto">
          <AnimatedSection delay={0.65} className="text-center mb-4">
            <h2 className="text-foreground/60 uppercase tracking-[0.15em] text-sm font-mono mb-2">
              Open Source
            </h2>
            <div className="w-12 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
          </AnimatedSection>
          <AnimatedSection delay={0.7}>
            <GitHubHeatmap />
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16"
        aria-label="Testimonials"
      >
        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={0.7} className="text-center mb-4">
            <h2 className="text-foreground/60 uppercase tracking-[0.15em] text-sm font-mono mb-2">
              What Colleagues Say
            </h2>
            <div className="w-12 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
          </AnimatedSection>
          <AnimatedSection delay={0.75}>
            <Testimonials />
          </AnimatedSection>
        </div>
      </section>

      {/* Challenge quiz */}
      <section
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16"
        aria-label="Challenge quiz"
      >
        <div className="max-w-xl mx-auto">
          <AnimatedSection delay={0.75} className="text-center mb-4">
            <h2 className="text-foreground/60 uppercase tracking-[0.15em] text-sm font-mono mb-2">
              Test Your Knowledge
            </h2>
            <p className="text-foreground/50 text-sm">
              A quick cybersecurity &amp; cloud quiz. How do you score?
            </p>
            <div className="w-12 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-2" />
          </AnimatedSection>
          <AnimatedSection delay={0.8}>
            <CyberQuiz />
          </AnimatedSection>
        </div>
      </section>

      {/* Quick contact section */}
      <section
        id="quick-contact"
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-16 md:pb-24"
        aria-label="Quick contact form"
      >
        <div className="max-w-lg mx-auto">
          <AnimatedSection delay={0.85} className="text-center mb-6">
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
