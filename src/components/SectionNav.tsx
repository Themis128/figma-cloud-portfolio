"use client";

import { useEffect, useState } from "react";

interface SectionNavProps {
  sections: ReadonlyArray<{ readonly id: string; readonly label: string }>;
  ariaLabel?: string;
}

export function SectionNav({ sections, ariaLabel = "Page sections" }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sectionEls = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;

    // Show nav after scrolling past hero
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const top = visibleEntries.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b,
          );
          setActiveId(top.target.id);
        }
      },
      { threshold: [0.1, 0.3, 0.5], rootMargin: "-80px 0px -40% 0px" },
    );

    for (const el of sectionEls) observer.observe(el);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4 pointer-events-none"
      }`}
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="group flex items-center gap-2"
            aria-label={`Jump to ${section.label}`}
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "text-cyan-400 opacity-100"
                  : "text-foreground/30 opacity-0 group-hover:opacity-100"
              }`}
            >
              {section.label}
            </span>
            <span
              className={`rounded-full transition-all duration-200 ${
                isActive
                  ? "w-2.5 h-2.5 bg-cyan-400 shadow-sm shadow-cyan-500/40"
                  : "w-1.5 h-1.5 bg-foreground/20 group-hover:bg-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
