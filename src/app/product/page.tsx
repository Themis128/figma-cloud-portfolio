import { Building, Calendar, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AnimatedSection } from "@/components/AnimatedSection";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Work Experience",
  description:
    "Professional work experience of Themistoklis Baltzakis - Cloud Architect & Cybersecurity Specialist with expertise in Cisco virtualization, Azure AD, and enterprise IT infrastructure.",
};

const experiences = [
  {
    company: "Estarta Solutions",
    position: "Systems and Network Engineer",
    period: "Dec 2024 – Mar 2025",
    location: "Remote",
    responsibilities: [
      "Administered Cisco virtualization platforms including UCS, HyperFlex, and ACI fabric infrastructure",
      "Managed VMware vSphere and ESXi environments for enterprise virtualization workloads",
      "Implemented network virtualization solutions using Cisco ACI and Nexus switching platforms",
      "Monitored and optimized infrastructure performance across hybrid cloud environments",
      "Collaborated with cross-functional teams to deliver scalable datacenter solutions",
    ],
  },
  {
    company: "Cosmos Business Systems Group",
    position: "IT Support Engineer",
    period: "Mar 2023 – May 2024",
    location: "Athens, Greece",
    responsibilities: [
      "Managed Azure Active Directory tenant administration, user provisioning, and identity governance",
      "Delivered Microsoft 365 support services including Exchange Online, Teams, and SharePoint",
      "Deployed and administered Microsoft Intune for mobile device management and endpoint security",
      "Configured conditional access policies and MFA to enforce zero-trust security principles",
      "Provided Level 2/3 support for enterprise IT incidents and service requests",
    ],
  },
  {
    company: "CPI SA (Nielsen Greece)",
    position: "IT Consultant",
    period: "Feb 2023 – Mar 2023",
    location: "Athens, Greece",
    responsibilities: [
      "Contributed to technology roadmap development and IT strategy planning",
      "Administered on-premises and cloud-based Active Directory environments",
      "Managed IT service delivery through ServiceNow ITSM platform",
      "Operated CyberArk privileged access management (PAM) solution for credential vaulting",
      "Assessed existing infrastructure and provided recommendations for modernization",
    ],
  },
  {
    company: "Athens International Airport",
    position: "Network & Infrastructure Engineer",
    period: "Jun 2021 – Jan 2023",
    location: "Athens, Greece",
    responsibilities: [
      "Rebuilt and upgraded critical airport network infrastructure to support post-COVID operations",
      "Designed and implemented redundant network topologies ensuring 99.99% uptime",
      "Managed firewall policies, VLANs, and inter-VLAN routing across the campus network",
      "Supported biometric and access-control system integrations for terminal security",
      "Coordinated with vendors and stakeholders during major infrastructure upgrade projects",
    ],
  },
  {
    company: "Cosmote / OTE Group",
    position: "Telecommunications Engineer",
    period: "Mar 2020 – May 2021",
    location: "Athens, Greece",
    responsibilities: [
      "Provided technical telecommunications support to vulnerable communities during COVID-19",
      "Maintained and troubleshot DSL, VDSL, and fiber broadband infrastructure",
      "Configured customer-premise equipment and resolved last-mile connectivity issues",
      "Collaborated with field teams to improve service restoration SLAs",
      "Documented network incidents and contributed to knowledge base improvements",
    ],
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20">
          {/* Hero Section */}
          <AnimatedSection className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 mb-12 md:mb-20">
            <AnimatedSection delay={0.1}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
                Work Experience
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-4" />
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-cyan-400 text-lg sm:text-xl font-semibold tracking-wide">
                Cloud Architecture · Cybersecurity · Network Infrastructure
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                15+ years of hands-on IT expertise across enterprise
                environments, cloud platforms, and critical infrastructure.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Experience Timeline */}
          <div className="max-w-4xl mx-auto space-y-8">
            {experiences.map((exp, index) => (
              <AnimatedSection key={exp.company} delay={0.1 * (index + 1)}>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-8 hover:border-cyan-400/30 transition-all duration-300">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-5 h-5 text-cyan-400 shrink-0" />
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {exp.company}
                        </h2>
                      </div>
                      <p className="text-cyan-400 font-semibold text-base ml-7">
                        {exp.position}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 sm:text-right ml-7 sm:ml-0">
                      <div className="flex items-center gap-2 sm:justify-end">
                        <Calendar className="w-4 h-4 text-white/50" />
                        <span className="text-white/70 text-sm">
                          {exp.period}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <MapPin className="w-4 h-4 text-white/50" />
                        <span className="text-white/70 text-sm">
                          {exp.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <ul className="space-y-3">
                    {exp.responsibilities.map((responsibility, rIndex) => (
                      <li
                        key={`${exp.company}-resp-${rIndex}`}
                        className="flex items-start gap-3 text-white/80 text-sm leading-relaxed"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                        {responsibility}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Call to Action */}
          <AnimatedSection delay={0.6}>
            <div className="text-center mt-16 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/resume/"
                className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
              >
                Build Resume
              </Link>
              <Link
                href="/contact/"
                className="inline-block px-8 py-3 border-2 border-cyan-400/60 hover:border-cyan-400 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
              >
                Get In Touch
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
}
