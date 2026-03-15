import type { metadataConfigs } from "@/components/DynamicMetadata";

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
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

// Actual portfolio projects for sitemap and RSS generation
const sampleProjects: Project[] = [
  {
    id: "1",
    slug: "figma-cloud-portfolio",
    title: "Portfolio Website",
    description:
      "Personal portfolio built with Next.js 16, deployed on AWS S3 + CloudFront with Amplify Gen 2 backend. Features AI chatbot, PWA support, and admin dashboard.",
    publishedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    slug: "raspberry-pi-monitoring",
    title: "Network Monitoring Stack",
    description:
      "Comprehensive monitoring solution for home/SOHO networks featuring security monitoring, network performance tracking, and infrastructure observability.",
    publishedAt: "2025-06-20T10:00:00Z",
  },
  {
    id: "3",
    slug: "stable-diffusion-webui",
    title: "Stable Diffusion Web UI",
    description:
      "Self-hosted Stable Diffusion web interface for AI image generation with custom models and configurations.",
    publishedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "4",
    slug: "telegram-web-app",
    title: "Telegram Web App",
    description:
      "Modern Telegram Web App with PWA support — full MTProto API access via Telethon for messaging and automation.",
    publishedAt: "2025-09-05T10:00:00Z",
  },
  {
    id: "5",
    slug: "dockerlabs",
    title: "Docker Labs",
    description:
      "Collection of Docker-based lab environments for learning containerization, networking, and microservices architecture.",
    publishedAt: "2025-04-25T10:00:00Z",
  },
  {
    id: "6",
    slug: "cloudless-ecommerce",
    title: "Cloudless E-Commerce",
    description:
      "Full-stack e-commerce platform with product management, cart functionality, and payment integration.",
    publishedAt: "2025-07-15T10:00:00Z",
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
        robotsContent =
          "index, follow, max-snippet:-1, max-image-preview:large";
        break;
      case "projects":
        robotsContent =
          "index, follow, max-snippet:-1, max-image-preview:large";
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
      (lang) =>
        `<link rel="alternate" hreflang="${lang.lang}" href="${lang.url}" />`,
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
    // Sitemap URL: `${this.baseURL}/sitemap.xml`
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
export const getCanonicalURL = (path: string) =>
  sitemapGenerator.generateCanonicalURL(path);
