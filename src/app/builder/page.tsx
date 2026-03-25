import type { Metadata } from "next";
import BuilderPage from "@/components/BuilderPage";

const SITE_URL = "https://www.baltzakisthemis.com";

export const metadata: Metadata = {
  title: "Builder",
  description:
    "Visual page builder powered by Builder.io. Create and customize content with a drag-and-drop interface.",
  alternates: { canonical: `${SITE_URL}/builder/` },
  openGraph: {
    title: "Builder | Themistoklis Baltzakis",
    description:
      "Visual page builder powered by Builder.io. Create and customize content with a drag-and-drop interface.",
    url: `${SITE_URL}/builder/`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Themistoklis Baltzakis | Builder" }],
  },
};

export default function Builder() {
  return <BuilderPage />;
}
