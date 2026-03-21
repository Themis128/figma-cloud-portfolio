"use client";

import {
  CheckCircle,
  Clock,
  Cloud,
  ExternalLink,
  GitBranch,
  Github,
  Loader2,
  RefreshCcw,
  Search,
  Server,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LAMBDA_API_URL } from "@/lib/admin-constants";

interface DeployInfo {
  frontend: {
    status: "healthy" | "degraded" | "unknown";
    url: string;
    checkedAt: Date | null;
    responseTime: number | null;
    headers: Record<string, string>;
  };
  api: {
    status: "healthy" | "degraded" | "down" | "unknown";
    checkedAt: Date | null;
    responseTime: number | null;
    uptime?: string;
    memory?: string;
    version?: string;
  };
  infrastructure: {
    s3Bucket: string;
    cloudfrontId: string;
    region: string;
    amplifyAppId: string;
    domain: string;
  };
}

interface GitHubStats {
  repos: number;
  stars: number;
  followers: number;
  name: string | null;
}

interface ServiceCheck {
  name: string;
  path: string;
  ok: boolean | null;
  ms: number | null;
}

const PRODUCTION_URL = "https://www.baltzakisthemis.com";
const API_HEALTH_URL = `${LAMBDA_API_URL}/api/health`;

const SERVICE_CHECKS: { name: string; path: string }[] = [
  { name: "Search", path: "/api/search?q=test" },
  { name: "GitHub API", path: "/api/github/stats" },
  { name: "Monitor", path: "/api/monitor" },
  { name: "Resume", path: "/api/resume/generate" },
  { name: "API Docs", path: "/api/docs" },
  { name: "Push Subs", path: "/api/push-notifications?action=subscriptions" },
];

export default function DeploymentStatus() {
  const [deploy, setDeploy] = useState<DeployInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [serviceChecks, setServiceChecks] = useState<ServiceCheck[]>([]);

  const checkDeployment = async () => {
    setLoading(true);

    const info: DeployInfo = {
      frontend: {
        status: "unknown",
        url: PRODUCTION_URL,
        checkedAt: null,
        responseTime: null,
        headers: {},
      },
      api: {
        status: "unknown",
        checkedAt: null,
        responseTime: null,
      },
      infrastructure: {
        s3Bucket: "figma-portfolio-static",
        cloudfrontId: "E134SCTR0QGQKJ",
        region: "us-east-1",
        amplifyAppId: "d1zjif7pi1h3om",
        domain: "baltzakisthemis.com",
      },
    };

    // Check frontend
    {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      try {
        const start = performance.now();
        const res = await fetch(PRODUCTION_URL, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
        const time = Math.round(performance.now() - start);
        info.frontend.status = "healthy";
        info.frontend.checkedAt = new Date();
        info.frontend.responseTime = time;

        // In no-cors mode we can't read headers, but at least we know it responded
        if (res.type !== "opaque") {
          res.headers.forEach((value, key) => {
            info.frontend.headers[key] = value;
          });
        }
      } catch {
        info.frontend.status = "degraded";
        info.frontend.checkedAt = new Date();
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Check API health
    {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      try {
        const start = performance.now();
        const res = await fetch(API_HEALTH_URL, { cache: "no-store", signal: controller.signal });
        const time = Math.round(performance.now() - start);
        info.api.checkedAt = new Date();
        info.api.responseTime = time;

        if (res.ok) {
          info.api.status = "healthy";
          try {
            const data = await res.json() as Record<string, unknown>;
            if (typeof data.uptime === "string") info.api.uptime = data.uptime;
            if (typeof data.uptime === "number") info.api.uptime = `${Math.round(data.uptime as number)}s`;
            if (typeof data.memory === "object" && data.memory !== null) {
              const mem = data.memory as { rss?: number };
              if (typeof mem.rss === "number") {
                info.api.memory = `${Math.round(mem.rss / 1024 / 1024)} MB`;
              }
            }
            if (typeof data.version === "string") info.api.version = data.version;
          } catch {
            // JSON parse failed, but response was ok
          }
        } else {
          info.api.status = "degraded";
        }
      } catch {
        info.api.status = "down";
        info.api.checkedAt = new Date();
      } finally {
        clearTimeout(timeoutId);
      }
    }

    setDeploy(info);
    setLoading(false);

    // Fetch GitHub stats (non-blocking)
    fetch(`${LAMBDA_API_URL}/api/github/stats`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setGithubStats(data as GitHubStats);
      })
      .catch(() => {});

    // Run service checks (non-blocking)
    void Promise.all(
      SERVICE_CHECKS.map(async (svc) => {
        const start = performance.now();
        try {
          const r = await fetch(`${LAMBDA_API_URL}${svc.path}`, { cache: "no-store" });
          return { name: svc.name, path: svc.path, ok: r.ok, ms: Math.round(performance.now() - start) };
        } catch {
          return { name: svc.name, path: svc.path, ok: false, ms: Math.round(performance.now() - start) };
        }
      }),
    ).then(setServiceChecks);
  };

  useEffect(() => {
    void checkDeployment();
  }, []);

  function statusBadge(status: string) {
    const colors: Record<string, string> = {
      healthy: "border-green-500/40 text-green-400",
      degraded: "border-yellow-500/40 text-yellow-400",
      down: "border-red-500/40 text-red-400",
      unknown: "border-foreground/20 text-foreground/30",
    };
    const dots: Record<string, string> = {
      healthy: "bg-green-400",
      degraded: "bg-yellow-400",
      down: "bg-red-400",
      unknown: "bg-foreground/20",
    };
    return (
      <Badge
        variant="outline"
        className={`text-[10px] uppercase tracking-wider font-mono ${colors[status] ?? colors.unknown}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[status] ?? dots.unknown}`} />
        {status}
      </Badge>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Cloud className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
          <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
            Production Deployment
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void checkDeployment()}
          disabled={loading}
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
          )}
          Check
        </Button>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Frontend */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">
                Frontend
              </p>
            </div>
            <div role="status" aria-label={`Frontend status: ${deploy?.frontend.status ?? "unknown"}`}>
              {deploy && statusBadge(deploy.frontend.status)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">URL</span>
              <a
                href={PRODUCTION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {deploy?.infrastructure.domain ?? "\u2014"}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">
                Response Time
              </span>
              <span className="text-[10px] font-mono text-foreground/60">
                {deploy?.frontend.responseTime !== null
                  ? `${deploy?.frontend.responseTime}ms`
                  : "\u2014"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">
                Hosting
              </span>
              <span className="text-[10px] font-mono text-foreground/60">
                S3 + CloudFront
              </span>
            </div>
          </div>
        </Card>

        {/* API */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">
                API (Lambda)
              </p>
            </div>
            <div role="status" aria-label={`API status: ${deploy?.api.status ?? "unknown"}`}>
              {deploy && statusBadge(deploy.api.status)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">
                Response Time
              </span>
              <span className="text-[10px] font-mono text-foreground/60">
                {deploy?.api.responseTime !== null
                  ? `${deploy?.api.responseTime}ms`
                  : "\u2014"}
              </span>
            </div>
            {deploy?.api.uptime && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-foreground/40">
                  Uptime
                </span>
                <span className="text-[10px] font-mono text-foreground/60">
                  {deploy.api.uptime}
                </span>
              </div>
            )}
            {deploy?.api.memory && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-foreground/40">
                  Memory (RSS)
                </span>
                <span className="text-[10px] font-mono text-foreground/60">
                  {deploy.api.memory}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">
                Runtime
              </span>
              <span className="text-[10px] font-mono text-foreground/60">
                Node.js (Express 5)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Infrastructure */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono mb-3 sm:mb-4">
          Infrastructure
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "S3 Bucket", value: deploy?.infrastructure.s3Bucket ?? "\u2014", icon: Server },
            { label: "CloudFront", value: deploy?.infrastructure.cloudfrontId ?? "\u2014", icon: Cloud },
            { label: "Region", value: deploy?.infrastructure.region ?? "\u2014", icon: Cloud },
            { label: "Amplify App", value: deploy?.infrastructure.amplifyAppId ?? "\u2014", icon: GitBranch },
            { label: "Domain", value: deploy?.infrastructure.domain ?? "\u2014", icon: ExternalLink },
            { label: "Branch", value: "production", icon: GitBranch },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/10"
              >
                <Icon className="w-4 h-4 text-foreground/20 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Deploy Checklist */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono mb-3">
          Health Checks
        </p>
        <div className="space-y-2">
          {[
            {
              label: "Frontend reachable",
              ok: deploy?.frontend.status === "healthy",
              checked: deploy?.frontend.checkedAt !== null,
            },
            {
              label: "API responding",
              ok: deploy?.api.status === "healthy",
              checked: deploy?.api.checkedAt !== null,
            },
            {
              label: "API latency < 2s",
              ok:
                deploy?.api.responseTime !== null &&
                (deploy?.api.responseTime ?? Infinity) < 2000,
              checked: deploy?.api.responseTime !== null,
            },
          ].map((check) => (
            <div key={check.label} className="flex items-center gap-2">
              {!check.checked ? (
                <Clock className="w-3.5 h-3.5 text-foreground/20" />
              ) : check.ok ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={`text-[10px] font-mono ${
                  !check.checked
                    ? "text-foreground/20"
                    : check.ok
                      ? "text-foreground/50"
                      : "text-red-400"
                }`}
              >
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* GitHub Activity + Service Health (side by side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GitHub Activity */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Github className="w-4 h-4 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
              GitHub Activity
            </p>
          </div>
          {githubStats ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Repos", value: githubStats.repos, color: "text-foreground" },
                { label: "Stars", value: githubStats.stars, color: "text-yellow-400" },
                { label: "Followers", value: githubStats.followers, color: "text-cyan-400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-xl font-mono font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-foreground/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px] font-mono">Loading...</span>
            </div>
          )}
        </Card>

        {/* Service Health */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
              Service Endpoints
            </p>
          </div>
          {serviceChecks.length > 0 ? (
            <div className="space-y-1.5">
              {serviceChecks.map((svc) => (
                <div key={svc.name} className="flex items-center gap-2">
                  {svc.ok === null ? (
                    <Clock className="w-3 h-3 text-foreground/20" />
                  ) : svc.ok ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className={`text-[10px] font-mono flex-1 ${svc.ok ? "text-foreground/50" : "text-red-400"}`}>
                    {svc.name}
                  </span>
                  {svc.ms !== null && (
                    <span className="text-[9px] font-mono text-foreground/20">
                      {svc.ms}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-foreground/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-[10px] font-mono">Checking...</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
