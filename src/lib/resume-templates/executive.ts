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

export function renderExecutive(data: ResumeFormData): string {
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
      <div class="entry-header">
        <div class="entry-left">
          <div class="role">${escapeHtml(exp.role)}</div>
          <div class="company">${escapeHtml(exp.company)}${exp.location ? ` — ${escapeHtml(exp.location)}` : ""}</div>
        </div>
        <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      </div>
      ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
          <div class="company">${escapeHtml(edu.institution)}${edu.gpa ? ` — GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
        </div>
        <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      </div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="cert-item">
      <span class="cert-name">${escapeHtml(cert.name)}</span>
      <span class="cert-meta"> — ${escapeHtml(cert.issuer)}, ${formatDate(cert.date)}</span>
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-row">
      <span class="skill-label">${escapeHtml(cat.category)}</span>
      <span class="skill-items">${cat.items.map(escapeHtml).join(" · ")}</span>
    </div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="role">${escapeHtml(proj.name)}${proj.url ? ` <a href="${escapeHtml(proj.url)}" class="link">↗</a>` : ""}</div>
        </div>
      </div>
      <p class="proj-desc">${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<div class="tech-tags">${proj.technologies.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
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
    font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #1e293b;
    padding: 0;
  }

  /* Navy header */
  .header {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    color: #fff;
    padding: 28px 32px 22px;
    margin: -1px;
  }
  h1 { font-size: 26pt; font-weight: 700; letter-spacing: 1px; margin-bottom: 2px; }
  .header-title { font-size: 13pt; color: #94a3b8; font-weight: 400; font-style: italic; margin-bottom: 10px; }
  .contact { display: flex; flex-wrap: wrap; gap: 14px; font-size: 9pt; color: #cbd5e1; }
  .contact a { color: #93c5fd; text-decoration: none; }

  .body-content { padding: 20px 32px 24px; }

  /* Sections */
  .section { margin-bottom: 16px; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: #1e3a5f;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: 2px solid #1e3a5f;
    padding-bottom: 4px;
    margin-bottom: 10px;
  }

  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-left { flex: 1; }
  .role { font-weight: 700; font-size: 11pt; color: #0f172a; }
  .company { color: #475569; font-size: 10pt; }
  .dates { font-size: 9.5pt; color: #64748b; white-space: nowrap; margin-left: 12px; font-style: italic; }
  ul { margin: 5px 0 0 18px; }
  li { margin-bottom: 2px; color: #334155; }

  .skill-row { margin-bottom: 5px; display: flex; gap: 8px; }
  .skill-label { font-weight: 700; color: #1e3a5f; min-width: 120px; font-size: 10pt; }
  .skill-items { color: #475569; }

  .cert-item { margin-bottom: 3px; }
  .cert-name { font-weight: 600; }
  .cert-meta { color: #64748b; font-size: 9.5pt; }

  .proj-desc { color: #475569; font-size: 10pt; margin-top: 2px; }
  .tech-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
  .tech-tag { background: #e2e8f0; color: #1e3a5f; padding: 1px 7px; border-radius: 3px; font-size: 8.5pt; }
  .link { color: #3b82f6; text-decoration: none; font-size: 9pt; }

  .summary { color: #334155; border-left: 3px solid #1e3a5f; padding-left: 14px; font-style: italic; }
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
    ${experience.length > 0 ? `<div class="section"><div class="section-title">Professional Experience</div>${experienceHtml}</div>` : ""}
    ${skills.length > 0 ? `<div class="section"><div class="section-title">Technical Expertise</div>${skillsHtml}</div>` : ""}
    ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${certificationsHtml}</div>` : ""}
    ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
    ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
  </div>
</body>
</html>`;
}
