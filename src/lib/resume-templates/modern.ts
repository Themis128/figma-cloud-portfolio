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

export function renderModern(data: ResumeFormData): string {
  const { personalInfo, summary, experience, education, certifications, skills, projects } = data;

  const contactItems: string[] = [];
  if (personalInfo.email) contactItems.push(`<div class="contact-item"><svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg><a href="mailto:${escapeHtml(personalInfo.email)}">${escapeHtml(personalInfo.email)}</a></div>`);
  if (personalInfo.phone) contactItems.push(`<div class="contact-item"><svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>${escapeHtml(personalInfo.phone)}</div>`);
  if (personalInfo.location) contactItems.push(`<div class="contact-item"><svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>${escapeHtml(personalInfo.location)}</div>`);

  const linkItems: string[] = [];
  if (personalInfo.linkedIn) linkItems.push(`<a href="${escapeHtml(personalInfo.linkedIn)}">LinkedIn</a>`);
  if (personalInfo.github) linkItems.push(`<a href="${escapeHtml(personalInfo.github)}">GitHub</a>`);
  if (personalInfo.website) linkItems.push(`<a href="${escapeHtml(personalInfo.website)}">Website</a>`);

  const experienceHtml = experience.map((exp) => `
    <div class="entry">
      <div class="entry-header">
        <div class="role">${escapeHtml(exp.role)}</div>
        <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      </div>
      <div class="company">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</div>
      ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="entry-header">
        <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
        <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      </div>
      <div class="company">${escapeHtml(edu.institution)}${edu.gpa ? ` · GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="cert-item">
      <strong>${escapeHtml(cert.name)}</strong>
      <span class="cert-issuer">${escapeHtml(cert.issuer)} · ${formatDate(cert.date)}</span>
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-group">
      <div class="skill-label">${escapeHtml(cat.category)}</div>
      <div class="skill-tags">${cat.items.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="entry">
      <div class="entry-header">
        <div class="role">${escapeHtml(proj.name)}</div>
      </div>
      <p>${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<div class="skill-tags" style="margin-top:4px">${proj.technologies.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      ${proj.url ? `<a href="${escapeHtml(proj.url)}" class="project-link">${escapeHtml(proj.url)}</a>` : ""}
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
    line-height: 1.5;
    color: #222;
    padding: 24px 32px;
  }
  a { color: #0369a1; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* Header */
  .header { margin-bottom: 18px; border-left: 4px solid #0ea5e9; padding-left: 16px; }
  h1 { font-size: 24pt; font-weight: 700; color: #0c4a6e; line-height: 1.2; }
  .header-title { font-size: 13pt; color: #0369a1; font-weight: 500; margin-bottom: 8px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 9.5pt; color: #555; }
  .contact-item { display: flex; align-items: center; gap: 4px; }
  .contact-item svg { color: #0ea5e9; }
  .links { font-size: 9.5pt; margin-top: 4px; }
  .links a + a::before { content: " · "; color: #999; }

  /* Sections */
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: #0c4a6e;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding-bottom: 4px;
    margin-bottom: 8px;
    border-bottom: 2px solid #e0f2fe;
  }

  /* Entries */
  .entry { margin-bottom: 10px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 600; font-size: 11pt; }
  .company { color: #555; font-size: 10pt; margin-bottom: 3px; }
  .dates { font-size: 9.5pt; color: #666; white-space: nowrap; margin-left: 12px; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 2px; }

  /* Skills */
  .skill-group { margin-bottom: 6px; }
  .skill-label { font-weight: 600; font-size: 10pt; margin-bottom: 2px; }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag {
    background: #e0f2fe;
    color: #0369a1;
    padding: 1px 8px;
    border-radius: 3px;
    font-size: 9pt;
  }

  /* Certs */
  .cert-item { margin-bottom: 4px; }
  .cert-issuer { color: #555; font-size: 9.5pt; margin-left: 4px; }

  /* Projects */
  .project-link { font-size: 9pt; }

  /* Summary */
  .summary { color: #333; }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
    ${personalInfo.title ? `<div class="header-title">${escapeHtml(personalInfo.title)}</div>` : ""}
    ${contactItems.length > 0 ? `<div class="contact-row">${contactItems.join("")}</div>` : ""}
    ${linkItems.length > 0 ? `<div class="links">${linkItems.join("")}</div>` : ""}
  </div>

  ${summary ? `<div class="section"><div class="section-title">Profile</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
  ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
  ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div>${skillsHtml}</div>` : ""}
  ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
  ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${certificationsHtml}</div>` : ""}
  ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
</body>
</html>`;
}
