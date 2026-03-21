import {
  Award,
  Briefcase,
  GraduationCap,
  Network,
  Server,
  Shield,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import { HoverCard } from "@/components/HoverAnimations";
import SkillsRadar from "@/components/interactive/SkillsRadar";
import Navigation from "@/components/Navigation";
import { SectionNav } from "@/components/SectionNav";

const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "summary", label: "Summary" },
  { id: "focus-areas", label: "Focus Areas" },
  { id: "skills", label: "Skills" },
  { id: "badges", label: "Badges" },
  { id: "awards", label: "Awards" },
] as const;

export const metadata: Metadata = {
  title: "About Me",
  description:
    "Learn about Themistoklis Baltzakis - IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <SectionNav sections={SECTIONS} ariaLabel="About page sections" />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <div id="hero">
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-20">
            <div className="space-y-3 md:space-y-4">
              <AnimatedSection delay={0.1}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground uppercase tracking-wider">
                  About Me
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
              </AnimatedSection>
            </div>
            <AnimatedSection delay={0.2}>
              <p className="text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
                IT Network Engineer
              </p>
              <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                IT Network Engineer with over 15 years of extensive experience
                in network infrastructure, Cisco systems, and Fortinet security
                solutions.
              </p>
            </AnimatedSection>
          </AnimatedSection>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Summary */}
            <div id="summary">
            <AnimatedSection delay={0.1}>
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
                    rebuild—enabling safe travel and economic recovery. My work
                    bridges technical mastery with social impact, creating
                    solutions that are both efficient and meaningful.
                  </p>
                </div>
              </div>
            </AnimatedSection>
            </div>

            {/* Key Focus Areas */}
            <div id="focus-areas">
            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <HoverCard>
                  <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 transition-all duration-300 group min-h-50 flex flex-col justify-center">
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
                </HoverCard>
                <HoverCard>
                  <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 transition-all duration-300 group min-h-50 flex flex-col justify-center">
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
                </HoverCard>
                <HoverCard>
                  <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border text-center hover:border-cyan-400/50 hover:bg-foreground/10 transition-all duration-300 group min-h-50 flex flex-col justify-center sm:col-span-2 lg:col-span-1">
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
                </HoverCard>
              </div>
            </AnimatedSection>
            </div>

            {/* Skills Radar */}
            <AnimatedSection delay={0.25}>
              <SkillsRadar />
            </AnimatedSection>

            {/* Skills & Certifications */}
            <div id="skills">
            <AnimatedSection delay={0.3}>
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
            </AnimatedSection>
            </div>

            {/* Credly Badges */}
            <div id="badges">
            <AnimatedSection delay={0.35}>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: "CyberOps Associate",
                      issuer: "Cisco",
                      year: "2025",
                      desc: "Security monitoring, threat detection, and incident response with 30+ hands-on labs.",
                      image: "https://images.credly.com/images/53f37f83-04a1-4935-9b1e-21a99cc6e1b2/CyberOpsAssoc.png",
                    },
                    {
                      name: "Career Preparation Workshop",
                      issuer: "Cisco",
                      year: "2025",
                      desc: "Professional readiness training and enrollment in Cisco Talent Bridge Matching Engine.",
                      image: "https://images.credly.com/images/8d97e39e-2a05-4ed7-88a3-3413bc88c7bd/CPW.png",
                    },
                    {
                      name: "CCNA: Intro to Networks",
                      issuer: "Cisco",
                      year: "2024",
                      desc: "IP addressing, networking fundamentals, and 54 Packet Tracer labs completed.",
                      image: "https://images.credly.com/images/70d71df5-f3dc-4380-9b9d-f22513a70417/CCNAITN__1_.png",
                    },
                    {
                      name: "Networking Basics",
                      issuer: "Cisco",
                      year: "2024",
                      desc: "Network types, protocols, and connectivity with 13 Packet Tracer activities.",
                      image: "https://images.credly.com/images/5bdd6a39-3e03-4444-9510-ecff80c9ce79/image.png",
                    },
                    {
                      name: "Data Analytics Essentials",
                      issuer: "Cisco",
                      year: "2024",
                      desc: "Data collection, processing, and visualization to extract business value.",
                      image: "https://images.credly.com/images/1fdfeaeb-e61c-4450-bdfe-a07bd4e715df/image.png",
                    },
                    {
                      name: "Intro to Data Science",
                      issuer: "Cisco",
                      year: "2024",
                      desc: "Foundations of Data Analytics, Data Engineering, and AI/ML concepts.",
                      image: "https://images.credly.com/images/b38a42e0-dc58-4ce2-b6c0-28d978e8aaad/image.png",
                    },
                    {
                      name: "DevNet Associate",
                      issuer: "Cisco",
                      year: "2023",
                      desc: "Python, Linux, REST APIs, and network automation for software-defined infrastructure.",
                      image: "https://images.credly.com/images/35985f2b-38d6-4b6f-8e63-42b17d3b5c69/DEVASC_Learning_Badge.png",
                    },
                    {
                      name: "KNIME Analytics Platform L1",
                      issuer: "KNIME",
                      year: "2023",
                      desc: "Passed L1 exam — data cleaning, transformation, and visual workflow analytics.",
                      image: "https://images.credly.com/images/ba8f2415-703b-4d41-a850-5aecbabd5cf4/L1_Large.png",
                    },
                    {
                      name: "Python Essentials 2",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Intermediate Python: OOP, exception handling, modules, and file operations.",
                      image: "https://images.credly.com/images/3f802526-7274-4230-91ab-f6d1a35340e6/image.png",
                    },
                    {
                      name: "Python Essentials 1",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Core programming concepts, Python syntax, data types, and control flow.",
                      image: "https://images.credly.com/images/68c0b94d-f6ac-40b1-a0e0-921439eb092e/image.png",
                    },
                    {
                      name: "Enterprise Networking & Automation",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Scalable architectures, dynamic routing, security threats, and network automation.",
                      image: "https://images.credly.com/images/0a6d331e-8abf-4272-a949-33f754569a76/CCNAENSA__1_.png",
                    },
                    {
                      name: "Kubernetes Fundamentals",
                      issuer: "Linux Foundation",
                      year: "2022",
                      desc: "Kubernetes deployment, container orchestration, and cluster management (LFS258).",
                      image: "https://images.credly.com/images/123746a7-fbbe-4fdd-9c0c-f0254e53292a/blob",
                    },
                    {
                      name: "Junior Cybersecurity Analyst",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Network monitoring, firewalls, cloud security, and cryptography fundamentals.",
                      image: "https://images.credly.com/images/441578ec-c0f3-46cc-95fc-86b27e90cf4f/image.png",
                    },
                    {
                      name: "Cyber Threat Management",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Security policies, vulnerability assessment, risk management, and threat analysis.",
                      image: "https://images.credly.com/images/5d5ac32b-d239-42b8-9665-8a921dc3ab47/image.png",
                    },
                    {
                      name: "Endpoint Security",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "OS security, endpoint protection, and network security fundamentals.",
                      image: "https://images.credly.com/images/0ca5f542-fb5e-4a22-9b7a-c1a1ce4c3db7/EndpointSecurity.png",
                    },
                    {
                      name: "Networking Devices & Config",
                      issuer: "Cisco",
                      year: "2022",
                      desc: "Cloud and virtualization, IP addressing schemes, and device initial setup.",
                      image: "https://images.credly.com/images/88316fe8-5651-4e61-a6be-5be1558f049e/image.png",
                    },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className="p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <Image
                          src={badge.image}
                          alt={badge.name}
                          width={40}
                          height={40}
                          className="rounded shrink-0"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <span className="text-foreground/90 text-sm font-medium block truncate">
                            {badge.name}
                          </span>
                          <span className="text-muted-foreground/60 text-[10px] font-mono">
                            {badge.issuer} &middot; {badge.year}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed mt-1.5 pl-13">
                        {badge.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
            </div>

            {/* Languages */}
            <AnimatedSection delay={0.3}>
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
            </AnimatedSection>

            {/* Honors & Awards */}
            <div id="awards">
            <AnimatedSection delay={0.4}>
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
                        3rd Place – Cisco Incubator 12.0
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
            </AnimatedSection>
            </div>

            {/* Call to Action */}
            <AnimatedSection delay={0.5}>
              <div className="text-center mt-16">
                <Link
                  href="/contact/"
                  className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-background rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
                >
                  Get In Touch
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </div>
  );
}
