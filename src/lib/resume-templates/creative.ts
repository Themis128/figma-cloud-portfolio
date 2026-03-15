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

export function renderCreative(data: ResumeFormData): string {
  const { personalInfo, summary, experience, education, certifications, skills, projects } = data;

  const contactItems: string[] = [];
  if (personalInfo.email) contactItems.push(`<span class="ci">✉ <a href="mailto:${escapeHtml(personalInfo.email)}">${escapeHtml(personalInfo.email)}</a></span>`);
  if (personalInfo.phone) contactItems.push(`<span class="ci">☎ ${escapeHtml(personalInfo.phone)}</span>`);
  if (personalInfo.location) contactItems.push(`<span class="ci">⌖ ${escapeHtml(personalInfo.location)}</span>`);
  if (personalInfo.linkedIn) contactItems.push(`<span class="ci"><a href="${escapeHtml(personalInfo.linkedIn)}">LinkedIn</a></span>`);
  if (personalInfo.github) contactItems.push(`<span class="ci"><a href="${escapeHtml(personalInfo.github)}">GitHub</a></span>`);
  if (personalInfo.website) contactItems.push(`<span class="ci"><a href="${escapeHtml(personalInfo.website)}">Portfolio</a></span>`);

  const experienceHtml = experience.map((exp) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="tl-header">
          <div class="role">${escapeHtml(exp.role)}</div>
          <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
        </div>
        <div class="company">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</div>
        ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
      </div>
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="tl-header">
          <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
          <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
        </div>
        <div class="company">${escapeHtml(edu.institution)}${edu.gpa ? ` · GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
      </div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="cert-card">
      <div class="cert-name">${escapeHtml(cert.name)}</div>
      <div class="cert-meta">${escapeHtml(cert.issuer)} · ${formatDate(cert.date)}</div>
    </div>
  `).join("");

  const skillsHtml = skills.map((cat) => `
    <div class="skill-group">
      <div class="skill-category">${escapeHtml(cat.category)}</div>
      <div class="skill-pills">${cat.items.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>
    </div>
  `).join("");

  const projectsHtml = projects.map((proj) => `
    <div class="project-card">
      <div class="role">${escapeHtml(proj.name)}${proj.url ? ` <a href="${escapeHtml(proj.url)}" class="proj-link">↗</a>` : ""}</div>
      <p class="proj-desc">${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<div class="skill-pills">${proj.technologies.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
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
    color: #1f2937;
    padding: 0;
  }

  /* Gradient header */
  .header {
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
    color: #fff;
    padding: 30px 32px 24px;
    margin: -1px;
  }
  h1 { font-size: 28pt; font-weight: 800; letter-spacing: -0.5px; }
  .header-title { font-size: 14pt; color: #e9d5ff; font-weight: 500; margin-bottom: 10px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 9pt; }
  .ci a { color: #e9d5ff; text-decoration: none; }
  .ci { color: #ddd6fe; }

  .body-content { padding: 20px 32px 24px; }

  /* Sections */
  .section { margin-bottom: 18px; }
  .section-title {
    font-size: 10pt;
    font-weight: 700;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::after {
    content: "";
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, #c084fc, transparent);
  }

  /* Timeline */
  .timeline-item { display: flex; gap: 14px; margin-bottom: 14px; position: relative; }
  .timeline-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #7c3aed; margin-top: 5px; flex-shrink: 0;
    box-shadow: 0 0 0 3px #ede9fe;
  }
  .timeline-content { flex: 1; }
  .tl-header { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 700; font-size: 11pt; color: #111827; }
  .company { color: #6b7280; font-size: 10pt; margin-bottom: 3px; }
  .dates { font-size: 9pt; color: #7c3aed; font-weight: 600; white-space: nowrap; margin-left: 12px; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 2px; color: #374151; }

  /* Skills */
  .skill-group { margin-bottom: 8px; }
  .skill-category { font-weight: 700; font-size: 10pt; color: #4c1d95; margin-bottom: 3px; }
  .skill-pills { display: flex; flex-wrap: wrap; gap: 5px; }
  .pill {
    background: linear-gradient(135deg, #ede9fe, #f3e8ff);
    color: #6d28d9;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 8.5pt;
    font-weight: 500;
  }

  /* Certs */
  .cert-card {
    display: inline-block;
    background: #faf5ff;
    border: 1px solid #e9d5ff;
    border-radius: 8px;
    padding: 6px 12px;
    margin: 0 6px 6px 0;
  }
  .cert-name { font-weight: 600; font-size: 10pt; color: #4c1d95; }
  .cert-meta { font-size: 8.5pt; color: #7c3aed; }

  /* Projects */
  .project-card {
    background: #faf5ff;
    border-left: 3px solid #7c3aed;
    padding: 10px 14px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 10px;
  }
  .proj-desc { color: #4b5563; font-size: 10pt; margin: 3px 0 5px; }
  .proj-link { color: #7c3aed; text-decoration: none; font-size: 9pt; }

  .summary { color: #374151; }
</style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
    ${personalInfo.title ? `<div class="header-title">${escapeHtml(personalInfo.title)}</div>` : ""}
    ${contactItems.length > 0 ? `<div class="contact-row">${contactItems.join("")}</div>` : ""}
  </div>

  <div class="body-content">
    ${summary ? `<div class="section"><div class="section-title">About Me</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
    ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
    ${skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div>${skillsHtml}</div>` : ""}
    ${certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div><div>${certificationsHtml}</div></div>` : ""}
    ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
    ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
  </div>
</body>
</html>`;
}
