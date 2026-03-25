interface StructuredDataProps {
  type:
    | "WebSite"
    | "Person"
    | "Project"
    | "Article"
    | "WebPage"
    | "Organization"
    | "ProfilePage";
  data: Record<string, unknown>;
}

/**
 * Server-rendered JSON-LD structured data component.
 * Outputs <script type="application/ld+json"> in the HTML at build time,
 * ensuring crawlers and AI agents can read it without executing JavaScript.
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

const SITE_URL = "https://www.baltzakisthemis.com";

const PERSON = {
  "@type": "Person" as const,
  "@id": `${SITE_URL}/#person`,
  name: "Themistoklis Baltzakis",
  alternateName: "Themis Baltzakis",
  jobTitle: "IT Network Engineer & Cloud Architect",
  description:
    "IT Network Engineer with 15+ years of experience in network infrastructure, Cisco systems, Fortinet security, Azure AD, Microsoft 365, and AWS cloud environments.",
  url: SITE_URL,
  email: "baltzakis.themis@gmail.com",
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: [
    "https://github.com/Themis128",
    "https://www.linkedin.com/in/baltzakis-themis",
  ],
  knowsAbout: [
    "Cloud Architecture",
    "Cisco Systems",
    "Fortinet Security",
    "Azure AD",
    "Microsoft 365",
    "AWS",
    "Cybersecurity",
    "Network Infrastructure",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "DevOps",
  ],
  worksFor: {
    "@type": "Organization" as const,
    name: "Cloudless.gr",
    url: "https://cloudless.gr",
  },
  address: {
    "@type": "PostalAddress" as const,
    addressLocality: "Athens",
    addressCountry: "GR",
  },
};

/**
 * Default structured data for the portfolio site.
 * Server-rendered — included in static HTML at build time.
 * Includes WebSite, Person, and ProfilePage schemas for maximum
 * visibility in Google Search, AI Overviews, and generative engines.
 */
export function DefaultStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Themistoklis Baltzakis | Cloud Architect & Cybersecurity Specialist",
    description:
      "Portfolio of IT Network Engineer & Cloud Architect with 15+ years of experience in Cisco, Fortinet, AWS, and enterprise security.",
    url: SITE_URL,
    inLanguage: "en-US",
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/projects/?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const personData = {
    "@context": "https://schema.org",
    ...PERSON,
  };

  const profilePageData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    name: "Themistoklis Baltzakis | Portfolio",
    url: SITE_URL,
    mainEntity: { "@id": `${SITE_URL}/#person` },
    dateCreated: "2024-01-01",
    dateModified: "2026-03-24",
    inLanguage: "en-US",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageData) }}
      />
    </>
  );
}

export default StructuredData;
