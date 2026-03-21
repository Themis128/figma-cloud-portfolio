"use client";

import { m } from "framer-motion";
import { ExternalLink, GitFork, Github, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getApiOrigin } from "@/lib/admin-constants";

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
}

interface GitHubStats {
  repos: number;
  stars: number;
  followers: number;
  name: string | null;
  profile: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-400",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-400",
  HTML: "bg-orange-400",
  CSS: "bg-purple-400",
  Shell: "bg-emerald-400",
  Dockerfile: "bg-cyan-400",
  Vue: "bg-emerald-500",
};

export default function GitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const origin = getApiOrigin();

    Promise.all([
      fetch(`${origin}/api/github/repos?limit=6`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
      fetch(`${origin}/api/github/stats`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([repoData, statsData]) => {
      setRepos(repoData as GitHubRepo[]);
      setStats(statsData as GitHubStats | null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        <span className="ml-3 text-white/40 font-mono text-sm">Loading GitHub data...</span>
      </div>
    );
  }

  if (repos.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Github className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white font-mono">
            Live from GitHub
          </h2>
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <span className="text-white/40">Repos:</span>
              <span className="text-white font-bold">{stats.repos}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <Star className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-white font-bold">{stats.stars}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <span className="text-white/40">Followers:</span>
              <span className="text-white font-bold">{stats.followers}</span>
            </div>
            <a
              href={stats.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 hover:text-white/80 transition-colors text-xs font-mono"
            >
              <Github className="w-3 h-3" />
              Profile
            </a>
          </div>
        )}
      </div>

      {/* Repo cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo, i) => (
          <m.a
            key={repo.id}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 p-4 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-mono truncate flex-1">
                {repo.name}
              </h3>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 transition-colors shrink-0 ml-2" />
            </div>

            {repo.description && (
              <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">
                {repo.description}
              </p>
            )}

            {/* Topics */}
            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {repo.topics.slice(0, 4).map((topic) => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="text-[9px] font-mono border-cyan-500/20 text-cyan-400/60 px-1.5 py-0"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer: language, stars, forks, date */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-white/30">
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${LANGUAGE_COLORS[repo.language] ?? "bg-gray-400"}`} />
                  {repo.language}
                </span>
              )}
              {repo.stars > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400/60" />
                  {repo.stars}
                </span>
              )}
              {repo.forks > 0 && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {repo.forks}
                </span>
              )}
              <span className="ml-auto">
                {new Date(repo.updatedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            </div>
          </m.a>
        ))}
      </div>
    </div>
  );
}
