import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import SettingsPage from "@/components/SettingsPage";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Customize your viewing experience: theme, accessibility preferences, and display options.",
  openGraph: {
    title: "Settings | Themistoklis Baltzakis",
    description:
      "Customize your viewing experience: theme, accessibility preferences, and display options.",
    url: `${SITE_URL}/settings/`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis | IT Network Engineer & Cloud Architect" }],
  },
  alternates: { canonical: `${SITE_URL}/settings/` },
  robots: { index: false, follow: true },
};

export default function Settings() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Settings", url: `${SITE_URL}/settings/` },
        ]}
      />
      <SettingsPage />
    </>
  );
}
