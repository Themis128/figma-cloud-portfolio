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

export function renderMinimal(data: ResumeFormData): string {
  const { personalInfo, summary, experience, education, certifications, skills, projects } = data;

  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(escapeHtml(personalInfo.email));
  if (personalInfo.phone) contactParts.push(escapeHtml(personalInfo.phone));
  if (personalInfo.location) contactParts.push(escapeHtml(personalInfo.location));
  if (personalInfo.linkedIn) contactParts.push(`<a href="${escapeHtml(personalInfo.linkedIn)}">LinkedIn</a>`);
  if (personalInfo.github) contactParts.push(`<a href="${escapeHtml(personalInfo.github)}">GitHub</a>`);
  if (personalInfo.website) contactParts.push(`<a href="${escapeHtml(personalInfo.website)}">Website</a>`);

  const experienceHtml = experience.map((exp) => `
    <div class="entry">
      <div class="meta">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      <div class="content">
        <div class="role">${escapeHtml(exp.role)}</div>
        <div class="org">${escapeHtml(exp.company)}${exp.location ? `, ${escapeHtml(exp.location)}` : ""}</div>
        ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
      </div>
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="meta">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      <div class="content">
        <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
        <div class="org">${escapeHtml(edu.institution)}${edu.gpa ? ` — GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
      </div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="entry">
      <div class="meta">${formatDate(cert.date)}</div>
      <div class="content">
        <div class="role">${escapeHtml(cert.name)}</div>
        <div class="org">${escapeHtml(cert.issuer)}</div>
      </div>
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-line"><span class="skill-cat">${escapeHtml(cat.category)}</span> ${cat.items.map(escapeHtml).join(" · ")}</div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="entry">
      <div class="meta">${proj.technologies.slice(0, 3).map(escapeHtml).join(", ")}</div>
      <div class="content">
        <div class="role">${escapeHtml(proj.name)}${proj.url ? ` <a href="${escapeHtml(proj.url)}">↗</a>` : ""}</div>
        <p>${escapeHtml(proj.description)}</p>
      </div>
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
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #333;
    padding: 28px 36px;
  }
  a { color: #333; text-decoration: none; border-bottom: 1px dotted #999; }

  /* Header */
  h1 { font-size: 20pt; font-weight: 300; letter-spacing: 2px; margin-bottom: 4px; }
  .subtitle { font-size: 11pt; color: #666; font-weight: 400; margin-bottom: 6px; }
  .contact { font-size: 9pt; color: #888; margin-bottom: 20px; }
  .contact span + span::before { content: " · "; }
  .contact a { color: #888; }

  /* Sections */
  .section { margin-bottom: 16px; }
  .section-title {
    font-size: 9pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #999;
    margin-bottom: 10px;
  }

  /* Two-column entries */
  .entry {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }
  .meta {
    width: 120px;
    flex-shrink: 0;
    font-family: "SF Mono", "Fira Code", "Consolas", monospace;
    font-size: 9pt;
    color: #888;
    padding-top: 2px;
    text-align: right;
  }
  .content { flex: 1; }
  .role { font-weight: 600; }
  .org { color: #666; font-size: 10pt; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 1px; color: #444; }

  /* Skills */
  .skill-line { margin-bottom: 4px; font-size: 10pt; }
  .skill-cat {
    font-weight: 600;
    display: inline-block;
    min-width: 100px;
  }

  /* Summary */
  .summary { color: #444; max-width: 560px; }

  /* Divider */
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 16px 0; }
</style>
</head>
<body>
  <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
  ${personalInfo.title ? `<div class="subtitle">${escapeHtml(personalInfo.title)}</div>` : ""}
  ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p) => `<span>${p}</span>`).join("")}</div>` : ""}

  ${summary ? `<div class="section"><div class="section-title">About</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
  ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
  ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
  ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div>${skillsHtml}</div>` : ""}
  ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${certificationsHtml}</div>` : ""}
  ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
</body>
</html>`;
}
