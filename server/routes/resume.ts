// Resume API endpoints
import { Router, Request, Response } from "express";
import { jsPDF } from "jspdf";

const router = Router();

const resumeData = {
  name: "Themistoklis Baltzakis",
  title: "Cloud Architect & Cybersecurity Specialist",
  email: "baltzakis.themis@gmail.com",
  phone: "+30 698 765 4321",
  location: "Athens, Greece",
  website: "https://www.baltzakisthemis.com",
  summary:
    "15+ years of IT expertise specializing in Azure AD, Microsoft 365, and multi-cloud environments. Proven track record in enterprise infrastructure, zero-trust security, and cloud-native application development.",
  experience: [
    {
      company: "Estarta Solutions",
      role: "Systems and Network Engineer",
      period: "Dec 2024 – Mar 2025",
      highlights: [
        "Managed Cisco UCS, HyperFlex, and ACI fabric infrastructure",
        "Implemented monitoring and automation for 200+ network devices",
      ],
    },
    {
      company: "Cosmos Business Systems Group",
      role: "IT Support Engineer",
      period: "Mar 2023 – May 2024",
      highlights: [
        "Administered Azure AD, Microsoft 365, and Intune for 500+ users",
        "Deployed conditional access policies and MFA across the organization",
      ],
    },
    {
      company: "CPI SA (Nielsen Greece)",
      role: "IT Consultant",
      period: "Feb 2023 – Mar 2023",
      highlights: [
        "Provided IT consulting for data collection infrastructure",
        "Audited network security and recommended improvements",
      ],
    },
  ],
  certifications: [
    "AWS Cloud Practitioner",
    "Cisco DevNet Associate",
    "Microsoft Azure Solutions Architect",
    "CISSP — Certified Information Systems Security Professional",
    "CEH — Certified Ethical Hacker",
    "ITIL Foundation",
  ],
  skills: {
    cloud: ["AWS", "Azure", "Multi-cloud Architecture"],
    security: ["Zero-Trust Security", "CyberArk PAM", "Microsoft Sentinel"],
    development: ["React", "Next.js", "TypeScript", "Node.js", "Python"],
    infrastructure: ["Cisco ACI/UCS", "VMware vSphere", "Docker", "Kubernetes"],
  },
};

// GET /api/resume/generate — returns resume data as JSON
router.get("/generate", (_req: Request, res: Response) => {
  res.json({
    pdfUrl: "/api/resume/download",
    data: resumeData,
    generatedAt: new Date().toISOString(),
  });
});

// GET /api/resume/download — generates and serves resume as PDF
router.get("/download", (_req: Request, res: Response) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(resumeData.name, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(resumeData.title, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${resumeData.email}  |  ${resumeData.location}  |  ${resumeData.website}`,
    margin,
    y,
  );
  y += 8;

  // Divider
  doc.setDrawColor(0, 188, 212); // cyan
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PROFESSIONAL SUMMARY", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
  doc.text(summaryLines as string[], margin, y);
  y += (summaryLines as string[]).length * 4 + 6;

  // Experience
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("EXPERIENCE", margin, y);
  y += 6;

  for (const job of resumeData.experience) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(job.role, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(job.period, pageWidth - margin, y, { align: "right" });
    y += 4;

    doc.setTextColor(60, 60, 60);
    doc.text(job.company, margin, y);
    y += 5;

    doc.setTextColor(0, 0, 0);
    for (const highlight of job.highlights) {
      doc.text(`•  ${highlight}`, margin + 2, y);
      y += 4;
    }
    y += 3;
  }

  // Skills
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("SKILLS", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const skillEntries: [string, string[]][] = Object.entries(resumeData.skills);
  for (const [category, skills] of skillEntries) {
    doc.setFont("helvetica", "bold");
    doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(skills.join(", "), margin + 30, y);
    y += 5;
  }
  y += 4;

  // Certifications
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATIONS", margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  for (const cert of resumeData.certifications) {
    doc.text(`•  ${cert}`, margin + 2, y);
    y += 4;
  }

  // Output
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Themistoklis_Baltzakis_Resume.pdf"',
  );
  res.setHeader("Content-Length", pdfBuffer.length.toString());
  res.send(pdfBuffer);
});

export default router;
