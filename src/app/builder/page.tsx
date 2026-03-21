import type { Metadata } from "next";
import BuilderPage from "@/components/BuilderPage";

export const metadata: Metadata = {
  title: "Builder",
  description:
    "Visual page builder powered by Builder.io — create and customize content with a drag-and-drop interface.",
};

export default function Builder() {
  return <BuilderPage />;
}
