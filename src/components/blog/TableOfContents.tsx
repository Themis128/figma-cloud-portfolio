"use client";

import { List } from "lucide-react";
import { useEffect, useState } from "react";
import { trackGA4 } from "@/components/GoogleAnalytics";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState("");

  // Extract headings from rendered MDX
  useEffect(() => {
    const article = document.querySelector("article.prose-cyber");
    if (!article) return;

    const els = article.querySelectorAll("h2, h3");
    const items: TocHeading[] = [];
    els.forEach((el) => {
      if (el.id) {
        items.push({
          id: el.id,
          text: el.textContent ?? "",
          level: el.tagName === "H2" ? 2 : 3,
        });
      }
    });
    setHeadings(items);
  }, []);

  // Highlight active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b,
          );
          setActiveId(top.target.id);
        }
      },
      { threshold: [0.1, 0.5], rootMargin: "-80px 0px -60% 0px" },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto"
    >
      <div className="rounded-lg border border-border/20 bg-foreground/5 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
          <List className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-cyan-400">
            On this page
          </span>
        </div>
        <ul className="space-y-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  trackGA4("toc_click", { section_id: h.id, section_title: h.text });
                  document
                    .getElementById(h.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-xs leading-relaxed py-1 transition-colors duration-200 ${
                  h.level === 3 ? "pl-3" : ""
                } ${
                  activeId === h.id
                    ? "text-cyan-400 font-medium"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
