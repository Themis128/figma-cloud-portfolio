import { Building, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";

export default function Product() {
  const experiences = [
    {
      company: "Estarta Solutions",
      position: "Systems and Network Engineer",
      period: "December 2024 - March 2025",
      location: "Greece",
      responsibilities: [
        "Design, deploy, and manage Cisco virtualization platforms including Cisco UCS (Unified Computing System), HyperFlex, and Cisco ACI (Application Centric Infrastructure)",
        "Implement and configure virtual machine environments using VMware vSphere, ESXi, and integration with Cisco hardware",
        "Configure and optimize Cisco UCS B-Series and C-Series servers, fabric interconnects, and chassis management",
        "Manage Cisco HyperFlex hyperconverged infrastructure solutions for storage, compute, and networking",
        "Implement network virtualization solutions using Cisco ACI and Nexus platforms",
        "Perform capacity planning, resource allocation, and performance tuning for virtualized environments",
        "Troubleshoot complex virtualization issues across compute, network, and storage layers",
        "Conduct system upgrades, firmware updates, and patch management on Cisco infrastructure",
        "Create and maintain technical documentation including architecture diagrams, configuration standards, and runbooks",
        "Collaborate with international teams and deliver solutions for clients across multiple regions",
        "Monitor infrastructure performance and implement optimization strategies",
      ],
    },
    {
      company: "Cosmos Business Systems Group",
      position: "Information Technology Support Engineer",
      period: "March 2023 - May 2024",
      location: "Greece",
      responsibilities: [
        "Azure Active Directory (Azure AD) Support: Managed and troubleshooted Azure Active Directory services, maintained secure identity and access management",
        "User provisioning and de-provisioning, group management, implementing access control through role-based access control (RBAC) and conditional access policies",
        "Microsoft 365 (M365) Support: Provided comprehensive support for Microsoft 365 services, resolved end-user issues related to M365 applications",
        "Intune Support: Specialized in mobile device management (MDM) and mobile application management (MAM) using Microsoft Intune",
      ],
    },
    {
      company: "CPI SA (Outsourced @ Nielsen Greece)",
      position: "Information Technology Consultant",
      period: "February 2023 - March 2023",
      location: "Athens, Attiki, Greece",
      responsibilities: [
        "Provided strategic guidance to organizations, helping them align technology initiatives with business goals",
        "Assessed IT needs and developed technology roadmaps, recommended solutions for efficiency, security, and cost-effectiveness",
        "Managed Active Directory environments, ensured secure authentication and authorization mechanisms",
        "Utilized ServiceNow for IT service management, configured workflows and managed IT asset inventories",
        "Implemented robust Privileged Access Management (PAM) using CyberArk with strict access controls and monitoring",
      ],
    },
    {
      company: "Printec Group",
      position: "Technical Engineer",
      period: "January 2022 - September 2022",
      location: "Athens International Airport",
      responsibilities: [
        "Contributed to critical infrastructure rebuild at Athens International Airport",
        "Supported safe travel and economic recovery through telecommunications services",
        "Managed technical operations during COVID-19 recovery efforts",
      ],
    },
    {
      company: "Germanos",
      position: "Tech expert",
      period: "February 2007 - October 2021",
      location: "Vari, Markopoulo, Paiania, Attiki, Greece",
      responsibilities: [
        "Developed software fine-tuning and hardware repairs of cellphones and tablets",
        "Offered services in repairing desktops and laptops of various brands",
        "Maintained strong client relationships and achieved sales goals",
        "Provided prompt and accurate technical feedback to customers",
      ],
    },
    {
      company: "INFORM",
      position: "IT department (Ε. Ο. Φ.)",
      period: "October 2003 - January 2006",
      location: "Koropi, Attiki, Greece",
      responsibilities: [
        "Managed IT department operations and infrastructure",
        "Provided technical support and system maintenance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider">
              Professional Experience
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 mx-auto rounded-full" />
            <p className="text-white/70 text-lg leading-relaxed">
              15+ years of IT expertise across cloud architecture, cybersecurity, and enterprise
              solutions.
            </p>
          </div>

          {/* Experience Timeline */}
          <div className="max-w-4xl mx-auto space-y-8">
            {experiences.map((exp, _index) => (
              <div
                key={`${exp.company}-${exp.period}`}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-100 transition-colors">
                      {exp.position}
                    </h3>
                    <div className="flex items-center gap-2 text-cyan-400 font-medium">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-cyan-400/10 rounded-lg">
                        <Building className="w-4 h-4" />
                      </div>
                      {exp.company}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 md:mt-0 md:text-right">
                    <div className="flex items-center gap-2 text-white/70">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-white/5 rounded-lg">
                        <Calendar className="w-4 h-4" />
                      </div>
                      {exp.period}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-white/5 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      {exp.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white/90">Key Responsibilities:</h4>
                  <ul className="space-y-3">
                    {exp.responsibilities.map((resp, respIndex) => (
                      <li
                        key={`${exp.company}-${respIndex}`}
                        className="flex items-start gap-3 text-white/80 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="leading-relaxed">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-400/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Education</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Master's Degree</h3>
                  <div className="text-white/80">
                    <div className="font-medium text-lg mb-2">Data Analytics and Technologies</div>
                    <div className="text-white/60 mb-1">University of Greater Manchester</div>
                    <div className="text-white/60">March 2024 - March 2025</div>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Bachelor's Degree</h3>
                  <div className="text-white/80">
                    <div className="font-medium text-lg mb-2">Computer Science</div>
                    <div className="text-white/60 mb-1">Hellenic Open University</div>
                    <div className="text-white/60">2014 - 2022</div>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-white/10">
                <h3 className="text-xl font-bold text-cyan-400 mb-6">Additional Certifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-white/80 font-medium">Cisco CCNA (2021-2022)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-white/80 font-medium">
                      Cisco DevNet Associate (2023-2024)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-white/80 font-medium">
                      AWS Certified Solutions Architect
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0" />
                    <span className="text-white/80 font-medium">Android App Development</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Link
              to="/contact"
              className="inline-block px-8 py-3 bg-cyan-400 hover:bg-cyan-500 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
            >
              Let's Work Together
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
