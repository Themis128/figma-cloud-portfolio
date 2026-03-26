"use client";

import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import {
  Key,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AuthInfo {
  currentUser: {
    username: string;
    userId: string;
    signInMethod: string;
  } | null;
  cognitoConfig: {
    userPoolId: string | null;
    region: string;
    appId: string;
  };
  token: {
    expiresAt: string | null;
    issuer: string | null;
    groups: string[];
  } | null;
}

export default function AuthManagement() {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);

  useEffect(() => {
    async function gatherAuthInfo() {
      const info: AuthInfo = {
        currentUser: null,
        cognitoConfig: {
          userPoolId: null,
          region: "us-east-1",
          appId: "d1zjif7pi1h3om",
        },
        token: null,
      };

      try {
        const currentUser = await getCurrentUser();
        info.currentUser = {
          username: currentUser.username,
          userId: currentUser.userId,
          signInMethod: currentUser.signInDetails?.loginId ?? "email",
        };

        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken;
        if (idToken) {
          const payload = idToken.payload;
          info.token = {
            expiresAt: payload.exp
              ? new Date(Number(payload.exp) * 1000).toISOString()
              : null,
            issuer: (payload.iss as string) ?? null,
            groups: (payload["cognito:groups"] as string[]) ?? [],
          };
          // Extract user pool ID from issuer
          if (typeof payload.iss === "string") {
            const parts = payload.iss.split("/");
            info.cognitoConfig.userPoolId = parts[parts.length - 1] ?? null;
          }
        }
      } catch {
        // Not signed in — info stays with defaults
      }

      setAuthInfo(info);
    }

    void gatherAuthInfo();
  }, []);

  if (!authInfo) {
    return (
      <div className="flex items-center justify-center min-h-50">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-cyan-400" />
          <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
            Current Session
          </p>
        </div>

        {authInfo.currentUser ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Username", value: authInfo.currentUser.username },
                { label: "User ID", value: authInfo.currentUser.userId },
                { label: "Sign-in Method", value: authInfo.currentUser.signInMethod },
                {
                  label: "Groups",
                  value: authInfo.token?.groups.join(", ") || "None",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-lg bg-background/30 border border-border/10"
                >
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                    {item.label}
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-foreground/30 font-mono">
            No user session
          </p>
        )}
      </Card>

      {/* Token Info */}
      {authInfo.token && (
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-cyan-400" />
            <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono">
              ID Token
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background/30 border border-border/10">
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                Expires
              </p>
              <p className="text-xs font-mono text-foreground/80 mt-1">
                {authInfo.token.expiresAt
                  ? new Date(authInfo.token.expiresAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/30 border border-border/10">
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                Issuer
              </p>
              <p className="text-xs font-mono text-foreground/80 truncate mt-1">
                {authInfo.token.issuer ?? "N/A"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Cognito Config */}
      <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <p className="text-xs font-mono text-foreground/80 font-bold">
              AWS Cognito
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-green-500/40 text-green-400 text-[10px] uppercase tracking-wider font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
            active
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-foreground/40">Region</span>
            <span className="text-[10px] font-mono text-foreground/60">
              {authInfo.cognitoConfig.region}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-foreground/40">App ID</span>
            <span className="text-[10px] font-mono text-foreground/60">
              {authInfo.cognitoConfig.appId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-foreground/40">User Pool</span>
            <span className="text-[10px] font-mono text-foreground/60">
              {authInfo.cognitoConfig.userPoolId ?? "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-foreground/40">Auth Method</span>
            <span className="text-[10px] font-mono text-foreground/60">
              Email (Cognito User Pool)
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
