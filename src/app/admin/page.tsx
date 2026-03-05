"use client";

import { Activity, ExternalLink, Terminal } from "lucide-react";

import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/components/admin/AdminLogin";
import ApiConsole from "@/components/admin/ApiConsole";
import ApiHealthDashboard from "@/components/admin/ApiHealthDashboard";
import GoogleAnalyticsExplainer from "@/components/admin/GoogleAnalyticsExplainer";
import { useAdminAuth } from "@/components/admin/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth();

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
          <AdminLogin onLogin={login} />
        ) : (
          <AdminLayout onLogout={logout}>
            <Tabs defaultValue="health" className="space-y-6">
              <TabsList className="bg-card/40 backdrop-blur-sm border border-border/20 p-1">
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
                  value="analytics"
                  className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400 font-mono text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health">
                <ApiHealthDashboard />
              </TabsContent>

              <TabsContent value="console">
                <ApiConsole />
              </TabsContent>

              <TabsContent value="analytics">
                <GoogleAnalyticsExplainer />
              </TabsContent>
            </Tabs>
          </AdminLayout>
        )}
      </main>
    </div>
  );
}
