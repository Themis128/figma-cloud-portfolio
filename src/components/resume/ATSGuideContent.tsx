import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  FileText,
  Filter,
  Lightbulb,
  Network,
  ScanSearch,
  Shield,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { AnimatedSection } from "@/components/AnimatedSection";
import { HoverCard } from "@/components/HoverAnimations";

const resumeSections = [
  {
    icon: Target,
    title: "Professional Summary",
    description:
      "A 2-3 sentence snapshot of your career. Lead with your title, years of experience, and core specialization. This is the first thing recruiters read — make it count.",
    doExample:
      '"IT Network Engineer with 10+ years of experience in Cisco infrastructure and Fortinet security. Proven track record in enterprise data center management and network automation."',
    dontExample:
      '"Hardworking professional looking for a challenging opportunity to grow and contribute to a dynamic team."',
  },
  {
    icon: BarChart3,
    title: "Work Experience",
    description:
      "List roles in reverse chronological order. Focus on measurable achievements, not just responsibilities. Use action verbs and quantify impact wherever possible.",
    doExample:
      '"Reduced network downtime by 40% by implementing redundant failover across 12 Cisco Nexus switches."',
    dontExample:
      '"Responsible for maintaining network equipment and ensuring uptime."',
  },
  {
    icon: Award,
    title: "Certifications",
    description:
      "In IT, certifications often matter more than education. List them prominently with the issuing body and date. Expired certs should be noted or removed.",
    doExample:
      '"AWS Certified Cloud Practitioner (2024) | Cisco CCNA (2022) | CyberOps Associate (2025)"',
    dontExample:
      '"Various IT certifications obtained over the years."',
  },
  {
    icon: Zap,
    title: "Technical Skills",
    description:
      "Group skills by category (Networking, Security, Cloud, etc.). Match keywords from the job description. ATS systems scan this section heavily — be specific.",
    doExample:
      '"Networking: Cisco ACI, Nexus, UCS | Security: Fortinet, CyberArk PAM | Cloud: AWS, Azure AD"',
    dontExample:
      '"Proficient in Microsoft Office, good communication skills, team player."',
  },
];

const atsSteps = [
  {
    step: "1",
    title: "Parsing",
    description:
      "The ATS extracts text from your resume, identifying sections like experience, education, and skills. Complex layouts, tables, and graphics often break this step.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    step: "2",
    title: "Keyword Matching",
    description:
      "Your resume is compared against the job description. The system scores how many required skills, certifications, and technologies you mention.",
    color: "from-cyan-500 to-teal-600",
  },
  {
    step: "3",
    title: "Ranking",
    description:
      "Candidates are ranked by match percentage. Top-scoring resumes are forwarded to human recruiters. Low scores are filtered out — often automatically.",
    color: "from-teal-500 to-green-600",
  },
  {
    step: "4",
    title: "Human Review",
    description:
      "Recruiters spend an average of 6-7 seconds on initial resume review. Clear formatting, strong summary, and visible certifications make the difference.",
    color: "from-green-500 to-emerald-600",
  },
];

const commonMistakes = [
  {
    mistake: "Using graphics-heavy templates",
    why: "ATS systems cannot read text embedded in images, charts, or complex layouts. Columns and tables also break parsing.",
    fix: "Use a single-column layout with standard headings and plain text.",
  },
  {
    mistake: "Generic skill descriptions",
    why: "\"Good with computers\" or \"networking knowledge\" doesn't match any job keywords. ATS needs exact technology names.",
    fix: "Be specific: \"Cisco CCNA\", \"Fortinet FortiGate 60F\", \"Azure Active Directory\".",
  },
  {
    mistake: "No quantified achievements",
    why: "Listing responsibilities tells what you did, not how well. Recruiters want to see measurable impact.",
    fix: "Add numbers: \"Managed 200+ endpoints\", \"Reduced incidents by 35%\", \"99.9% uptime SLA\".",
  },
  {
    mistake: "One resume for every application",
    why: "Each job description has different keywords and priorities. A generic resume scores lower in ATS matching.",
    fix: "Tailor your summary and skills section to match each job posting's key requirements.",
  },
  {
    mistake: "Missing or outdated certifications",
    why: "In IT, certifications validate current skills. Expired certs or missing ones signal stale knowledge.",
    fix: "List active certs with dates. Include Credly badge links for digital verification.",
  },
  {
    mistake: "Burying technical skills at the bottom",
    why: "Recruiters and ATS scan top-to-bottom. If your Cisco CCNA is on page 2, it might never be seen.",
    fix: "Place a dedicated \"Technical Skills\" section near the top, right after your summary.",
  },
];

const itKeywords: Record<string, string[]> = {
  "Network Infrastructure": [
    "Cisco IOS", "Nexus", "ACI", "UCS", "VLAN", "BGP", "OSPF", "MPLS",
    "SD-WAN", "TCP/IP", "DNS", "DHCP", "LAN/WAN",
  ],
  "Network Security": [
    "Fortinet", "FortiGate", "Palo Alto", "IDS/IPS", "VPN", "Firewall",
    "Zero Trust", "SIEM", "SOC", "Penetration Testing",
  ],
  "Cloud & Identity": [
    "AWS", "Azure", "Azure AD", "Microsoft 365", "Intune", "Okta", "SSO",
    "MFA", "RBAC", "Conditional Access", "IAM",
  ],
  "DevOps & Automation": [
    "Python", "Ansible", "Terraform", "Docker", "Kubernetes", "CI/CD",
    "GitHub Actions", "REST API", "Netmiko", "NAPALM",
  ],
  "IT Service Management": [
    "ServiceNow", "ITIL", "Change Management", "Incident Response", "SLA",
    "NOC", "Ticketing", "Root Cause Analysis",
  ],
};

export function ATSGuideContent() {
  return (
    <div className="space-y-20">
      {/* How ATS Works */}
      <AnimatedSection delay={0.1}>
        <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <ScanSearch className="w-8 h-8 text-cyan-400" />
            How ATS Systems Work
          </h2>
          <p className="text-foreground/80 mb-8 leading-relaxed">
            An Applicant Tracking System (ATS) is software used by 99% of
            Fortune 500 companies and most mid-size employers to filter
            resumes before human review. Understanding this pipeline is
            the first step to getting past it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {atsSteps.map((phase) => (
              <div
                key={phase.step}
                className="relative bg-foreground/5 rounded-xl p-5 border border-border hover:border-cyan-400/30 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-br ${phase.color} flex items-center justify-center text-white font-bold text-lg mb-3`}
                >
                  {phase.step}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {phase.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
            <p className="text-sm text-foreground/70">
              <Lightbulb className="w-4 h-4 text-cyan-400 inline mr-2" />
              <strong className="text-cyan-400">Key takeaway:</strong>{" "}
              Your resume needs to be optimized for{" "}
              <em>two audiences</em> — the ATS algorithm that scores it
              and the human recruiter who skims it in seconds.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Anatomy of a Strong Resume */}
      <AnimatedSection delay={0.15}>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          Anatomy of a Strong IT Resume
        </h2>
        <div className="space-y-6">
          {resumeSections.map((section) => (
            <div
              key={section.title}
              className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-border hover:border-cyan-400/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {section.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {section.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-mono text-green-400 uppercase tracking-wider">
                      Good Example
                    </span>
                  </div>
                  <p className="text-foreground/70 text-sm italic">
                    {section.doExample}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
                      Avoid This
                    </span>
                  </div>
                  <p className="text-foreground/70 text-sm italic">
                    {section.dontExample}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Common Mistakes */}
      <AnimatedSection delay={0.2}>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-cyan-400" />
          6 Mistakes That Get Resumes Rejected
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {commonMistakes.map((item, index) => (
            <HoverCard key={item.mistake}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-cyan-400/30 transition-all duration-300 h-full">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-red-400 font-bold font-mono text-lg shrink-0">
                    #{index + 1}
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {item.mistake}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {item.why}
                </p>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-sm text-foreground/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 inline mr-1.5" />
                    <strong className="text-green-400">Fix:</strong>{" "}
                    {item.fix}
                  </p>
                </div>
              </div>
            </HoverCard>
          ))}
        </div>
      </AnimatedSection>

      {/* ATS Keywords for IT */}
      <AnimatedSection delay={0.25}>
        <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Filter className="w-8 h-8 text-cyan-400" />
            ATS Keywords for IT Professionals
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-3xl">
            These are the high-value keywords that ATS systems and IT
            recruiters scan for. Include the ones relevant to your
            experience — but only if you can back them up in an interview.
          </p>
          <div className="space-y-6">
            {Object.entries(itKeywords).map(([category, keywords]) => (
              <div key={category}>
                <h3 className="text-sm font-mono text-cyan-400/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-foreground/5 border border-border rounded-lg text-sm text-foreground/80 font-mono hover:border-cyan-400/30 hover:text-cyan-400 transition-colors"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Networking Career Tips */}
      <AnimatedSection delay={0.3}>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          Career Tips for Network Engineers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Network,
              title: "Build a Home Lab",
              description:
                "Set up a network lab with GNS3, Containerlab, or physical gear. Document it on GitHub. This demonstrates hands-on skills that certifications alone don't prove.",
            },
            {
              icon: Award,
              title: "Stack Certifications Strategically",
              description:
                "Start with CCNA, then specialize: CCNP for routing/switching, CyberOps for security, or DevNet for automation. AWS/Azure certs add cloud credibility.",
            },
            {
              icon: BookOpen,
              title: "Learn Network Automation",
              description:
                "Python + Ansible + REST APIs is the combo that separates modern network engineers from legacy ones. Start with Netmiko for SSH automation.",
            },
            {
              icon: Shield,
              title: "Understand Security Fundamentals",
              description:
                "Every network role now requires security knowledge. Learn firewalls (Fortinet, Palo Alto), IAM (Azure AD, Okta), and zero-trust architecture.",
            },
          ].map((tip) => (
            <HoverCard key={tip.title}>
              <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-cyan-400/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                    <tip.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {tip.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </HoverCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Quick Reference Checklist */}
      <AnimatedSection delay={0.35}>
        <div className="bg-foreground/5 backdrop-blur-sm rounded-xl p-8 border border-border">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            Pre-Submission Checklist
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Single-column layout (no tables or multi-column)",
              "Standard section headings (Experience, Education, Skills)",
              "PDF format (unless .docx is specifically requested)",
              "Contact info at the top (email, phone, LinkedIn, location)",
              "Professional summary with job title and years of experience",
              "Achievements with numbers (%, $, count, time saved)",
              "Active certifications listed with dates and issuers",
              "Technical skills grouped by category and matching job keywords",
              "No photos, graphics, icons, or decorative elements",
              "Proofread for spelling and grammar (use Grammarly or similar)",
              "File named: FirstName_LastName_Resume.pdf",
              "1-2 pages maximum (1 page if under 10 years experience)",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-3 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-foreground/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <AnimatedSection delay={0.4}>
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Want to see these principles in action?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about/"
              className="inline-block px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-background rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium"
            >
              View My Profile
            </Link>
            <Link
              href="/product/"
              className="inline-block px-6 py-3 bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border rounded-md transition-all duration-300 uppercase text-sm tracking-wider font-medium"
            >
              Work Experience
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
