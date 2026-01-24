"use client";

import { useEffect, useMemo } from "react";

interface StructuredDataProps {
  type: "WebSite" | "Person" | "Project" | "Article" | "WebPage" | "Organization";
  data: Record<string, unknown>;
}

/**
 * Component for adding Schema.org structured data to pages
 * Improves SEO by providing search engines with structured information
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    }),
    [type, data],
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [structuredData]);

  return null;
}

/**
 * Default structured data for the portfolio site
 * Used in root layout for consistent site-wide SEO
 */
export function DefaultStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Themistoklis Baltzakis - Portfolio",
    description:
      "Cloud Architect & Full-Stack Developer portfolio showcasing modern web applications, cloud solutions, and technical expertise",
    url: "https://baltzakis.dev",
    author: {
      "@type": "Person",
      name: "Themistoklis Baltzakis",
      jobTitle: "Cloud Architect & Full-Stack Developer",
      url: "https://baltzakis.dev",
      sameAs: ["https://github.com/Themis128", "https://linkedin.com/in/baltzakis-themis"],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://baltzakis.dev/projects?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Themistoklis Baltzakis",
    alternateName: "Themis Baltzakis",
    jobTitle: "Cloud Architect & Full-Stack Developer",
    description:
      "Technical Leadership and Cloud Innovation with 15+ years of IT expertise, specializing in Azure AD, Microsoft 365, and multi-cloud environments",
    url: "https://baltzakis.dev",
    email: "baltzakis.themis@gmail.com",
    sameAs: ["https://github.com/Themis128", "https://linkedin.com/in/baltzakis-themis"],
    knowsAbout: [
      "Cloud Architecture",
      "Azure AD",
      "Microsoft 365",
      "AWS",
      "Cybersecurity",
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Python",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Cloudless.gr",
      url: "https://cloudless.gr",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Athens",
      addressCountry: "GR",
    },
  };

  useEffect(() => {
    // Website structured data
    const websiteScript = document.createElement("script");
    websiteScript.type = "application/ld+json";
    websiteScript.textContent = JSON.stringify(websiteData);
    document.head.appendChild(websiteScript);

    // Person structured data
    const personScript = document.createElement("script");
    personScript.type = "application/ld+json";
    personScript.textContent = JSON.stringify(personData);
    document.head.appendChild(personScript);

    return () => {
      if (document.head.contains(websiteScript)) {
        document.head.removeChild(websiteScript);
      }
      if (document.head.contains(personScript)) {
        document.head.removeChild(personScript);
      }
    };
  }, []);

  return null;
}

// Re-export as named export for layout usage
export { DefaultStructuredData as StructuredData };

export default StructuredData;
