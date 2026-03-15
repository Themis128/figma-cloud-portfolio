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

export function renderEmerald(data: ResumeFormData): string {
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
          <div class="role">${escapeHtml(exp.role)}</div>
          <div class="company">${escapeHtml(exp.company)}${exp.location ? ` · ${escapeHtml(exp.location)}` : ""}</div>
        </div>
        <div class="dates">${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate ?? "")}</div>
      </div>
      ${exp.highlights.length > 0 ? `<ul>${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>` : ""}
    </div>
  `).join("");

  const educationHtml = education.map((edu) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <div class="role">${escapeHtml(edu.degree)} in ${escapeHtml(edu.field)}</div>
          <div class="company">${escapeHtml(edu.institution)}${edu.gpa ? ` · GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
        </div>
        <div class="dates">${formatDate(edu.startDate)} – ${formatDate(edu.endDate ?? "")}</div>
      </div>
    </div>
  `).join("");

  const certificationsHtml = certifications.map((cert) => `
    <div class="cert-item">
      <div class="cert-icon">✓</div>
      <div>
        <span class="cert-name">${escapeHtml(cert.name)}</span>
        <span class="cert-meta"> — ${escapeHtml(cert.issuer)}, ${formatDate(cert.date)}</span>
      </div>
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
      <div class="role">${escapeHtml(proj.name)}${proj.url ? ` <a href="${escapeHtml(proj.url)}" class="link">↗</a>` : ""}</div>
      <p class="desc">${escapeHtml(proj.description)}</p>
      ${proj.technologies.length > 0 ? `<div class="skill-tags" style="margin-top:4px">${proj.technologies.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
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
    line-height: 1.55;
    color: #1a1a2e;
    display: flex;
    min-height: 100vh;
  }

  /* Green sidebar */
  .sidebar {
    width: 220px;
    background: linear-gradient(180deg, #065f46, #047857, #059669);
    color: #fff;
    padding: 28px 20px;
    flex-shrink: 0;
  }
  .sidebar h1 { font-size: 18pt; font-weight: 700; line-height: 1.2; margin-bottom: 2px; }
  .sidebar .title { font-size: 10pt; color: #a7f3d0; margin-bottom: 16px; }
  .sidebar .section-title {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #6ee7b7;
    margin-bottom: 6px;
    margin-top: 14px;
  }
  .sidebar .contact-item {
    font-size: 8.5pt;
    color: #d1fae5;
    margin-bottom: 4px;
    word-break: break-all;
  }
  .sidebar a { color: #a7f3d0; text-decoration: none; }

  .sidebar .skill-group { margin-bottom: 10px; }
  .sidebar .skill-label { font-weight: 700; font-size: 9pt; color: #ecfdf5; margin-bottom: 3px; }
  .sidebar .skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
  .sidebar .tag {
    background: rgba(255,255,255,0.15);
    color: #d1fae5;
    padding: 1px 7px;
    border-radius: 3px;
    font-size: 8pt;
  }

  .sidebar .cert-item { display: flex; gap: 6px; margin-bottom: 5px; align-items: flex-start; }
  .sidebar .cert-icon { color: #6ee7b7; font-weight: 700; font-size: 10pt; margin-top: -1px; }
  .sidebar .cert-name { font-weight: 600; font-size: 9pt; color: #ecfdf5; }
  .sidebar .cert-meta { font-size: 8pt; color: #a7f3d0; }

  /* Main content */
  .main {
    flex: 1;
    padding: 28px 28px 24px;
  }

  .section { margin-bottom: 16px; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: #065f46;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding-bottom: 4px;
    margin-bottom: 10px;
    border-bottom: 2px solid #d1fae5;
  }

  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
  .role { font-weight: 700; font-size: 11pt; color: #064e3b; }
  .company { color: #6b7280; font-size: 10pt; margin-bottom: 3px; }
  .dates { font-size: 9pt; color: #059669; font-weight: 600; white-space: nowrap; margin-left: 12px; }
  ul { margin: 4px 0 0 16px; }
  li { margin-bottom: 2px; color: #374151; }
  li::marker { color: #10b981; }

  .desc { color: #4b5563; font-size: 10pt; margin-top: 2px; }
  .link { color: #059669; text-decoration: none; font-size: 9pt; }

  .summary {
    color: #374151;
    padding: 10px 14px;
    background: #ecfdf5;
    border-radius: 6px;
  }

  .main .skill-group { margin-bottom: 6px; }
  .main .skill-label { font-weight: 600; font-size: 10pt; margin-bottom: 2px; }
  .main .skill-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .main .tag { background: #d1fae5; color: #065f46; padding: 1px 8px; border-radius: 3px; font-size: 8.5pt; }
</style>
</head>
<body>
  <div class="sidebar">
    <h1>${escapeHtml(personalInfo.name || "Your Name")}</h1>
    ${personalInfo.title ? `<div class="title">${escapeHtml(personalInfo.title)}</div>` : ""}

    <div class="section-title">Contact</div>
    ${contactParts.map((p) => `<div class="contact-item">${p}</div>`).join("")}

    ${skills.length > 0 ? `
      <div class="section-title">Skills</div>
      ${skillsHtml}
    ` : ""}

    ${certifications.length > 0 ? `
      <div class="section-title">Certifications</div>
      ${certificationsHtml}
    ` : ""}
  </div>

  <div class="main">
    ${summary ? `<div class="section"><div class="section-title">About</div><p class="summary">${escapeHtml(summary)}</p></div>` : ""}
    ${experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${experienceHtml}</div>` : ""}
    ${education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${educationHtml}</div>` : ""}
    ${projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${projectsHtml}</div>` : ""}
  </div>
</body>
</html>`;
}
