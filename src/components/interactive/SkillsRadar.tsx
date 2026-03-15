'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SkillData {
  name: string;
  value: number;
  details: string;
  years: string;
}

const skills: SkillData[] = [
  { name: 'Networking', value: 95, details: 'Cisco CCNA, Enterprise routing/switching, LAN/WAN', years: '15+' },
  { name: 'Security', value: 88, details: 'Fortinet firewalls, CyberOps, endpoint security', years: '10+' },
  { name: 'Cloud', value: 82, details: 'AWS Cloud Practitioner, Azure AD, M365', years: '5+' },
  { name: 'DevOps', value: 75, details: 'Kubernetes, Docker, CI/CD pipelines', years: '3+' },
  { name: 'Programming', value: 78, details: 'Python, REST APIs, DevNet automation', years: '5+' },
  { name: 'Systems', value: 90, details: 'Windows Server, Active Directory, Intune MDM', years: '12+' },
];

function getProficiencyLevel(value: number): string {
  if (value >= 90) return 'Expert';
  if (value >= 80) return 'Advanced';
  if (value >= 70) return 'Proficient';
  if (value >= 50) return 'Intermediate';
  return 'Beginner';
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleIndex: number,
  total: number,
): { x: number; y: number } {
  const angle = (Math.PI * 2 * angleIndex) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export default function SkillsRadar() {
  const [isVisible, setIsVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setAnimateIn(true), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible]);

  const handleSkillClick = useCallback((skill: SkillData) => {
    setSelectedSkill((prev) => (prev?.name === skill.name ? null : skill));
  }, []);

  const total = skills.length;
  const cx = 150;
  const cy = 150;
  const maxRadius = 120;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = skills.map((skill, i) => {
    const r = animateIn ? (skill.value / 100) * maxRadius : 0;
    return polarToCartesian(cx, cy, r, i, total);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      ref={containerRef}
      className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-2xl p-6 md:p-8"
    >
      <h3 className="font-mono text-cyan-400 uppercase tracking-[0.15em] text-lg mb-6 text-center">
        Skills Radar
      </h3>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 300 300"
          className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px]"
          role="img"
          aria-label="Radar chart showing skill proficiency levels"
        >
          {/* Concentric ring backgrounds */}
          {rings.map((scale) => {
            const ringPoints = Array.from({ length: total }, (_, i) =>
              polarToCartesian(cx, cy, maxRadius * scale, i, total),
            );
            const ringPolygon = ringPoints.map((p) => `${p.x},${p.y}`).join(' ');
            return (
              <polygon
                key={scale}
                points={ringPolygon}
                fill="none"
                stroke="#22d3ee"
                strokeOpacity={0.12}
                strokeWidth={1}
              />
            );
          })}

          {/* Axis lines from center to each vertex */}
          {skills.map((_, i) => {
            const end = polarToCartesian(cx, cy, maxRadius, i, total);
            return (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#22d3ee"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={dataPolygon}
            fill="#22d3ee"
            fillOpacity={0.15}
            stroke="#22d3ee"
            strokeWidth={2}
            strokeOpacity={0.9}
            style={{
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* Data point dots */}
          {dataPoints.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#22d3ee"
              style={{
                transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${i * 80}ms`,
              }}
            />
          ))}

          {/* Axis labels — clickable */}
          {skills.map((skill, i) => {
            const labelRadius = maxRadius + 24;
            const pos = polarToCartesian(cx, cy, labelRadius, i, total);
            const isSelected = selectedSkill?.name === skill.name;

            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (pos.x < cx - 10) textAnchor = 'end';
            else if (pos.x > cx + 10) textAnchor = 'start';

            return (
              <g
                key={`label-${i}`}
                onClick={() => handleSkillClick(skill)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`${skill.name}: ${skill.value}%`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSkillClick(skill);
                  }
                }}
              >
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="font-mono"
                  fill={isSelected ? '#22d3ee' : '#94a3b8'}
                  fontSize={11}
                  fontWeight={isSelected ? 700 : 500}
                  style={{ transition: 'fill 0.2s, font-weight 0.2s' }}
                >
                  {skill.name}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 14}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className="font-mono"
                  fill="#22d3ee"
                  fillOpacity={animateIn ? 0.7 : 0}
                  fontSize={10}
                  style={{ transition: 'fill-opacity 0.8s ease' }}
                >
                  {skill.value}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Details panel */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: selectedSkill ? '200px' : '0px',
          opacity: selectedSkill ? 1 : 0,
        }}
      >
        {selectedSkill && (
          <div className="mt-6 border border-cyan-400/20 rounded-xl bg-cyan-950/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-mono text-cyan-400 text-base uppercase tracking-wider">
                {selectedSkill.name}
              </h4>
              <span className="font-mono text-xs text-cyan-400/80 border border-cyan-400/30 rounded px-2 py-0.5">
                {getProficiencyLevel(selectedSkill.value)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-1">
                  Proficiency
                </span>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${selectedSkill.value}%` }}
                  />
                </div>
                <span className="font-mono text-cyan-400 text-xs mt-1 block">
                  {selectedSkill.value}/100
                </span>
              </div>
              <div>
                <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-1">
                  Certifications & Skills
                </span>
                <p className="text-slate-300 text-sm">{selectedSkill.details}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-1">
                  Experience
                </span>
                <p className="font-mono text-cyan-400 text-lg">{selectedSkill.years} years</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
