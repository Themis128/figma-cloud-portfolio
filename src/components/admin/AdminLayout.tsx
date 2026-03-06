"use client";

import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userEmail?: string | undefined;
}

export default function AdminLayout({
  children,
  onLogout,
  userEmail,
}: AdminLayoutProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-foreground">
          Admin Dashboard
        </h1>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden sm:inline text-foreground/40 font-mono text-xs">
              {userEmail}
            </span>
          )}
          <Badge
            variant="outline"
            className="border-green-500/40 text-green-400 text-[10px] uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5" />
            Online
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="border-border/30 text-foreground/60 hover:text-foreground hover:border-border/50"
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>
      <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mb-2" />
      <p className="text-foreground/50 text-sm mb-8">
        Monitoring & management console
      </p>
      {children}
    </div>
  );
}
