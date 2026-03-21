"use client";

import dynamic from "next/dynamic";

// Dynamically import BuilderClient with SSR disabled to avoid createContext issues
const BuilderClient = dynamic(
  () => import("@/components/BuilderClient").then((mod) => mod.BuilderClient),
  { ssr: false },
);

export default function BuilderPage() {
  return (
    <main id="main-content">
      <BuilderClient model="page" url="/builder" />
    </main>
  );
}
