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

import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
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
import { PushNotificationTester } from "@/components/PushNotificationTester";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const { isAuthenticated, isLoading, login, logout, loginError, user } =
    useAdminAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      {/* noindex for search engines */}
      <meta name="robots" content="noindex, nofollow" />

      <CircuitBackground />
      <Navigation />

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
            <Tabs defaultValue="health" className="space-y-6">
              <TabsList className="bg-card/40 backdrop-blur-sm border border-border/20 p-1 flex-wrap h-auto gap-1">
                <TabsTrigger
                  value="health"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  Health
                </TabsTrigger>
                <TabsTrigger
                  value="console"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1.5" />
                  Console
                </TabsTrigger>
                <TabsTrigger
                  value="deploy"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Cloud className="w-3.5 h-3.5 mr-1.5" />
                  Deploy
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Errors
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Gauge className="w-3.5 h-3.5 mr-1.5" />
                  Perf
                </TabsTrigger>
                <TabsTrigger
                  value="seo"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  SEO
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  Push
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="auth"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Auth
                </TabsTrigger>
                <TabsTrigger
                  value="environment"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Env
                </TabsTrigger>
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
