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

export function renderClassic(data: ResumeFormData): string {
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
        <div>
          <strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.company)}
          ${exp.location ? `<span class="location">, ${escapeHtml(exp.location)}</span>` : ""}
        </div>
        <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      </div>
      ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="entry-header">
        <div><strong>${escapeHtml(edu.degree)}</strong> in ${escapeHtml(edu.field)} — ${escapeHtml(edu.institution)}</div>
        <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      </div>
      ${edu.gpa ? `<p class="gpa">GPA: ${escapeHtml(edu.gpa)}</p>` : ""}
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="entry">
      <div class="entry-header">
        <div><strong>${escapeHtml(cert.name)}</strong> — ${escapeHtml(cert.issuer)}</div>
        <div class="dates">${formatDate(cert.date)}</div>
      </div>
      ${cert.credentialId ? `<p class="credential">ID: ${escapeHtml(cert.credentialId)}</p>` : ""}
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-row">
      <strong>${escapeHtml(cat.category)}:</strong> ${cat.items.map(escapeHtml).join(", ")}
    </div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <strong>${escapeHtml(proj.name)}</strong>
          ${proj.url ? ` — <a href="${escapeHtml(proj.url)}">${escapeHtml(proj.url)}</a>` : ""}
        </div>
      </div>
      <p>${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<p class="tech">Technologies: ${proj.technologies.map(escapeHtml).join(", ")}</p>` : ""}
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
    font-family: Georgia, "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    padding: 24px 32px;
  }
  a { color: #1a1a1a; text-decoration: underline; }
  h1 { font-size: 22pt; font-weight: 700; margin-bottom: 2px; }
  .title { font-size: 13pt; color: #444; margin-bottom: 6px; }
  .contact { font-size: 9.5pt; color: #555; margin-bottom: 16px; }
  .contact a { color: #555; }
  .contact span + span::before { content: " | "; }
  .section { margin-bottom: 14px; }
  .section-title {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1.5px solid #1a1a1a;
    padding-bottom: 3px;
    margin-bottom: 8px;
  }
  .entry { margin-bottom: 10px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .dates { font-size: 10pt; color: #555; white-space: nowrap; margin-left: 12px; }
  .location { color: #555; }
  ul { margin: 4px 0 0 18px; }
  li { margin-bottom: 2px; }
  .gpa, .credential, .tech { font-size: 10pt; color: #555; margin-top: 2px; }
  .skill-row { margin-bottom: 4px; }
  .summary { margin-bottom: 4px; }
</style>
</head>
<body>
  <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
  ${personalInfo.title ? `<div class="title">${escapeHtml(personalInfo.title)}</div>` : ""}
  ${contactParts.length > 0 ? `<div class="contact">${contactParts.map((p) => `<span>${p}</span>`).join("")}</div>` : ""}

  ${summary ? `<div class="section"><div class="section-title">Summary</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
  ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
  ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
  ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div>${skillsHtml}</div>` : ""}
  ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${certificationsHtml}</div>` : ""}
  ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
</body>
</html>`;
}
