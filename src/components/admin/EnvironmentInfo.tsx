"use client";

import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Code,
  GitBranch,
  Globe,
  Monitor,
  Server,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface EnvItem {
  label: string;
  value: string;
  icon: LucideIcon;
  status?: "ok" | "warn" | "off";
}

function getNavigatorInfo(): { userAgent: string; language: string } {
  if (typeof navigator === "undefined") {
    return { userAgent: "unknown", language: "unknown" };
  }
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
  };
}

function statusColor(s?: "ok" | "warn" | "off") {
  if (s === "ok") return "border-green-500/40 text-green-400";
  if (s === "warn") return "border-yellow-500/40 text-yellow-400";
  if (s === "off") return "border-foreground/20 text-foreground/30";
  return "border-cyan-500/30 text-cyan-400";
}

function statusDot(s?: "ok" | "warn" | "off") {
  if (s === "ok") return "bg-green-400";
  if (s === "warn") return "bg-yellow-400";
  if (s === "off") return "bg-foreground/20";
  return "bg-cyan-400";
}

export default function EnvironmentInfo() {
  const [clientInfo, setClientInfo] = useState<{
    viewport: string;
    memory: string;
    cores: string;
    connection: string;
  } | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { effectiveType?: string };
    };

    setClientInfo({
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : "unknown",
      cores: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} cores`
        : "unknown",
      connection: nav.connection?.effectiveType ?? "unknown",
    });
  }, []);

  const appVersion =
    process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "not set");
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const nodeEnv = process.env.NODE_ENV ?? "unknown";

  const buildItems: EnvItem[] = [
    {
      label: "App Version",
      value: appVersion,
      icon: Code,
    },
    {
      label: "Environment",
      value: nodeEnv,
      icon: Server,
      status: nodeEnv === "production" ? "ok" : "warn",
    },
    {
      label: "Site URL",
      value: siteUrl,
      icon: Globe,
    },
    {
      label: "Framework",
      value: "Next.js 16 (App Router)",
      icon: Zap,
    },
  ];

  const integrationItems: EnvItem[] = [
    {
      label: "Google Analytics",
      value: gaId ?? "not configured",
      icon: Monitor,
      status: gaId ? "ok" : "off",
    },
    {
      label: "Sentry",
      value: sentryDsn ? "configured" : "not configured",
      icon: Cloud,
      status: sentryDsn ? "ok" : "off",
    },
    {
      label: "reCAPTCHA v3",
      value: recaptchaKey ? "configured" : "not configured",
      icon: Cloud,
      status: recaptchaKey ? "ok" : "off",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Build Info */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono mb-4">
          Build Info
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {buildItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/10"
              >
                <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate">
                    {item.value}
                  </p>
                </div>
                {item.status && (
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono shrink-0 ${statusColor(item.status)}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusDot(item.status)}`} />
                    {item.status}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Integrations */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono mb-4">
          Integrations
        </p>
        <div className="space-y-2">
          {integrationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/10"
              >
                <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate">
                    {item.value}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-mono shrink-0 ${statusColor(item.status)}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusDot(item.status)}`} />
                  {item.status === "ok" ? "active" : "inactive"}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Git Info */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono mb-4">
          Git
        </p>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/10">
          <GitBranch className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
              Branch
            </p>
            <p className="text-xs font-mono text-foreground/80">
              production
            </p>
          </div>
        </div>
      </Card>

      {/* Client Info */}
      {clientInfo && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono mb-4">
            Client
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Viewport", value: clientInfo.viewport },
              { label: "Device Memory", value: clientInfo.memory },
              { label: "CPU Cores", value: clientInfo.cores },
              { label: "Connection", value: clientInfo.connection },
              { label: "Language", value: getNavigatorInfo().language },
              {
                label: "Platform",
                value:
                  typeof navigator !== "undefined"
                    ? navigator.platform
                    : "unknown",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/10"
              >
                <Monitor className="w-4 h-4 text-foreground/20 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
