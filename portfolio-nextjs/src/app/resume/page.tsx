import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume",
  description: "Professional resume and experience of Themistoklis Baltzakis - Cloud Architect & Full-Stack Developer",
};

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">Resume Builder</h1>
        <p className="text-foreground/80 text-lg mb-8">
          Interactive resume builder coming soon. Check back for an AI-powered resume generation tool.
        </p>
      </div>
    </div>
  );
}
