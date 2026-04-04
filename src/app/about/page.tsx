import {
  Award,
  Briefcase,
  GraduationCap,
  Network,
  Server,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import { SectionNav } from "@/components/SectionNav";

const SkillsRadar = dynamic(
  () => import("@/components/interactive/SkillsRadar"),
);
const CountUpStats = dynamic(
  () => import("@/components/interactive/CountUpStats"),
);
const BadgesGrid = dynamic(
  () => import("@/components/interactive/BadgesGrid"),
);

const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "summary", label: "Summary" },
  { id: "focus-areas", label: "Focus Areas" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "badges", label: "Badges" },
  { id: "awards", label: "Awards" },
] as const;

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Learn about Themistoklis Baltzakis, IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
  openGraph: {
    title: "About Me | Themistoklis Baltzakis",
    description:
      "Learn about Themistoklis Baltzakis, IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
    url: `${SITE_URL}/about/`,
    type: "profile",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect" }],
  },
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "About", url: `${SITE_URL}/about/` },
        ]}
      />
      <CircuitBackground />
      <Navigation />

      <SectionNav sections={SECTIONS} ariaLabel="About page sections" />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <div id="hero" style={{ contain: "layout" }}>
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-20">
            <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                  About Me
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            </div>
            <div>
              <p className="text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
                IT Network Engineer
              </p>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                IT Network Engineer with over 15 years of extensive experience
                in network infrastructure, Cisco systems, and Fortinet security
                solutions.
              </p>
            </div>
          </div>
          </div>

          {/* Count-Up Stats */}
          <div className="mb-12 md:mb-20" style={{ contain: "layout" }}>
            <CountUpStats />
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Summary */}
            <div id="summary" style={{ contain: "layout" }}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Briefcase className="w-8 h-8 text-cyan-400" />
                  Professional Summary
                </h2>
                <div className="text-foreground/80 space-y-4 leading-relaxed">
                  <p>
                    Experienced IT Network Engineer specializing in Cisco
                    infrastructure and Fortinet security solutions. Proven
                    expertise in designing, maintaining, and troubleshooting
                    enterprise network systems, ensuring high availability and
                    performance for critical operations. Skilled in network
                    security, data center management, and supporting global
                    maritime transportation infrastructure.
                  </p>
                  <p>
                    My foundation combines a Computer Science degree with
                    industry certifications (AWS Certified Cloud Practitioner,
                    Cisco DevNet Associate) and hands-on experience across
                    network infrastructure, cybersecurity, and cloud migration
                    strategies. I excel at transforming complex technical
                    challenges into scalable, resilient systems that drive
                    business outcomes.
                  </p>
                  <p>
                    Beyond technical expertise, I&apos;m passionate about
                    technology as a catalyst for positive change. During
                    COVID-19, I supported vulnerable communities through
                    telecommunications services, then contributed to Athens
                    International Airport&apos;s critical infrastructure
                    rebuild, enabling safe travel and economic recovery. My work
                    bridges technical mastery with social impact, creating
                    solutions that are both efficient and meaningful.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Focus Areas */}
            <div id="focus-areas" style={{ contain: "layout" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 hover:scale-[1.02] transition-all duration-300 group min-h-50 flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto">
                    <Network className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">
                    Network Infrastructure
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Cisco Systems, Data Center Management & Enterprise
                    Networking
                  </p>
                </div>
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 hover:scale-[1.02] transition-all duration-300 group min-h-50 flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto">
                    <Shield className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">
                    Network Security
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Fortinet Firewalls, Identity Management & Threat
                    Protection
                  </p>
                </div>
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 hover:scale-[1.02] transition-all duration-300 group min-h-50 flex flex-col justify-center sm:col-span-2 lg:col-span-1">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-cyan-400/10 rounded-full mb-4 md:mb-6 group-hover:bg-cyan-400/20 transition-colors mx-auto">
                    <Server className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">
                    Cloud & Identity
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Azure AD, Microsoft 365, AWS & Multi-cloud Environments
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Radar */}
            <div style={{ contain: "layout" }}>
              <SkillsRadar />
            </div>

            {/* Skills & Certifications */}
            <div id="skills" style={{ contain: "layout" }}>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg">
                      <Award className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Top Skills
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "Cisco Systems & Network Infrastructure",
                      "Azure Active Directory & Identity Management",
                      "Fortinet Firewalls & Network Security",
                      "Microsoft 365 & Intune MDM/MAM",
                      "AWS Cloud Practitioner",
                      "Python & DevNet Automation",
                      "Kubernetes & Containerization",
                    ].map((skill) => (
                      <li
                        key={skill}
                        className="flex items-center gap-3 p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full shrink-0" />
                        <span className="text-foreground/90 font-medium">
                          {skill}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-cyan-400/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Certifications
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      "AWS Certified Cloud Practitioner",
                      "Cisco DevNet Associate",
                      "Cisco CCNA (Networking & Telecommunications)",
                      "Cisco CyberOps Associate",
                      "Kubernetes Fundamentals (LFS258)",
                      "Windows Server 2016: Installation & Configuration",
                      "Cisco Incubator 12.0 EMEA",
                    ].map((cert) => (
                      <li
                        key={cert}
                        className="flex items-center gap-3 p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full shrink-0" />
                        <span className="text-foreground/90 font-medium">
                          {cert}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Education */}
            <div id="education" style={{ contain: "layout" }}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-cyan-400" />
                  Education
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">
                        M.Sc. Data Analytics and Technologies
                      </div>
                      <div className="text-cyan-400 font-medium text-sm">
                        Bolton University | New York College
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        2025
                      </div>
                      <p className="text-foreground/70 text-sm mt-2">
                        Specialized in data analytics, machine learning, and
                        modern data technologies. Research focus on applying
                        analytics techniques to cybersecurity and network
                        performance optimization.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">
                        B.Sc. Computer Science
                      </div>
                      <div className="text-cyan-400 font-medium text-sm">
                        Hellenic Open University
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        2014 &ndash; 2022
                      </div>
                      <p className="text-foreground/70 text-sm mt-2">
                        Comprehensive foundation in computer science covering
                        algorithms, data structures, operating systems,
                        databases, software engineering, and networking. Studied
                        part-time alongside full-time professional career.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">
                        Cisco Incubator 12.0 EMEA &mdash; Customer Experience
                      </div>
                      <div className="text-cyan-400 font-medium text-sm">
                        Cisco Networking Academy
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        2024 &ndash; 2025
                      </div>
                      <p className="text-foreground/70 text-sm mt-2">
                        Selected for Cisco&apos;s competitive European
                        incubator program. Developed innovative customer
                        experience solutions and placed 3rd in the final
                        competition.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">
                        DevNet Associate Program
                      </div>
                      <div className="text-cyan-400 font-medium text-sm">
                        Cisco Networking Academy
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        2023 &ndash; 2024
                      </div>
                      <p className="text-foreground/70 text-sm mt-2">
                        Software development and automation for Cisco platforms
                        using Python, REST APIs, and network programmability.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="font-bold text-foreground">
                        CCNA Program &mdash; Networking &amp; Telecommunications
                      </div>
                      <div className="text-cyan-400 font-medium text-sm">
                        Cisco Networking Academy
                      </div>
                      <div className="text-muted-foreground text-sm mt-1">
                        2021 &ndash; 2022
                      </div>
                      <p className="text-foreground/70 text-sm mt-2">
                        Comprehensive networking curriculum covering routing,
                        switching, network security, and enterprise architecture.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credly Badges */}
            <div id="badges" style={{ contain: "layout" }}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Award className="w-8 h-8 text-cyan-400" />
                    Verified Digital Badges
                  </h3>
                  <a
                    href="https://www.credly.com/users/themistoklis-baltzakis"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-mono transition-colors"
                  >
                    View on Credly &rarr;
                  </a>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  16 verified badges across networking, cybersecurity, data
                  analytics, and software development.
                </p>
                <BadgesGrid />
              </div>
            </div>

            {/* Languages */}
            <div style={{ contain: "layout" }}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Languages
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">English</span>
                    <span className="text-cyan-400 font-medium">
                      Full Professional
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">Greek</span>
                    <span className="text-cyan-400 font-medium">
                      Native/Bilingual
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Honors & Awards */}
            <div id="awards" style={{ contain: "layout" }}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-lg p-8 border border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Award className="w-8 h-8 text-cyan-400" />
                  Honors & Awards
                </h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">
                        3rd Place, Cisco Incubator 12.0
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Customer Experience Track
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                    <div>
                      <div className="font-medium">Scholarship Recipient</div>
                      <div className="text-muted-foreground text-sm">
                        Academic Excellence
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <Link
                href="/contact/"
                className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-background rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
