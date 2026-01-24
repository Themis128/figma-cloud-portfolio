import { useEffect, useMemo } from "react";

interface StructuredDataProps {
  type: "WebSite" | "Person" | "Project" | "Article" | "WebPage";
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
 * Predefined structured data for common use cases
 */

// Portfolio/Person structured data
export function PersonStructuredData() {
  return (
    <StructuredData
      type='Person'
      data={{
        name: "Themistoklis Baltzakis",
        alternateName: "Themis Baltzakis",
        jobTitle: "Full Stack Developer",
        description:
          "Experienced full-stack developer specializing in React, Node.js, and modern web technologies",
        url: "https://themisbaltzakis.dev",
        sameAs: ["https://github.com/themisbaltzakis", "https://linkedin.com/in/themisbaltzakis"],
        knowsAbout: [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "Web Development",
          "AI/ML",
          "Cloud Computing",
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Full Stack Developer",
          occupationLocation: {
            "@type": "City",
            name: "Athens",
            addressCountry: "GR",
          },
        },
      }}
    />
  );
}

// Website structured data
export function WebsiteStructuredData() {
  return (
    <StructuredData
      type='WebSite'
      data={{
        name: "Themistoklis Baltzakis - Portfolio",
        description:
          "Full-stack developer portfolio showcasing modern web applications, AI projects, and technical expertise",
        url: "https://themisbaltzakis.dev",
        author: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        publisher: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://themisbaltzakis.dev/projects?search={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// Project structured data
interface ProjectStructuredDataProps {
  project: {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    url?: string;
    image?: string;
    dateCreated?: string;
    dateModified?: string;
  };
}

export function ProjectStructuredData({ project }: ProjectStructuredDataProps) {
  return (
    <StructuredData
      type='Project'
      data={{
        name: project.title,
        description: project.description,
        url: project.url || `https://themisbaltzakis.dev/projects/${project.id}`,
        image: project.image,
        dateCreated: project.dateCreated,
        dateModified: project.dateModified,
        author: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        technology: project.technologies,
        programmingLanguage: project.technologies.filter((tech) =>
          ["JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust"].includes(tech),
        ),
      }}
    />
  );
}

// Article/Blog post structured data
interface ArticleStructuredDataProps {
  article: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
    image?: string;
    keywords?: string[];
  };
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  return (
    <StructuredData
      type='Article'
      data={{
        headline: article.headline,
        description: article.description,
        author: {
          "@type": "Person",
          name: article.author,
        },
        publisher: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        url: article.url,
        image: article.image,
        keywords: article.keywords?.join(", "),
      }}
    />
  );
}

// WebPage structured data for individual pages
interface WebPageStructuredDataProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function WebPageStructuredData({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
}: WebPageStructuredDataProps) {
  return (
    <StructuredData
      type='WebPage'
      data={{
        name: title,
        description: description,
        url: url,
        image: image,
        datePublished: datePublished,
        dateModified: dateModified,
        author: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        publisher: {
          "@type": "Person",
          name: "Themistoklis Baltzakis",
        },
        isPartOf: {
          "@type": "WebSite",
          name: "Themistoklis Baltzakis Portfolio",
          url: "https://themisbaltzakis.dev",
        },
      }}
    />
  );
}

export default StructuredData;
