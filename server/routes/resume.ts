// Resume API endpoints
import { Router, Request, Response } from "express";
const router = Router();

const resumeData = {
  name: "Themistoklis Baltzakis",
  title: "Cloud Architect & Cybersecurity Specialist",
  email: "baltzakis.themis@gmail.com",
  location: "Athens, Greece",
  summary:
    "15+ years of IT expertise specializing in Azure AD, Microsoft 365, and multi-cloud environments.",
  experience: [
    {
      company: "Estarta Solutions",
      role: "Systems and Network Engineer",
      period: "Dec 2024 – Mar 2025",
    },
    {
      company: "Cosmos Business Systems Group",
      role: "IT Support Engineer",
      period: "Mar 2023 – May 2024",
    },
    {
      company: "CPI SA (Nielsen Greece)",
      role: "IT Consultant",
      period: "Feb 2023 – Mar 2023",
    },
  ],
  certifications: [
    "AWS Cloud Practitioner",
    "Cisco DevNet Associate",
    "Microsoft Azure Solutions Architect",
    "CISSP",
    "CEH",
    "ITIL Foundation",
  ],
  skills: [
    "Azure",
    "AWS",
    "Multi-cloud",
    "Zero-Trust Security",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
  ],
};

// GET /api/resume/generate — returns resume data as JSON
router.get("/generate", (_req: Request, res: Response) => {
  const htmlContent = `<html><body>
<h1>${resumeData.name}</h1>
<h2>${resumeData.title}</h2>
<p>${resumeData.summary}</p>
</body></html>`;

  res.json({
    pdfUrl: "/api/resume/download",
    htmlContent,
    data: resumeData,
    generatedAt: new Date().toISOString(),
  });
});

// GET /api/resume/download — serves resume as PDF
router.get("/download", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Themistoklis_Baltzakis_Resume.pdf"',
  );
  // Minimal valid PDF
  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
206
%%EOF`;
  res.send(pdf);
});

export default router;
