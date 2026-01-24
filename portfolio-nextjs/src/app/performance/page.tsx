import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance",
  description: "Performance monitoring dashboard for the portfolio website",
};

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-foreground mb-8">Performance Dashboard</h1>
        <p className="text-foreground/80 text-lg mb-8">
          Real-time performance monitoring and Web Vitals metrics coming soon.
        </p>
      </div>
    </div>
  );
}
