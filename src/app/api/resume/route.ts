import { NextResponse } from "next/server";

const resumeData = {
  personal: {
    name: "Themistoklis Baltzakis",
    title: "Cloud Architect & Cybersecurity Specialist",
    email: "baltzakis.themis@gmail.com",
    linkedin: "https://www.linkedin.com/in/baltzakis-themis",
    website: "https://www.baltzakisthemis.com",
    location: "Athens, Greece",
    summary:
      "Technical Leadership and Cloud Innovation with 15+ years of IT expertise, specializing in Azure AD, Microsoft 365, and multi-cloud environments. My foundation combines a Computer Science degree with industry certifications (AWS Cloud Practitioner, Cisco DevNet Associate) and hands-on experience across network infrastructure, cybersecurity, and cloud migration strategies.",
  },
  experience: [
    {
      company: "Estarta Solutions",
      position: "Systems and Network Engineer",
      period: "Dec 2024 – Mar 2025",
      location: "Remote",
      responsibilities: [
        "Administered Cisco virtualization platforms including UCS, HyperFlex, and ACI",
        "Managed VMware vSphere and ESXi environments",
        "Implemented network virtualization with Cisco ACI and Nexus",
        "Monitored and optimized infrastructure performance",
      ],
    },
    {
      company: "Cosmos Business Systems Group",
      position: "IT Support Engineer",
      period: "Mar 2023 – May 2024",
      location: "Athens, Greece",
      responsibilities: [
        "Managed Azure Active Directory and identity governance",
        "Delivered Microsoft 365 support services",
        "Deployed Microsoft Intune for mobile device management",
        "Configured conditional access and MFA policies",
      ],
    },
    {
      company: "CPI SA (Nielsen Greece)",
      position: "IT Consultant",
      period: "Feb 2023 – Mar 2023",
      location: "Athens, Greece",
      responsibilities: [
        "Technology roadmap development and IT strategy",
        "Active Directory administration",
        "ServiceNow IT service management",
        "CyberArk privileged access management",
      ],
    },
  ],
  education: [
    {
      institution: "Harokopio University of Athens",
      degree: "Master's degree",
      field:
        "Informatics and Telematics (Data-driven Agricultural Innovations)",
      period: "2023 – Present",
    },
    {
      institution: "University of Piraeus",
      degree: "Bachelor of Science",
      field: "Computer Science",
      period: "2006 – 2013",
    },
  ],
  certifications: [
    "AWS Cloud Practitioner",
    "Cisco DevNet Associate",
    "Microsoft Azure Solutions Architect",
    "Certified Information Systems Security Professional (CISSP)",
    "Certified Ethical Hacker (CEH)",
    "ITIL Foundation Certification",
  ],
  skills: {
    cloud: [
      "Microsoft Azure",
      "AWS",
      "Multi-cloud Migration",
      "Infrastructure as Code",
    ],
    security: [
      "Zero-Trust Security",
      "Azure AD",
      "CyberArk PAM",
      "Microsoft Sentinel",
    ],
    networking: ["Cisco ACI", "Cisco UCS", "VMware vSphere", "Nexus Switching"],
    development: ["React", "Next.js", "TypeScript", "Node.js", "Python"],
    tools: [
      "Microsoft 365",
      "ServiceNow",
      "Microsoft Intune",
      "GitHub Actions",
    ],
  },
  languages: [
    { language: "English", level: "Full Professional" },
    { language: "Greek", level: "Native/Bilingual" },
  ],
  honors: [
    {
      title: "3rd Place – Cisco Incubator 12.0",
      detail: "Customer Experience Track",
    },
    { title: "Scholarship Recipient", detail: "Academic Excellence" },
  ],
};

export async function GET() {
  return NextResponse.json(resumeData);
}
