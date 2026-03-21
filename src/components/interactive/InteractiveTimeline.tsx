'use client';

import { Calendar, MapPin } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimelineEntry {
  company: string;
  position: string;
  period: string;
  location: string;
  responsibilities: string[];
}

interface InteractiveTimelineProps {
  experiences: TimelineEntry[];
}

export default function InteractiveTimeline({ experiences }: InteractiveTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;

    if (entry.isIntersecting) {
      const ratio = entry.intersectionRatio;
      setLineHeight(Math.min(ratio * 1.2, 1) * 100);
    }
  }, []);

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: Array.from({ length: 20 }, (_, i) => i / 20),
      rootMargin: '0px 0px -10% 0px',
    });

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [handleIntersection]);

  const extractYear = (period: string): string => {
    const match = period.match(/\d{4}/);
    return match ? match[0] : '';
  };

  return (
    <div ref={timelineRef} className="relative w-full">
      {/* Desktop: timeline with line */}
      <div className="hidden md:block">
        {/* Animated timeline line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-white/10">
          <div
            className="w-full bg-linear-to-b from-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
            style={{ height: `${lineHeight}%` }}
          />
        </div>

        {/* Timeline entries */}
        <div className="space-y-8">
          {experiences.map((exp, index) => {
            const isActive = activeIndex === index;
            return (
              <div key={`${exp.company}-${exp.period}`} className="relative pl-12">
                {/* Node */}
                <button
                  onClick={() => setActiveIndex(index)}
                  className="absolute left-0 top-1 z-10 flex items-center gap-3 group"
                  aria-label={`Select ${exp.company} - ${exp.period}`}
                  aria-expanded={isActive}
                >
                  {/* Circle */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-cyan-400 transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-500/40 animate-[pulse-glow_2s_ease-in-out_infinite]'
                        : 'bg-transparent hover:bg-cyan-400/30'
                    }`}
                  />
                  {/* Year label */}
                  <span className="text-xs font-mono text-cyan-400/60 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                    {extractYear(exp.period)}
                  </span>
                </button>

                {/* Experience card */}
                <div
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  className={`cursor-pointer rounded-lg border transition-all duration-500 ${
                    isActive
                      ? 'bg-white/5 backdrop-blur-sm border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                      : 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card header */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg leading-tight">
                      {exp.company}
                    </h3>
                    <p className="text-cyan-400 text-sm mt-1">{exp.position}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  {/* Expandable responsibilities */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isActive ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                      <ul className="space-y-2">
                        {exp.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-white/70"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: no timeline line, all cards fully expanded */}
      <div className="md:hidden space-y-6">
        {experiences.map((exp) => (
          <div
            key={`mobile-${exp.company}-${exp.period}`}
            className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <h3 className="text-white font-semibold text-lg leading-tight">
              {exp.company}
            </h3>
            <p className="text-cyan-400 text-sm mt-1">{exp.position}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {exp.period}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {exp.location}
              </span>
            </div>
            <div className="border-t border-white/5 pt-3 mt-3">
              <ul className="space-y-2">
                {exp.responsibilities.map((resp, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/70"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Pulse glow keyframes */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
          }
          50% {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.2);
          }
        }
      `}</style>
    </div>
  );
}
