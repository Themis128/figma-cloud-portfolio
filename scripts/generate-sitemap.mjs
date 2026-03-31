#!/usr/bin/env node

/**
 * Auto-generates sitemap.xml from static pages + Velite blog posts.
 * Reads blog frontmatter for dates. Run as part of the build pipeline.
 *
 * Usage: node scripts/generate-sitemap.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = "https://www.baltzakisthemis.com";
const BLOG_DIR = join(process.cwd(), "content/blog");
const OUTPUT = join(process.cwd(), "public/sitemap.xml");

// Static pages with priority and changefreq
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/about/", priority: "0.8", changefreq: "monthly" },
  { path: "/contact/", priority: "0.8", changefreq: "monthly" },
  { path: "/blog/", priority: "0.8", changefreq: "weekly" },
  { path: "/resume/", priority: "0.7", changefreq: "monthly" },
  { path: "/projects/", priority: "0.7", changefreq: "monthly" },
  { path: "/product/", priority: "0.6", changefreq: "monthly" },
  { path: "/performance/", priority: "0.5", changefreq: "monthly" },
  { path: "/agents/", priority: "0.5", changefreq: "monthly" },
  { path: "/builder/", priority: "0.4", changefreq: "monthly" },
  { path: "/privacy/", priority: "0.3", changefreq: "yearly" },
  { path: "/terms/", priority: "0.3", changefreq: "yearly" },
  { path: "/cookies/", priority: "0.3", changefreq: "yearly" },
];

/**
 * Extract frontmatter from MDX file.
 * Returns { date, updated, published, slug } or null if unpublished.
 */
function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = match[1];
  const get = (key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, "m"));
    return m ? m[1].trim() : undefined;
  };

  const published = get("published");
  if (published === "false") return null;

  const slug = filePath
    .split("/")
    .pop()
    .replace(/\.mdx$/, "");

  return {
    slug,
    date: get("date"),
    updated: get("updated"),
  };
}

function toW3CDate(isoDate) {
  // Ensure YYYY-MM-DD format
  return isoDate ? isoDate.slice(0, 10) : undefined;
}

function buildUrl(entry) {
  let xml = `  <url>\n    <loc>${SITE_URL}${entry.path}</loc>\n`;
  if (entry.lastmod) xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
  if (entry.changefreq) xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
  if (entry.priority) xml += `    <priority>${entry.priority}</priority>\n`;
  xml += `  </url>`;
  return xml;
}

// Build entries
const entries = [];

// Static pages — use today as lastmod for homepage/blog listing
const today = new Date().toISOString().slice(0, 10);
for (const page of STATIC_PAGES) {
  entries.push({
    ...page,
    lastmod: page.changefreq === "yearly" ? undefined : today,
  });
}

// Blog posts from MDX frontmatter
try {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const meta = parseFrontmatter(join(BLOG_DIR, file));
    if (!meta) continue;

    entries.push({
      path: `/blog/${meta.slug}/`,
      lastmod: toW3CDate(meta.updated ?? meta.date),
      changefreq: "monthly",
      priority: "0.7",
    });
  }
} catch {
  console.warn("[generate-sitemap] No blog directory found, skipping blog posts");
}

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(buildUrl).join("\n")}
</urlset>
`;

writeFileSync(OUTPUT, xml, "utf-8");
console.log(`[generate-sitemap] Generated ${OUTPUT} with ${entries.length} URLs`);
