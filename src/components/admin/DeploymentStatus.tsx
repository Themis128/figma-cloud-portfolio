"use client";

import {
  Activity,
  AlertTriangle,
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
import { useCallback, useEffect, useState } from "react";
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

interface DeploymentSnapshot {
  timestamp: string;
  frontendOk: boolean;
  apiOk: boolean;
  serviceSuccessRatio: number;
}

interface UptimeWindowStats {
  availabilityPercent: number;
  sampleCount: number;
  lastFailureAt: string | null;
  consecutiveFailureCount: number;
}

interface AwsUptimeSummary {
  source: "aws-cloudwatch";
  functionName: string;
  region: string;
  windowHours: number;
  availabilityPercent: number;
  invocations: number;
  errors: number;
}

const PRODUCTION_URL = "https://www.baltzakisthemis.com";
const API_HEALTH_URL = `${LAMBDA_API_URL}/api/health`;
const UPTIME_SUMMARY_URL = `${LAMBDA_API_URL}/api/uptime/summary`;
const UPTIME_HISTORY_STORAGE_KEY = "admin-deployment-uptime-history-v1";
const UPTIME_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEPLOYMENT_POLL_INTERVAL_MS = 60_000;
const MAX_UPTIME_SAMPLES = 2_000;

const SERVICE_CHECKS: { name: string; path: string }[] = [
  { name: "Search", path: "/api/search?q=test" },
  { name: "GitHub API", path: "/api/github/stats" },
  { name: "Monitor", path: "/api/monitor" },
  { name: "Resume", path: "/api/resume/generate" },
  { name: "API Docs", path: "/api/docs" },
  { name: "Push Subs", path: "/api/push-notifications?action=subscriptions" },
];

function formatRelativeTime(isoDate: string): string {
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return "n/a";

  const seconds = Math.floor((Date.now() - dt.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDurationFromSeconds(rawSeconds: number | null): string {
  if (rawSeconds === null || !Number.isFinite(rawSeconds) || rawSeconds < 0) {
    return "n/a";
  }

  const total = Math.round(rawSeconds);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = total % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function pruneHistory(history: DeploymentSnapshot[]): DeploymentSnapshot[] {
  const cutoff = Date.now() - UPTIME_WINDOW_MS;
  return history
    .filter((entry) => {
      const ts = new Date(entry.timestamp).getTime();
      return Number.isFinite(ts) && ts >= cutoff;
    })
    .slice(-MAX_UPTIME_SAMPLES);
}

function isSampleHealthy(entry: DeploymentSnapshot): boolean {
  return entry.frontendOk && entry.apiOk && entry.serviceSuccessRatio >= 0.8;
}

function computeUptimeWindow(history: DeploymentSnapshot[]): UptimeWindowStats {
  if (history.length === 0) {
    return {
      availabilityPercent: 0,
      sampleCount: 0,
      lastFailureAt: null,
      consecutiveFailureCount: 0,
    };
  }

  const successful = history.filter((entry) => isSampleHealthy(entry)).length;

  let consecutiveFailureCount = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const sample = history[i];
    if (!sample || isSampleHealthy(sample)) break;
    consecutiveFailureCount += 1;
  }

  const lastFailure = [...history].reverse().find((entry) => !isSampleHealthy(entry));

  return {
    availabilityPercent: Math.round((successful / history.length) * 10_000) / 100,
    sampleCount: history.length,
    lastFailureAt: lastFailure?.timestamp ?? null,
    consecutiveFailureCount,
  };
}

export default function DeploymentStatus() {
  const [deploy, setDeploy] = useState<DeployInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [serviceChecks, setServiceChecks] = useState<ServiceCheck[]>([]);
  const [uptimeHistory, setUptimeHistory] = useState<DeploymentSnapshot[]>([]);
  const [awsUptime, setAwsUptime] = useState<AwsUptimeSummary | null>(null);

  const checkDeployment = useCallback(async () => {
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
            if (typeof data.uptime === "number") info.api.uptime = formatDurationFromSeconds(data.uptime);
            if (typeof data.memory === "object" && data.memory !== null) {
              const mem = data.memory as { rss?: number };
              if (typeof mem.rss === "number") {
                info.api.memory = `${Math.round(mem.rss / 1024 / 1024)} MB`;
              }
            }
            if (typeof data.memory === "string") {
              info.api.memory = data.memory;
            }
            if (typeof data.version === "string") info.api.version = data.version;
          } catch {
            // JSON parse failed, but response was ok.
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

    fetch(`${LAMBDA_API_URL}/api/github/stats`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setGithubStats(data as GitHubStats);
      })
      .catch(() => {});

    fetch(UPTIME_SUMMARY_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { aws?: AwsUptimeSummary | null } | null) => {
        setAwsUptime(data?.aws ?? null);
      })
      .catch(() => {
        setAwsUptime(null);
      });

    const serviceResults = await Promise.all(
      SERVICE_CHECKS.map(async (svc) => {
        const start = performance.now();
        try {
          const r = await fetch(`${LAMBDA_API_URL}${svc.path}`, { cache: "no-store" });
          return { name: svc.name, path: svc.path, ok: r.ok, ms: Math.round(performance.now() - start) };
        } catch {
          return { name: svc.name, path: svc.path, ok: false, ms: Math.round(performance.now() - start) };
        }
      }),
    );

    setServiceChecks(serviceResults);

    const serviceSuccessRatio = serviceResults.length > 0
      ? serviceResults.filter((svc) => svc.ok).length / serviceResults.length
      : 1;

    const snapshot: DeploymentSnapshot = {
      timestamp: new Date().toISOString(),
      frontendOk: info.frontend.status === "healthy",
      apiOk: info.api.status === "healthy",
      serviceSuccessRatio,
    };

    setUptimeHistory((prev) => {
      const next = pruneHistory([...prev, snapshot]);
      try {
        localStorage.setItem(UPTIME_HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors in restricted environments.
      }
      return next;
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UPTIME_HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DeploymentSnapshot[];
        setUptimeHistory(pruneHistory(parsed));
      }
    } catch {
      // Ignore invalid localStorage data and continue with an empty timeline.
    }

    void checkDeployment();
  }, [checkDeployment]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void checkDeployment();
    }, DEPLOYMENT_POLL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [checkDeployment]);

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

  const uptimeStats = computeUptimeWindow(uptimeHistory);
  const hasUptimeData = uptimeStats.sampleCount > 0;
  const serviceUp = serviceChecks.filter((svc) => svc.ok).length;
  const serviceTotal = serviceChecks.length;
  const availabilityPercent = awsUptime?.availabilityPercent ?? uptimeStats.availabilityPercent;
  const availabilitySampleText = awsUptime
    ? `${awsUptime.invocations} Lambda invocations`
    : hasUptimeData
      ? `${uptimeStats.sampleCount} local samples`
      : "Collecting samples...";
  const availabilitySourceText = awsUptime
    ? "AWS CloudWatch (read-only, free-tier eligible)"
    : "Browser local fallback";
  const lastFailureText = awsUptime
    ? awsUptime.errors > 0
      ? ` error events in 24h`
      : "none"
    : uptimeStats.lastFailureAt
      ? formatRelativeTime(uptimeStats.lastFailureAt)
      : "none";
  const isAwsFreeTierMode = awsUptime !== null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Cloud className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
          <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
            Production Deployment
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAwsFreeTierMode && (
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-emerald-400 text-[10px] uppercase tracking-wider font-mono"
            >
              AWS Free-Tier Mode
            </Badge>
          )}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Availability 24h
            </p>
          </div>
          <p className="text-2xl font-mono font-bold text-cyan-400">
            {(awsUptime || hasUptimeData) ? `${availabilityPercent}%` : "n/a"}
          </p>
          <p className="text-[10px] text-foreground/30 font-mono">{availabilitySampleText}</p>
          <p className="text-[10px] text-foreground/20 font-mono">{availabilitySourceText}</p>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Services Healthy
            </p>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {serviceTotal > 0 ? `${serviceUp}/${serviceTotal}` : "n/a"}
          </p>
          <p className="text-[10px] text-foreground/30 font-mono">Current endpoint sweep</p>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Last Failure
            </p>
          </div>
          <p className="text-xl font-mono font-bold text-foreground">{lastFailureText}</p>
          <p className="text-[10px] text-foreground/30 font-mono">Across frontend, API, and service ratio</p>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono">
              Consecutive Failures
            </p>
          </div>
          <p className="text-2xl font-mono font-bold text-foreground">
            {awsUptime ? awsUptime.errors : uptimeStats.consecutiveFailureCount}
          </p>
          <p className="text-[10px] text-foreground/30 font-mono">
            {awsUptime ? "CloudWatch errors in window" : "Most recent failed checks in a row"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">Frontend</p>
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
              <span className="text-[10px] font-mono text-foreground/40">Response Time</span>
              <span className="text-[10px] font-mono text-foreground/60">
                {deploy?.frontend.responseTime !== null
                  ? `${deploy?.frontend.responseTime}ms`
                  : "\u2014"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Hosting</span>
              <span className="text-[10px] font-mono text-foreground/60">S3 + CloudFront</span>
            </div>
          </div>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">API (Lambda)</p>
            </div>
            <div role="status" aria-label={`API status: ${deploy?.api.status ?? "unknown"}`}>
              {deploy && statusBadge(deploy.api.status)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Response Time</span>
              <span className="text-[10px] font-mono text-foreground/60">
                {deploy?.api.responseTime !== null
                  ? `${deploy?.api.responseTime}ms`
                  : "\u2014"}
              </span>
            </div>
            {deploy?.api.uptime && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-foreground/40">Process Age</span>
                <span className="text-[10px] font-mono text-foreground/60">{deploy.api.uptime}</span>
              </div>
            )}
            {deploy?.api.memory && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-foreground/40">Memory</span>
                <span className="text-[10px] font-mono text-foreground/60">{deploy.api.memory}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Runtime</span>
              <span className="text-[10px] font-mono text-foreground/60">Node.js (Express 5)</span>
            </div>
            <p className="text-[10px] text-foreground/30 font-mono pt-1">
              Process age resets on cold starts and deploys; uptime KPI uses CloudWatch when available.
            </p>
          </div>
        </Card>
      </div>

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
                  <p className="text-xs font-mono text-foreground/80 truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-wider text-foreground/40 font-mono mb-3">Health Checks</p>
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
            {
              label: "Rolling availability >= 99.5%",
              ok: (awsUptime || hasUptimeData) && availabilityPercent >= 99.5,
              checked: awsUptime !== null || hasUptimeData,
            },
            {
              label: "No active incident streak",
              ok: awsUptime ? awsUptime.errors === 0 : uptimeStats.consecutiveFailureCount === 0,
              checked: awsUptime !== null || hasUptimeData,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{stat.label}</p>
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
                    <span className="text-[9px] font-mono text-foreground/20">{svc.ms}ms</span>
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
