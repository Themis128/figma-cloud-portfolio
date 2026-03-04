"use client";

import { useState } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  gradientClass: string;
  colors: string[];
}

const templates: Template[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    category: "Tech & Startups",
    gradientClass: "from-blue-500 to-purple-600",
    colors: ["#667eea", "#764ba2", "#f5f5f5"],
  },
  {
    id: "professional-classic",
    name: "Professional Classic",
    category: "Corporate & Finance",
    gradientClass: "from-slate-800 to-slate-900",
    colors: ["#1a365d", "#2d3748", "#e2e8f0"],
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    category: "Design & Marketing",
    gradientClass: "from-pink-400 to-red-500",
    colors: ["#f093fb", "#f5576c", "#fff5f5"],
  },
  {
    id: "elegant-simple",
    name: "Elegant Simple",
    category: "All Industries",
    gradientClass: "from-gray-800 to-black",
    colors: ["#434343", "#000000", "#ffffff"],
  },
  {
    id: "fresh-gradient",
    name: "Fresh Gradient",
    category: "Tech & Creative",
    gradientClass: "from-green-500 to-emerald-400",
    colors: ["#11998e", "#38ef7d", "#f0fff4"],
  },
  {
    id: "executive-premium",
    name: "Executive Premium",
    category: "Leadership & C-Suite",
    gradientClass: "from-gray-800 to-gray-900",
    colors: ["#414345", "#232526", "#d4af37"],
  },
];

export default function TemplateShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filteredTemplates =
    filter === "All"
      ? templates
      : templates.filter((t) => t.category === filter);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Template </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Preview our upcoming collection of professionally designed templates
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${
                  filter === category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`
                group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500
                ${
                  selectedTemplate === template.id
                    ? "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]"
                    : "hover:scale-[1.02] hover:shadow-2xl"
                }
              `}
              onClick={() =>
                setSelectedTemplate(
                  selectedTemplate === template.id ? null : template.id,
                )
              }
            >
              {/* Template preview - simulated resume card */}
              <div
                className={`aspect-[8.5/11] relative bg-gradient-to-br ${template.gradientClass}`}
              >
                {/* Simulated resume content */}
                <div className="absolute inset-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
                  {/* Header section */}
                  <div className="h-16 mb-4 flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: template.colors[0] }}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 rounded bg-gray-300" />
                      <div className="h-2 w-32 rounded bg-gray-200" />
                    </div>
                  </div>

                  {/* Content lines */}
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-2 rounded bg-gray-200"
                        style={{ width: `${70 + ((i * 3) % 30)}%` }}
                      />
                    ))}
                  </div>

                  {/* Section divider */}
                  <div className="my-4 h-px bg-gray-200" />

                  {/* More content */}
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-2 rounded bg-gray-200"
                        style={{ width: `${60 + ((i * 7) % 40)}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg font-semibold mb-2">
                      {template.name}
                    </p>
                    <p className="text-sm opacity-80">{template.category}</p>
                    <div className="mt-4 px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      Click to preview
                    </div>
                  </div>
                </div>
              </div>

              {/* Template info */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.category}
                    </p>
                  </div>
                  {/* Color palette */}
                  <div className="flex gap-1">
                    {template.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Coming soon badge */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                Coming Soon
              </div>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-card border border-border">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-xl font-semibold mb-2">More Templates Coming</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working with professional designers to bring you a diverse
            collection of templates for every industry and style.
          </p>
        </div>
      </div>
    </section>
  );
}
