"use client";

import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import ApiEndpointCard, {
  type EndpointDef,
  type EndpointStatus,
} from "./ApiEndpointCard";

const ENDPOINTS: EndpointDef[] = [
  {
    id: "ping",
    name: "Ping",
    method: "GET",
    path: "/api/ping",
    service: "Lambda",
    description: "Basic health check",
    healthCheck: { method: "GET", path: "/api/ping" },
  },
  {
    id: "health",
    name: "Health",
    method: "GET",
    path: "/api/health",
    service: "Lambda",
    description: "Detailed health status with uptime and memory",
    healthCheck: { method: "GET", path: "/api/health" },
  },
  {
    id: "booking-slots",
    name: "Booking Slots",
    method: "GET",
    path: "/api/booking/slots",
    service: "Cal.com",
    description: "Fetch available booking slots (next 7 days)",
    healthCheck: { method: "GET", path: "/api/booking/slots" },
  },
  {
    id: "booking-create",
    name: "Booking Create",
    method: "POST",
    path: "/api/booking/create",
    service: "Cal.com",
    description: "Create a new booking with Google Meet link",
    healthCheck: {
      method: "POST",
      path: "/api/booking/create",
      body: JSON.stringify({}),
    },
  },
  {
    id: "chat",
    name: "AI Chat",
    method: "POST",
    path: "/api/chat",
    service: "HuggingFace",
    description: "AI assistant powered by Llama 3.1",
    healthCheck: {
      method: "POST",
      path: "/api/chat",
      body: JSON.stringify({ message: "ping", history: [] }),
    },
  },
  {
    id: "resume",
    name: "Resume Download",
    method: "GET",
    path: "/api/resume/download",
    service: "Lambda",
    description: "PDF resume (302 redirect)",
    healthCheck: { method: "GET", path: "/api/resume/download" },
  },
  {
    id: "api-keys",
    name: "API Keys",
    method: "GET",
    path: "/api/organizations/api_keys",
    service: "Lambda",
    description: "API key management (CRUD)",
    healthCheck: { method: "GET", path: "/api/organizations/api_keys" },
  },
  {
    id: "contact",
    name: "Contact Form",
    method: "POST",
    path: "/api/contact",
    service: "reCAPTCHA + SES",
    description: "Contact form submission with reCAPTCHA validation",
    healthCheck: {
      method: "POST",
      path: "/api/contact",
      body: JSON.stringify({
        name: "healthcheck",
        email: "hc@test.com",
        message: "healthcheck",
      }),
    },
  },
  {
    id: "push-notifications",
    name: "Push Notifications",
    method: "GET",
    path: "/api/push-notifications",
    service: "Web Push",
    description: "Push notification management (VAPID, subscriptions)",
    healthCheck: {
      method: "GET",
      path: "/api/push-notifications?action=subscriptions",
    },
  },
];

const defaultStatus = (): EndpointStatus => ({
  state: "idle",
  statusCode: null,
  responseTime: null,
  lastChecked: null,
});

export default function ApiHealthDashboard() {
  const [statuses, setStatuses] = useState<Record<string, EndpointStatus>>(
    () => {
      const s: Record<string, EndpointStatus> = {};
      for (const ep of ENDPOINTS) s[ep.id] = defaultStatus();
      return s;
    },
  );

  const checkEndpoint = useCallback(async (ep: EndpointDef) => {
    setStatuses((prev) => {
      const current = prev[ep.id] ?? defaultStatus();
      const { error: _e, ...rest } = current;
      return { ...prev, [ep.id]: { ...rest, state: "checking" as const } };
    });

    const start = performance.now();
    try {
      const opts: RequestInit = {
        method: ep.healthCheck.method,
        redirect: "follow",
      };
      if (ep.healthCheck.body) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = ep.healthCheck.body;
      }
      const res = await fetch(ep.healthCheck.path, opts);
      const time = Math.round(performance.now() - start);

      setStatuses((prev) => ({
        ...prev,
        [ep.id]: {
          state: res.ok || res.status === 302 || res.status === 400 ? "healthy" : "degraded",
          statusCode: res.status,
          responseTime: time,
          lastChecked: new Date(),
        },
      }));
    } catch (err) {
      const time = Math.round(performance.now() - start);
      setStatuses((prev) => ({
        ...prev,
        [ep.id]: {
          state: "down",
          statusCode: null,
          responseTime: time,
          lastChecked: new Date(),
          error: err instanceof Error ? err.message : "Network error",
        },
      }));
    }
  }, []);

  const refreshAll = useCallback(() => {
    for (const ep of ENDPOINTS) void checkEndpoint(ep);
  }, [checkEndpoint]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const statusValues = Object.values(statuses);
  const healthy = statusValues.filter((s) => s.state === "healthy").length;
  const degraded = statusValues.filter((s) => s.state === "degraded").length;
  const down = statusValues.filter((s) => s.state === "down").length;
  const times = statusValues
    .map((s) => s.responseTime)
    .filter((t): t is number => t !== null);
  const avgTime =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-foreground">
              {ENDPOINTS.length}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Total
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-green-400">
              {healthy}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
              Healthy
            </p>
          </div>
          {degraded > 0 && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-yellow-400">
                {degraded}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Degraded
              </p>
            </div>
          )}
          {down > 0 && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-red-400">
                {down}
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Down
              </p>
            </div>
          )}
          {avgTime > 0 && (
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-cyan-400">
                {avgTime}
                <span className="text-sm text-foreground/40">ms</span>
              </p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                Avg
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
          Refresh All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENDPOINTS.map((ep) => (
          <ApiEndpointCard
            key={ep.id}
            endpoint={ep}
            status={statuses[ep.id] ?? defaultStatus()}
            onRefresh={() => void checkEndpoint(ep)}
          />
        ))}
      </div>
    </div>
  );
}
