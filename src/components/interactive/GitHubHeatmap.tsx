"use client";

import { useEffect, useState } from "react";

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4
}

const GITHUB_USERNAME = "Themis128";
const WEEKS_TO_SHOW = 20;

export default function GitHubHeatmap() {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [publicRepos, setPublicRepos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGitHub() {
      try {
        // Fetch public repo data
        const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });
        if (userRes.ok) {
          const data = (await userRes.json()) as { public_repos?: number };
          setPublicRepos(data.public_repos ?? 0);
        }

        // Fetch recent events to approximate contribution activity
        const eventsRes = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
          { headers: { Accept: "application/vnd.github.v3+json" } },
        );
        if (eventsRes.ok) {
          const events = (await eventsRes.json()) as Array<{ created_at: string; type: string }>;

          // Build a contribution map from events
          const dayMap = new Map<string, number>();
          for (const event of events) {
            const date = event.created_at.slice(0, 10);
            dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
          }

          // Generate the last N weeks of days
          const days: ContributionDay[] = [];
          const now = new Date();
          for (let i = WEEKS_TO_SHOW * 7 - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const count = dayMap.get(dateStr) ?? 0;
            const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
            days.push({ date: dateStr, count, level });
          }

          setContributions(days);
          setTotalContributions(events.length);
        }
      } catch {
        // Silently fail — heatmap is decorative
      } finally {
        setLoading(false);
      }
    }

    void fetchGitHub();
  }, []);

  if (loading) {
    return (
      <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-4 animate-pulse">
        <div className="h-20 bg-foreground/5 rounded" />
      </div>
    );
  }

  const levelColors = [
    "bg-foreground/5",
    "bg-cyan-500/20",
    "bg-cyan-500/40",
    "bg-cyan-500/60",
    "bg-cyan-400",
  ];

  // Group by weeks
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-foreground/60 uppercase tracking-[0.15em] text-xs font-mono">
          GitHub Activity
        </h3>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 font-mono text-xs hover:text-cyan-300 transition-colors"
        >
          @{GITHUB_USERNAME}
        </a>
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.75 overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.75">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-2.5 h-2.5 rounded-xs ${levelColors[day.level]} transition-colors`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mt-3 text-xs font-mono">
        <span className="text-foreground/50">
          <span className="text-cyan-400 font-bold">{totalContributions}</span> recent events
        </span>
        <span className="text-foreground/50">
          <span className="text-cyan-400 font-bold">{publicRepos}</span> public repos
        </span>
      </div>
    </div>
  );
}
