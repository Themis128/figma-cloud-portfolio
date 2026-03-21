import type { Metadata } from "next";
import SettingsPage from "@/components/SettingsPage";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Customize your viewing experience — theme, accessibility preferences, and display options.",
  robots: { index: false, follow: true },
};

export default function Settings() {
  return <SettingsPage />;
}
