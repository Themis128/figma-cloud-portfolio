// Chat API endpoint — uses AWS Bedrock (Claude 3.5 Haiku) with tool use,
// knowledge base, blog RAG, and action tokens for booking/contact/navigation.
import { Router, Request, Response } from "express";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  type ConverseStreamCommandInput,
  type ContentBlock,
  type Message as BedrockMessage,
  type ToolConfiguration,
  type ToolResultContentBlock,
} from "@aws-sdk/client-bedrock-runtime";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// ── Simple in-memory rate limiter ────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window per IP
const RATE_LIMIT_MAP_MAX_SIZE = 10_000; // prevent memory exhaustion
const MAX_MESSAGE_LENGTH = 2_000; // max characters per message
const MAX_HISTORY_CONTENT_LENGTH = 1_000; // max characters per history entry
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    if (rateLimitMap.size >= RATE_LIMIT_MAP_MAX_SIZE) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest !== undefined) rateLimitMap.delete(oldest);
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

const BEDROCK_REGION = process.env.BEDROCK_REGION ?? "us-east-1";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ?? "us.anthropic.claude-3-5-haiku-20241022-v1:0";
const MAX_HISTORY_TURNS = 6;
const MAX_TOOL_ROUNDS = 2; // prevent infinite tool-use loops

interface HistoryMessage {
  role: string;
  content: string;
}

// ── Knowledge base (loaded once at startup) ─────────────────────────────────

let _knowledgeBase: string | null = null;

function getKnowledgeBase(): string {
  if (_knowledgeBase !== null) return _knowledgeBase;

  const knowledgeDir = join(__dirname, "..", "bot", "knowledge");
  try {
    const files = readdirSync(knowledgeDir)
      .filter((f) => f.endsWith(".md"))
      .sort();

    _knowledgeBase = files
      .map((f) => readFileSync(join(knowledgeDir, f), "utf-8"))
      .join("\n\n---\n\n");

    console.log(
      `Loaded knowledge base: ${files.length} files, ${_knowledgeBase.length} chars`,
    );
  } catch {
    _knowledgeBase = "";
    console.warn(
      `WARNING: Knowledge base not found at ${knowledgeDir}. Chatbot will have no context.`,
    );
  }

  return _knowledgeBase;
}

// ── NLP utilities ───────────────────────────────────────────────────────────

// Stop words to filter from search queries
const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "about",
  "what", "which", "who", "whom", "this", "that", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "tell", "know",
  "think", "want", "like", "get", "make", "go", "see", "look",
  "also", "back", "use", "much", "many", "up", "down",
]);

// Synonym map — expands user terms to match knowledge base vocabulary
const SYNONYMS: Record<string, string[]> = {
  // Cybersecurity
  infosec: ["cybersecurity", "security"],
  "cyber security": ["cybersecurity"],
  hacking: ["cybersecurity", "penetration", "security"],
  pentest: ["penetration", "security"],
  soc: ["security", "sentinel", "monitoring"],
  siem: ["sentinel", "security", "monitoring"],
  iam: ["identity", "access", "management", "cyberark"],
  pam: ["cyberark", "privileged", "access"],
  "zero-trust": ["zero trust", "ztna"],
  ztna: ["zero trust", "zero-trust"],
  firewall: ["fortinet", "fortigate", "security"],
  // Cloud
  cloud: ["aws", "azure", "cloud architecture"],
  serverless: ["lambda", "aws"],
  containers: ["kubernetes", "docker", "k8s"],
  k8s: ["kubernetes"],
  devops: ["ci/cd", "pipeline", "infrastructure"],
  iaas: ["cloud", "infrastructure"],
  paas: ["cloud", "platform"],
  // Networking
  networking: ["cisco", "network", "infrastructure"],
  switching: ["cisco", "network"],
  routing: ["cisco", "network"],
  datacenter: ["cisco", "ucs", "hyperflex", "aci"],
  "data center": ["cisco", "ucs", "hyperflex", "aci"],
  hyperconverged: ["hyperflex", "hci"],
  hci: ["hyperflex", "hyperconverged"],
  // Certifications
  certs: ["certifications", "certified"],
  cert: ["certification", "certified"],
  ccna: ["cisco", "certification", "network"],
  cissp: ["cybersecurity", "certification", "security"],
  // General
  resume: ["cv", "experience", "background"],
  cv: ["resume", "experience", "background"],
  portfolio: ["projects", "website", "work"],
  skills: ["expertise", "technologies", "tech stack"],
  experience: ["work", "career", "employment", "job"],
  job: ["work", "career", "employment", "experience"],
  education: ["degree", "university", "masters", "bachelor"],
  degree: ["education", "university", "masters", "bachelor"],
  hire: ["consulting", "available", "services"],
  consult: ["consulting", "available", "services"],
  blog: ["article", "post", "writing"],
  article: ["blog", "post", "writing"],
};

/** Simple English stemmer — reduces words to approximate roots */
function stem(word: string): string {
  let w = word.toLowerCase();
  // Common suffixes
  if (w.endsWith("ation")) return w.slice(0, -5);
  if (w.endsWith("ment")) return w.slice(0, -4);
  if (w.endsWith("ness")) return w.slice(0, -4);
  if (w.endsWith("ence")) return w.slice(0, -4);
  if (w.endsWith("ance")) return w.slice(0, -4);
  if (w.endsWith("ible")) return w.slice(0, -4);
  if (w.endsWith("able")) return w.slice(0, -4);
  if (w.endsWith("tion")) return w.slice(0, -4);
  if (w.endsWith("sion")) return w.slice(0, -4);
  if (w.endsWith("ment")) return w.slice(0, -4);
  if (w.endsWith("ful")) return w.slice(0, -3);
  if (w.endsWith("ous")) return w.slice(0, -3);
  if (w.endsWith("ive")) return w.slice(0, -3);
  if (w.endsWith("ing") && w.length > 5) return w.slice(0, -3);
  if (w.endsWith("ied")) return w.slice(0, -3) + "y";
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("ed") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("er") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("ly") && w.length > 4) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) return w.slice(0, -1);
  return w;
}

/** Tokenize, filter stop words, expand synonyms, and stem */
function normalizeQuery(query: string): string[] {
  const raw = query.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();

  for (const word of raw) {
    if (STOP_WORDS.has(word)) continue;
    expanded.add(word);
    expanded.add(stem(word));

    // Check synonym map (both exact and stemmed)
    const syns = SYNONYMS[word] ?? SYNONYMS[stem(word)];
    if (syns) {
      for (const s of syns) expanded.add(s.toLowerCase());
    }
  }

  return [...expanded];
}

/** Score how well a text matches a set of normalized terms (TF-IDF-lite) */
function scoreMatch(text: string, terms: string[], boost: number = 1): number {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const wordCount = words.length || 1;
  let score = 0;

  for (const term of terms) {
    // Exact substring match
    if (lower.includes(term)) {
      // Count occurrences (term frequency)
      const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = lower.match(regex);
      const tf = matches ? matches.length / wordCount : 0;
      // Inverse document frequency approximation (shorter terms = more common = less weight)
      const idf = Math.log(1 + 10 / (term.length || 1));
      score += (tf * idf + 1) * boost;
    }

    // Stemmed match (slightly lower weight)
    const stemmed = stem(term);
    if (stemmed !== term && lower.includes(stemmed)) {
      score += 0.5 * boost;
    }
  }

  return score;
}

// ── Blog index for RAG (loaded once at startup) ────────────────────────────

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  plainText: string;
}

let _blogIndex: BlogPost[] | null = null;

function getBlogIndex(): BlogPost[] {
  if (_blogIndex !== null) return _blogIndex;

  const blogDir = join(__dirname, "..", "..", "content", "blog");
  _blogIndex = [];

  if (!existsSync(blogDir)) {
    console.warn(`Blog directory not found at ${blogDir}. Blog search disabled.`);
    return _blogIndex;
  }

  try {
    const files = readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const raw = readFileSync(join(blogDir, file), "utf-8");

      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) continue;

      const fm = fmMatch[1];
      const title = fm.match(/title:\s*"(.+?)"/)?.[1] ?? file;
      const slug = fm.match(/slug:\s*(.+)/)?.[1]?.trim()?.replace(/^"/, "").replace(/"$/, "") ?? file.replace(".mdx", "");
      const description = fm.match(/description:\s*"(.+?)"/)?.[1] ?? "";
      const date = fm.match(/date:\s*"(.+?)"/)?.[1] ?? "";
      const tagsMatch = fm.match(/tags:\s*\[(.+?)]/);
      const tags = tagsMatch
        ? tagsMatch[1].split(",").map((t) => t.trim().replace(/"/g, ""))
        : [];

      const body = raw.slice(fmMatch[0].length);
      const plainText = body
        .replace(/```[\s\S]*?```/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/!\[.*?]\(.*?\)/g, "")
        .replace(/\[(.+?)]\(.*?\)/g, "$1")
        .replace(/#{1,6}\s+/g, "")
        .replace(/[*_~`]/g, "")
        .replace(/\n{2,}/g, "\n")
        .trim();

      _blogIndex.push({ slug, title, description, tags, date, plainText });
    }

    console.log(`Loaded blog index: ${_blogIndex.length} posts`);
  } catch {
    console.warn("Failed to load blog index.");
  }

  return _blogIndex;
}

function searchBlog(query: string): Array<{ title: string; description: string; url: string; excerpt: string }> {
  const posts = getBlogIndex();
  const terms = normalizeQuery(query);
  if (terms.length === 0) return [];

  const scored = posts.map((post) => {
    const titleScore = scoreMatch(post.title, terms, 10);
    const tagScore = scoreMatch(post.tags.join(" "), terms, 5);
    const descScore = scoreMatch(post.description, terms, 3);
    const bodyScore = scoreMatch(post.plainText, terms, 1);
    return { post, score: titleScore + tagScore + descScore + bodyScore };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => {
      // Extract best excerpt — find the densest passage with matching terms
      const lower = post.plainText.toLowerCase();
      let bestStart = 0;
      let bestDensity = 0;

      // Slide a 300-char window across the text, score each window
      for (let i = 0; i < lower.length - 100; i += 50) {
        const window = lower.slice(i, i + 300);
        let density = 0;
        for (const term of terms) {
          if (window.includes(term)) density++;
        }
        if (density > bestDensity) {
          bestDensity = density;
          bestStart = i;
        }
      }

      const excerpt = (bestStart > 0 ? "…" : "") +
        post.plainText.slice(bestStart, bestStart + 300).trim() +
        (bestStart + 300 < post.plainText.length ? "…" : "");

      return {
        title: post.title,
        description: post.description,
        url: `/${post.slug}/`,
        excerpt,
      };
    });
}

// ── Portfolio search (built from knowledge base sections) ───────────────────

interface PortfolioEntry {
  title: string;
  type: string;
  description: string;
  keywords: string[];
}

let _portfolioIndex: PortfolioEntry[] | null = null;

function getPortfolioIndex(): PortfolioEntry[] {
  if (_portfolioIndex !== null) return _portfolioIndex;

  _portfolioIndex = [
    // Skills
    { title: "Cloud Architecture", type: "skill", description: "AWS, Azure, multi-cloud environments, migration strategies, S3, CloudFront, Lambda, Route 53", keywords: ["cloud", "aws", "azure", "serverless", "lambda", "s3", "cloudfront", "multi-cloud"] },
    { title: "Cybersecurity", type: "skill", description: "Zero-trust security, CyberArk PAM, Microsoft Sentinel, SIEM/SOC, penetration testing, CISSP", keywords: ["cybersecurity", "security", "zero trust", "cyberark", "pam", "sentinel", "siem", "soc", "cissp", "infosec"] },
    { title: "Network Engineering", type: "skill", description: "Cisco ACI, UCS, HyperFlex, Nexus switching, Fortinet FortiGate, VPN, VLAN, BGP, OSPF", keywords: ["cisco", "networking", "aci", "ucs", "hyperflex", "fortinet", "fortigate", "switching", "routing", "firewall", "vpn"] },
    { title: "Full-Stack Development", type: "skill", description: "React, Next.js, TypeScript, Node.js, Python, Three.js, Tailwind CSS, REST APIs", keywords: ["react", "nextjs", "typescript", "nodejs", "python", "fullstack", "frontend", "backend", "web development"] },
    { title: "DevOps & Infrastructure", type: "skill", description: "Docker, Kubernetes, CI/CD pipelines, VMware vSphere, Ansible, Terraform, GitHub Actions", keywords: ["devops", "docker", "kubernetes", "k8s", "ci/cd", "vmware", "ansible", "terraform", "infrastructure"] },
    { title: "Identity & Access Management", type: "skill", description: "Azure AD, Microsoft Entra, Intune MDM, Conditional Access, MFA, RBAC, SSO", keywords: ["iam", "azure ad", "entra", "intune", "mdm", "mfa", "rbac", "sso", "identity", "access"] },
    // Experience
    { title: "Hellenic Navy — Skaramangas Shipyards", type: "experience", description: "IT Network & Security Specialist — enterprise network management, cybersecurity operations, VMware virtualization", keywords: ["navy", "skaramangas", "military", "current", "network", "security"] },
    { title: "Estarta Solutions", type: "experience", description: "Systems and Network Engineer — Cisco UCS, HyperFlex, ACI data center deployment", keywords: ["estarta", "cisco", "ucs", "hyperflex", "aci", "data center"] },
    { title: "Athens International Airport", type: "experience", description: "Network Operations Center Engineer — NOC monitoring, incident response, network troubleshooting", keywords: ["airport", "athens", "noc", "monitoring", "operations"] },
    { title: "Cosmos Business Systems", type: "experience", description: "IT Support Engineer — Azure AD, Microsoft 365, Intune MDM, endpoint management", keywords: ["cosmos", "microsoft", "365", "intune", "azure", "support"] },
    { title: "COVID-19 Response", type: "experience", description: "Led rapid deployment of remote access infrastructure for hospital network continuity", keywords: ["covid", "pandemic", "remote", "hospital", "vpn"] },
    // Pages
    { title: "About Themistoklis", type: "page", description: "Cloud Architect & Cybersecurity Specialist — skills, certifications, background", keywords: ["about", "background", "bio", "profile"] },
    { title: "Work Experience", type: "page", description: "Career timeline with 7 roles across 15+ years", keywords: ["experience", "career", "timeline", "jobs", "work history"] },
    { title: "Projects Portfolio", type: "page", description: "12 personal and professional projects", keywords: ["projects", "portfolio", "work", "built"] },
    { title: "Blog", type: "page", description: "Articles on cloud architecture, cybersecurity, and web development", keywords: ["blog", "articles", "writing", "posts"] },
    { title: "Performance", type: "page", description: "Live web performance metrics and Core Web Vitals", keywords: ["performance", "speed", "metrics", "web vitals", "lighthouse"] },
    { title: "AI Agents", type: "page", description: "AI agent templates, patterns, and Blockly workflow builder", keywords: ["agents", "ai", "automation", "blockly", "workflow"] },
    { title: "Contact", type: "page", description: "Get in touch for consulting, collaboration, or career opportunities", keywords: ["contact", "email", "hire", "reach", "message"] },
    { title: "Resume Builder", type: "page", description: "Interactive resume builder and PDF export", keywords: ["resume", "cv", "builder", "pdf"] },
    // Certifications
    { title: "Cisco DevNet Associate", type: "certification", description: "Cisco Certified DevNet Associate — network automation, APIs, Python for networking", keywords: ["devnet", "cisco", "automation", "api", "python"] },
    { title: "Fortinet NSE", type: "certification", description: "Fortinet Network Security Expert certifications", keywords: ["fortinet", "nse", "firewall", "security"] },
    { title: "CISSP (In Progress)", type: "certification", description: "Certified Information Systems Security Professional", keywords: ["cissp", "security", "certification"] },
    // Education
    { title: "M.Sc. Data Analytics", type: "education", description: "Master's degree in Data Analytics — machine learning, data science, statistical analysis", keywords: ["masters", "data analytics", "machine learning", "data science", "education", "degree"] },
    { title: "B.Sc. Informatics", type: "education", description: "Bachelor's degree in Informatics and Telecommunications", keywords: ["bachelors", "informatics", "telecommunications", "education", "degree", "university"] },
  ];

  return _portfolioIndex;
}

function searchPortfolio(query: string): Array<{ title: string; type: string; description: string; relevance: number }> {
  const terms = normalizeQuery(query);
  if (terms.length === 0) return [];

  const index = getPortfolioIndex();

  const scored = index.map((entry) => {
    const titleScore = scoreMatch(entry.title, terms, 10);
    const descScore = scoreMatch(entry.description, terms, 3);
    const keywordScore = scoreMatch(entry.keywords.join(" "), terms, 5);
    return { entry, score: titleScore + descScore + keywordScore };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ entry, score }) => ({
      title: entry.title,
      type: entry.type,
      description: entry.description,
      relevance: Math.round(score * 10) / 10,
    }));
}

// ── Tool definitions for Bedrock ────────────────────────────────────────────

const toolConfig: ToolConfiguration = {
  tools: [
    {
      toolSpec: {
        name: "search_portfolio",
        description: "Search portfolio content including skills, pages, and work experience. Use when a visitor asks about specific topics, skills, or sections of the portfolio.",
        inputSchema: {
          json: {
            type: "object",
            properties: { query: { type: "string", description: "Search query" } },
            required: ["query"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "search_blog",
        description: "Search Themis's blog articles by topic, keyword, or tag. Use when a visitor asks about blog posts, articles, or written content.",
        inputSchema: {
          json: {
            type: "object",
            properties: { query: { type: "string", description: "Search query for blog articles" } },
            required: ["query"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "get_github_stats",
        description: "Fetch Themis's GitHub profile statistics including repos, stars, and followers. Use when asked about open source work or GitHub activity.",
        inputSchema: {
          json: { type: "object", properties: {} },
        },
      },
    },
    {
      toolSpec: {
        name: "check_booking_availability",
        description: "Check available booking slots for scheduling a call with Themis. Use when asked about availability or scheduling.",
        inputSchema: {
          json: { type: "object", properties: {} },
        },
      },
    },
  ],
};

// ── Tool execution ──────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "search_portfolio": {
      const query = typeof input.query === "string" ? input.query : "";
      const results = searchPortfolio(query);
      return JSON.stringify({ results, total: results.length });
    }
    case "search_blog": {
      const query = typeof input.query === "string" ? input.query : "";
      const results = searchBlog(query);
      return JSON.stringify({ results, total: results.length });
    }
    case "get_github_stats": {
      try {
        const username = process.env.GITHUB_USERNAME ?? "Themis128";
        const headers: Record<string, string> = {
          "User-Agent": "portfolio-chatbot",
          Accept: "application/vnd.github.v3+json",
        };
        if (process.env.GITHUB_TOKEN) {
          headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }
        const res = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!res.ok) return JSON.stringify({ error: `GitHub API returned ${res.status}` });
        const data = await res.json() as Record<string, unknown>;
        return JSON.stringify({
          name: data.name,
          publicRepos: data.public_repos,
          followers: data.followers,
          following: data.following,
          bio: data.bio,
          profileUrl: data.html_url,
        });
      } catch {
        return JSON.stringify({ error: "Failed to fetch GitHub stats" });
      }
    }
    case "check_booking_availability": {
      try {
        const calApiKey = process.env.CAL_API_KEY ?? "";
        const calEventTypeId = process.env.CAL_EVENT_TYPE_ID ?? "";
        if (!calApiKey || !calEventTypeId) {
          return JSON.stringify({ error: "Booking service not configured" });
        }
        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
          start: now.toISOString(),
          end: end.toISOString(),
          eventTypeId: calEventTypeId,
        });
        const res = await fetch(`https://api.cal.com/v2/slots?${params}`, {
          headers: {
            Authorization: `Bearer ${calApiKey}`,
            "cal-api-version": "2024-09-04",
          },
        });
        if (!res.ok) return JSON.stringify({ error: `Cal.com API returned ${res.status}` });
        const data = await res.json() as { data?: Record<string, unknown[]> };
        const slotDays = Object.keys(data.data ?? {}).length;
        const totalSlots = Object.values(data.data ?? {}).reduce((sum: number, arr) => sum + (arr as unknown[]).length, 0);
        return JSON.stringify({ available: totalSlots > 0, daysWithSlots: slotDays, totalSlots });
      } catch {
        return JSON.stringify({ error: "Failed to check booking availability" });
      }
    }
    default:
      return JSON.stringify({ error: "Unknown tool" });
  }
}

// ── System prompt ───────────────────────────────────────────────────────────

const VALID_PAGES = [
  { path: "/about/", label: "About — skills, certifications, background" },
  { path: "/product/", label: "Work experience timeline" },
  { path: "/projects/", label: "Project portfolio" },
  { path: "/blog/", label: "Blog articles" },
  { path: "/performance/", label: "Site performance metrics" },
  { path: "/agents/", label: "AI agents guide" },
  { path: "/contact/", label: "Contact form" },
  { path: "/resume/", label: "Resume builder" },
  { path: "/admin/", label: "Admin dashboard" },
];

function buildSystemPrompt(): string {
  const knowledge = getKnowledgeBase();
  const blogPosts = getBlogIndex();
  const blogSummary = blogPosts.length > 0
    ? `\n\nThemis has a blog at /blog/ with ${blogPosts.length} articles:\n${blogPosts.map((p) => `- "${p.title}" (${p.date}) — ${p.description} [${p.tags.join(", ")}]`).join("\n")}`
    : "";

  const pageList = VALID_PAGES.map((p) => `  ${p.path} — ${p.label}`).join("\n");

  return `You are an AI assistant on Themistoklis Baltzakis's portfolio website (baltzakisthemis.com).
Your job is to help visitors learn about Themis — his skills, experience, certifications, and services.
Visitors are typically recruiters, potential clients, or fellow engineers.

<knowledge_base>
${knowledge}${blogSummary}
</knowledge_base>

<tools_guidance>
You have access to tools for live data and deeper search. Use this decision framework:

1. **Answer directly from the knowledge base** when the question is about:
   - Themis's skills, certifications, education, or work history
   - General "who is Themis" / "what does he do" questions
   - Services, availability, or contact methods

2. **Use search_portfolio** when:
   - The visitor asks about a specific technology and you want to find related skills/experience
   - You need to cross-reference which experience entries relate to a topic

3. **Use search_blog** when:
   - The visitor asks about articles, blog posts, or written content
   - The visitor asks about a technical topic that might be covered in a blog post

4. **Use get_github_stats** when:
   - The visitor asks about open source work, GitHub activity, or repos

5. **Use check_booking_availability** when:
   - The visitor asks if Themis is free, what times are available, or how soon they can meet

Do NOT use tools for questions you can answer directly from the knowledge base — it adds latency.
</tools_guidance>

<action_tokens>
Special action tokens trigger UI interactions:

- [BOOK_CALL] — Opens the booking form. Use ONLY when the user explicitly wants to book, schedule, or arrange a meeting or call. Respond with ONLY this token, no other text.
- [CONTACT] — Opens the contact form. Use ONLY when the user explicitly wants to send a message, get in touch, or email Themis. Respond with ONLY this token, no other text.
- When a visitor pastes a job description and asks for a cover letter or proposal, write a tailored 3-4 paragraph cover letter highlighting Themis's relevant experience from the knowledge base. Match skills to the job requirements. Keep it professional and concise.
- [GOTO:/path/] — Navigates to a page. Append at the END of your text response when you're referring the visitor to a specific page. Valid pages:
${pageList}
  Blog post URLs follow the pattern: /blog/<slug>/
  Only include ONE [GOTO:] token per response. Use it when the visitor would benefit from seeing the actual page.
</action_tokens>

<response_guidelines>
- Answer from the knowledge base and tool results. Never invent facts, certifications, job titles, dates, or skills not in the knowledge base.
- If you don't have enough information, say: "I don't have that information, but you can ask Themis directly through the contact form."
- Keep answers concise: 2-4 sentences for simple questions, up to a short paragraph for detailed ones.
- Use a professional, friendly, and enthusiastic tone. Refer to him as "Themis".
- When listing skills, certifications, or projects, use the exact names from the knowledge base.
- For comparison questions ("how does Themis compare to..."), focus on his strengths without making competitive claims.
- For "why should I hire Themis" questions, highlight relevant experience and certifications from the knowledge base.
- If asked about topics unrelated to Themis or his portfolio, politely redirect: "I'm here to help with questions about Themis's background, skills, and services. Is there something specific about his profile I can help with?"
- When the visitor's question is ambiguous, interpret it charitably in the context of a portfolio visit. For example, "what can you do?" likely means "what can Themis do?" not "what are your AI capabilities?"
- Use markdown formatting sparingly — **bold** for emphasis on key terms, but no headers or long lists in short answers.
</response_guidelines>`;
}

// ── Bedrock client (reused across requests) ─────────────────────────────────

const bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });

// ── Stream processing helpers ───────────────────────────────────────────────

interface StreamResult {
  text: string;
  toolUseBlocks: Array<{ toolUseId: string; name: string; input: Record<string, unknown> }>;
  stopReason: string;
}

async function processStream(
  stream: AsyncIterable<Record<string, unknown>>,
  res: Response,
  shouldStreamTokens: boolean,
): Promise<StreamResult> {
  let text = "";
  let stopReason = "end_turn";

  // Tool use accumulation
  const toolUseBlocks: Array<{ toolUseId: string; name: string; input: Record<string, unknown> }> = [];
  let currentToolId = "";
  let currentToolName = "";
  let currentToolInput = "";
  let sentAction = false;

  for await (const event of stream as AsyncIterable<Record<string, Record<string, unknown>>>) {
    // Text content
    const textDelta = event.contentBlockDelta?.delta as Record<string, string> | undefined;
    if (textDelta?.text) {
      const chunk = textDelta.text;
      text += chunk;

      // Check for action tokens before streaming
      if (shouldStreamTokens && !sentAction) {
        if (text.includes("[BOOK_CALL]")) {
          sentAction = true;
          res.write(`data: ${JSON.stringify({ action: "start_booking" })}\n\n`);
        } else if (text.includes("[CONTACT]")) {
          sentAction = true;
          res.write(`data: ${JSON.stringify({ action: "open_contact" })}\n\n`);
        } else {
          // Check for [GOTO:] — only emit text before the token
          const gotoMatch = text.match(/\[GOTO:(\/[a-z0-9\-/]+)]/i);
          if (gotoMatch) {
            // Emit any text before the GOTO token that hasn't been sent yet
            const beforeGoto = text.slice(0, text.indexOf(gotoMatch[0]));
            const alreadySent = text.length - chunk.length;
            if (beforeGoto.length > alreadySent) {
              res.write(`data: ${JSON.stringify({ token: beforeGoto.slice(alreadySent) })}\n\n`);
            }
            sentAction = true;
            res.write(`data: ${JSON.stringify({ action: "navigate", path: gotoMatch[1] })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
          }
        }
      }
    }

    // Tool use start
    const blockStart = event.contentBlockStart?.start as Record<string, Record<string, string>> | undefined;
    if (blockStart?.toolUse) {
      currentToolId = blockStart.toolUse.toolUseId ?? "";
      currentToolName = blockStart.toolUse.name ?? "";
      currentToolInput = "";
    }

    // Tool use input delta
    const toolDelta = event.contentBlockDelta?.delta as Record<string, string> | undefined;
    if (toolDelta?.toolUse) {
      currentToolInput += (toolDelta.toolUse as unknown as { input?: string }).input ?? "";
    }

    // Content block stop — finalize tool use block
    if (event.contentBlockStop !== undefined && currentToolId) {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(currentToolInput || "{}") as Record<string, unknown>;
      } catch {
        // malformed tool input
      }
      toolUseBlocks.push({ toolUseId: currentToolId, name: currentToolName, input: parsedInput });
      currentToolId = "";
      currentToolName = "";
      currentToolInput = "";
    }

    // Message stop
    const messageStop = event.messageStop as Record<string, string> | undefined;
    if (messageStop?.stopReason) {
      stopReason = messageStop.stopReason;
    }
  }

  return { text, toolUseBlocks, stopReason };
}

// ── Route ───────────────────────────────────────────────────────────────────

// POST /api/chat
router.post("/", async (req: Request, res: Response) => {
  // Budget killswitch: when BUDGET_EXCEEDED is set, disable Bedrock calls
  if (process.env.BUDGET_EXCEEDED === "true") {
    return res.status(503).json({
      error: "The AI assistant is temporarily offline due to budget limits. The site and all other features are still available. Please try again next month or contact Themis directly.",
    });
  }

  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.socket.remoteAddress
    || "unknown";
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  try {
    const body = req.body as Record<string, unknown>;
    const message = typeof body.message === "string" ? body.message : "";
    const history = Array.isArray(body.history) ? (body.history as HistoryMessage[]) : [];

    const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!trimmedMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array with recent history (Converse API format)
    const messages: BedrockMessage[] = [];

    const recentHistory = history.slice(-MAX_HISTORY_TURNS);
    for (const entry of recentHistory) {
      if (
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.length > 0
      ) {
        messages.push({
          role: entry.role,
          content: [{ text: entry.content.slice(0, MAX_HISTORY_CONTENT_LENGTH) }],
        });
      }
    }
    messages.push({ role: "user", content: [{ text: trimmedMessage }] });

    // Stream SSE events to the frontend
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Tool-use loop: model may request tools, we execute them and re-invoke
    let toolRounds = 0;

    while (toolRounds <= MAX_TOOL_ROUNDS) {
      const isLastRound = toolRounds === MAX_TOOL_ROUNDS;
      const commandInput: ConverseStreamCommandInput = {
        modelId: BEDROCK_MODEL_ID,
        system: [{ text: buildSystemPrompt() }],
        messages,
        inferenceConfig: {
          maxTokens: toolRounds > 0 ? 768 : 512, // more tokens when incorporating tool results
          temperature: 0.3,
          topP: 0.9,
        },
        ...(!isLastRound ? { toolConfig } : {}),
      };

      const response = await bedrockClient.send(new ConverseStreamCommand(commandInput));

      if (!response.stream) {
        res.write(`data: ${JSON.stringify({ error: "No response generated" })}\n\n`);
        break;
      }

      // Only stream tokens to client on the final round (when model produces text, not tool calls)
      const isStreamingRound = toolRounds === MAX_TOOL_ROUNDS;
      const result = await processStream(response.stream, res, true);

      // If model used tools, execute them and loop
      if (result.stopReason === "tool_use" && result.toolUseBlocks.length > 0 && !isLastRound) {
        // Send status to client so they see a "thinking" indicator
        res.write(`data: ${JSON.stringify({ status: "thinking" })}\n\n`);

        // Add the assistant's response (with tool use blocks) to messages
        const assistantContent: ContentBlock[] = [];
        if (result.text) {
          assistantContent.push({ text: result.text });
        }
        for (const tool of result.toolUseBlocks) {
          assistantContent.push({
            toolUse: {
              toolUseId: tool.toolUseId,
              name: tool.name,
              input: tool.input as Record<string, unknown>,
            },
          });
        }
        messages.push({ role: "assistant", content: assistantContent });

        // Execute tools and add results
        const toolResults: ContentBlock[] = [];
        for (const tool of result.toolUseBlocks) {
          const toolOutput = await executeTool(tool.name, tool.input);
          toolResults.push({
            toolResult: {
              toolUseId: tool.toolUseId,
              content: [{ text: toolOutput }] as ToolResultContentBlock[],
            },
          });
        }
        messages.push({ role: "user", content: toolResults });

        toolRounds++;
        continue;
      }

      // Final response — text was already streamed by processStream
      if (!result.text && result.toolUseBlocks.length === 0) {
        res.write(`data: ${JSON.stringify({ error: "No response generated" })}\n\n`);
      }
      break;
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (!res.headersSent) {
      res.status(500).json({ error: `Chat request failed: ${msg}` });
    } else {
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
});

export default router;
