"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  tags?: string[];
}

interface DynamicMetadataProps {
  config: MetadataConfig;
}

const DynamicMetadata: React.FC<DynamicMetadataProps> = ({ config }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const baseURL = window.location.origin;
    const search = searchParams?.toString()
      ? `?${searchParams.toString()}`
      : "";
    const currentURL = `${baseURL}${pathname}${search}`;

    // Default values
    const defaultTitle =
      "Themistoklis Baltzakis - IT Network Engineer";
    const defaultDescription =
      "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.";
    const defaultImage = `${baseURL}/logo.svg`;
    const defaultKeywords = [
      "IT Network Engineer",
      "Cisco Systems",
      "Fortinet",
      "Network Security",
      "Azure AD",
      "Portfolio",
    ];

    // Use provided config or defaults
    const title = config.title || defaultTitle;
    const description = config.description || defaultDescription;
    const keywords = config.keywords || defaultKeywords;
    const image = config.image || defaultImage;
    const type = config.type || "website";
    const author = config.author || "Themistoklis Baltzakis";
    const publishedAt = config.publishedAt || new Date().toISOString();
    const modifiedAt = config.modifiedAt || new Date().toISOString();
    const tags = config.tags || [];

    // Remove existing meta tags to avoid duplicates
    const removeExistingMetaTags = () => {
      const metaTags = document.querySelectorAll(
        "meta[name], meta[property], meta[itemprop]",
      );
      metaTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
    removeExistingMetaTags();

    // Helper function to create meta tags
    const createMetaTag = (
      name: string,
      content: string,
      property?: string,
    ) => {
      const meta = document.createElement("meta");
      if (property) {
        meta.setAttribute("property", property);
      } else {
        meta.setAttribute("name", name);
      }
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    // Helper function to create link tags
    const createLinkTag = (rel: string, href: string, type?: string) => {
      const link = document.createElement("link");
      link.setAttribute("rel", rel);
      link.setAttribute("href", href);
      if (type) {
        link.setAttribute("type", type);
      }
      document.head.appendChild(link);
    };

    // 1. Basic Meta Tags
    document.title = title;
    createMetaTag("description", description);
    createMetaTag("keywords", keywords.join(", "));
    createMetaTag("author", author);
    createMetaTag("viewport", "width=device-width, initial-scale=1");
    createMetaTag("robots", "index, follow");
    createMetaTag("language", "English");
    createMetaTag("revisit-after", "7 days");

    // 2. Open Graph Tags
    createMetaTag("og:title", title, "og:title");
    createMetaTag("og:description", description, "og:description");
    createMetaTag("og:type", type, "og:type");
    createMetaTag("og:url", currentURL, "og:url");
    createMetaTag("og:image", image, "og:image");
    createMetaTag(
      "og:site_name",
      "Themistoklis Baltzakis Portfolio",
      "og:site_name",
    );
    createMetaTag("og:locale", "en_US", "og:locale");

    // 3. Twitter Card Tags
    createMetaTag("twitter:card", "summary_large_image", "twitter:card");
    createMetaTag("twitter:title", title, "twitter:title");
    createMetaTag("twitter:description", description, "twitter:description");
    createMetaTag("twitter:image", image, "twitter:image");
    createMetaTag("twitter:site", "@baltzakisthemis", "twitter:site");
    createMetaTag("twitter:creator", "@baltzakisthemis", "twitter:creator");

    // 4. Schema.org Structured Data
    const schemaData = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "Person",
      name: author,
      url: currentURL,
      image: image,
      description: description,
      ...(type === "article" && {
        headline: title,
        datePublished: publishedAt,
        dateModified: modifiedAt,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: "Themistoklis Baltzakis Portfolio",
          logo: {
            "@type": "ImageObject",
            url: `${baseURL}/logo.svg`,
          },
        },
      }),
      ...(type === "website" && {
        sameAs: [
          "https://www.linkedin.com/in/baltzakis-themis",
          "https://www.baltzakisthemis.com",
        ],
      }),
      ...(tags.length > 0 && { keywords: tags.join(", ") }),
    };

    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(schemaScript);

    // 5. Additional Meta Tags
    createMetaTag("theme-color", "#007bff");
    createMetaTag("msapplication-TileColor", "#007bff");
    createMetaTag("msapplication-TileImage", "/favicon.ico");

    // 6. Canonical URL
    createLinkTag("canonical", currentURL);

    // 7. Favicon and Icons
    createLinkTag("icon", "/favicon.ico", "image/x-icon");
    createLinkTag("apple-touch-icon", "/logo.svg");

    // 8. Performance and Security Headers (Meta tags)
    createMetaTag("X-UA-Compatible", "IE=edge");
    createMetaTag("X-Content-Type-Options", "nosniff");
    createMetaTag("X-Frame-Options", "SAMEORIGIN");
    createMetaTag("X-XSS-Protection", "1; mode=block");

    // 9. Social Media Optimization
    createMetaTag(
      "og:updated_time",
      new Date().toISOString(),
      "og:updated_time",
    );
    createMetaTag(
      "article:published_time",
      publishedAt,
      "article:published_time",
    );
    createMetaTag("article:modified_time", modifiedAt, "article:modified_time");
    createMetaTag("article:author", author, "article:author");

    // 10. Performance Optimization
    createMetaTag("mobile-web-app-capable", "yes");
    createMetaTag("apple-mobile-web-app-capable", "yes");
    createMetaTag("apple-mobile-web-app-status-bar-style", "default");

    return () => {
      // Cleanup function to remove dynamically created meta tags
      const metaTags = document.querySelectorAll(
        "meta[name], meta[property], meta[itemprop]",
      );
      metaTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });

      const linkTags = document.querySelectorAll(
        'link[rel="canonical"], link[rel="icon"], link[rel="apple-touch-icon"]',
      );
      linkTags.forEach((tag) => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });

      const schemaScript = document.querySelector(
        'script[type="application/ld+json"]',
      );
      if (schemaScript?.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, [pathname, searchParams, config]);

  return null;
};

// Predefined metadata configurations for different pages
export const metadataConfigs = {
  home: {
    title:
      "Themistoklis Baltzakis - IT Network Engineer",
    description:
      "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, and Fortinet security solutions.",
    keywords: [
      "IT Network Engineer",
      "Cisco Systems",
      "Fortinet",
      "Network Security",
      "Azure AD",
      "Portfolio",
    ],
    type: "website" as const,
    author: "Themistoklis Baltzakis",
    tags: [
      "Networking",
      "Cisco",
      "Fortinet",
      "Security",
      "Azure",
      "Microsoft 365",
    ],
  },

  about: {
    title: "About Themistoklis Baltzakis - IT Network Engineer",
    description:
      "Learn more about my journey in network engineering and IT infrastructure, with 15+ years of experience in Cisco systems and security solutions.",
    keywords: [
      "About",
      "Experience",
      "Background",
      "Network Engineer",
      "IT Infrastructure",
    ],
    type: "profile" as const,
    author: "Themistoklis Baltzakis",
    tags: ["Experience", "Background", "Expertise", "Networking"],
  },

  projects: {
    title: "Projects & Portfolio - Network Infrastructure & Security",
    description:
      "Explore my latest work and technical projects in network infrastructure, security, and enterprise IT.",
    keywords: [
      "Projects",
      "Portfolio",
      "Network Projects",
      "Security Projects",
      "IT Infrastructure",
    ],
    type: "website" as const,
    author: "Themistoklis Baltzakis",
    tags: ["Projects", "Portfolio", "Networking", "Security", "Infrastructure"],
  },

  resume: {
    title: "Resume - Themistoklis Baltzakis",
    description:
      "Download my professional resume showcasing 15+ years of experience in network infrastructure and IT engineering.",
    keywords: ["Resume", "CV", "Experience", "Skills", "Professional"],
    type: "article" as const,
    author: "Themistoklis Baltzakis",
    tags: ["Resume", "CV", "Professional", "Experience"],
  },

  contact: {
    title: "Contact - Themistoklis Baltzakis",
    description:
      "Get in touch with me for cloud architecture consultations, cybersecurity advice, or collaboration opportunities.",
    keywords: ["Contact", "Email", "LinkedIn", "Portfolio", "Collaboration"],
    type: "website" as const,
    author: "Themistoklis Baltzakis",
    tags: ["Contact", "Collaboration", "Consultation"],
  },
};

export default DynamicMetadata;
