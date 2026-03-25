import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedSection } from "@/components/AnimatedSection";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import CircuitBackground from "@/components/CircuitBackground";
import InteractiveTimeline from "@/components/interactive/InteractiveTimeline";
import Navigation from "@/components/Navigation";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Work Experience",
  description:
    "Work experience of Themistoklis Baltzakis: Cisco, Fortinet, Azure AD, and enterprise IT infrastructure expertise.",
  openGraph: {
    title: "Work Experience | Themistoklis Baltzakis",
    description:
      "Work experience of Themistoklis Baltzakis: Cisco, Fortinet, Azure AD, and enterprise IT infrastructure expertise.",
    url: `${SITE_URL}/product/`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect" }],
  },
  alternates: { canonical: `${SITE_URL}/product/` },
};

const experiences = [
  {
    company: "Skaramangas Shipyards",
    position: "IT Network Engineer",
    period: "2025 to Present",
    location: "Skaramangas, Attiki, Greece",
    responsibilities: [
      "Design, maintain, and troubleshoot Cisco-based network infrastructure for a maritime transportation company managing 8.1M+ deadweight tonnes fleet",
      "Manage and secure Fortinet firewall environments to protect critical data center infrastructure",
      "Ensure high availability of core network systems supporting global operations across 1,000+ ports",
      "Provide technical support for internal users and implement infrastructure improvements",
      "Collaborate with IT teams for infrastructure planning and modernization of fleet management systems",
    ],
  },
  {
    company: "Estarta Solutions",
    position: "Network and Systems Engineer",
    period: "Recent",
    location: "Greece",
    responsibilities: [
      "Resolved over 90% of Cisco infrastructure issues in data centers, ensuring 100% SLA compliance",
      "Streamlined RMA process, enhancing logistics communication efficiency by 30%",
      "Proactively monitored delivery statuses and resolved logistics challenges, minimizing downtime",
    ],
  },
  {
    company: "Cosmos Business Systems",
    position: "IT Consultant Analyst",
    period: "Recent",
    location: "Greece",
    responsibilities: [
      "Specialized in managing and troubleshooting Azure Active Directory services",
      "Maintained robust security protocols including RBAC and conditional access policies",
      "Delivered comprehensive support for Microsoft 365 services",
      "Specialized in MDM and MAM using Microsoft Intune",
      "Gained experience in network security and troubleshooting Cisco networking issues",
    ],
  },
  {
    company: "CPI SA (outsourced @ Nielsen Hellas)",
    position: "IT Consultant Analyst",
    period: "Mar 2023",
    location: "Greece",
    responsibilities: [
      "Provided strategic guidance aligning technology initiatives with business goals",
      "Managed and maintained Active Directory environments",
      "Utilized ServiceNow to manage and track IT service requests, incidents, and inventory",
      "Ensured robust Privileged Access Management (PAM) using CyberArk",
    ],
  },
  {
    company: "Printec Hellas",
    position: "Technical Engineer",
    period: "Jan 2022 to Sep 2022",
    location: "Greece",
    responsibilities: [
      "Specialized use of Windows and Cisco Systems, servers, switches, routers, firewalls, LAN, WAN",
      "Installed and upgraded hardware-based networks, network services, and equipment",
      "Performed troubleshooting analysis of network, servers, workstations, and associated systems",
      "Diagnosed and troubleshot technical issues including account setup and network configuration",
    ],
  },
];

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Work Experience", url: `${SITE_URL}/product/` },
        ]}
      />
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
                Network Infrastructure · Cisco Systems · Fortinet Security
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                15+ years of hands-on IT expertise across enterprise
                environments, cloud platforms, and critical infrastructure.
              </p>
            </AnimatedSection>
          </AnimatedSection>

          {/* Experience Timeline */}
          <div className="max-w-4xl mx-auto">
            <AnimatedSection delay={0.3}>
              <InteractiveTimeline experiences={experiences} />
            </AnimatedSection>
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
