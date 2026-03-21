import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import ContactPage from "@/components/ContactPage";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Themistoklis Baltzakis — Cloud Architect & Cybersecurity Specialist. Send a message, schedule a meeting, or connect on LinkedIn.",
  openGraph: {
    title: "Contact | Themistoklis Baltzakis",
    description:
      "Reach out for cloud architecture consulting, cybersecurity services, or collaboration opportunities.",
    url: `${SITE_URL}/contact/`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis — IT Network Engineer & Cloud Architect" }],
  },
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function Contact() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Contact", url: `${SITE_URL}/contact/` },
        ]}
      />
      <ContactPage />
    </>
  );
}
