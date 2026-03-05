"use client";

import { Lock } from "lucide-react";
import { useState } from "react";

import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => boolean;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!onLogin(email, password)) {
      setError("Invalid credentials");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <AnimatedSection delay={0.1}>
        <Card
          className={`bg-card/40 backdrop-blur-sm border border-border/20 p-8 w-full max-w-sm ${
            shake ? "animate-pulse" : ""
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-lg font-bold uppercase tracking-[0.15em] text-foreground">
                Admin Access
              </h1>
              <div className="w-16 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
            </div>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm bg-background/50 border-border/30 focus:border-cyan-500/50"
                autoComplete="email"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono text-sm bg-background/50 border-border/30 focus:border-cyan-500/50"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-destructive text-xs text-center font-mono">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60"
            >
              Authenticate
            </Button>

            <p className="text-foreground/30 text-[10px] text-center uppercase tracking-wider">
              Unauthorized access prohibited
            </p>
          </form>
        </Card>
      </AnimatedSection>
    </div>
  );
}
