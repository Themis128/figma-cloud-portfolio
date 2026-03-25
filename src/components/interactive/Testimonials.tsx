"use client";

import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aristotelis K.",
    role: "Senior Network Architect",
    company: "Athens International Airport",
    text: "Themis has an exceptional ability to diagnose complex network issues under pressure. His deep knowledge of Cisco infrastructure and proactive approach to security made him an invaluable member of our NOC team.",
  },
  {
    name: "Maria P.",
    role: "IT Director",
    company: "Cosmos Business Systems",
    text: "During our Azure AD migration, Themis demonstrated outstanding technical leadership. He not only handled the migration flawlessly but also trained the entire support team on the new platform. A true professional.",
  },
  {
    name: "Konstantinos D.",
    role: "Solutions Architect",
    company: "Estarta Solutions",
    text: "Working with Themis on data center deployments was a pleasure. His expertise in Cisco UCS and HyperFlex, combined with his attention to documentation, ensured every project was delivered on time and to spec.",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActive((i) => (i + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[active];
  if (!t) return null;

  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-6 relative overflow-hidden">
      {/* Decorative quote mark */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-400/10" />

      <blockquote className="text-foreground/80 text-sm leading-relaxed font-mono italic min-h-[80px]">
        &ldquo;{t.text}&rdquo;
      </blockquote>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/20">
        <div>
          <p className="text-cyan-400 font-mono text-sm font-semibold">{t.name}</p>
          <p className="text-foreground/50 font-mono text-xs">
            {t.role} · {t.company}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="p-1.5 rounded border border-border/20 text-foreground/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="p-1.5 rounded border border-border/20 text-foreground/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === active ? "bg-cyan-400" : "bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
