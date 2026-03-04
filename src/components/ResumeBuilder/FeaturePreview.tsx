"use client";

import { useState } from "react";

interface Feature {
  icon: string;
  title: string;
  description: string;
  details: string[];
}

const features: Feature[] = [
  {
    icon: "🤖",
    title: "AI-Powered Generation",
    description: "Let AI craft the perfect resume based on your experience",
    details: [
      "Smart content suggestions",
      "Keyword optimization for your industry",
      "Automatic achievement highlighting",
      "Tone and style customization",
    ],
  },
  {
    icon: "📋",
    title: "ATS-Optimized Templates",
    description: "Beat applicant tracking systems with optimized formats",
    details: [
      "ATS-compliant formatting",
      "Standard section ordering",
      "Clean, parseable layouts",
      "Keyword density analysis",
    ],
  },
  {
    icon: "🎨",
    title: "Professional Designs",
    description: "Choose from dozens of modern, professional templates",
    details: [
      "Industry-specific designs",
      "Color scheme options",
      "Font pairing suggestions",
      "Layout customization",
    ],
  },
  {
    icon: "⚡",
    title: "Real-time Preview",
    description: "See changes instantly as you build your resume",
    details: [
      "Live editing experience",
      "Instant PDF preview",
      "Mobile-responsive view",
      "Print optimization",
    ],
  },
  {
    icon: "📊",
    title: "Analytics & Insights",
    description: "Get feedback on your resume effectiveness",
    details: [
      "Readability scoring",
      "Impact analysis",
      "Section balance metrics",
      "Improvement suggestions",
    ],
  },
  {
    icon: "🔗",
    title: "Easy Sharing",
    description: "Share your resume in multiple formats",
    details: [
      "PDF export",
      "Public link sharing",
      "LinkedIn integration",
      "Version history",
    ],
  },
];

export default function FeaturePreview() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create a standout resume that gets you hired
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`
                relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer
                ${
                  activeFeature === index
                    ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                    : "bg-card border-border hover:border-primary/50 hover:shadow-md"
                }
              `}
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              {/* Icon */}
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>

              {/* Details - shown on hover */}
              <div
                className={`
                overflow-hidden transition-all duration-300
                ${activeFeature === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
              `}
              >
                <ul className="space-y-2 pt-4 border-t border-border">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            More features being added regularly
          </p>
          <div className="inline-flex items-center gap-2 text-primary font-medium">
            <span>Stay tuned for launch</span>
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
