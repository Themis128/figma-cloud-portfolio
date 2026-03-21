"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  Cloud,
  ExternalLink,
  Gauge,
  Info,
  Search,
  Shield,
  Terminal,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/components/admin/AdminLogin";
import ApiConsole from "@/components/admin/ApiConsole";
import ApiHealthDashboard from "@/components/admin/ApiHealthDashboard";
import AuthManagement from "@/components/admin/AuthManagement";
import DeploymentStatus from "@/components/admin/DeploymentStatus";
import EnvironmentInfo from "@/components/admin/EnvironmentInfo";
import ErrorLogViewer from "@/components/admin/ErrorLogViewer";
import GoogleAnalyticsExplainer from "@/components/admin/GoogleAnalyticsExplainer";
import PerformanceBudget from "@/components/admin/PerformanceBudget";
import SeoAudit from "@/components/admin/SeoAudit";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import { PushNotificationTester } from "@/components/PushNotificationTester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_ITEMS = [
  { value: "health", label: "Health", icon: Activity },
  { value: "console", label: "Console", icon: Terminal },
  { value: "deploy", label: "Deploy", icon: Cloud },
  { value: "errors", label: "Errors", icon: AlertTriangle },
  { value: "performance", label: "Perf", icon: Gauge },
  { value: "seo", label: "SEO", icon: Search },
  { value: "notifications", label: "Push", icon: Bell },
  { value: "analytics", label: "Analytics", icon: ExternalLink },
  { value: "auth", label: "Auth", icon: Shield },
  { value: "environment", label: "Env", icon: Info },
] as const;

const SHORTCUTS = [
  { keys: "R", description: "Refresh all endpoints (Health tab)" },
  { keys: "Ctrl+Enter", description: "Send request (Console tab)" },
  { keys: "?", description: "Show keyboard shortcuts" },
] as const;

function ShortcutHelpModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="bg-card/90 backdrop-blur-md border border-cyan-500/20 rounded-lg p-6 w-full max-w-sm shadow-lg shadow-cyan-500/5">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-400 mb-4 font-mono">
          Keyboard Shortcuts
        </h2>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between gap-4">
              <span className="text-xs text-foreground/60">{s.description}</span>
              <kbd className="shrink-0 px-2 py-1 rounded border border-border/30 bg-background/50 text-[11px] font-mono text-cyan-400">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded border border-border/20 text-xs font-mono text-foreground/40 hover:text-foreground/60 hover:border-border/40 transition-colors"
        >
          Close <span className="text-foreground/20">(Esc)</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAuthenticated, isLoading, login, logout, loginError, user } =
    useAdminAuth();
  const [activeTab, setActiveTab] = useState<string>("health");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleCloseShortcuts = useCallback(() => setShowShortcuts(false), []);

  // "?" keyboard shortcut to open help modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return;
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      {showShortcuts && <ShortcutHelpModal onClose={handleCloseShortcuts} />}

      <main id="main-content" className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : !isAuthenticated ? (
          <AdminLogin onLogin={login} errorMessage={loginError} />
        ) : (
          <AdminLayout
            onLogout={() => void logout()}
            {...(user?.signInDetails?.loginId !== undefined && { userEmail: user.signInDetails.loginId })}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
              {/* Mobile: Dropdown select for tabs */}
              <div className="block md:hidden">
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full appearance-none bg-card/40 backdrop-blur-sm border border-border/20 rounded-lg px-4 py-3 font-mono text-sm text-cyan-400 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                    aria-label="Select admin tab"
                  >
                    {TAB_ITEMS.map((tab) => (
                      <option key={tab.value} value={tab.value} className="bg-background text-foreground">
                        {tab.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Desktop: Tab bar */}
              <TabsList className="hidden md:flex bg-card/40 backdrop-blur-sm border border-border/20 p-1 flex-wrap h-auto gap-1">
                {TAB_ITEMS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                    >
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="health">
                <ApiHealthDashboard />
              </TabsContent>

              <TabsContent value="console">
                <ApiConsole />
              </TabsContent>

              <TabsContent value="deploy">
                <DeploymentStatus />
              </TabsContent>

              <TabsContent value="errors">
                <ErrorLogViewer />
              </TabsContent>

              <TabsContent value="performance">
                <PerformanceBudget />
              </TabsContent>

              <TabsContent value="seo">
                <SeoAudit />
              </TabsContent>

              <TabsContent value="notifications">
                <PushNotificationTester />
              </TabsContent>

              <TabsContent value="analytics">
                <GoogleAnalyticsExplainer />
              </TabsContent>

              <TabsContent value="auth">
                <AuthManagement />
              </TabsContent>

              <TabsContent value="environment">
                <EnvironmentInfo />
              </TabsContent>
            </Tabs>
          </AdminLayout>
        )}
      </main>
    </div>
  );
}
