"use client";

import { useEffect, useState } from "react";
import {
  Key,
  Lock,
  Shield,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/firebase";

interface AuthInfo {
  currentUser: {
    email: string | null;
    uid: string;
    emailVerified: boolean;
    createdAt: string | null;
    lastSignIn: string | null;
    provider: string;
  } | null;
  firebaseConfig: {
    projectId: string | null;
    authDomain: string | null;
    configured: boolean;
  };
  amplifyConfig: {
    configured: boolean;
    region: string;
    appId: string;
  };
  token: {
    expiresAt: string | null;
    issuer: string | null;
  } | null;
}

export default function AuthManagement() {
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);

  useEffect(() => {
    async function gatherAuthInfo() {
      const user = auth.currentUser;

      const info: AuthInfo = {
        currentUser: null,
        firebaseConfig: {
          projectId: auth.app?.options?.projectId ?? null,
          authDomain: auth.app?.options?.authDomain ?? null,
          configured: !!auth.app?.options?.apiKey,
        },
        amplifyConfig: {
          configured: true,
          region: "us-east-1",
          appId: "d1zjif7pi1h3om",
        },
        token: null,
      };

      if (user) {
        info.currentUser = {
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime ?? null,
          lastSignIn: user.metadata.lastSignInTime ?? null,
          provider: user.providerData[0]?.providerId ?? "unknown",
        };

        try {
          const tokenResult = await user.getIdTokenResult();
          info.token = {
            expiresAt: tokenResult.expirationTime,
            issuer: tokenResult.claims["iss"] as string | null ?? null,
          };
        } catch {
          // Token fetch failed
        }
      }

      setAuthInfo(info);
    }

    void gatherAuthInfo();
  }, []);

  if (!authInfo) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
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
                { label: "Email", value: authInfo.currentUser.email ?? "—" },
                { label: "UID", value: authInfo.currentUser.uid },
                {
                  label: "Email Verified",
                  value: authInfo.currentUser.emailVerified ? "Yes" : "No",
                },
                { label: "Provider", value: authInfo.currentUser.provider },
                {
                  label: "Created",
                  value: authInfo.currentUser.createdAt
                    ? new Date(authInfo.currentUser.createdAt).toLocaleDateString()
                    : "—",
                },
                {
                  label: "Last Sign-in",
                  value: authInfo.currentUser.lastSignIn
                    ? new Date(authInfo.currentUser.lastSignIn).toLocaleString()
                    : "—",
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
                  : "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-background/30 border border-border/10">
              <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-mono">
                Issuer
              </p>
              <p className="text-xs font-mono text-foreground/80 truncate mt-1">
                {authInfo.token.issuer ?? "—"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Auth Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">
                Firebase Auth
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] uppercase tracking-wider font-mono ${
                authInfo.firebaseConfig.configured
                  ? "border-green-500/40 text-green-400"
                  : "border-foreground/20 text-foreground/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  authInfo.firebaseConfig.configured ? "bg-green-400" : "bg-foreground/20"
                }`}
              />
              {authInfo.firebaseConfig.configured ? "configured" : "disabled"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Project</span>
              <span className="text-[10px] font-mono text-foreground/60">
                {authInfo.firebaseConfig.projectId ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Auth Domain</span>
              <span className="text-[10px] font-mono text-foreground/60 truncate max-w-40">
                {authInfo.firebaseConfig.authDomain ?? "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Amplify Cognito */}
        <Card className="bg-card/40 backdrop-blur-sm border border-border/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <p className="text-xs font-mono text-foreground/80 font-bold">
                Amplify Cognito
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-green-500/40 text-green-400 text-[10px] uppercase tracking-wider font-mono"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
              production
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">Region</span>
              <span className="text-[10px] font-mono text-foreground/60">
                {authInfo.amplifyConfig.region}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground/40">App ID</span>
              <span className="text-[10px] font-mono text-foreground/60">
                {authInfo.amplifyConfig.appId}
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
    </div>
  );
}
