import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure marked for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

function parseResumeMarkdown(markdownContent) {
  const lines = markdownContent.split("\n");
  const resume = {
    name: "",
    title: "",
    contact: {},
    summary: "",
    competencies: {},
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    memberships: [],
    languages: [],
    skills: {},
  };

  let currentSection = "";
  let currentItem = null;
  const _inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse header
    if (line.startsWith("# ")) {
      resume.name = line.replace("# ", "");
    } else if (line.startsWith("## ")) {
      const section = line.replace("## ", "").toLowerCase();
      if (section.includes("professional summary")) {
        currentSection = "summary";
      } else if (section.includes("core competencies") || section.includes("technical skills")) {
        currentSection = "competencies";
      } else if (section.includes("professional experience")) {
        currentSection = "experience";
      } else if (section.includes("education")) {
        currentSection = "education";
      } else if (section.includes("certifications")) {
        currentSection = "certifications";
      } else if (section.includes("projects")) {
        currentSection = "projects";
      } else if (section.includes("memberships")) {
        currentSection = "memberships";
      } else if (section.includes("languages")) {
        currentSection = "languages";
      } else if (section === "cloud architect & cybersecurity specialist") {
        resume.title = line.replace("## ", "");
      }
    } else if (line.includes("📧") || line.includes("📱") || line.includes("🌐")) {
      // Contact info line
      const emailMatch = line.match(/📧 ([^|]+)/);
      const linkedinMatch = line.match(/📱 LinkedIn: \[([^\]]+)\]/);
      const websiteMatch = line.match(/🌐 \[([^\]]+)\]/);

      if (emailMatch) resume.contact.email = emailMatch[1].trim();
      if (linkedinMatch) resume.contact.linkedin = `LinkedIn: ${linkedinMatch[1]}`;
      if (websiteMatch) resume.contact.website = websiteMatch[1].trim();
    } else if (
      currentSection === "summary" &&
      line &&
      !line.startsWith("-") &&
      !line.startsWith("---")
    ) {
      resume.summary += `${line} `;
    } else if (currentSection === "competencies") {
      if (line.startsWith("### ")) {
        const category = line.replace("### ", "");
        resume.competencies[category] = [];
        currentItem = category;
      } else if (line.startsWith("- **")) {
        const skillLine = line.replace("- **", "").replace("**", "");
        const [skill, _description] = skillLine.split(": ");
        if (currentItem && resume.competencies[currentItem]) {
          resume.competencies[currentItem].push(skill.trim());
        }
      }
    } else if (currentSection === "skills") {
      if (line.startsWith("### ")) {
        const category = line.replace("### ", "").replace(/\*/g, "");
        resume.competencies[category] = [];
        currentItem = category;
      } else if (line.startsWith("- ")) {
        const skillLine = line.replace("- ", "");
        if (skillLine.includes("(")) {
          const [skill, _level] = skillLine.split(" (");
          if (currentItem && resume.competencies[currentItem]) {
            resume.competencies[currentItem].push(skill.trim());
          }
        }
      }
    } else if (currentSection === "experience") {
      if (line.startsWith("### ")) {
        currentItem = {
          title: line.replace("### ", ""),
          company: "",
          date: "",
          achievements: [],
        };
        resume.experience.push(currentItem);
      } else if (
        currentItem &&
        !line.startsWith("### ") &&
        !line.startsWith("- ") &&
        !line.startsWith("**") &&
        line.includes("|")
      ) {
        // Company and location line
        const [company, location] = line.split(" | ");
        currentItem.company = `${company.trim()} | ${location.trim()}`;
      } else if (currentItem && line.match(/^[A-Z][a-z]+ \d{4} - (Present|[A-Z][a-z]+ \d{4})$/)) {
        // Date line
        currentItem.date = line;
      } else if (currentItem && line.startsWith("- ")) {
        currentItem.achievements.push(line.replace("- ", ""));
      }
    } else if (currentSection === "education") {
      if (line.startsWith("**")) {
        const degree = line.replace(/\*\*/g, "");
        const institution = lines[i + 1] ? lines[i + 1].replace(/\*\*/g, "") : "";
        const date = lines[i + 2] ? lines[i + 2].replace(/\*\*/g, "") : "";
        resume.education.push({ degree, institution, date });
        i += 2; // Skip next lines
      }
    } else if (currentSection === "certifications") {
      if (line.startsWith("- **")) {
        const certLine = line.replace("- **", "").replace("**", "");
        const [cert, year] = certLine.split(" (");
        const issuer = lines[i + 1] ? lines[i + 1].replace("- ", "") : "";
        resume.certifications.push({
          name: cert.trim(),
          issuer: issuer.replace(/^\*\*/, "").replace(/\*\*$/, ""),
          year: year ? year.replace(")", "") : "",
        });
        i += 1; // Skip next line
      }
    }
  }

  return resume;
}

function generateHTML(resume) {
  const skillLevels = {
    "Microsoft Azure": 95,
    "Azure AD & Identity": 98,
    "Microsoft 365": 92,
    AWS: 85,
    "Azure AD Premium, Microsoft Defender Suite": 95,
    "Azure Sentinel & SIEM": 90,
    "Zero Trust Architecture": 93,
    "Compliance (GDPR, ISO 27001)": 88,
    "Active Directory": 90,
    "Windows Server": 85,
    "PowerShell & Automation": 88,
    "VMware & Virtualization": 82,
  };

  // Modern color palette with accessibility
  const colors = {
    primary: "#1e293b", // Slate-800
    secondary: "#0f172a", // Slate-900
    accent: "#06b6d4", // Cyan-500
    accentLight: "#67e8f9", // Cyan-300
    text: "#334155", // Slate-600
    textLight: "#64748b", // Slate-500
    success: "#10b981", // Emerald-500
    warning: "#f59e0b", // Amber-500
    background: "#f8fafc", // Slate-50
    card: "#ffffff",
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modern Tech Resume - ${resume.name}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: ${colors.text};
        background: linear-gradient(135deg, ${colors.background} 0%, #e2e8f0 100%);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .resume-container {
        max-width: 210mm;
        margin: 0 auto;
        background: ${colors.card};
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06);
        min-height: 297mm;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
      }

      .header {
        background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
        color: white;
        padding: 50px 40px;
        position: relative;
        overflow: hidden;
      }

      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.03"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.03"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.1;
      }

      .header-content {
        position: relative;
        z-index: 1;
        text-align: center;
      }

      .header h1 {
        font-size: 3em;
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, white 0%, ${colors.accentLight} 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .header h2 {
        font-size: 1.3em;
        font-weight: 400;
        opacity: 0.9;
        margin-bottom: 25px;
        letter-spacing: 0.01em;
      }

      .contact-info {
        display: flex;
        justify-content: center;
        gap: 25px;
        font-size: 0.95em;
        flex-wrap: wrap;
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .main-content {
        display: flex;
        flex: 1;
      }

      .left-column {
        width: 35%;
        background: linear-gradient(180deg, ${colors.background} 0%, #f1f5f9 100%);
        padding: 35px;
        border-right: 1px solid #e2e8f0;
      }

      .right-column {
        width: 65%;
        padding: 35px;
      }

      .section {
        margin-bottom: 35px;
      }

      .section-title {
        font-size: 1.2em;
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 20px;
        position: relative;
        padding-bottom: 8px;
      }

      .section-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 3px;
        background: linear-gradient(90deg, ${colors.accent}, ${colors.accentLight});
        border-radius: 2px;
      }

      .skill-category {
        margin-bottom: 25px;
      }

      .skill-category h4 {
        font-size: 0.9em;
        color: ${colors.primary};
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }

      .skill-item {
        margin-bottom: 12px;
      }

      .skill-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .skill-name {
        font-weight: 500;
        color: ${colors.text};
        font-size: 0.9em;
      }

      .skill-percentage {
        font-size: 0.8em;
        color: ${colors.accent};
        font-weight: 600;
      }

      .skill-bar {
        background: #e2e8f0;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }

      .skill-fill {
        height: 100%;
        background: linear-gradient(90deg, ${colors.accent}, ${colors.accentLight});
        border-radius: 4px;
        transition: width 0.3s ease;
        position: relative;
      }

      .skill-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }

      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      .certification-item {
        margin-bottom: 15px;
        padding: 12px;
        background: white;
        border-radius: 8px;
        border-left: 4px solid ${colors.success};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        transition: transform 0.2s ease;
      }

      .certification-item:hover {
        transform: translateY(-2px);
      }

      .certification-item strong {
        display: block;
        color: ${colors.primary};
        font-weight: 600;
        margin-bottom: 2px;
      }

      .certification-item .issuer {
        color: ${colors.textLight};
        font-size: 0.85em;
      }

      .certification-item .year {
        color: ${colors.accent};
        font-size: 0.8em;
        font-weight: 500;
      }

      .experience-item {
        margin-bottom: 30px;
        position: relative;
        padding-left: 20px;
      }

      .experience-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        width: 8px;
        height: 8px;
        background: ${colors.accent};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.2);
      }

      .experience-header {
        margin-bottom: 12px;
      }

      .job-title {
        font-size: 1.1em;
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 2px;
      }

      .company {
        font-weight: 500;
        color: ${colors.text};
        font-size: 0.95em;
      }

      .date {
        color: ${colors.textLight};
        font-size: 0.85em;
        font-weight: 500;
        margin-top: 4px;
      }

      .achievement-list {
        margin-top: 12px;
      }

      .achievement-item {
        margin-bottom: 8px;
        position: relative;
        padding-left: 16px;
        font-size: 0.9em;
        line-height: 1.5;
      }

      .achievement-item::before {
        content: "→";
        color: ${colors.accent};
        position: absolute;
        left: 0;
        font-weight: bold;
      }

      .education-item {
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        border-left: 4px solid ${colors.warning};
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .degree {
        font-weight: 600;
        color: ${colors.primary};
        margin-bottom: 2px;
      }

      .institution {
        color: ${colors.text};
        font-size: 0.9em;
        margin-bottom: 2px;
      }

      .education-date {
        color: ${colors.textLight};
        font-size: 0.85em;
        font-weight: 500;
      }

      .summary {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        padding: 25px;
        border-radius: 12px;
        border-left: 4px solid ${colors.accent};
        margin-bottom: 35px;
        position: relative;
        overflow: hidden;
      }

      .summary::before {
        content: '"';
        position: absolute;
        top: 15px;
        left: 20px;
        font-size: 4em;
        color: rgba(6, 182, 212, 0.1);
        font-family: Georgia, serif;
        line-height: 1;
      }

      .summary p {
        font-size: 1em;
        line-height: 1.7;
        color: ${colors.text};
        position: relative;
        z-index: 1;
        margin-left: 20px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-top: 20px;
      }

      .metric-item {
        background: white;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        border: 1px solid #e2e8f0;
      }

      .metric-value {
        font-size: 1.5em;
        font-weight: 700;
        color: ${colors.accent};
        display: block;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 0.8em;
        color: ${colors.textLight};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      }

      @media print {
        body {
          background: white;
        }

        .resume-container {
          box-shadow: none;
          margin: 0;
          border-radius: 0;
        }

        .contact-item {
          background: rgba(30, 41, 59, 0.1);
        }
      }

      @media (max-width: 768px) {
        .main-content {
          flex-direction: column;
        }

        .left-column, .right-column {
          width: 100%;
        }

        .header h1 {
          font-size: 2.5em;
        }

        .contact-info {
          flex-direction: column;
          gap: 10px;
        }
      }
    </style>
  </head>

  <body>
    <div class="resume-container">
      <header class="header">
        <div class="header-content">
          <h1>${resume.name}</h1>
          <h2>${resume.title}</h2>
          <div class="contact-info">
            ${resume.contact.email ? `<div class="contact-item">📧 ${resume.contact.email}</div>` : ""}
            ${resume.contact.linkedin ? `<div class="contact-item">💼 ${resume.contact.linkedin.replace("LinkedIn: ", "")}</div>` : ""}
            ${resume.contact.website ? `<div class="contact-item">🌐 ${resume.contact.website}</div>` : ""}
          </div>
        </div>
      </header>

      <div class="main-content">
        <div class="left-column">
          <div class="section">
            <h3 class="section-title">💡 Core Competencies</h3>

            ${Object.entries(resume.competencies)
              .map(
                ([category, skills]) => `
            <div class="skill-category">
              <h4>${category}</h4>
              ${skills
                .map((skill) => {
                  const level = skillLevels[skill] || 85;
                  return `
                <div class="skill-item">
                  <div class="skill-header">
                    <span class="skill-name">${skill}</span>
                    <span class="skill-percentage">${level}%</span>
                  </div>
                  <div class="skill-bar">
                    <div class="skill-fill" style="width: ${level}%"></div>
                  </div>
                </div>
                `;
                })
                .join("")}
            </div>
            `,
              )
              .join("")}

            ${
              resume.certifications.length > 0
                ? `
          <div class="section">
            <h3 class="section-title">🏆 Certifications</h3>
            ${resume.certifications
              .map(
                (cert) => `
            <div class="certification-item">
              <strong>${cert.name}</strong>
              <span class="issuer">${cert.issuer}</span>
              ${cert.year ? `<span class="year">${cert.year}</span>` : ""}
            </div>
            `,
              )
              .join("")}
          </div>
            `
                : ""
            }

          ${
            resume.education.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">🎓 Education</h3>
            ${resume.education
              .map(
                (edu) => `
            <div class="education-item">
              <div class="degree">${edu.degree}</div>
              <div class="institution">${edu.institution}</div>
              <div class="education-date">${edu.date}</div>
            </div>
            `,
              )
              .join("")}
          </div>
            `
              : ""
          }
        </div>

        <div class="right-column">
          ${
            resume.summary
              ? `
          <div class="summary">
            <p>${resume.summary.trim()}</p>
          </div>
            `
              : ""
          }

          ${
            resume.experience.length > 0
              ? `
          <div class="section">
            <h3 class="section-title">🚀 Professional Experience</h3>

            ${resume.experience
              .map(
                (exp) => `
            <div class="experience-item">
              <div class="experience-header">
                <div class="job-title">${exp.title}</div>
                <div class="company">${exp.company}</div>
                <div class="date">${exp.date}</div>
              </div>
              <div class="achievement-list">
                ${exp.achievements
                  .map(
                    (achievement) => `
                <div class="achievement-item">${achievement}</div>
                `,
                  )
                  .join("")}
              </div>
            </div>
            `,
              )
              .join("")}
          </div>
            `
              : ""
          }

          <!-- Key Metrics Section -->
          <div class="section">
            <h3 class="section-title">📊 Key Achievements</h3>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-value">15+</span>
                <span class="metric-label">Years Experience</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">60%</span>
                <span class="metric-label">Security Incident Reduction</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">€2.5M</span>
                <span class="metric-label">Cost Savings</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">99.9%</span>
                <span class="metric-label">Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function generateResume() {
  const startTime = Date.now();

  try {
    const markdownPath = path.join(__dirname, "..", "public", "resume-content.md");
    const htmlPath = path.join(__dirname, "..", "public", "modern-resume.html");

    // Check if markdown file exists
    if (!fs.existsSync(markdownPath)) {
      throw new Error(`Resume content file not found: ${markdownPath}`);
    }

    const markdownContent = fs.readFileSync(markdownPath, "utf8");

    const resume = parseResumeMarkdown(markdownContent);

    // Validate parsed data
    if (!resume.name) {
    }
    if (!resume.title) {
    }
    if (Object.keys(resume.competencies).length === 0) {
    }

    const htmlContent = generateHTML(resume);

    fs.writeFileSync(htmlPath, htmlContent, "utf8");

    const endTime = Date.now();
    const _duration = ((endTime - startTime) / 1000).toFixed(2);
  } catch (error) {
    const endTime = Date.now();
    const _duration = ((endTime - startTime) / 1000).toFixed(2);

    if (error.code === "ENOENT") {
    }

    process.exit(1);
  }
}

generateResume();
