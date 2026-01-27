import type { metadataConfigs } from "@/components/DynamicMetadata";

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
}

// Static pages configuration
const staticPages: SitemapEntry[] = [
  {
    url: "/",
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: "/about",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/projects",
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "/resume",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: "/contact",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: "/performance",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: "/settings",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: "/agents",
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

// Sample projects for dynamic sitemap generation
const sampleProjects: Project[] = [
  {
    id: "1",
    slug: "ecommerce-dashboard",
    title: "E-Commerce Dashboard",
    description:
      "A comprehensive admin dashboard for e-commerce platforms with real-time analytics and inventory management.",
    publishedAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    slug: "ai-content-generator",
    title: "AI Content Generator",
    description:
      "AI-powered content generation tool that creates blog posts, social media content, and marketing copy.",
    publishedAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "3",
    slug: "mobile-fitness-tracker",
    title: "Mobile Fitness Tracker",
    description:
      "Cross-platform mobile application for tracking fitness activities, nutrition, and health metrics.",
    publishedAt: "2023-12-10T10:00:00Z",
  },
  {
    id: "4",
    slug: "code-collaboration-tool",
    title: "Code Collaboration Tool",
    description:
      "Real-time collaborative code editor with version control integration and team management features.",
    publishedAt: "2023-10-05T10:00:00Z",
  },
  {
    id: "5",
    slug: "3d-portfolio-showcase",
    title: "3D Portfolio Showcase",
    description:
      "Interactive 3D portfolio website built with Three.js and React, showcasing projects in an immersive environment.",
    publishedAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "6",
    slug: "task-management-game",
    title: "Task Management Game",
    description:
      "Gamified task management application that turns productivity into an RPG experience.",
    publishedAt: "2023-08-15T10:00:00Z",
  },
];

export class SitemapGenerator {
  private baseURL: string;

  constructor(baseURL = "") {
    this.baseURL = baseURL || this.getBaseURL();
  }

  private getBaseURL(): string {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://www.baltzakisthemis.com";
  }

  /**
   * Generate sitemap entries for all pages
   */
  generateSitemapEntries(): SitemapEntry[] {
    const baseURL = this.baseURL;

    // Static pages
    const staticSitemap = staticPages.map((page) => ({
      ...page,
      url: `${baseURL}${page.url}`,
    }));

    // Dynamic project pages
    const projectSitemap = sampleProjects.map((project) => ({
      url: `${baseURL}/projects/${project.slug}`,
      lastModified: project.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticSitemap, ...projectSitemap];
  }

  /**
   * Generate XML sitemap string
   */
  generateXMLSitemap(): string {
    const entries = this.generateSitemapEntries();

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    const xmlEntries = entries
      .map(
        (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
      )
      .join("");

    const xmlFooter = `
</urlset>`;

    return xmlHeader + xmlEntries + xmlFooter;
  }

  /**
   * Generate RSS feed for blog/projects
   */
  generateRSSFeed(): string {
    const entries = sampleProjects
      .map(
        (project) => `
  <item>
    <title>${this.escapeXml(project.title)}</title>
    <description>${this.escapeXml(project.description)}</description>
    <link>${this.baseURL}/projects/${project.slug}</link>
    <guid>${this.baseURL}/projects/${project.slug}</guid>
    <pubDate>${new Date(project.publishedAt).toUTCString()}</pubDate>
    <category>Projects</category>
  </item>`,
      )
      .join("");

    const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Themistoklis Baltzakis - Projects</title>
    <description>Latest projects and technical work from Themistoklis Baltzakis</description>
    <link>${this.baseURL}</link>
    <atom:link href="${this.baseURL}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Portfolio Sitemap Generator</generator>`;

    const rssFooter = `
  </channel>
</rss>`;

    return rssHeader + entries + rssFooter;
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `# Robots.txt for Themistoklis Baltzakis Portfolio
User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseURL}/sitemap.xml

# RSS Feed
RSS: ${this.baseURL}/rss.xml

# Crawl delay
Crawl-delay: 1

# Disallow specific paths
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /test/

# Allow search engines to index all content
Allow: /$
Allow: /about
Allow: /projects
Allow: /resume
Allow: /contact
Allow: /performance
Allow: /settings
Allow: /agents

# Allow project pages
${sampleProjects.map((project) => `Allow: /projects/${project.slug}`).join("\n")}

# Allow resources
Allow: /favicon.ico
Allow: /logo.svg
Allow: /manifest.webmanifest
Allow: /sw.js
Allow: /global.css
Allow: /resume.pdf`;
  }

  /**
   * Generate robots meta tags for individual pages
   */
  generateRobotsMetaTags(pageType: keyof typeof metadataConfigs): string {
    let robotsContent = "index, follow";

    // Adjust robots directives based on page type
    switch (pageType) {
      case "home":
        robotsContent = "index, follow, max-image-preview:large";
        break;
      case "about":
        robotsContent = "index, follow, max-snippet:-1, max-image-preview:large";
        break;
      case "projects":
        robotsContent = "index, follow, max-snippet:-1, max-image-preview:large";
        break;
      case "resume":
        robotsContent = "index, follow, max-snippet:-1";
        break;
      case "contact":
        robotsContent = "index, follow, max-snippet:-1";
        break;
      default:
        robotsContent = "index, follow";
    }

    return robotsContent;
  }

  /**
   * Generate canonical URL for a page
   */
  generateCanonicalURL(path: string): string {
    // Remove trailing slashes and ensure proper formatting
    const cleanPath = path.replace(/\/+$/, "");
    return `${this.baseURL}${cleanPath || "/"}`;
  }

  /**
   * Generate hreflang tags for internationalization (future feature)
   */
  generateHreflangTags(currentPath: string): string[] {
    const languages = [
      { lang: "en", url: `${this.baseURL}${currentPath}` },
      { lang: "el", url: `${this.baseURL}/el${currentPath}` },
    ];

    return languages.map(
      (lang) => `<link rel="alternate" hreflang="${lang.lang}" href="${lang.url}" />`,
    );
  }

  /**
   * Utility function to escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Download sitemap as XML file
   */
  downloadSitemap(): void {
    const sitemap = this.generateXMLSitemap();
    const blob = new Blob([sitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download robots.txt file
   */
  downloadRobotsTxt(): void {
    const robotsTxt = this.generateRobotsTxt();
    const blob = new Blob([robotsTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Submit sitemap to search engines (conceptual - would need API keys)
   */
  submitToSearchEngines(): void {
    const _sitemapUrl = `${this.baseURL}/sitemap.xml`;
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();

// Utility functions for easy access
export const generateSitemap = () => sitemapGenerator.generateXMLSitemap();
export const generateRobotsTxt = () => sitemapGenerator.generateRobotsTxt();
export const generateRSSFeed = () => sitemapGenerator.generateRSSFeed();
export const getRobotsMetaTags = (pageType: keyof typeof metadataConfigs) =>
  sitemapGenerator.generateRobotsMetaTags(pageType);
export const getCanonicalURL = (path: string) => sitemapGenerator.generateCanonicalURL(path);
