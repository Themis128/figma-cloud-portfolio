import type { ResumeFormData } from "@/types/resume-builder";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: string): string {
  if (!date) return "";
  const [year, month] = date.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthIndex = parseInt(month ?? "0", 10) - 1;
  return `${months[monthIndex] ?? ""} ${year}`;
}

export function renderBold(data: ResumeFormData): string {
  const { personalInfo, summary, experience, education, certifications, skills, projects } = data;

  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(`<a href="mailto:${escapeHtml(personalInfo.email)}">${escapeHtml(personalInfo.email)}</a>`);
  if (personalInfo.phone) contactParts.push(escapeHtml(personalInfo.phone));
  if (personalInfo.location) contactParts.push(escapeHtml(personalInfo.location));
  if (personalInfo.linkedIn) contactParts.push(`<a href="${escapeHtml(personalInfo.linkedIn)}">LinkedIn</a>`);
  if (personalInfo.github) contactParts.push(`<a href="${escapeHtml(personalInfo.github)}">GitHub</a>`);
  if (personalInfo.website) contactParts.push(`<a href="${escapeHtml(personalInfo.website)}">Website</a>`);

  const experienceHtml = experience.map((exp) => `
    <div class="entry">
      <div class="entry-top">
        <div class="role">${escapeHtml(exp.role)}</div>
        <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      </div>
      <div class="company">${escapeHtml(exp.company)}${exp.location ? ` | ${escapeHtml(exp.location)}` : ""}</div>
      ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="entry-top">
        <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
        <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      </div>
      <div class="company">${escapeHtml(edu.institution)}${edu.gpa ? ` | GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="cert-row">
      <span class="accent-bar"></span>
      <div>
        <div class="cert-name">${escapeHtml(cert.name)}</div>
        <div class="cert-meta">${escapeHtml(cert.issuer)} · ${formatDate(cert.date)}</div>
      </div>
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-block">
      <div class="skill-cat">${escapeHtml(cat.category)}</div>
      <div class="skill-bar-wrap">${cat.items.map((item) => `<span class="skill-chip">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="entry">
      <div class="role">${escapeHtml(proj.name)}${proj.url ? ` <a href="${escapeHtml(proj.url)}" class="proj-link">↗</a>` : ""}</div>
      <p class="proj-desc">${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<div class="skill-bar-wrap" style="margin-top:4px">${proj.technologies.map((t) => `<span class="skill-chip">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    color: #18181b;
    padding: 0;
  }

  /* Bold red/orange header */
  .header {
    background: #18181b;
    color: #fff;
    padding: 28px 32px 20px;
    margin: -1px;
    border-bottom: 4px solid #ef4444;
  }
  h1 { font-size: 28pt; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
  .header-title { font-size: 12pt; color: #fca5a5; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px; }
  .contact { display: flex; flex-wrap: wrap; gap: 14px; font-size: 9pt; color: #a1a1aa; }
  .contact a { color: #fca5a5; text-decoration: none; }

  .body-content { padding: 20px 32px 24px; }

  /* Sections */
  .section { margin-bottom: 16px; }
  .section-title {
    font-size: 12pt;
    font-weight: 900;
    color: #dc2626;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 3px solid #fecaca;
  }

  .entry { margin-bottom: 12px; }
  .entry-top { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 800; font-size: 11pt; color: #18181b; }
  .company { color: #52525b; font-size: 10pt; margin-bottom: 3px; }
  .dates { font-size: 9pt; color: #dc2626; font-weight: 700; white-space: nowrap; margin-left: 12px; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 2px; color: #3f3f46; }
  li::marker { color: #ef4444; }

  /* Skills */
  .skill-block { margin-bottom: 8px; }
  .skill-cat { font-weight: 800; font-size: 10pt; color: #18181b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .skill-bar-wrap { display: flex; flex-wrap: wrap; gap: 4px; }
  .skill-chip {
    background: #18181b;
    color: #fafafa;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 8.5pt;
    font-weight: 600;
  }

  /* Certs */
  .cert-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
  .accent-bar { width: 3px; min-height: 28px; background: #ef4444; border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
  .cert-name { font-weight: 700; font-size: 10pt; }
  .cert-meta { font-size: 9pt; color: #71717a; }

  .proj-desc { color: #52525b; font-size: 10pt; margin-top: 2px; }
  .proj-link { color: #dc2626; text-decoration: none; font-size: 9pt; }

  .summary {
    color: #3f3f46;
    padding: 10px 14px;
    background: #fef2f2;
    border-left: 3px solid #ef4444;
    border-radius: 0 6px 6px 0;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
    ${personalInfo.title ? `<div class="header-title">${escapeHtml(personalInfo.title)}</div>` : ""}
    ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p) => `<span>${p}</span>`).join("")}</div>` : ""}
  </div>

  <div class="body-content">
    ${summary ? `<div class="section"><div class="section-title">Profile</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
    ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
    ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div>${skillsHtml}</div>` : ""}
    ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${certificationsHtml}</div>` : ""}
    ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
    ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
  </div>
</body>
</html>`;
}
